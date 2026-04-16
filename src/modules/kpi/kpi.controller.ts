import type { NextFunction, Request, Response } from "express";
import {
  foxiChartLastWorkingDay,
  getLast13WeekKPI,
  lastWorkingDayKPI,
} from "./kpi.service";
import { PrismaError } from "../../middleware/errorhanlder";

function parseLocationId(value: unknown, required: true): number;
function parseLocationId(value: unknown, required?: false): number | null;
function parseLocationId(value: unknown, required = false): number | null {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new PrismaError("locationId query parameter is required", 400);
    }

    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new PrismaError("locationId must be a positive integer", 400);
  }

  return parsedValue;
}

export const getLast13WeekData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locationId = parseLocationId(req.query.locationId);
    const data = await getLast13WeekKPI(locationId);

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const lastWorkingDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locationId = parseLocationId(req.query.locationId, true);

    const data = await lastWorkingDayKPI(locationId);

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getFoxiChartLastWorkingDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const locationId = parseLocationId(req.query.locationId, true);
    const data = await foxiChartLastWorkingDay(locationId);

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
