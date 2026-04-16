import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import type {
  FoxiChartResponse,
  KpiResponse,
  KpiWeekEntry,
  LastWorkingDayKpis,
  LastWorkingDayResponse,
} from "./kpi.types";
import {
  buildWeekRanges,
  formatDate,
  getLastWorkingDay,
} from "../../utils/helper";

type WeekMetricTotals = Record<keyof KpiWeekEntry["kpis"], number>;
type TrendKpiName = keyof WeekMetricTotals;
type TrendDailyMetric = Prisma.DailyMetricGetPayload<{
  select: {
    metricDate: true;
    metricValue: true;
    createdAt: true;
    locationId: true;
    kpiType: {
      select: {
        kpiName: true;
      };
    };
  };
}>;

const normalizeDate = (date: Date) => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const createEmptyWeekTotals = (): WeekMetricTotals => ({
  MVZ_karten_ohne_Leistung: 0,
  MVZ_Karten_Fehlen: 0,
  Fehlende_Doku: 0,
  ohne_Leistung: 0,
});

const TREND_KPI_NAME_MAP: Record<string, TrendKpiName> = {
  ohne_Leistung: "ohne_Leistung",
  Fehlende_Doku: "Fehlende_Doku",
  MVZ_Karten_Fehlen: "MVZ_Karten_Fehlen",
  MVZ_karten_ohne_Leistung: "MVZ_karten_ohne_Leistung",
};

export const getLast13WeekKPI = async (
  locationId?: number | null,
): Promise<KpiResponse> => {
  const weeks = buildWeekRanges();
  const weekBuckets = weeks.map((week) => ({
    ...week,
    kpis: createEmptyWeekTotals(),
  }));

  if (weekBuckets.length === 0) {
    return {
      success: true,
      totalWeeks: 13,
      locationId: locationId ?? null,
      data: [],
    };
  }

  const firstWeekStart = weekBuckets[0]!.weekStart;
  const lastWeekEnd = weekBuckets[weekBuckets.length - 1]!.weekEnd;

  const dailyMetrics: TrendDailyMetric[] = await prisma.dailyMetric.findMany({
    where: {
      metricDate: {
        gte: firstWeekStart,
        lte: lastWeekEnd,
      },
      ...(locationId ? { locationId } : {}),
      kpiType: {
        kpiName: {
          in: Object.keys(TREND_KPI_NAME_MAP),
        },
      },
    },
    select: {
      metricDate: true,
      metricValue: true,
      createdAt: true,
      locationId: true,
      kpiType: {
        select: {
          kpiName: true,
        },
      },
    },
  });

  const getWeekBucket = (date: Date) =>
    weekBuckets.find((week) => date >= week.weekStart && date <= week.weekEnd);
  const latestDailyMetricMap = new Map<string, TrendDailyMetric>();

  for (const metric of dailyMetrics) {
    const metricDate = normalizeDate(metric.metricDate);
    const dedupeKey = [
      metric.locationId,
      metric.kpiType.kpiName,
      metricDate.toISOString(),
    ].join(":");
    const existingMetric = latestDailyMetricMap.get(dedupeKey);

    if (!existingMetric || metric.createdAt > existingMetric.createdAt) {
      latestDailyMetricMap.set(dedupeKey, metric);
    }
  }

  for (const metric of latestDailyMetricMap.values()) {
    const kpiName = TREND_KPI_NAME_MAP[metric.kpiType.kpiName];

    if (!kpiName) {
      continue;
    }

    const weekBucket = getWeekBucket(normalizeDate(metric.metricDate));

    if (!weekBucket) {
      continue;
    }

    weekBucket.kpis[kpiName] += Number(metric.metricValue ?? 0);
  }

  return {
    success: true,
    totalWeeks: 13,
    locationId: locationId ?? null,
    data: weekBuckets,
  };
};

export const lastWorkingDayKPI = async (
  locationId: number,
): Promise<LastWorkingDayResponse> => {
  const lastWorkingDate = getLastWorkingDay();
  const kpiNames = [
    "ohne_Leistung",
    "Foxi",
    "ohne_Folgetermin",
    "MVZ_karten_ohne_Leistung",
    "MVZ_Karten_Fehlen",
    "Fehlende_Doku",
  ];

  const data = await prisma.dailyMetric.findMany({
    where: {
      locationId,
      metricDate: lastWorkingDate,
      kpiType: {
        kpiName: {
          in: [...kpiNames],
        },
      },
    },
    select: {
      metricValue: true,
      kpiType: {
        select: {
          kpiName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const kpiMap: LastWorkingDayKpis = {
    ohne_Leistung: 0,
    Foxi: 0,
    ohne_Folgetermin: 0,
    MVZ_karten_ohne_Leistung: 0,
    MVZ_Karten_Fehlen: 0,
    Fehlende_Doku: 0,
  };

  for (const item of data) {
    const key = item.kpiType.kpiName as keyof LastWorkingDayKpis;
    if (kpiMap[key] === 0) {
      kpiMap[key] = Number(item.metricValue ?? 0);
    }
  }

  const date = formatDate(lastWorkingDate);

  return {
    success: true,
    date: date || "",
    locationId,
    kpis: kpiMap,
  };
};

export const foxiChartLastWorkingDay = async (
  locationId: number,
): Promise<FoxiChartResponse> => {
  const lastWorkingDate = getLastWorkingDay();
  const records = await prisma.dailyMetric.findMany({
    where: {
      kpiType: {
        kpiName: "Foxi",
      },
      locationId,
      metricDate: lastWorkingDate,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const record = records[0];
  const currentPercentage = Number(record?.metricValue) || 0;
  const remainingPercentage = 100 - currentPercentage;

  return {
    success: true,
    date: formatDate(lastWorkingDate) || "",
    currentPercentage,
    remainingPercentage,
  };
};
