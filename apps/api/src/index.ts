import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import artisanRoutes from "./routes/artisans";
import requestRoutes from "./routes/requests";
import catalogRoutes from "./routes/catalog";
import reviewRoutes from "./routes/reviews";
import adminRoutes from "./routes/admin";
import { swaggerSpec } from "./swagger";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/catalog", catalogRoutes);
app.use("/artisans", artisanRoutes);
app.use("/requests", requestRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API running on port ${config.port}`);
});
