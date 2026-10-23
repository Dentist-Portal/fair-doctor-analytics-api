import cors from "cors";
import express, { type Request, type Response } from "express";

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

export default app;
