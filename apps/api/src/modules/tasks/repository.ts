import type { DatabaseSync } from "node:sqlite";

import type {
  ProgressSnapshot,
  Task,
  TaskCompletionMode,
  TaskCreateInput,
  TaskPenaltyKind,
  TaskSelfAssessment,
  TaskUpdateInput,
} from "@mainline/contracts";

interface TaskRow {
  id: string;
  title: string;
  details: string;
  goal_id: string | null;
  lane: Task["lane"];
  form: Task["form"];
  scheduled_date: string;
  time_block: Task["timeBlock"];
  completion_mode: Task["completionMode"];
  experience_reward: number;
  experience_granted: number;
  reward_title: string;
  reward_status: Task["rewardStatus"];
  penalty_kind: Task["penaltyKind"];
  penalty_detail: string;
  penalty_amount: number | null;
  penalty_status: Task["penaltyStatus"];
  penalty_due_at: string | null;
  result_summary: string | null;
  self_assessment: Task["selfAssessment"];
  result_submitted_at: string | null;
  incomplete_reason: string | null;
  status: Task["status"];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface NewTask extends Omit<TaskCreateInput, "goalId" | "penaltyAmount"> {
  id: string;
  goalId: string | null;
  completionMode: TaskCompletionMode;
  experienceReward: number;
  rewardTitle: string;
  penaltyKind: TaskPenaltyKind;
  penaltyDetail: string;
  penaltyAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    goalId: row.goal_id,
    lane: row.lane,
    form: row.form,
    scheduledDate: row.scheduled_date,
    timeBlock: row.time_block,
    completionMode: row.completion_mode,
    experienceReward: row.experience_reward,
    experienceGranted: row.experience_granted,
    rewardTitle: row.reward_title,
    rewardStatus: row.reward_status,
    penaltyKind: row.penalty_kind,
    penaltyDetail: row.penalty_detail,
    penaltyAmount: row.penalty_amount,
    penaltyStatus: row.penalty_status,
    penaltyDueAt: row.penalty_due_at,
    resultSummary: row.result_summary,
    selfAssessment: row.self_assessment,
    resultSubmittedAt: row.result_submitted_at,
    incompleteReason: row.incomplete_reason,
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
            id, title, details, goal_id, lane, form, scheduled_date, time_block,
            completion_mode, experience_reward, experience_granted,
            reward_title, reward_status,
            penalty_kind, penalty_detail, penalty_amount, penalty_status, penalty_due_at,
            result_summary, self_assessment, result_submitted_at, incomplete_reason,
            status, created_at, updated_at, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, 'planned', ?, ?, NULL)
        `,
      )
      .run(
        task.id,
        task.title,
        task.details,
        task.goalId,
        task.lane,
        task.form,
        task.scheduledDate,
        task.timeBlock,
        task.completionMode,
        task.experienceReward,
        task.rewardTitle,
        task.rewardTitle ? "locked" : "none",
        task.penaltyKind,
        task.penaltyDetail,
        task.penaltyAmount,
        task.penaltyKind === "none" ? "none" : "armed",
        task.createdAt,
        task.updatedAt,
      );

    return this.findById(task.id)!;
  }

  update(id: string, update: TaskUpdateInput, updatedAt: string): Task {
    const assignments: string[] = [];
    const values: Array<string | null> = [];

    if (update.title !== undefined) {
      assignments.push("title = ?");
      values.push(update.title);
    }

    if (update.details !== undefined) {
      assignments.push("details = ?");
      values.push(update.details);
    }

    if (update.goalId !== undefined) {
      assignments.push("goal_id = ?");
      values.push(update.goalId);
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

  complete(id: string, completedAt: string, experienceGranted: number): Task {
    this.database
      .prepare(
        `
          UPDATE tasks
          SET status = 'completed',
              completed_at = ?,
              experience_granted = ?,
              reward_status = CASE WHEN reward_status = 'locked' THEN 'available' ELSE reward_status END,
              updated_at = ?
          WHERE id = ?
        `,
      )
      .run(completedAt, experienceGranted, completedAt, id);

    return this.findById(id)!;
  }

  submitResult(
    id: string,
    summary: string,
    selfAssessment: TaskSelfAssessment,
    submittedAt: string,
  ): Task {
    this.database
      .prepare(
        `
          UPDATE tasks
          SET status = 'pending_resolution',
              result_summary = ?,
              self_assessment = ?,
              result_submitted_at = ?,
              updated_at = ?
          WHERE id = ?
        `,
      )
      .run(summary, selfAssessment, submittedAt, submittedAt, id);

    return this.findById(id)!;
  }

  markIncomplete(id: string, reason: string | null, penaltyDueAt: string | null, updatedAt: string): Task {
    this.database
      .prepare(
        `
          UPDATE tasks
          SET status = 'incomplete',
              incomplete_reason = ?,
              reward_status = CASE WHEN reward_status = 'locked' THEN 'forfeited' ELSE reward_status END,
              penalty_status = CASE WHEN penalty_status = 'armed' THEN 'pending' ELSE penalty_status END,
              penalty_due_at = CASE WHEN penalty_status = 'armed' THEN ? ELSE penalty_due_at END,
              updated_at = ?
          WHERE id = ?
        `,
      )
      .run(reason, penaltyDueAt, updatedAt, id);

    return this.findById(id)!;
  }

  claimReward(id: string, updatedAt: string): Task {
    this.database
      .prepare("UPDATE tasks SET reward_status = 'claimed', updated_at = ? WHERE id = ?")
      .run(updatedAt, id);

    return this.findById(id)!;
  }

  fulfillPenalty(id: string, updatedAt: string): Task {
    this.database
      .prepare("UPDATE tasks SET penalty_status = 'fulfilled', updated_at = ? WHERE id = ?")
      .run(updatedAt, id);

    return this.findById(id)!;
  }

  getProgress(): ProgressSnapshot {
    const experienceResult = this.database
      .prepare("SELECT COALESCE(SUM(experience_granted), 0) AS experience FROM tasks WHERE status = 'completed'")
      .get() as { experience: number };
    const availableRewards = this.database
      .prepare(
        `
          SELECT id AS taskId, title AS taskTitle, reward_title AS rewardTitle
          FROM tasks
          WHERE reward_status = 'available'
          ORDER BY completed_at DESC
        `,
      )
      .all() as ProgressSnapshot["availableRewards"];
    const pendingPenalties = this.database
      .prepare(
        `
          SELECT id AS taskId, title AS taskTitle, penalty_kind AS kind,
                 penalty_detail AS detail, penalty_amount AS amount, penalty_due_at AS dueAt
          FROM tasks
          WHERE penalty_status = 'pending'
          ORDER BY penalty_due_at ASC
        `,
      )
      .all() as ProgressSnapshot["pendingPenalties"];

    return { experience: experienceResult.experience, availableRewards, pendingPenalties };
  }

  delete(id: string): void {
    this.database.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  }
}
