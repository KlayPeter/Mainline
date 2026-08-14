import Fastify, { type FastifyServerOptions } from "fastify";

import type { AiPlanningProvider } from "./modules/ai-proposals/provider.js";
import { AiProposalRepository } from "./modules/ai-proposals/repository.js";
import { registerAiProposalRoutes } from "./modules/ai-proposals/routes.js";
import { AiProposalService } from "./modules/ai-proposals/service.js";
import { registerSystemRoutes } from "./modules/system/routes.js";
import { TaskRepository } from "./modules/tasks/repository.js";
import { registerTaskRoutes } from "./modules/tasks/routes.js";
import { TaskService } from "./modules/tasks/service.js";
import { createDeepSeekPlanner } from "./platform/ai/deepseek-planner.js";
import { LocalDatabase } from "./platform/database/local-database.js";

export interface MainlineAppOptions {
  aiProvider?: AiPlanningProvider;
  databasePath?: string;
  fastify?: FastifyServerOptions;
}

export function createApp(options: MainlineAppOptions = {}) {
  const database = new LocalDatabase(options.databasePath);
  const app = Fastify({ logger: false, ...options.fastify });
  const taskService = new TaskService(new TaskRepository(database.getConnection()));
  const aiProposalService = new AiProposalService(
    new AiProposalRepository(database.getConnection()),
    options.aiProvider ?? createDeepSeekPlanner(),
  );

  app.addHook("onClose", () => database.close());
  app.register(registerSystemRoutes, { database });
  app.register(registerTaskRoutes, { service: taskService });
  app.register(registerAiProposalRoutes, { service: aiProposalService });

  return app;
}
