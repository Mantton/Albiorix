import "dotenv/config";
import { logger } from "./logger";

// Server
export const PORT = process.env["PORT"] ?? 5000;
export const TACHIDESK_URL = process.env["TACHIDESK_URL"] ?? "";

if (!TACHIDESK_URL) {
  logger.error("TachiDesk URL not set");
  process.exit(1);
}

// Environment
export const ENVIRONMENT = process.env.NODE_ENV ?? "development";
export const isProductionEnvironment = ENVIRONMENT === "production";
