import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { LocalDatabase } from "./local-database.js";

describe("LocalDatabase", () => {
  const temporaryDirectories: string[] = [];

  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { force: true, recursive: true });
    }
  });

  it("initializes the in-memory store with its first migration", () => {
    const database = new LocalDatabase(":memory:");

    expect(database.getStatus()).toEqual({
      status: "ready",
      driver: "sqlite",
      migrationCount: 7,
    });

    database.close();
  });

  it("records migrations so reopening a local file does not apply them twice", () => {
    const directory = mkdtempSync(join(tmpdir(), "mainline-sqlite-"));
    temporaryDirectories.push(directory);
    const databasePath = join(directory, "mainline.sqlite");

    const firstDatabase = new LocalDatabase(databasePath);
    const firstStatus = firstDatabase.getStatus();
    firstDatabase.close();

    const reopenedDatabase = new LocalDatabase(databasePath);

    expect(existsSync(databasePath)).toBe(true);
    expect(reopenedDatabase.getStatus()).toEqual(firstStatus);

    reopenedDatabase.close();
  });
});
