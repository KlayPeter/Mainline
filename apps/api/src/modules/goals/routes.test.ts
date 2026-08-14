import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

describe("chapter and goal routes", () => {
  const apps: ReturnType<typeof createApp>[] = [];
  afterEach(async () => { await Promise.all(apps.splice(0).map((app) => app.close())); });

  it("keeps multiple domain chapters and marks a goal achieved only after user progress reaches its target", async () => {
    const app = createApp({ databasePath: ":memory:" });
    apps.push(app);
    const chapter = await app.inject({ method: "POST", url: "/chapters", payload: { domain: "career", title: "应届生毕业第一阶段 · 过渡", description: "适应工作和探索学习。", startedOn: "2026-08-14", endsOn: "2026-11-30" } });
    expect(chapter.statusCode).toBe(201);
    const chapterId = chapter.json().id as string;
    const goal = await app.inject({ method: "POST", url: "/goals", payload: { chapterId, title: "获得工作认可", definition: "能承担独立工作，获得几次夸奖认可并争取年底调薪。", metric: "获得认可次数", targetValue: 3, targetDate: "2026-11-30" } });
    expect(goal.statusCode).toBe(201);
    const goalId = goal.json().id as string;
    const progressing = await app.inject({ method: "POST", url: `/goals/${goalId}/progress`, payload: { currentValue: 2 } });
    expect(progressing.json()).toMatchObject({ status: "active", currentValue: 2 });
    const achieved = await app.inject({ method: "POST", url: `/goals/${goalId}/progress`, payload: { currentValue: 3 } });
    expect(achieved.json()).toMatchObject({ status: "achieved", currentValue: 3 });
    const map = await app.inject({ method: "GET", url: "/chapters" });
    expect(map.json()).toMatchObject({ chapters: [{ id: chapterId, domain: "career", goals: [{ id: goalId, status: "achieved" }] }] });
  });
});
