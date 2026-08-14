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

export const LifeDomainSchema = Type.Union([
  Type.Literal("career"),
  Type.Literal("learning"),
  Type.Literal("creation"),
  Type.Literal("health"),
  Type.Literal("life"),
]);

export const ChapterStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("completed"),
  Type.Literal("archived"),
]);

export const GoalStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("achieved"),
  Type.Literal("paused"),
  Type.Literal("abandoned"),
]);

export const TaskCompletionModeSchema = Type.Union([
  Type.Literal("direct"),
  Type.Literal("result_report"),
]);

export const TaskRewardStatusSchema = Type.Union([
  Type.Literal("none"),
  Type.Literal("locked"),
  Type.Literal("available"),
  Type.Literal("claimed"),
  Type.Literal("forfeited"),
]);

export const TaskPenaltyKindSchema = Type.Union([
  Type.Literal("none"),
  Type.Literal("money"),
  Type.Literal("physical"),
  Type.Literal("custom"),
]);

export const TaskPenaltyStatusSchema = Type.Union([
  Type.Literal("none"),
  Type.Literal("armed"),
  Type.Literal("pending"),
  Type.Literal("fulfilled"),
  Type.Literal("waived"),
]);

export const TaskSelfAssessmentSchema = Type.Union([
  Type.Literal("basic"),
  Type.Literal("solid"),
  Type.Literal("excellent"),
]);

const DateOnlySchema = Type.String({ pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" });
const TaskTitleSchema = Type.String({ minLength: 1, maxLength: 120 });
const TaskDetailsSchema = Type.String({ maxLength: 1000 });
const TaskRewardTitleSchema = Type.String({ maxLength: 120 });
const TaskPenaltyDetailSchema = Type.String({ maxLength: 300 });
const TaskIncompleteReasonSchema = Type.String({ maxLength: 300 });
const TaskResultSummarySchema = Type.String({ minLength: 1, maxLength: 1000 });
const TaskGoalIdSchema = Type.String({ minLength: 1, maxLength: 64 });
const TaskExperienceSchema = Type.Integer({ minimum: 1, maximum: 100 });
const GrantedExperienceSchema = Type.Integer({ minimum: 0, maximum: 150 });
const PenaltyAmountSchema = Type.Integer({ minimum: 1, maximum: 100_000 });
const ChapterTitleSchema = Type.String({ minLength: 1, maxLength: 120 });
const ChapterDescriptionSchema = Type.String({ maxLength: 1000 });
const GoalTitleSchema = Type.String({ minLength: 1, maxLength: 120 });
const GoalDefinitionSchema = Type.String({ maxLength: 1000 });
const GoalMetricSchema = Type.String({ maxLength: 120 });
const ReviewTextSchema = Type.String({ maxLength: 1500 });

export const TaskSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    title: TaskTitleSchema,
    details: TaskDetailsSchema,
    goalId: Type.Union([TaskGoalIdSchema, Type.Null()]),
    lane: TaskLaneSchema,
    form: TaskFormSchema,
    scheduledDate: DateOnlySchema,
    timeBlock: TaskTimeBlockSchema,
    completionMode: TaskCompletionModeSchema,
    experienceReward: TaskExperienceSchema,
    experienceGranted: GrantedExperienceSchema,
    rewardTitle: TaskRewardTitleSchema,
    rewardStatus: TaskRewardStatusSchema,
    penaltyKind: TaskPenaltyKindSchema,
    penaltyDetail: TaskPenaltyDetailSchema,
    penaltyAmount: Type.Union([PenaltyAmountSchema, Type.Null()]),
    penaltyStatus: TaskPenaltyStatusSchema,
    penaltyDueAt: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    resultSummary: Type.Union([TaskResultSummarySchema, Type.Null()]),
    selfAssessment: Type.Union([TaskSelfAssessmentSchema, Type.Null()]),
    resultSubmittedAt: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    incompleteReason: Type.Union([TaskIncompleteReasonSchema, Type.Null()]),
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
    goalId: Type.Optional(TaskGoalIdSchema),
    completionMode: Type.Optional(TaskCompletionModeSchema),
    experienceReward: Type.Optional(TaskExperienceSchema),
    rewardTitle: Type.Optional(TaskRewardTitleSchema),
    penaltyKind: Type.Optional(TaskPenaltyKindSchema),
    penaltyDetail: Type.Optional(TaskPenaltyDetailSchema),
    penaltyAmount: Type.Optional(PenaltyAmountSchema),
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
    goalId: Type.Optional(Type.Union([TaskGoalIdSchema, Type.Null()])),
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

export const ChapterSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    domain: LifeDomainSchema,
    title: ChapterTitleSchema,
    description: ChapterDescriptionSchema,
    startedOn: DateOnlySchema,
    endsOn: Type.Union([DateOnlySchema, Type.Null()]),
    status: ChapterStatusSchema,
    createdAt: Type.String({ minLength: 1 }),
    updatedAt: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export const GoalSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    chapterId: Type.String({ minLength: 1 }),
    title: GoalTitleSchema,
    definition: GoalDefinitionSchema,
    metric: GoalMetricSchema,
    targetValue: Type.Integer({ minimum: 1, maximum: 1_000_000 }),
    currentValue: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    linkedTaskCount: Type.Integer({ minimum: 0 }),
    targetDate: Type.Union([DateOnlySchema, Type.Null()]),
    status: GoalStatusSchema,
    createdAt: Type.String({ minLength: 1 }),
    updatedAt: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export const ChapterWithGoalsSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    domain: LifeDomainSchema,
    title: ChapterTitleSchema,
    description: ChapterDescriptionSchema,
    startedOn: DateOnlySchema,
    endsOn: Type.Union([DateOnlySchema, Type.Null()]),
    status: ChapterStatusSchema,
    createdAt: Type.String({ minLength: 1 }),
    updatedAt: Type.String({ minLength: 1 }),
    goals: Type.Array(GoalSchema),
  },
  { additionalProperties: false },
);

