import { HealthResponseSchema, LocalStorageStatusSchema } from "@mainline/contracts";
import type { FastifyInstance } from "fastify";

import type { LocalDatabase } from "../../platform/database/local-database.js";
import { getHealth, getStorageStatus } from "./service.js";

interface SystemRoutesOptions {
  database: LocalDatabase;
}

export async function registerSystemRoutes(
  app: FastifyInstance,
  options: SystemRoutesOptions,
): Promise<void> {
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

  app.get(
    "/system/storage",
    {
      schema: {
        response: {
          200: LocalStorageStatusSchema,
        },
      },
    },
    async () => getStorageStatus(options.database),
  );
}
