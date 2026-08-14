import {
  isAiInterruptionProposal,
  isAiProposal,
  isAiProposalListResponse,
  isAiTaskPlanProposal,
  type AiInterruptionProposal,
  type AiInterruptionRequest,
  type AiProposal,
  type AiTaskPlanProposal,
  type AiTaskPlanRequest,
} from "@mainline/contracts";

export class AiProposalApiError extends Error {}

async function getErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => undefined);

  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = (payload as Record<string, unknown>).message;

    if (typeof message === "string" && message) {
      return message;
    }
  }

  return "AI 建议暂时无法生成，请稍后再试。";
}

async function readProposal(response: Response): Promise<AiProposal> {
  if (!response.ok) {
    throw new AiProposalApiError(await getErrorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isAiProposal(payload)) {
    throw new AiProposalApiError("本地服务返回了无法识别的 AI 建议。");
  }

  return payload;
}

export async function requestTaskPlan(input: AiTaskPlanRequest): Promise<AiTaskPlanProposal> {
  const proposal = await readProposal(
    await fetch("/api/ai/task-plans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );

  if (!isAiTaskPlanProposal(proposal)) {
    throw new AiProposalApiError("本地服务返回了不匹配的任务建议。");
  }

  return proposal;
}

export async function requestInterruptionAdvice(
  input: AiInterruptionRequest,
): Promise<AiInterruptionProposal> {
  const proposal = await readProposal(
    await fetch("/api/ai/interruptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }),
  );

  if (!isAiInterruptionProposal(proposal)) {
    throw new AiProposalApiError("本地服务返回了不匹配的中断建议。");
  }

  return proposal;
}

export async function fetchPendingAiProposals(): Promise<AiProposal[]> {
  const response = await fetch("/api/ai/proposals");

  if (!response.ok) {
    throw new AiProposalApiError(await getErrorMessage(response));
  }

  const payload: unknown = await response.json();

  if (!isAiProposalListResponse(payload)) {
    throw new AiProposalApiError("本地服务返回了无法识别的 AI 建议列表。");
  }

  return payload.proposals;
}

export async function acceptAiProposal(id: string): Promise<AiProposal> {
  return readProposal(await fetch(`/api/ai/proposals/${id}/accept`, { method: "POST" }));
}

export async function dismissAiProposal(id: string): Promise<AiProposal> {
  return readProposal(await fetch(`/api/ai/proposals/${id}/dismiss`, { method: "POST" }));
}
