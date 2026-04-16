import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

export class PrismaError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 404) {
    super(message);
    this.name = "PrismaError";
    this.statusCode = statusCode;
  }
}

type AppError = Error & {
  statusCode?: number;
};

const getErrorStatusCode = (error: AppError): number => {
  if (typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2025" ? 404 : 400;
  }

  return 500;
};

const getErrorMessage = (error: AppError): string => {
  if (error instanceof PrismaError) {
    return error.message;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2025" ? "Record not found" : "Database request failed";
  }

  return "Internal Server Error";
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const error = err instanceof Error ? (err as AppError) : new Error("Unknown error");

  if (process.env.NODE_ENV !== "test") {
    console.error(error.message);
  }

  res.status(getErrorStatusCode(error)).json({
    success: false,
    message: getErrorMessage(error),
  });
};

export const ErrorHanlder = errorHandler;
