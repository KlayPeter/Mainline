export type ReminderErrorCode = "REMINDER_VALIDATION";

export class ReminderDomainError extends Error {
  constructor(
    readonly code: ReminderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ReminderDomainError";
  }
}
