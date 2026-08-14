import { randomUUID } from "node:crypto";

import type {
  TaskEvidence,
  TaskEvidenceCreateInput,
  TaskEvidenceListResponse,
  TaskEvidenceMimeType,
} from "@mainline/contracts";

import { LocalEvidenceStore } from "../../platform/evidence/local-evidence-store.js";
import { TaskDomainError } from "./errors.js";
import { TaskEvidenceRepository } from "./evidence-repository.js";
import { TaskRepository } from "./repository.js";

const maximumEvidenceBytes = 5 * 1024 * 1024;

function decodeBase64(value: string): Buffer {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0) {
    throw new TaskDomainError("TASK_VALIDATION", "凭据图片格式无法识别，请重新选择文件。", 422);
  }

  const content = Buffer.from(value, "base64");

  if (!content.length || content.length > maximumEvidenceBytes) {
    throw new TaskDomainError("TASK_VALIDATION", "凭据图片需小于 5 MB。", 422);
  }

  return content;
}

function isMatchingImage(content: Buffer, mimeType: TaskEvidenceMimeType): boolean {
  if (mimeType === "image/jpeg") {
    return content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return content.length >= 8 && content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  return content.length >= 12
    && content.subarray(0, 4).toString("ascii") === "RIFF"
    && content.subarray(8, 12).toString("ascii") === "WEBP";
}

export class TaskEvidenceService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly repository: TaskEvidenceRepository,
    private readonly store: LocalEvidenceStore,
  ) {}

  list(): TaskEvidenceListResponse {
    return { evidence: this.repository.list() };
  }

  create(input: TaskEvidenceCreateInput): TaskEvidence {
    const task = this.taskRepository.findById(input.taskId);

    if (!task) {
      throw new TaskDomainError("TASK_NOT_FOUND", "没有找到要留存凭据的任务。", 404);
    }

    if (task.penaltyStatus !== "pending") {
      throw new TaskDomainError("TASK_CONFLICT", "只有待兑现的承诺可以留存凭据。", 409);
    }

    const originalFilename = input.filename.trim();

    if (!originalFilename) {
      throw new TaskDomainError("TASK_VALIDATION", "请保留凭据图片的文件名。", 422);
    }

    const content = decodeBase64(input.dataBase64);

    if (!isMatchingImage(content, input.mimeType)) {
      throw new TaskDomainError("TASK_VALIDATION", "图片内容与选择的格式不一致。", 422);
    }

    const id = randomUUID();
    const storedFilename = this.store.write(id, input.mimeType, content);

    try {
      return this.repository.create({
        id,
        taskId: task.id,
        originalFilename,
        storedFilename,
        mimeType: input.mimeType,
        byteSize: content.length,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      this.store.remove(storedFilename);
      throw error;
    }
  }

  read(id: string): { content: Buffer; mimeType: TaskEvidenceMimeType } {
    const evidence = this.repository.findStoredFilename(id);

    if (!evidence) {
      throw new TaskDomainError("TASK_NOT_FOUND", "没有找到这份本地凭据。", 404);
    }

    try {
      return { content: this.store.read(evidence.filename), mimeType: evidence.mimeType };
    } catch {
      throw new TaskDomainError("TASK_NOT_FOUND", "这份本地凭据文件已不可用。", 404);
    }
  }
}
