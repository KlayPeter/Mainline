import {
  ApiProblemSchema,
  ChapterCreateInputSchema,
  ChapterSchema,
  GoalCreateInputSchema,
  GoalMapResponseSchema,
  GoalProgressInputSchema,
  GoalSchema,
  TaskIdParamsSchema,
  type ChapterCreateInput,
  type GoalCreateInput,
  type GoalProgressInput,
} from "@mainline/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";

import { GoalDomainError } from "./errors.js";
import type { GoalService } from "./service.js";

interface GoalRoutesOptions { service: GoalService; }
function sendError(error: unknown, reply: FastifyReply) {
  if (error instanceof GoalDomainError) return reply.code(error.statusCode).send({ code: error.code, message: error.message });
  throw error;
}

export async function registerGoalRoutes(app: FastifyInstance, options: GoalRoutesOptions): Promise<void> {
  app.get("/chapters", { schema: { response: { 200: GoalMapResponseSchema } } }, async () => options.service.list());
  app.post("/chapters", { schema: { body: ChapterCreateInputSchema, response: { 201: ChapterSchema, 422: ApiProblemSchema } } }, async (request, reply) => {
    try { return reply.code(201).send(options.service.createChapter(request.body as ChapterCreateInput)); } catch (error) { return sendError(error, reply); }
  });
  app.post("/goals", { schema: { body: GoalCreateInputSchema, response: { 201: GoalSchema, 404: ApiProblemSchema, 422: ApiProblemSchema } } }, async (request, reply) => {
    try { return reply.code(201).send(options.service.createGoal(request.body as GoalCreateInput)); } catch (error) { return sendError(error, reply); }
  });
  app.post("/goals/:id/progress", { schema: { params: TaskIdParamsSchema, body: GoalProgressInputSchema, response: { 200: GoalSchema, 404: ApiProblemSchema, 409: ApiProblemSchema } } }, async (request, reply) => {
    try { return options.service.updateProgress((request.params as { id: string }).id, request.body as GoalProgressInput); } catch (error) { return sendError(error, reply); }
  });
}
