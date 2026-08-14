import { HealthResponseSchema, LocalStorageStatusSchema } from "@mainline/contracts";
import type { FastifyInstance } from "fastify";

import type { LocalDatabase } from "../../platform/database/local-database.js";
import type { LocalBackupService } from "../../platform/backup/local-backup-service.js";
import { getHealth, getStorageStatus } from "./service.js";

interface SystemRoutesOptions {
  database: LocalDatabase;
  backupService: LocalBackupService;
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

  app.get(
    "/system/backup",
    async (_request, reply) => {
      const backup = options.backupService.create();
      const date = backup.exportedAt.slice(0, 10);
      return reply
        .header("content-disposition", `attachment; filename=mainline-backup-${date}.json`)
        .type("application/json; charset=utf-8")
        .send(JSON.stringify(backup));
    },
  );
}
