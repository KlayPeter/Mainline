import {
  ApiProblemSchema,
  DailyReminderSchema,
  DailyReminderUpdateInputSchema,
  type DailyReminderUpdateInput,
} from "@mainline/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";

import { ReminderDomainError } from "./errors.js";
import type { ReminderService } from "./service.js";

interface ReminderRoutesOptions {
  service: ReminderService;
}

function sendError(error: unknown, reply: FastifyReply) {
  if (error instanceof ReminderDomainError) {
    return reply.code(422).send({ code: error.code, message: error.message });
  }

  throw error;
}

export async function registerReminderRoutes(app: FastifyInstance, options: ReminderRoutesOptions): Promise<void> {
  app.get("/reminders/daily", { schema: { response: { 200: DailyReminderSchema } } }, async () => options.service.get());
  app.put("/reminders/daily", { schema: { body: DailyReminderUpdateInputSchema, response: { 200: DailyReminderSchema, 422: ApiProblemSchema } } }, async (request, reply) => {
    try {
      return options.service.save(request.body as DailyReminderUpdateInput);
    } catch (error) {
      return sendError(error, reply);
    }
  });
}
