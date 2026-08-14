import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

const taskPayload = {
  title: "完成工作需求",
  details: "整理并提交今天的工作任务。",
  lane: "main",
  form: "one_off",
  scheduledDate: "2026-08-14",
  timeBlock: "morning",
} as const;

describe("task routes", () => {
  const apps: ReturnType<typeof createApp>[] = [];
  const evidenceDirectories: string[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    for (const directory of evidenceDirectories.splice(0)) {
      rmSync(directory, { force: true, recursive: true });
    }
  });

  function createTestApp() {
    const app = createApp({ databasePath: ":memory:" });
    apps.push(app);
    return app;
  }

  it("creates, updates, starts, completes, and lists a normal task", async () => {
    const app = createTestApp();
    const created = await app.inject({ method: "POST", url: "/tasks", payload: taskPayload });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({
      title: taskPayload.title,
      status: "planned",
      completionMode: "direct",
      experienceReward: 10,
      experienceGranted: 0,
      completedAt: null,
    });

    const taskId = created.json().id as string;
    const updated = await app.inject({
      method: "PATCH",
      url: `/tasks/${taskId}`,
      payload: { title: "完成本周工作需求", timeBlock: "afternoon" },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({ title: "完成本周工作需求", timeBlock: "afternoon" });

    const started = await app.inject({ method: "POST", url: `/tasks/${taskId}/start` });
    expect(started.statusCode).toBe(200);
    expect(started.json().status).toBe("in_progress");

    const completed = await app.inject({ method: "POST", url: `/tasks/${taskId}/complete` });
    expect(completed.statusCode).toBe(200);
    expect(completed.json()).toMatchObject({ status: "completed", experienceGranted: 10 });
    expect(completed.json().completedAt).toEqual(expect.any(String));

    const listed = await app.inject({ method: "GET", url: "/tasks?date=2026-08-14" });
    expect(listed.statusCode).toBe(200);
    expect(listed.json().tasks).toHaveLength(1);
    expect(listed.json().tasks[0]).toMatchObject({ id: taskId, status: "completed" });
  });

  it("protects the one-main-task rule and completed task records", async () => {
    const app = createTestApp();
    const first = await app.inject({ method: "POST", url: "/tasks", payload: taskPayload });
    const conflict = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { ...taskPayload, title: "第二条主线" },
    });

    expect(conflict.statusCode).toBe(409);
    expect(conflict.json()).toEqual({
      code: "TASK_CONFLICT",
      message: "这一天已经有一条主线任务，请先调整原来的主线。",
    });

    const taskId = first.json().id as string;
    await app.inject({ method: "POST", url: `/tasks/${taskId}/complete` });

    const editableAgain = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { ...taskPayload, title: "完成后的新主线" },
    });
    expect(editableAgain.statusCode).toBe(201);

    const updateCompleted = await app.inject({
      method: "PATCH",
      url: `/tasks/${taskId}`,
      payload: { title: "不应修改" },
    });
    const deleteCompleted = await app.inject({ method: "DELETE", url: `/tasks/${taskId}` });
    expect(updateCompleted.statusCode).toBe(409);
    expect(deleteCompleted.statusCode).toBe(409);
  });

  it("validates a calendar date and lets users remove an unfinished task", async () => {
    const app = createTestApp();
    const invalidDate = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { ...taskPayload, scheduledDate: "2026-02-30" },
    });
    expect(invalidDate.statusCode).toBe(422);
    expect(invalidDate.json()).toEqual({ code: "TASK_VALIDATION", message: "请填写真实的任务日期。" });

    const created = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { ...taskPayload, title: "写公众号草稿", lane: "side" },
    });
    const deleted = await app.inject({ method: "DELETE", url: `/tasks/${created.json().id as string}` });
    expect(deleted.statusCode).toBe(204);

    const listed = await app.inject({ method: "GET", url: "/tasks?date=2026-08-14" });
    expect(listed.json()).toEqual({ tasks: [] });
  });

  it("links a task to an active goal and lets the user remove that link before completing it", async () => {
    const app = createTestApp();
    const chapter = await app.inject({
      method: "POST",
      url: "/chapters",
      payload: { domain: "learning", title: "Agent 学习", description: "完成课程和项目。", startedOn: "2026-08-14" },
    });
    const goal = await app.inject({
      method: "POST",
      url: "/goals",
      payload: { chapterId: chapter.json().id, title: "完成 Deep Agents 课程", definition: "完成学习和项目产出。", metric: "完成模块", targetValue: 8 },
    });
    const goalId = goal.json().id as string;

    const linked = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { ...taskPayload, title: "学习 Deep Agents 第一节", lane: "side", goalId },
    });
    expect(linked.statusCode).toBe(201);
    expect(linked.json()).toMatchObject({ goalId });

    const withLinkedTask = await app.inject({ method: "GET", url: "/chapters" });
    expect(withLinkedTask.json()).toMatchObject({ chapters: [{ goals: [{ id: goalId, linkedTaskCount: 1 }] }] });

    const unlinked = await app.inject({ method: "PATCH", url: `/tasks/${linked.json().id as string}`, payload: { goalId: null } });
    expect(unlinked.statusCode).toBe(200);
    expect(unlinked.json()).toMatchObject({ goalId: null });

    const withoutLinkedTask = await app.inject({ method: "GET", url: "/chapters" });
    expect(withoutLinkedTask.json()).toMatchObject({ chapters: [{ goals: [{ id: goalId, linkedTaskCount: 0 }] }] });

    const missingGoal = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { ...taskPayload, title: "不应关联到不存在的目标", lane: "side", goalId: "missing-goal" },
    });
    expect(missingGoal.statusCode).toBe(404);
    expect(missingGoal.json()).toEqual({ code: "TASK_NOT_FOUND", message: "没有找到要关联的目标。" });
  });

  it("makes rewards claimable only after completion and aggregates granted experience", async () => {
    const app = createTestApp();
    const created = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        ...taskPayload,
        rewardTitle: "批准玩游戏 2 小时",
        experienceReward: 15,
      },
    });
    const taskId = created.json().id as string;

    const completed = await app.inject({ method: "POST", url: `/tasks/${taskId}/complete` });
    expect(completed.statusCode).toBe(200);
    expect(completed.json()).toMatchObject({
      status: "completed",
      experienceGranted: 15,
      rewardStatus: "available",
    });

    const progressWithReward = await app.inject({ method: "GET", url: "/progress" });
    expect(progressWithReward.statusCode).toBe(200);
    expect(progressWithReward.json()).toEqual({
      experience: 15,
      availableRewards: [{ taskId, taskTitle: taskPayload.title, rewardTitle: "批准玩游戏 2 小时" }],
      pendingPenalties: [],
    });

    const claimed = await app.inject({ method: "POST", url: `/tasks/${taskId}/claim-reward` });
    expect(claimed.statusCode).toBe(200);
    expect(claimed.json()).toMatchObject({ rewardStatus: "claimed" });
    expect((await app.inject({ method: "GET", url: "/progress" })).json()).toMatchObject({
      experience: 15,
      availableRewards: [],
    });
  });

  it("stores a selected penalty image locally and exposes it only through the local evidence route", async () => {
    const evidenceDirectory = mkdtempSync(join(tmpdir(), "mainline-evidence-"));
    evidenceDirectories.push(evidenceDirectory);
    const app = createApp({ databasePath: ":memory:", evidenceDirectory });
    apps.push(app);
    const created = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        ...taskPayload,
        title: "完成晚间锻炼",
        lane: "growth",
        penaltyKind: "physical",
        penaltyDetail: "完成 30 个俯卧撑",
      },
    });
    const taskId = created.json().id as string;
    await app.inject({ method: "POST", url: `/tasks/${taskId}/mark-incomplete`, payload: {} });

    const uploaded = await app.inject({
      method: "POST",
      url: "/evidence",
      payload: {
        taskId,
        filename: "俯卧撑凭据.png",
        mimeType: "image/png",
        dataBase64: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString("base64"),
      },
    });
    expect(uploaded.statusCode).toBe(201);
    expect(uploaded.json()).toMatchObject({ taskId, taskTitle: "完成晚间锻炼", kind: "penalty", fileUrl: expect.stringContaining("/evidence/") });

    const evidenceId = uploaded.json().id as string;
    const listed = await app.inject({ method: "GET", url: "/evidence" });
    expect(listed.json()).toMatchObject({ evidence: [{ id: evidenceId, originalFilename: "俯卧撑凭据.png" }] });

    const file = await app.inject({ method: "GET", url: `/evidence/${evidenceId}/file` });
    expect(file.statusCode).toBe(200);
    expect(file.headers["content-type"]).toContain("image/png");

    await app.inject({ method: "POST", url: `/tasks/${taskId}/fulfill-penalty` });
    const afterFulfillment = await app.inject({
      method: "POST",
      url: "/evidence",
      payload: {
        taskId,
        filename: "不应保存.png",
        mimeType: "image/png",
        dataBase64: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString("base64"),
      },
    });
    expect(afterFulfillment.statusCode).toBe(409);
  });

  it("requires results for result-report tasks and creates a 24-hour self-selected penalty on incomplete work", async () => {
    const app = createTestApp();
    const resultTask = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        ...taskPayload,
        title: "写一份 Agent 教程",
        lane: "side",
        completionMode: "result_report",
        experienceReward: 20,
        rewardTitle: "一瓶可乐",
      },
    });
    const resultTaskId = resultTask.json().id as string;

    const directCompletion = await app.inject({ method: "POST", url: `/tasks/${resultTaskId}/complete` });
    expect(directCompletion.statusCode).toBe(409);

    const submitted = await app.inject({
      method: "POST",
      url: `/tasks/${resultTaskId}/submit-result`,
      payload: { summary: "完成教程大纲、示例项目和一段讲解视频。", selfAssessment: "excellent" },
    });
    expect(submitted.statusCode).toBe(200);
    expect(submitted.json()).toMatchObject({
      status: "pending_resolution",
      selfAssessment: "excellent",
    });

    const confirmed = await app.inject({ method: "POST", url: `/tasks/${resultTaskId}/confirm-result` });
    expect(confirmed.statusCode).toBe(200);
    expect(confirmed.json()).toMatchObject({
      status: "completed",
      experienceGranted: 24,
      rewardStatus: "available",
    });

    const incompleteTask = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: {
        ...taskPayload,
        title: "完成一次晚间锻炼",
        lane: "growth",
        rewardTitle: "无负担刷手机 2 小时",
        penaltyKind: "physical",
        penaltyDetail: "完成 30 个俯卧撑",
      },
    });
    const incompleteTaskId = incompleteTask.json().id as string;

    const markedIncomplete = await app.inject({
      method: "POST",
      url: `/tasks/${incompleteTaskId}/mark-incomplete`,
      payload: { reason: "下班太晚，今天无法完成。" },
    });
    expect(markedIncomplete.statusCode).toBe(200);
    expect(markedIncomplete.json()).toMatchObject({
      status: "incomplete",
      rewardStatus: "forfeited",
      penaltyStatus: "pending",
      incompleteReason: "下班太晚，今天无法完成。",
    });
    expect(markedIncomplete.json().penaltyDueAt).toEqual(expect.any(String));

    const progressWithPenalty = await app.inject({ method: "GET", url: "/progress" });
    expect(progressWithPenalty.json()).toMatchObject({
      experience: 24,
      availableRewards: [{ taskId: resultTaskId, rewardTitle: "一瓶可乐" }],
      pendingPenalties: [{ taskId: incompleteTaskId, kind: "physical", detail: "完成 30 个俯卧撑" }],
    });

    const fulfilled = await app.inject({ method: "POST", url: `/tasks/${incompleteTaskId}/fulfill-penalty` });
    expect(fulfilled.statusCode).toBe(200);
    expect(fulfilled.json()).toMatchObject({ penaltyStatus: "fulfilled" });
  });
});
