import express, { type Request, type Response } from 'express';

const app = express();

app.get("/", async(req: Request, res: Response) => {
    res.send("Server is running fine");
})

export default app