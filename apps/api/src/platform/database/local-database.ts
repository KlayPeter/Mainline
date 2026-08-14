import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { LocalStorageStatus } from "@mainline/contracts";

import { applyMigrations, getAppliedMigrationCount } from "./migrations.js";

const IN_MEMORY_DATABASE = ":memory:";

export function getDefaultDatabasePath(): string {
  const configuredPath = process.env.MAINLINE_DATABASE_PATH?.trim();

  if (configuredPath) {
    return resolve(configuredPath);
  }

  return resolve(import.meta.dirname, "../../../../../data/mainline.sqlite");
}

export class LocalDatabase {
  readonly #connection: DatabaseSync;

  constructor(private readonly path = getDefaultDatabasePath()) {
    if (path !== IN_MEMORY_DATABASE) {
      mkdirSync(dirname(path), { recursive: true });
    }

    this.#connection = new DatabaseSync(path);
    this.#connection.exec("PRAGMA foreign_keys = ON");

    if (path !== IN_MEMORY_DATABASE) {
      this.#connection.exec("PRAGMA journal_mode = WAL");
    }

    applyMigrations(this.#connection);
  }

  getStatus(): LocalStorageStatus {
    return {
      status: "ready",
      driver: "sqlite",
      migrationCount: getAppliedMigrationCount(this.#connection),
    };
  }

  close(): void {
    this.#connection.close();
  }
}
