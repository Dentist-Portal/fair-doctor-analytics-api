import cors from "cors";
import express, { type Request, type Response } from "express";
import kpiRoutes from "./modules/kpi/kpi.routes";
import locationRoutes from "./modules/location/location.routes";
import { errorHandler } from "./middleware/errorhanlder";

const app = express();
const corsOrigin = process.env.FRONTEND_URL?.trim();

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === corsOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running fine");
});

app.use("/api/locations", locationRoutes);
app.use("/api", kpiRoutes);

app.use(errorHandler);

export default app;
