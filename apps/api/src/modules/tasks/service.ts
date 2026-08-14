import { randomUUID } from "node:crypto";

import type {
  ProgressSnapshot,
  Task,
  TaskCreateInput,
  TaskDateQuery,
  TaskIncompleteInput,
  TaskListResponse,
  TaskResultSubmissionInput,
  TaskUpdateInput,
} from "@mainline/contracts";

import { TaskDomainError } from "./errors.js";
import { TaskRepository } from "./repository.js";

function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function assertCalendarDate(value: string): void {
  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new TaskDomainError("TASK_VALIDATION", "请填写真实的任务日期。", 422);
  }
}

function normalizeTitle(title: string): string {
  const normalized = title.trim();

  if (!normalized) {
    throw new TaskDomainError("TASK_VALIDATION", "任务标题不能只包含空白字符。", 422);
  }

  return normalized;
}

interface NormalizedTaskCreateInput extends Omit<TaskCreateInput, "penaltyAmount"> {
  completionMode: Task["completionMode"];
  experienceReward: number;
  rewardTitle: string;
  penaltyKind: Task["penaltyKind"];
  penaltyDetail: string;
  penaltyAmount: number | null;
}

function normalizeCreateInput(input: TaskCreateInput): NormalizedTaskCreateInput {
  assertCalendarDate(input.scheduledDate);
  const rewardTitle = input.rewardTitle?.trim() ?? "";
  const penaltyKind = input.penaltyKind ?? "none";
  const penaltyDetail = input.penaltyDetail?.trim() ?? "";

  if (penaltyKind !== "none" && !penaltyDetail) {
    throw new TaskDomainError("TASK_VALIDATION", "设置惩罚承诺时，请写清楚要如何兑现。", 422);
  }

  if (penaltyKind === "money" && input.penaltyAmount === undefined) {
    throw new TaskDomainError("TASK_VALIDATION", "金钱惩罚请填写金额。", 422);
  }

  return {
    ...input,
    title: normalizeTitle(input.title),
    details: input.details.trim(),
    completionMode: input.completionMode ?? "direct",
    experienceReward: input.experienceReward ?? 10,
    rewardTitle,
    penaltyKind,
    penaltyDetail,
    penaltyAmount: penaltyKind === "money" ? input.penaltyAmount ?? null : null,
  };
}

