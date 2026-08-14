export class GoalDomainError extends Error {
  constructor(
    readonly code: "CHAPTER_NOT_FOUND" | "GOAL_NOT_FOUND" | "GOAL_VALIDATION" | "GOAL_CONFLICT",
    message: string,
    readonly statusCode: 404 | 409 | 422,
  ) {
    super(message);
    this.name = "GoalDomainError";
  }
}
