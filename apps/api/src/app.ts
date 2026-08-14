import Fastify, { type FastifyServerOptions } from "fastify";

import { registerSystemRoutes } from "./modules/system/routes.js";

export function createApp(options: FastifyServerOptions = {}) {
  const app = Fastify({ logger: false, ...options });

  app.register(registerSystemRoutes);

  return app;
}
