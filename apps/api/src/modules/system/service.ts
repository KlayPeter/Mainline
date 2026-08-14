import type { HealthResponse } from "@mainline/contracts";

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