function normalizeUpdateInput(input: TaskUpdateInput): TaskUpdateInput {
  if (input.scheduledDate !== undefined) {
    assertCalendarDate(input.scheduledDate);
  }

  return {
    ...input,
    ...(input.title !== undefined ? { title: normalizeTitle(input.title) } : {}),
    ...(input.details !== undefined ? { details: input.details.trim() } : {}),
  };
}

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  list(query: TaskDateQuery): TaskListResponse {
    const scheduledDate = query.date ?? getLocalDate();
    assertCalendarDate(scheduledDate);

    return { tasks: this.repository.listByDate(scheduledDate) };
  }

  create(input: TaskCreateInput): Task {
    const task = normalizeCreateInput(input);
    this.assertMainLaneAvailable(task.lane, task.scheduledDate);

    const now = new Date().toISOString();
    return this.repository.create({
      ...task,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  update(id: string, input: TaskUpdateInput): Task {
    const existing = this.getRequiredTask(id);
    this.assertEditable(existing);
    const update = normalizeUpdateInput(input);
    const resultingLane = update.lane ?? existing.lane;
    const resultingDate = update.scheduledDate ?? existing.scheduledDate;

    this.assertMainLaneAvailable(resultingLane, resultingDate, existing.id);
    return this.repository.update(id, update, new Date().toISOString());
  }

  start(id: string): Task {
    const existing = this.getRequiredTask(id);

    if (existing.status === "in_progress") {
      return existing;
    }

    if (existing.status !== "planned") {
      throw new TaskDomainError("TASK_CONFLICT", "只有计划中的任务可以认领开始。", 409);
    }

    return this.repository.setStatus(id, "in_progress", null, new Date().toISOString());
  }

  complete(id: string): Task {
    const existing = this.getRequiredTask(id);

    if (existing.status === "completed") {
      return existing;
    }

    if (existing.completionMode === "result_report") {
      throw new TaskDomainError("TASK_CONFLICT", "这项任务需要先提交成果，再确认完成。", 409);
    }

    if (existing.status !== "planned" && existing.status !== "in_progress") {
      throw new TaskDomainError("TASK_CONFLICT", "当前状态不能直接完成任务。", 409);
    }

    const now = new Date().toISOString();
    return this.repository.complete(id, now, existing.experienceReward);
  }

  submitResult(id: string, input: TaskResultSubmissionInput): Task {
    const existing = this.getRequiredTask(id);

    if (existing.completionMode !== "result_report") {
      throw new TaskDomainError("TASK_CONFLICT", "普通任务不需要提交成果，可直接完成。", 409);
    }

    if (existing.status !== "planned" && existing.status !== "in_progress") {
      throw new TaskDomainError("TASK_CONFLICT", "当前状态不能提交成果。", 409);
    }

    const summary = input.summary.trim();

    if (!summary) {
      throw new TaskDomainError("TASK_VALIDATION", "请写下本次任务实际产出的结果。", 422);
    }

    return this.repository.submitResult(id, summary, input.selfAssessment, new Date().toISOString());
  }

  confirmResult(id: string): Task {
    const existing = this.getRequiredTask(id);

    if (existing.completionMode !== "result_report" || existing.status !== "pending_resolution") {
      throw new TaskDomainError("TASK_CONFLICT", "只有已提交成果的任务可以确认完成。", 409);
    }

    if (!existing.selfAssessment) {
      throw new TaskDomainError("TASK_CONFLICT", "请先填写成果自评。", 409);
    }

    return this.repository.complete(
      id,
      new Date().toISOString(),
      this.getExperienceForAssessment(existing.experienceReward, existing.selfAssessment),
    );
  }

  markIncomplete(id: string, input: TaskIncompleteInput): Task {
    const existing = this.getRequiredTask(id);

    if (!["planned", "in_progress", "pending_resolution"].includes(existing.status)) {
      throw new TaskDomainError("TASK_CONFLICT", "当前任务不需要再按未完成结算。", 409);
    }

    const now = new Date();
    const reason = input.reason?.trim() || null;
    const penaltyDueAt = existing.penaltyStatus === "armed"
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null;

    return this.repository.markIncomplete(id, reason, penaltyDueAt, now.toISOString());
  }

  claimReward(id: string): Task {
    const existing = this.getRequiredTask(id);

    if (existing.rewardStatus !== "available") {
      throw new TaskDomainError("TASK_CONFLICT", "这条奖励现在还不能领取。", 409);
    }

    return this.repository.claimReward(id, new Date().toISOString());
  }

  fulfillPenalty(id: string): Task {
    const existing = this.getRequiredTask(id);

    if (existing.penaltyStatus !== "pending") {
      throw new TaskDomainError("TASK_CONFLICT", "这条惩罚现在不需要兑现。", 409);
    }

    return this.repository.fulfillPenalty(id, new Date().toISOString());
  }

  getProgress(): ProgressSnapshot {
    return this.repository.getProgress();
  }

  delete(id: string): void {
    const existing = this.getRequiredTask(id);

    if (existing.status !== "planned" && existing.status !== "in_progress") {
      throw new TaskDomainError("TASK_CONFLICT", "已形成结果的任务是事实记录，不能删除。", 409);
    }

    this.repository.delete(id);
  }

  private getRequiredTask(id: string): Task {
    const task = this.repository.findById(id);

    if (!task) {
      throw new TaskDomainError("TASK_NOT_FOUND", "没有找到这条任务。", 404);
    }

    return task;
  }

  private assertEditable(task: Task): void {
    if (task.status !== "planned" && task.status !== "in_progress") {
      throw new TaskDomainError("TASK_CONFLICT", "已形成结果的任务不能修改。", 409);
    }
  }

  private assertMainLaneAvailable(
    lane: Task["lane"],
    scheduledDate: string,
    excludedTaskId?: string,
  ): void {
    if (lane !== "main") {
      return;
    }

    if (this.repository.hasActiveMainForDate(scheduledDate, excludedTaskId)) {
      throw new TaskDomainError("TASK_CONFLICT", "这一天已经有一条主线任务，请先调整原来的主线。", 409);
    }
  }

  private getExperienceForAssessment(
    baseExperience: number,
    assessment: NonNullable<Task["selfAssessment"]>,
  ): number {
    if (assessment === "basic") {
      return Math.max(1, Math.floor(baseExperience * 0.6));
    }

    if (assessment === "excellent") {
      return Math.min(150, Math.round(baseExperience * 1.2));
    }

    return baseExperience;
  }
}
