import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { ErrorHandler } from "./utils/handlers";
import router from "./routes/source.router";
import { handleFetchRunnerList } from "./controllers/source.controller";

// Define
const app = express();

// Core Middleware
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(cors());

// Routes
app.use("/source", router);
app.get("/runners.json", handleFetchRunnerList);

// Default Handlers
app.use(ErrorHandler);
app.use("*", (req, res) => {
  res.status(400).send({ msg: "route not found" });
});

// Export
export default app;