export const GoalMapResponseSchema = Type.Object(
  { chapters: Type.Array(ChapterWithGoalsSchema) },
  { additionalProperties: false },
);

export const ChapterCreateInputSchema = Type.Object(
  {
    domain: LifeDomainSchema,
    title: ChapterTitleSchema,
    description: ChapterDescriptionSchema,
    startedOn: DateOnlySchema,
    endsOn: Type.Optional(DateOnlySchema),
  },
  { additionalProperties: false },
);

export const GoalCreateInputSchema = Type.Object(
  {
    chapterId: Type.String({ minLength: 1, maxLength: 64 }),
    title: GoalTitleSchema,
    definition: GoalDefinitionSchema,
    metric: GoalMetricSchema,
    targetValue: Type.Integer({ minimum: 1, maximum: 1_000_000 }),
    targetDate: Type.Optional(DateOnlySchema),
  },
  { additionalProperties: false },
);

export const GoalProgressInputSchema = Type.Object(
  {
    currentValue: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  },
  { additionalProperties: false },
);

export const DailyReviewSchema = Type.Object(
  {
    date: DateOnlySchema,
    progress: ReviewTextSchema,
    obstacles: ReviewTextSchema,
    nextStep: ReviewTextSchema,
    keepAsMemory: Type.Boolean(),
    createdAt: Type.String({ minLength: 1 }),
    updatedAt: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export const DailyReviewInputSchema = Type.Object(
  {
    progress: ReviewTextSchema,
    obstacles: ReviewTextSchema,
    nextStep: ReviewTextSchema,
    keepAsMemory: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const ReviewListResponseSchema = Type.Object(
  { reviews: Type.Array(DailyReviewSchema) },
  { additionalProperties: false },
);

export const TaskResultSubmissionInputSchema = Type.Object(
  {
    summary: TaskResultSummarySchema,
    selfAssessment: TaskSelfAssessmentSchema,
  },
  { additionalProperties: false },
);

export const TaskIncompleteInputSchema = Type.Object(
  {
    reason: Type.Optional(TaskIncompleteReasonSchema),
  },
  { additionalProperties: false },
);

export const ProgressRewardSchema = Type.Object(
  {
    taskId: Type.String({ minLength: 1 }),
    taskTitle: TaskTitleSchema,
    rewardTitle: TaskRewardTitleSchema,
  },
  { additionalProperties: false },
);

export const ProgressPenaltySchema = Type.Object(
  {
    taskId: Type.String({ minLength: 1 }),
    taskTitle: TaskTitleSchema,
    kind: TaskPenaltyKindSchema,
    detail: TaskPenaltyDetailSchema,
    amount: Type.Union([PenaltyAmountSchema, Type.Null()]),
    dueAt: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export const ProgressSnapshotSchema = Type.Object(
  {
    experience: Type.Integer({ minimum: 0 }),
    availableRewards: Type.Array(ProgressRewardSchema),
    pendingPenalties: Type.Array(ProgressPenaltySchema),
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
export type LifeDomain = Static<typeof LifeDomainSchema>;
export type ChapterStatus = Static<typeof ChapterStatusSchema>;
export type GoalStatus = Static<typeof GoalStatusSchema>;
export type TaskCompletionMode = Static<typeof TaskCompletionModeSchema>;
export type TaskRewardStatus = Static<typeof TaskRewardStatusSchema>;
export type TaskPenaltyKind = Static<typeof TaskPenaltyKindSchema>;
export type TaskPenaltyStatus = Static<typeof TaskPenaltyStatusSchema>;
export type TaskSelfAssessment = Static<typeof TaskSelfAssessmentSchema>;
export type TaskCreateInput = Static<typeof TaskCreateInputSchema>;
export type TaskUpdateInput = Static<typeof TaskUpdateInputSchema>;
export type TaskDateQuery = Static<typeof TaskDateQuerySchema>;
export type TaskListResponse = Static<typeof TaskListResponseSchema>;
export type Chapter = Static<typeof ChapterSchema>;
export type Goal = Static<typeof GoalSchema>;
export type ChapterWithGoals = Static<typeof ChapterWithGoalsSchema>;
export type GoalMapResponse = Static<typeof GoalMapResponseSchema>;
export type ChapterCreateInput = Static<typeof ChapterCreateInputSchema>;
export type GoalCreateInput = Static<typeof GoalCreateInputSchema>;
export type GoalProgressInput = Static<typeof GoalProgressInputSchema>;
export type DailyReview = Static<typeof DailyReviewSchema>;
export type DailyReviewInput = Static<typeof DailyReviewInputSchema>;
export type ReviewListResponse = Static<typeof ReviewListResponseSchema>;
export type TaskResultSubmissionInput = Static<typeof TaskResultSubmissionInputSchema>;
export type TaskIncompleteInput = Static<typeof TaskIncompleteInputSchema>;
export type ProgressReward = Static<typeof ProgressRewardSchema>;
export type ProgressPenalty = Static<typeof ProgressPenaltySchema>;
export type ProgressSnapshot = Static<typeof ProgressSnapshotSchema>;
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
  return Value.Check(TaskSchema, value);
}

export function isTaskListResponse(value: unknown): value is TaskListResponse {
  return Value.Check(TaskListResponseSchema, value);
}

export function isProgressSnapshot(value: unknown): value is ProgressSnapshot {
  return Value.Check(ProgressSnapshotSchema, value);
}

export function isGoalMapResponse(value: unknown): value is GoalMapResponse {
  return Value.Check(GoalMapResponseSchema, value);
}

export function isReviewListResponse(value: unknown): value is ReviewListResponse {
  return Value.Check(ReviewListResponseSchema, value);
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
