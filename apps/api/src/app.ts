import Fastify, { type FastifyServerOptions } from "fastify";

import { registerSystemRoutes } from "./modules/system/routes.js";
import { LocalDatabase } from "./platform/database/local-database.js";

export interface MainlineAppOptions {
  databasePath?: string;
  fastify?: FastifyServerOptions;
}

export function createApp(options: MainlineAppOptions = {}) {
  const database = new LocalDatabase(options.databasePath);
  const app = Fastify({ logger: false, ...options.fastify });

  app.addHook("onClose", () => database.close());
  app.register(registerSystemRoutes, { database });

  return app;
}
