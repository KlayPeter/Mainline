import Fastify, { type FastifyServerOptions } from "fastify";

import { registerSystemRoutes } from "./modules/system/routes.js";
import { TaskRepository } from "./modules/tasks/repository.js";
import { registerTaskRoutes } from "./modules/tasks/routes.js";
import { TaskService } from "./modules/tasks/service.js";
import { LocalDatabase } from "./platform/database/local-database.js";

export interface MainlineAppOptions {
  databasePath?: string;
  fastify?: FastifyServerOptions;
}

export function createApp(options: MainlineAppOptions = {}) {
  const database = new LocalDatabase(options.databasePath);
  const app = Fastify({ logger: false, ...options.fastify });
  const taskService = new TaskService(new TaskRepository(database.getConnection()));

  app.addHook("onClose", () => database.close());
  app.register(registerSystemRoutes, { database });
  app.register(registerTaskRoutes, { service: taskService });

  return app;
}
