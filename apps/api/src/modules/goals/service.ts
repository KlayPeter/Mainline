import { randomUUID } from "node:crypto";

import type { Chapter, ChapterCreateInput, Goal, GoalCreateInput, GoalMapResponse, GoalProgressInput } from "@mainline/contracts";

import { GoalDomainError } from "./errors.js";
import { GoalRepository } from "./repository.js";

function assertDate(value: string): void {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new GoalDomainError("GOAL_VALIDATION", "请填写真实的日期。", 422);
}

function required(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new GoalDomainError("GOAL_VALIDATION", `${label}不能为空。`, 422);
  return normalized;
}

export class GoalService {
  constructor(private readonly repository: GoalRepository) {}

  list(): GoalMapResponse { return this.repository.listMap(); }

  createChapter(input: ChapterCreateInput): Chapter {
    assertDate(input.startedOn);
    if (input.endsOn) assertDate(input.endsOn);
    const now = new Date().toISOString();
    return this.repository.createChapter({ id: randomUUID(), domain: input.domain, title: required(input.title, "章节标题"), description: input.description.trim(), startedOn: input.startedOn, endsOn: input.endsOn ?? null, status: "active", createdAt: now, updatedAt: now });
  }

  createGoal(input: GoalCreateInput): Goal {
    if (!this.repository.findChapter(input.chapterId)) throw new GoalDomainError("CHAPTER_NOT_FOUND", "没有找到目标所属的章节。", 404);
    if (input.targetDate) assertDate(input.targetDate);
    const now = new Date().toISOString();
    return this.repository.createGoal({ id: randomUUID(), chapterId: input.chapterId, title: required(input.title, "目标标题"), definition: input.definition.trim(), metric: required(input.metric, "衡量方式"), targetValue: input.targetValue, currentValue: 0, targetDate: input.targetDate ?? null, status: "active", createdAt: now, updatedAt: now });
  }

  updateProgress(id: string, input: GoalProgressInput): Goal {
    const goal = this.repository.findGoal(id);
    if (!goal) throw new GoalDomainError("GOAL_NOT_FOUND", "没有找到这项目标。", 404);
    if (goal.status !== "active") throw new GoalDomainError("GOAL_CONFLICT", "已结束的目标不能再更新进度。", 409);
    return this.repository.updateProgress(id, input.currentValue, input.currentValue >= goal.targetValue ? "achieved" : "active", new Date().toISOString());
  }
}
