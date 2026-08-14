export type TaskErrorCode = "TASK_NOT_FOUND" | "TASK_CONFLICT" | "TASK_VALIDATION";

export class TaskDomainError extends Error {
  constructor(
    readonly code: TaskErrorCode,
    message: string,
    readonly statusCode: 404 | 409 | 422,
  ) {
    super(message);
    this.name = "TaskDomainError";
  }
}
