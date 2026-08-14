import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

const profileInput = {
  lifeStateTitle: "毕业后的过渡期",
  lifeStateDescription: "适应第一份工作，同时建立稳定的学习节奏。",
  lifeStateStartedOn: "2026-08-14",
  lifeStateEndsOn: "2026-11-30",
  currentContext: "工作、Agent 学习和公众号都想推进。",
  timeConstraints: "工作日晚上时间有限，周末更完整。",
  interruptionPatterns: "下班疲惫时容易刷短视频。",
  rewardPreferences: "无负担玩游戏或喝可乐。",
  penaltyPreferences: "转给家人一笔钱，或完成俯卧撑。",
  capabilityFocus: "AI Coding、Agent 开发和独立交付。",
};

describe("onboarding routes", () => {
  const apps: ReturnType<typeof createApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("keeps an editable local profile and marks onboarding complete only after the user saves it", async () => {
    const app = createApp({ databasePath: ":memory:" });
    apps.push(app);

    const initial = await app.inject({ method: "GET", url: "/onboarding/profile" });
    expect(initial.json()).toMatchObject({ completed: false, lifeStateTitle: "" });

    const saved = await app.inject({
      method: "PUT",
      url: "/onboarding/profile",
      payload: profileInput,
    });
    expect(saved.statusCode).toBe(200);
    expect(saved.json()).toMatchObject({
      completed: true,
      lifeStateTitle: profileInput.lifeStateTitle,
      capabilityFocus: profileInput.capabilityFocus,
    });

    const invalid = await app.inject({
      method: "PUT",
      url: "/onboarding/profile",
      payload: { ...profileInput, lifeStateEndsOn: "2026-01-01" },
    });
    expect(invalid.statusCode).toBe(422);
    expect(invalid.json()).toEqual({
      code: "ONBOARDING_VALIDATION",
      message: "预计结束日期不能早于开始日期。",
    });
  });
});
