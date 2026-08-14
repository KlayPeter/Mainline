import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

describe("daily reminder routes", () => {
  const apps: ReturnType<typeof createApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it("keeps one local daily reminder setting with a user-chosen valid time", async () => {
    const app = createApp({ databasePath: ":memory:" });
    apps.push(app);

    const initial = await app.inject({ method: "GET", url: "/reminders/daily" });
    expect(initial.json()).toMatchObject({ enabled: false, time: "20:00" });

    const updated = await app.inject({ method: "PUT", url: "/reminders/daily", payload: { enabled: true, time: "21:15" } });
    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({ enabled: true, time: "21:15" });

    const invalid = await app.inject({ method: "PUT", url: "/reminders/daily", payload: { enabled: true, time: "29:00" } });
    expect(invalid.statusCode).toBe(422);
    expect(invalid.json()).toEqual({ code: "REMINDER_VALIDATION", message: "请填写有效的提醒时间。" });
  });
});
