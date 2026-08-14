import { randomUUID } from "node:crypto";

import type {
  Task,
  TaskCreateInput,
  TaskDateQuery,
  TaskListResponse,
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

function normalizeCreateInput(input: TaskCreateInput): TaskCreateInput {
  assertCalendarDate(input.scheduledDate);

  return {
    ...input,
    title: normalizeTitle(input.title),
    details: input.details.trim(),
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

    if (existing.status !== "planned" && existing.status !== "in_progress") {
      throw new TaskDomainError("TASK_CONFLICT", "当前状态不能直接完成任务。", 409);
    }

    const now = new Date().toISOString();
    return this.repository.setStatus(id, "completed", now, now);
  }

  delete(id: string): void {
    const existing = this.getRequiredTask(id);

    if (existing.status === "completed") {
      throw new TaskDomainError("TASK_CONFLICT", "已完成任务是事实记录，不能删除。", 409);
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
    if (task.status === "completed") {
      throw new TaskDomainError("TASK_CONFLICT", "已完成任务不能修改。", 409);
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
}
