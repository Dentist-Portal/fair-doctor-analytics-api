import type { Response, Request, NextFunction } from "express";

export class PrismaError extends Error {
    statusCode: number;
    constructor(message: string, statusCode:number = 404) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const ErrorHanlder = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err instanceof PrismaError ? err.message : "Internal Server Error"
    })
}