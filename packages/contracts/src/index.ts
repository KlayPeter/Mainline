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

export function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.status === "ok" && candidate.service === "mainline-api";
}
