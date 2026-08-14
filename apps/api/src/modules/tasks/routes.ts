import {
  ApiProblemSchema,
  NoContentSchema,
  TaskCreateInputSchema,
  TaskDateQuerySchema,
  TaskIdParamsSchema,
  TaskListResponseSchema,
  TaskSchema,
  TaskUpdateInputSchema,
  type TaskCreateInput,
  type TaskDateQuery,
  type TaskUpdateInput,
} from "@mainline/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";

import { TaskDomainError } from "./errors.js";
import type { TaskService } from "./service.js";

interface TaskRoutesOptions {
  service: TaskService;
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
        response: { 201: TaskSchema, 409: ApiProblemSchema, 422: ApiProblemSchema },
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
