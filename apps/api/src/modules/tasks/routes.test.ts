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

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
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
    expect(completed.json()).toMatchObject({ status: "completed" });
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
});
