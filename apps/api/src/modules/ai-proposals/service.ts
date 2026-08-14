import { randomUUID } from "node:crypto";

import type {
  AiInterruptionProposal,
  AiInterruptionRequest,
  AiProposal,
  AiProposalListResponse,
  AiTaskPlanProposal,
  AiTaskPlanRequest,
} from "@mainline/contracts";
import { isAiInterruptionContent, isAiTaskPlanContent } from "@mainline/contracts";

import { AiProposalError } from "./errors.js";
import type { AiPlanningProvider } from "./provider.js";
import { AiProposalRepository } from "./repository.js";

function normalizeTaskPlanRequest(request: AiTaskPlanRequest): AiTaskPlanRequest {
  const title = request.title.trim();

  if (!title) {
    throw new AiProposalError("AI_VALIDATION", "请先填写任务标题，再请求 AI 规划。", 422);
  }

  return { ...request, title, details: request.details.trim() };
}

function normalizeInterruptionRequest(request: AiInterruptionRequest): AiInterruptionRequest {
  const message = request.message.trim();

  if (!message) {
    throw new AiProposalError("AI_VALIDATION", "请先说明发生了什么现实中断。", 422);
  }

  return { ...request, message };
}

export class AiProposalService {
  constructor(
    private readonly repository: AiProposalRepository,
    private readonly provider: AiPlanningProvider,
  ) {}

  async createTaskPlan(request: AiTaskPlanRequest): Promise<AiTaskPlanProposal> {
    const normalizedRequest = normalizeTaskPlanRequest(request);
    const content = await this.provider.planTask(normalizedRequest);

    if (!isAiTaskPlanContent(content)) {
      throw new AiProposalError("AI_INVALID_RESPONSE", "AI 返回的任务建议不完整，请重新请求。", 502);
    }

    const now = new Date().toISOString();
    const proposal: AiTaskPlanProposal = {
      id: randomUUID(),
      kind: "task_plan",
      status: "pending",
      request: normalizedRequest,
      content,
      createdAt: now,
      resolvedAt: null,
    };

    return this.repository.create(proposal) as AiTaskPlanProposal;
  }

  async createInterruption(request: AiInterruptionRequest): Promise<AiInterruptionProposal> {
    const normalizedRequest = normalizeInterruptionRequest(request);
    const content = await this.provider.adviseOnInterruption(normalizedRequest);

    if (!isAiInterruptionContent(content)) {
      throw new AiProposalError("AI_INVALID_RESPONSE", "AI 返回的中断建议不完整，请重新请求。", 502);
    }

    const now = new Date().toISOString();
    const proposal: AiInterruptionProposal = {
      id: randomUUID(),
      kind: "interruption",
      status: "pending",
      request: normalizedRequest,
      content,
      createdAt: now,
      resolvedAt: null,
    };

    return this.repository.create(proposal) as AiInterruptionProposal;
  }

  listPending(): AiProposalListResponse {
    return { proposals: this.repository.listPending() };
  }

  accept(id: string): AiProposal {
    return this.resolve(id, "accepted");
  }

  dismiss(id: string): AiProposal {
    return this.resolve(id, "dismissed");
  }

  private resolve(id: string, status: "accepted" | "dismissed"): AiProposal {
    const proposal = this.repository.findById(id);

    if (!proposal) {
      throw new AiProposalError("AI_PROPOSAL_NOT_FOUND", "没有找到这条 AI 提案。", 404);
    }

    if (proposal.status !== "pending") {
      throw new AiProposalError("AI_PROPOSAL_CONFLICT", "这条 AI 提案已经处理过了。", 409);
    }

    return this.repository.resolve(id, status);
  }
}
