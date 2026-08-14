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
      migrationCount: 1,
    });
  });
});
