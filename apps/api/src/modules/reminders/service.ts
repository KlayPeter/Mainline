import type { DailyReminder, DailyReminderUpdateInput } from "@mainline/contracts";

import { ReminderDomainError } from "./errors.js";
import { ReminderRepository } from "./repository.js";

function assertReminderTime(time: string): void {
  const match = /^(\d{2}):(\d{2})$/.exec(time);

  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new ReminderDomainError("REMINDER_VALIDATION", "请填写有效的提醒时间。");
  }
}

export class ReminderService {
  constructor(private readonly repository: ReminderRepository) {}

  get(): DailyReminder {
    return this.repository.get();
  }

  save(input: DailyReminderUpdateInput): DailyReminder {
    assertReminderTime(input.time);
    return this.repository.save(input.enabled, input.time, new Date().toISOString());
  }
}
