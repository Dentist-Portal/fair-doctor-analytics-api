import type { NextFunction, Request, Response } from "express";
import {
  foxiChartLastWorkingDay,
  getLast13WeekKPI,
  lastWorkingDayKPI,
} from "./kpi.service";
import { Prisma } from "@prisma/client";
import { PrismaError } from "../../middleware/errorhanlder";

export const getLast13WeekData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let locationId = req.query.locationId ? Number(req.query.locationId) : null;
    const data = await getLast13WeekKPI(locationId);

    return res.status(200).json({
      success: true,
      totalWeeks: 13,
      locationId: locationId,
      data: data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        next(new PrismaError("Record not found", 404));
        return;
      }
    }
    next(error);
  }
};

export const lastWorkingDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locationId = req.query.locationId
      ? Number(req.query.locationId)
      : null;

    if (locationId === null) return next(new Error("Internal Server error"));

    const data = await lastWorkingDayKPI(locationId);

    return res.status(200).json({
      success: true,
      date: data.date,
      locationId: data.locationId,
      kpis: data.kpis,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        next(new PrismaError("Record not found", 404));
        return;
      }
    }
    next(error);
  }
};

export const getFoxiChartLastWorkingDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locationId = req.query.locationId
      ? Number(req.query.locationId)
      : null;
    if (locationId === null) return next(new Error("Internal Server Error"));
    const data = await foxiChartLastWorkingDay(locationId);

    return res.status(200).json({
      success: true,
      date: data.date,
      currentPercentage: data.currentPercentage,
      remainingPercentage: data.remainingPercentage,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        next(new PrismaError("Record not found", 404));
        return;
      }
    }
    next(error);
  }
};
