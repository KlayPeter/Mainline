import type { HealthResponse, LocalStorageStatus } from "@mainline/contracts";

import type { LocalDatabase } from "../../platform/database/local-database.js";

/**
 * System-level factual state. Keeping even this small response in a service
 * establishes the boundary that routes do not contain business logic.
 */
export function getHealth(): HealthResponse {
  return {
    status: "ok",
    service: "mainline-api",
  };
}

export function getStorageStatus(database: LocalDatabase): LocalStorageStatus {
  return database.getStatus();
}
