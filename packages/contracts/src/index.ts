import { Type, type Static } from "typebox";

/**
 * The smallest shared API contract. New HTTP payloads must be added here first
 * so that the browser and local server agree on the shape of factual data.
 */
export const HealthResponseSchema = Type.Object(
  {
    status: Type.Literal("ok"),
    service: Type.Literal("mainline-api"),
  },
  { additionalProperties: false },
);

export type HealthResponse = Static<typeof HealthResponseSchema>;

export const LocalStorageStatusSchema = Type.Object(
  {
    status: Type.Literal("ready"),
    driver: Type.Literal("sqlite"),
    migrationCount: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);

export type LocalStorageStatus = Static<typeof LocalStorageStatusSchema>;

export function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.status === "ok" && candidate.service === "mainline-api";
}

export function isLocalStorageStatus(value: unknown): value is LocalStorageStatus {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.status === "ready" &&
    candidate.driver === "sqlite" &&
    typeof candidate.migrationCount === "number" &&
    Number.isInteger(candidate.migrationCount) &&
    candidate.migrationCount >= 1
  );
}
