import { Type, type Static } from "typebox";
import { Value } from "typebox/value";

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

export const AiProposalStatusSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("accepted"),
  Type.Literal("dismissed"),
]);

export const AiTaskPlanRequestSchema = Type.Object(
  {
    title: TaskTitleSchema,
    details: TaskDetailsSchema,
    scheduledDate: DateOnlySchema,
  },
  { additionalProperties: false },
);

export const AiInterruptionRequestSchema = Type.Object(
  {
    message: Type.String({ minLength: 1, maxLength: 1000 }),
    taskId: Type.Optional(Type.String({ minLength: 1, maxLength: 64 })),
  },
  { additionalProperties: false },
);

export const AiTaskPlanContentSchema = Type.Object(
  {
    analysis: Type.String({ minLength: 1, maxLength: 600 }),
    suggestedLane: TaskLaneSchema,
    suggestedForm: TaskFormSchema,
    suggestedTimeBlock: TaskTimeBlockSchema,
    suggestedSteps: Type.Array(
      Type.Object(
        {
          title: Type.String({ minLength: 1, maxLength: 120 }),
          details: Type.String({ maxLength: 600 }),
        },
        { additionalProperties: false },
      ),
      { maxItems: 5 },
    ),
  },
  { additionalProperties: false },
);

export const AiInterruptionContentSchema = Type.Object(
  {
    summary: Type.String({ minLength: 1, maxLength: 400 }),
    suggestedAction: Type.Union([
      Type.Literal("keep"),
      Type.Literal("reduce"),
      Type.Literal("reschedule"),
      Type.Literal("pause"),
    ]),
    suggestedAdjustment: Type.String({ minLength: 1, maxLength: 600 }),
  },
  { additionalProperties: false },
);

export const AiTaskPlanProposalSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    kind: Type.Literal("task_plan"),
    status: AiProposalStatusSchema,
    request: AiTaskPlanRequestSchema,
    content: AiTaskPlanContentSchema,
    createdAt: Type.String({ minLength: 1 }),
    resolvedAt: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  },
  { additionalProperties: false },
);

export const AiInterruptionProposalSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    kind: Type.Literal("interruption"),
    status: AiProposalStatusSchema,
    request: AiInterruptionRequestSchema,
    content: AiInterruptionContentSchema,
    createdAt: Type.String({ minLength: 1 }),
    resolvedAt: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
  },
  { additionalProperties: false },
);

export const AiProposalSchema = Type.Union([AiTaskPlanProposalSchema, AiInterruptionProposalSchema]);

export const AiProposalListResponseSchema = Type.Object(
  {
    proposals: Type.Array(AiProposalSchema),
  },
  { additionalProperties: false },
);

export const AiProposalIdParamsSchema = TaskIdParamsSchema;

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
export type AiProposalStatus = Static<typeof AiProposalStatusSchema>;
export type AiTaskPlanRequest = Static<typeof AiTaskPlanRequestSchema>;
export type AiInterruptionRequest = Static<typeof AiInterruptionRequestSchema>;
export type AiTaskPlanContent = Static<typeof AiTaskPlanContentSchema>;
export type AiInterruptionContent = Static<typeof AiInterruptionContentSchema>;
export type AiTaskPlanProposal = Static<typeof AiTaskPlanProposalSchema>;
export type AiInterruptionProposal = Static<typeof AiInterruptionProposalSchema>;
export type AiProposal = Static<typeof AiProposalSchema>;
export type AiProposalListResponse = Static<typeof AiProposalListResponseSchema>;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isAiTaskPlanContent(value: unknown): value is AiTaskPlanContent {
  return Value.Check(AiTaskPlanContentSchema, value);
}

export function isAiInterruptionContent(value: unknown): value is AiInterruptionContent {
  return Value.Check(AiInterruptionContentSchema, value);
}

export function isAiProposal(value: unknown): value is AiProposal {
  return Value.Check(AiProposalSchema, value);
}

export function isAiTaskPlanProposal(value: unknown): value is AiTaskPlanProposal {
  return isAiProposal(value) && value.kind === "task_plan";
}

export function isAiInterruptionProposal(value: unknown): value is AiInterruptionProposal {
  return isAiProposal(value) && value.kind === "interruption";
}

export function isAiProposalListResponse(value: unknown): value is AiProposalListResponse {
  return Value.Check(AiProposalListResponseSchema, value);
}
