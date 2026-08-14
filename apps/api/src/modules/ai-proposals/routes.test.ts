import { afterEach, describe, expect, it } from "vitest";

import type { AiPlanningProvider } from "./provider.js";
import { createApp } from "../../app.js";

const planningProvider: AiPlanningProvider = {
  async planTask() {
    return {
      analysis: "这是一项可选学习任务，适合放在成长线并留出一个清晰的起步动作。",
      suggestedLane: "growth",
      suggestedForm: "challenge",
      suggestedTimeBlock: "evening",
      suggestedSteps: [
        { title: "确定本节目标", details: "只完成课程第一节和一个小练习。" },
        { title: "记录产出", details: "留下一段可回看的笔记。" },
      ],
    };
  },
  async adviseOnInterruption() {
    return {
      summary: "临时加班压缩了今晚的可用精力。",
      suggestedAction: "reduce",
      suggestedAdjustment: "把学习缩小为 20 分钟回顾；如果做不到，再由你手动改期。",
    };
  },
};

describe("AI proposal routes", () => {
  const apps: ReturnType<typeof createApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  function createTestApp(provider: AiPlanningProvider = planningProvider) {
    const app = createApp({ aiProvider: provider, databasePath: ":memory:" });
    apps.push(app);
    return app;
  }

  it("persists a task plan, and only changes its proposal status after explicit acceptance", async () => {
    const app = createTestApp();

    const created = await app.inject({
      method: "POST",
      url: "/ai/task-plans",
      payload: {
        title: "完成 Agent 课程第一节",
        details: "学习 Planning 和 Filesystem。",
        scheduledDate: "2026-08-14",
      },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({
      kind: "task_plan",
      status: "pending",
      request: { title: "完成 Agent 课程第一节" },
      content: { suggestedLane: "growth", suggestedForm: "challenge" },
    });

    const proposalId = (created.json() as { id: string }).id;
    const pending = await app.inject({ method: "GET", url: "/ai/proposals" });
    expect(pending.json()).toMatchObject({ proposals: [{ id: proposalId, status: "pending" }] });

    const accepted = await app.inject({ method: "POST", url: `/ai/proposals/${proposalId}/accept` });
    expect(accepted.statusCode).toBe(200);
    expect(accepted.json()).toMatchObject({ id: proposalId, status: "accepted" });

    const afterAccept = await app.inject({ method: "GET", url: "/ai/proposals" });
    expect(afterAccept.json()).toEqual({ proposals: [] });

    const acceptingAgain = await app.inject({ method: "POST", url: `/ai/proposals/${proposalId}/accept` });
    expect(acceptingAgain.statusCode).toBe(409);
  });

  it("records an interruption suggestion without mutating the referenced task", async () => {
    const app = createTestApp();
    const taskResponse = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        title: "完成工作需求梳理",
        details: "今天下班前给出初版。",
        lane: "main",
        form: "one_off",
        scheduledDate: "2026-08-14",
        timeBlock: "afternoon",
      },
    });
    const task = taskResponse.json() as { id: string; status: string };

    const created = await app.inject({
      method: "POST",
      url: "/ai/interruptions",
      payload: { message: "临时加班，今晚没有完整时间了。", taskId: task.id },
    });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({
      kind: "interruption",
      status: "pending",
      request: { taskId: task.id },
      content: { suggestedAction: "reduce" },
    });

    const taskAfterAdvice = await app.inject({ method: "GET", url: "/tasks?date=2026-08-14" });
    expect(taskAfterAdvice.json()).toMatchObject({ tasks: [{ id: task.id, status: "planned" }] });

    const proposalId = (created.json() as { id: string }).id;
    const dismissed = await app.inject({ method: "POST", url: `/ai/proposals/${proposalId}/dismiss` });
    expect(dismissed.statusCode).toBe(200);
    expect(dismissed.json()).toMatchObject({ id: proposalId, status: "dismissed" });
  });

  it("rejects an invalid provider response before saving a proposal", async () => {
    const invalidProvider = {
      ...planningProvider,
      async planTask() {
        return { analysis: "缺少必要字段" } as never;
      },
    } satisfies AiPlanningProvider;
    const app = createTestApp(invalidProvider);

    const response = await app.inject({
      method: "POST",
      url: "/ai/task-plans",
      payload: { title: "学习 SDD", details: "", scheduledDate: "2026-08-14" },
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({ code: "AI_INVALID_RESPONSE" });

    const pending = await app.inject({ method: "GET", url: "/ai/proposals" });
    expect(pending.json()).toEqual({ proposals: [] });
  });
});
