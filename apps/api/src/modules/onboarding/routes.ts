import {
  ApiProblemSchema,
  OnboardingProfileSchema,
  OnboardingProfileUpdateInputSchema,
  type OnboardingProfileUpdateInput,
} from "@mainline/contracts";
import type { FastifyInstance, FastifyReply } from "fastify";

import { OnboardingDomainError } from "./errors.js";
import type { OnboardingService } from "./service.js";

interface OnboardingRoutesOptions {
  service: OnboardingService;
}

function sendError(error: unknown, reply: FastifyReply) {
  if (error instanceof OnboardingDomainError) {
    return reply.code(422).send({ code: error.code, message: error.message });
  }

  throw error;
}

export async function registerOnboardingRoutes(
  app: FastifyInstance,
  options: OnboardingRoutesOptions,
): Promise<void> {
  app.get(
    "/onboarding/profile",
    { schema: { response: { 200: OnboardingProfileSchema } } },
    async () => options.service.get(),
  );

  app.put(
    "/onboarding/profile",
    {
      schema: {
        body: OnboardingProfileUpdateInputSchema,
        response: { 200: OnboardingProfileSchema, 422: ApiProblemSchema },
      },
    },
    async (request, reply) => {
      try {
        return options.service.save(request.body as OnboardingProfileUpdateInput);
      } catch (error) {
        return sendError(error, reply);
      }
    },
  );
}
