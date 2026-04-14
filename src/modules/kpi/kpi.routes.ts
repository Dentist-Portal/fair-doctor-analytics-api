import express, { type Request, type Response } from 'express';
import { getFoxiChartLastWorkingDay, getLast13WeekData, lastWorkingDay } from './kpi.controller';

const router = express.Router();

router.get("/last-working-day", lastWorkingDay);
router.get("/foxi-chart-last-working-day", getFoxiChartLastWorkingDay);
router.get("/kpi/last13weeks", getLast13WeekData);

export default router;