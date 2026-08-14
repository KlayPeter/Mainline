import type { DatabaseSync } from "node:sqlite";

import type { Task, TaskCreateInput, TaskUpdateInput } from "@mainline/contracts";

interface TaskRow {
  id: string;
  title: string;
  details: string;
  lane: Task["lane"];
  form: Task["form"];
  scheduled_date: string;
  time_block: Task["timeBlock"];
  status: Task["status"];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface NewTask extends TaskCreateInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    lane: row.lane,
    form: row.form,
    scheduledDate: row.scheduled_date,
    timeBlock: row.time_block,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export class TaskRepository {
  constructor(private readonly database: DatabaseSync) {}

  listByDate(scheduledDate: string): Task[] {
    const rows = this.database
      .prepare(
        `
          SELECT * FROM tasks
          WHERE scheduled_date = ?
          ORDER BY
            CASE lane
              WHEN 'main' THEN 0
              WHEN 'side' THEN 1
              WHEN 'growth' THEN 2
              ELSE 3
            END,
            CASE time_block
              WHEN 'morning' THEN 0
              WHEN 'afternoon' THEN 1
              WHEN 'evening' THEN 2
              ELSE 3
            END,
            created_at ASC
        `,
      )
      .all(scheduledDate) as unknown as TaskRow[];

    return rows.map(toTask);
  }

  findById(id: string): Task | undefined {
    const row = this.database.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow | undefined;
    return row ? toTask(row) : undefined;
  }

  hasActiveMainForDate(scheduledDate: string, excludedTaskId?: string): boolean {
    const result = this.database
      .prepare(
        `
          SELECT 1 FROM tasks
          WHERE scheduled_date = ?
            AND lane = 'main'
            AND status IN ('planned', 'in_progress')
            AND (? IS NULL OR id != ?)
          LIMIT 1
        `,
      )
      .get(scheduledDate, excludedTaskId ?? null, excludedTaskId ?? null);

    return Boolean(result);
  }

  create(task: NewTask): Task {
    this.database
      .prepare(
        `
          INSERT INTO tasks (
            id, title, details, lane, form, scheduled_date, time_block,
            status, created_at, updated_at, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?, NULL)
        `,
      )
      .run(
        task.id,
        task.title,
        task.details,
        task.lane,
        task.form,
        task.scheduledDate,
        task.timeBlock,
        task.createdAt,
        task.updatedAt,
      );

    return this.findById(task.id)!;
  }

  update(id: string, update: TaskUpdateInput, updatedAt: string): Task {
    const assignments: string[] = [];
    const values: string[] = [];

    if (update.title !== undefined) {
      assignments.push("title = ?");
      values.push(update.title);
    }

    if (update.details !== undefined) {
      assignments.push("details = ?");
      values.push(update.details);
    }

    if (update.lane !== undefined) {
      assignments.push("lane = ?");
      values.push(update.lane);
    }

    if (update.form !== undefined) {
      assignments.push("form = ?");
      values.push(update.form);
    }

    if (update.scheduledDate !== undefined) {
      assignments.push("scheduled_date = ?");
      values.push(update.scheduledDate);
    }

    if (update.timeBlock !== undefined) {
      assignments.push("time_block = ?");
      values.push(update.timeBlock);
    }

    this.database
      .prepare(`UPDATE tasks SET ${assignments.join(", ")}, updated_at = ? WHERE id = ?`)
      .run(...values, updatedAt, id);

    return this.findById(id)!;
  }

  setStatus(id: string, status: Task["status"], completedAt: string | null, updatedAt: string): Task {
    this.database
      .prepare("UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?")
      .run(status, completedAt, updatedAt, id);

    return this.findById(id)!;
  }

  delete(id: string): void {
    this.database.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  }
}
