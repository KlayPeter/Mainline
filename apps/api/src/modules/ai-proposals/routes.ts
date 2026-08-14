import {
  AiInterruptionRequestSchema,
  AiProposalIdParamsSchema,
  AiProposalListResponseSchema,
  AiProposalSchema,
  AiTaskPlanRequestSchema,
  ApiProblemSchema,
  type AiInterruptionRequest,
  type AiTaskPlanRequest,
} from "@mainline/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";

import { AiProposalError } from "./errors.js";
import type { AiProposalService } from "./service.js";

interface AiProposalRoutesOptions {
  service: AiProposalService;
}

function sendAiError(error: unknown, reply: FastifyReply) {
  if (error instanceof AiProposalError) {
    return reply.code(error.statusCode).send({ code: error.code, message: error.message });
  }

  throw error;
}

export async function registerAiProposalRoutes(
  app: FastifyInstance,
  options: AiProposalRoutesOptions,
): Promise<void> {
  app.get(
    "/ai/proposals",
    { schema: { response: { 200: AiProposalListResponseSchema } } },
    async () => options.service.listPending(),
  );

  app.post(
    "/ai/task-plans",
    {
      schema: {
        body: AiTaskPlanRequestSchema,
        response: { 201: AiProposalSchema, 422: ApiProblemSchema, 502: ApiProblemSchema, 503: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        return reply.code(201).send(await options.service.createTaskPlan(request.body as AiTaskPlanRequest));
      } catch (error) {
        return sendAiError(error, reply);
      }
    },
  );

  app.post(
    "/ai/interruptions",
    {
      schema: {
        body: AiInterruptionRequestSchema,
        response: { 201: AiProposalSchema, 422: ApiProblemSchema, 502: ApiProblemSchema, 503: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        return reply.code(201).send(await options.service.createInterruption(request.body as AiInterruptionRequest));
      } catch (error) {
        return sendAiError(error, reply);
      }
    },
  );

  app.post(
    "/ai/proposals/:id/accept",
    {
      schema: {
        params: AiProposalIdParamsSchema,
        response: { 200: AiProposalSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.accept(id);
      } catch (error) {
        return sendAiError(error, reply);
      }
    },
  );

  app.post(
    "/ai/proposals/:id/dismiss",
    {
      schema: {
        params: AiProposalIdParamsSchema,
        response: { 200: AiProposalSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.dismiss(id);
      } catch (error) {
        return sendAiError(error, reply);
      }
    },
  );
}
