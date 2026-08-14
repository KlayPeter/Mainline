import Fastify, { type FastifyServerOptions } from "fastify";

import { GoalRepository } from "./modules/goals/repository.js";
import { registerGoalRoutes } from "./modules/goals/routes.js";
import { GoalService } from "./modules/goals/service.js";
import { ReviewRepository } from "./modules/reviews/repository.js";
import { registerReviewRoutes } from "./modules/reviews/routes.js";
import { ReviewService } from "./modules/reviews/service.js";
import type { AiPlanningProvider } from "./modules/ai-proposals/provider.js";
import { AiProposalRepository } from "./modules/ai-proposals/repository.js";
import { registerAiProposalRoutes } from "./modules/ai-proposals/routes.js";
import { AiProposalService } from "./modules/ai-proposals/service.js";
import { registerSystemRoutes } from "./modules/system/routes.js";
import { TaskEvidenceRepository } from "./modules/tasks/evidence-repository.js";
import { TaskEvidenceService } from "./modules/tasks/evidence-service.js";
import { TaskRepository } from "./modules/tasks/repository.js";
import { registerTaskRoutes } from "./modules/tasks/routes.js";
import { TaskService } from "./modules/tasks/service.js";
import { createDeepSeekPlanner } from "./platform/ai/deepseek-planner.js";
import { LocalDatabase } from "./platform/database/local-database.js";
import { LocalEvidenceStore } from "./platform/evidence/local-evidence-store.js";

export interface MainlineAppOptions {
  aiProvider?: AiPlanningProvider;
  databasePath?: string;
  evidenceDirectory?: string;
  fastify?: FastifyServerOptions;
}

export function createApp(options: MainlineAppOptions = {}) {
  const database = new LocalDatabase(options.databasePath);
  const app = Fastify({ logger: false, ...options.fastify });
  const taskRepository = new TaskRepository(database.getConnection());
  const goalRepository = new GoalRepository(database.getConnection());
  const taskService = new TaskService(taskRepository, goalRepository);
  const taskEvidenceService = new TaskEvidenceService(
    taskRepository,
    new TaskEvidenceRepository(database.getConnection()),
    new LocalEvidenceStore(options.evidenceDirectory),
  );
  const goalService = new GoalService(goalRepository);
  const reviewService = new ReviewService(new ReviewRepository(database.getConnection()));
  const aiProposalService = new AiProposalService(
    new AiProposalRepository(database.getConnection()),
    options.aiProvider ?? createDeepSeekPlanner(),
  );

  app.addHook("onClose", () => database.close());
  app.register(registerSystemRoutes, { database });
  app.register(registerTaskRoutes, { service: taskService, evidenceService: taskEvidenceService });
  app.register(registerGoalRoutes, { service: goalService });
  app.register(registerReviewRoutes, { service: reviewService });
  app.register(registerAiProposalRoutes, { service: aiProposalService });

  return app;
}
