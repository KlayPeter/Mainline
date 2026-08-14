import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { createApp } from "./app.js";

const DEFAULT_PORT = 4174;
const environmentPath = resolve(import.meta.dirname, "../../../.env");

if (existsSync(environmentPath)) {
  process.loadEnvFile(environmentPath);
}

export function getServerPort(value = process.env.MAINLINE_PORT): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    return DEFAULT_PORT;
  }

  return port;
}

const app = createApp();

try {
  await app.listen({
    host: "127.0.0.1",
    port: getServerPort(),
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
