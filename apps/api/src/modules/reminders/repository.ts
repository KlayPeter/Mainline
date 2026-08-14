import type { DatabaseSync } from "node:sqlite";

import type { DailyReminder } from "@mainline/contracts";

interface ReminderRow {
  enabled: number;
  time: string;
  updated_at: string;
}

function toReminder(row: ReminderRow): DailyReminder {
  return { enabled: row.enabled === 1, time: row.time, updatedAt: row.updated_at };
}

export class ReminderRepository {
  constructor(private readonly database: DatabaseSync) {}

  get(): DailyReminder {
    const row = this.database.prepare("SELECT enabled, time, updated_at FROM daily_reminder_settings WHERE id = 1").get() as unknown as ReminderRow;
    return toReminder(row);
  }

  save(enabled: boolean, time: string, updatedAt: string): DailyReminder {
    this.database.prepare("UPDATE daily_reminder_settings SET enabled = ?, time = ?, updated_at = ? WHERE id = 1")
      .run(enabled ? 1 : 0, time, updatedAt);
    return this.get();
  }
}
