import type { DatabaseSync } from "node:sqlite";

import type { TaskEvidence, TaskEvidenceMimeType } from "@mainline/contracts";

interface TaskEvidenceRow {
  id: string;
  task_id: string;
  kind: "penalty";
  original_filename: string;
  stored_filename: string;
  mime_type: TaskEvidenceMimeType;
  byte_size: number;
  created_at: string;
  task_title: string;
}

interface NewTaskEvidence {
  id: string;
  taskId: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: TaskEvidenceMimeType;
  byteSize: number;
  createdAt: string;
}

function toEvidence(row: TaskEvidenceRow): TaskEvidence {
  return {
    id: row.id,
    taskId: row.task_id,
    taskTitle: row.task_title,
    kind: row.kind,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    fileUrl: `/evidence/${row.id}/file`,
    createdAt: row.created_at,
  };
}

export class TaskEvidenceRepository {
  constructor(private readonly database: DatabaseSync) {}

  list(): TaskEvidence[] {
    return (this.database.prepare(`
      SELECT evidence.*, tasks.title AS task_title
      FROM task_evidence AS evidence
      JOIN tasks ON tasks.id = evidence.task_id
      ORDER BY evidence.created_at DESC
      LIMIT 30
    `).all() as unknown as TaskEvidenceRow[]).map(toEvidence);
  }

  create(evidence: NewTaskEvidence): TaskEvidence {
    this.database.prepare(`
      INSERT INTO task_evidence (
        id, task_id, kind, original_filename, stored_filename, mime_type, byte_size, created_at
      ) VALUES (?, ?, 'penalty', ?, ?, ?, ?, ?)
    `).run(
      evidence.id,
      evidence.taskId,
      evidence.originalFilename,
      evidence.storedFilename,
      evidence.mimeType,
      evidence.byteSize,
      evidence.createdAt,
    );

    return this.find(evidence.id)!;
  }

  find(id: string): TaskEvidence | undefined {
    const row = this.findRow(id);
    return row ? toEvidence(row) : undefined;
  }

  findStoredFilename(id: string): { filename: string; mimeType: TaskEvidenceMimeType } | undefined {
    const row = this.findRow(id);
    return row ? { filename: row.stored_filename, mimeType: row.mime_type } : undefined;
  }

  private findRow(id: string): TaskEvidenceRow | undefined {
    return this.database.prepare(`
      SELECT evidence.*, tasks.title AS task_title
      FROM task_evidence AS evidence
      JOIN tasks ON tasks.id = evidence.task_id
      WHERE evidence.id = ?
    `).get(id) as TaskEvidenceRow | undefined;
  }
}
