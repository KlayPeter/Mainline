export type AiProposalErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_UPSTREAM_FAILURE"
  | "AI_INVALID_RESPONSE"
  | "AI_VALIDATION"
  | "AI_PROPOSAL_NOT_FOUND"
  | "AI_PROPOSAL_CONFLICT";

export class AiProposalError extends Error {
  constructor(
    readonly code: AiProposalErrorCode,
    message: string,
    readonly statusCode: 404 | 409 | 422 | 502 | 503,
  ) {
    super(message);
    this.name = "AiProposalError";
  }
}
