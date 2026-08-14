import {
  ApiProblemSchema,
  NoContentSchema,
  ProgressSnapshotSchema,
  TaskCreateInputSchema,
  TaskDateQuerySchema,
  TaskEvidenceCreateInputSchema,
  TaskEvidenceListResponseSchema,
  TaskEvidenceSchema,
  TaskIdParamsSchema,
  TaskIncompleteInputSchema,
  TaskListResponseSchema,
  TaskResultSubmissionInputSchema,
  TaskSchema,
  TaskUpdateInputSchema,
  type TaskCreateInput,
  type TaskDateQuery,
  type TaskEvidenceCreateInput,
  type TaskIncompleteInput,
  type TaskResultSubmissionInput,
  type TaskUpdateInput,
} from "@mainline/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";

import { TaskDomainError } from "./errors.js";
import type { TaskEvidenceService } from "./evidence-service.js";
import type { TaskService } from "./service.js";

interface TaskRoutesOptions {
  service: TaskService;
  evidenceService: TaskEvidenceService;
}

function sendTaskError(error: unknown, reply: FastifyReply) {
  if (error instanceof TaskDomainError) {
    return reply.code(error.statusCode).send({ code: error.code, message: error.message });
  }

  throw error;
}

export async function registerTaskRoutes(
  app: FastifyInstance,
  options: TaskRoutesOptions,
): Promise<void> {
  app.get(
    "/progress",
    { schema: { response: { 200: ProgressSnapshotSchema } } },
    async () => options.service.getProgress(),
  );

  app.get(
    "/evidence",
    { schema: { response: { 200: TaskEvidenceListResponseSchema } } },
    async () => options.evidenceService.list(),
  );

  app.post(
    "/evidence",
    {
      bodyLimit: 8 * 1024 * 1024,
      schema: {
        body: TaskEvidenceCreateInputSchema,
        response: { 201: TaskEvidenceSchema, 404: ApiProblemSchema, 409: ApiProblemSchema, 422: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        return reply.code(201).send(options.evidenceService.create(request.body as TaskEvidenceCreateInput));
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.get(
    "/evidence/:id/file",
    { schema: { params: TaskIdParamsSchema, response: { 404: ApiProblemSchema } } },
    async (request, reply) => {
      try {
        const evidence = options.evidenceService.read((request.params as { id: string }).id);
        return reply.type(evidence.mimeType).send(evidence.content);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.get(
    "/tasks",
    {
      schema: {
        querystring: TaskDateQuerySchema,
        response: { 200: TaskListResponseSchema, 422: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        return options.service.list(request.query as TaskDateQuery);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks",
    {
      schema: {
        body: TaskCreateInputSchema,
        response: { 201: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema, 422: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        return reply.code(201).send(options.service.create(request.body as TaskCreateInput));
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.patch(
    "/tasks/:id",
    {
      schema: {
        params: TaskIdParamsSchema,
        body: TaskUpdateInputSchema,
        response: {
          200: TaskSchema,
          404: ApiProblemSchema,
          409: ApiProblemSchema,
          422: ApiProblemSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.update(id, request.body as TaskUpdateInput);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks/:id/start",
    {
      schema: {
        params: TaskIdParamsSchema,
        response: { 200: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.start(id);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks/:id/complete",
    {
      schema: {
        params: TaskIdParamsSchema,
        response: { 200: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.complete(id);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks/:id/submit-result",
    {
      schema: {
        params: TaskIdParamsSchema,
        body: TaskResultSubmissionInputSchema,
        response: { 200: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema, 422: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.submitResult(id, request.body as TaskResultSubmissionInput);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks/:id/confirm-result",
    {
      schema: {
        params: TaskIdParamsSchema,
        response: { 200: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.confirmResult(id);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks/:id/mark-incomplete",
    {
      schema: {
        params: TaskIdParamsSchema,
        body: TaskIncompleteInputSchema,
        response: { 200: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema, 422: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.markIncomplete(id, request.body as TaskIncompleteInput);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks/:id/claim-reward",
    {
      schema: {
        params: TaskIdParamsSchema,
        response: { 200: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.claimReward(id);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.post(
    "/tasks/:id/fulfill-penalty",
    {
      schema: {
        params: TaskIdParamsSchema,
        response: { 200: TaskSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        return options.service.fulfillPenalty(id);
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );

  app.delete(
    "/tasks/:id",
    {
      schema: {
        params: TaskIdParamsSchema,
        response: { 204: NoContentSchema, 404: ApiProblemSchema, 409: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        options.service.delete(id);
        return reply.code(204).send();
      } catch (error) {
        return sendTaskError(error, reply);
      }
    },
  );
}
