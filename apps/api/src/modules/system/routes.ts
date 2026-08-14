import { HealthResponseSchema } from "@mainline/contracts";
import type { FastifyInstance } from "fastify";

import { getHealth } from "./service.js";

export async function registerSystemRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    async () => getHealth(),
  );
}
