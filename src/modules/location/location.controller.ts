import type { NextFunction, Request, Response } from "express";
import { fetchLocations } from "./location.service";

export const getAllLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchLocations();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
