import { ErrorRequestHandler } from "express";
import { logger } from "./logger";

export const ErrorHandler: ErrorRequestHandler = (_err, _, res, _next) => {
  if (res.headersSent) return;

  res.status(500).send({ msg: "server error" });
  logger.error(_err.message);
};
