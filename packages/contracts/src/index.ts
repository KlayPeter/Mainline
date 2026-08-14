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

export const TaskLaneSchema = Type.Union([
  Type.Literal("main"),
  Type.Literal("side"),
  Type.Literal("growth"),
  Type.Literal("routine"),
]);

export const TaskFormSchema = Type.Union([
  Type.Literal("one_off"),
  Type.Literal("routine"),
  Type.Literal("challenge"),
  Type.Literal("event"),
]);

export const TaskTimeBlockSchema = Type.Union([
  Type.Literal("anytime"),
  Type.Literal("morning"),
  Type.Literal("afternoon"),
  Type.Literal("evening"),
]);

export const TaskStatusSchema = Type.Union([
  Type.Literal("planned"),
  Type.Literal("in_progress"),
  Type.Literal("paused"),
  Type.Literal("interrupted"),
  Type.Literal("completed"),
  Type.Literal("incomplete"),
  Type.Literal("pending_resolution"),
  Type.Literal("abandoned"),
  Type.Literal("closed"),
]);

const DateOnlySchema = Type.String({ pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" });
const TaskTitleSchema = Type.String({ minLength: 1, maxLength: 120 });
const TaskDetailsSchema = Type.String({ maxLength: 1000 });

export const TaskSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    title: TaskTitleSchema,
    details: TaskDetailsSchema,
    lane: TaskLaneSchema,
    form: TaskFormSchema,
    scheduledDate: DateOnlySchema,
    timeBlock: TaskTimeBlockSchema,
    status: TaskStatusSchema,
    createdAt: Type.String({ minLength: 1 }),
    updatedAt: Type.String({ minLength: 1 }),
    completedAt: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  },
  { additionalProperties: false },
);

export const TaskCreateInputSchema = Type.Object(
  {
    title: TaskTitleSchema,
    details: TaskDetailsSchema,
    lane: TaskLaneSchema,
    form: TaskFormSchema,
    scheduledDate: DateOnlySchema,
    timeBlock: TaskTimeBlockSchema,
  },
  { additionalProperties: false },
);

export const TaskUpdateInputSchema = Type.Object(
  {
    title: Type.Optional(TaskTitleSchema),
    details: Type.Optional(TaskDetailsSchema),
    lane: Type.Optional(TaskLaneSchema),
    form: Type.Optional(TaskFormSchema),
    scheduledDate: Type.Optional(DateOnlySchema),
    timeBlock: Type.Optional(TaskTimeBlockSchema),
  },
  { additionalProperties: false, minProperties: 1 },
);

export const TaskIdParamsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1, maxLength: 64 }),
  },
  { additionalProperties: false },
);

export const TaskDateQuerySchema = Type.Object(
  {
    date: Type.Optional(DateOnlySchema),
  },
  { additionalProperties: false },
);

export const TaskListResponseSchema = Type.Object(
  {
    tasks: Type.Array(TaskSchema),
  },
  { additionalProperties: false },
);

export const ApiProblemSchema = Type.Object(
  {
    code: Type.String({ minLength: 1 }),
    message: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export const NoContentSchema = Type.Null();

export type Task = Static<typeof TaskSchema>;
export type TaskLane = Static<typeof TaskLaneSchema>;
export type TaskForm = Static<typeof TaskFormSchema>;
export type TaskTimeBlock = Static<typeof TaskTimeBlockSchema>;
export type TaskStatus = Static<typeof TaskStatusSchema>;
export type TaskCreateInput = Static<typeof TaskCreateInputSchema>;
export type TaskUpdateInput = Static<typeof TaskUpdateInputSchema>;
export type TaskDateQuery = Static<typeof TaskDateQuerySchema>;
export type TaskListResponse = Static<typeof TaskListResponseSchema>;
export type ApiProblem = Static<typeof ApiProblemSchema>;

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

export function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const validLanes = ["main", "side", "growth", "routine"];
  const validForms = ["one_off", "routine", "challenge", "event"];
  const validTimeBlocks = ["anytime", "morning", "afternoon", "evening"];
  const validStatuses = [
    "planned",
    "in_progress",
    "paused",
    "interrupted",
    "completed",
    "incomplete",
    "pending_resolution",
    "abandoned",
    "closed",
  ];

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.details === "string" &&
    typeof candidate.lane === "string" &&
    validLanes.includes(candidate.lane) &&
    typeof candidate.form === "string" &&
    validForms.includes(candidate.form) &&
    typeof candidate.scheduledDate === "string" &&
    typeof candidate.timeBlock === "string" &&
    validTimeBlocks.includes(candidate.timeBlock) &&
    typeof candidate.status === "string" &&
    validStatuses.includes(candidate.status) &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    (typeof candidate.completedAt === "string" || candidate.completedAt === null)
  );
}

export function isTaskListResponse(value: unknown): value is TaskListResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.tasks) && candidate.tasks.every(isTask);
}
