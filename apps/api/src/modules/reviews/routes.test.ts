import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";

describe("daily review routes", () => {
  const apps: ReturnType<typeof createApp>[] = [];
  afterEach(async () => { await Promise.all(apps.splice(0).map((app) => app.close())); });
  it("keeps one editable local review per day and exposes it for later memory recall", async () => {
    const app = createApp({ databasePath: ":memory:" }); apps.push(app);
    const saved = await app.inject({ method: "PUT", url: "/reviews/2026-08-14", payload: { progress: "完成了需求梳理。", obstacles: "下班较晚。", nextStep: "明天先做课程第一节。", keepAsMemory: true } });
    expect(saved.statusCode).toBe(200); expect(saved.json()).toMatchObject({ date: "2026-08-14", keepAsMemory: true });
    const updated = await app.inject({ method: "PUT", url: "/reviews/2026-08-14", payload: { progress: "完成需求梳理并提交。", obstacles: "", nextStep: "明天开始 Agent 课程。", keepAsMemory: false } });
    expect(updated.json()).toMatchObject({ progress: "完成需求梳理并提交。", keepAsMemory: false });
    expect((await app.inject({ method: "GET", url: "/reviews" })).json()).toMatchObject({ reviews: [{ date: "2026-08-14", nextStep: "明天开始 Agent 课程。" }] });
  });
});
