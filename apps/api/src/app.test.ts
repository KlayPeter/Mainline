import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "./app.js";

describe("local API", () => {
  const apps: ReturnType<typeof createApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("returns the validated health contract", async () => {
    const app = createApp({ databasePath: ":memory:" });
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "mainline-api",
    });
  });

  it("reports that the local SQLite store is ready without exposing its contents", async () => {
    const app = createApp({ databasePath: ":memory:" });
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/system/storage" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ready",
      driver: "sqlite",
      migrationCount: 10,
    });
  });

  it("downloads a complete local backup document without requiring cloud storage", async () => {
    const app = createApp({ databasePath: ":memory:" });
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/system/backup" });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-disposition"]).toContain("attachment; filename=mainline-backup-");
    expect(response.json()).toMatchObject({
      format: "mainline-local-backup",
      version: 1,
      data: {
        tasks: [],
        chapters: [],
        goals: [],
        dailyReviews: [],
        aiProposals: [],
        evidence: [],
        dailyReminder: { enabled: 0, time: "20:00" },
        onboardingProfile: { id: 1, life_state_title: "", onboarding_completed_at: null },
      },
    });
  });
});
