import { FileType, PatientMetricType } from "@prisma/client";
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

export const getLast13WeekKPI = async (
  locationId?: number | null,
): Promise<KpiResponse> => {
  const weeks = buildWeekRanges();

  // const fullRangeStart = weeks[0].weekStart;
  // const today = weeks[12].weekEnd;

  const patientMetrics = await prisma.patientMetric.findMany({
    where: {
      // metricDate: {
      //   gte: fullRangeStart,
      //   lte: today,
      // },
      metricType: {
        in: ["missing_document", "ohne_leistung"],
      },
      ...(locationId ? { locationId } : {}),
    },
    select: {
      metricDate: true,
      metricType: true,
      locationId: true,
    },
  });

  console.log(patientMetrics.length);

  const fileOperations = await prisma.fileOperation.findMany({
    where: {
      // fileDate: {
      //   gte: fullRangeStart,
      //   lte: today,
      // },
      fileType: {
        in: ["mvz_karten_fehlen", "karten_ohne_leistung"],
      },
      ...(locationId ? { locationId } : {}),
    },
    select: {
      fileDate: true,
      fileType: true,
      locationId: true,
    },
  });

  const data: KpiWeekEntry[] = weeks.map((week) => {
    const missignPatientMetrics = patientMetrics.filter(
      (p) =>
        p.metricType === PatientMetricType.missing_document &&
        p.metricDate >= week.weekStart &&
        p.metricDate <= week.weekEnd,
    ).length;

    const ohneLeistungMetrics = patientMetrics.filter((p) => {
      const metricDate = new Date(p.metricDate);
      metricDate.setHours(0, 0, 0, 0);
      return (
        p.metricType === PatientMetricType.ohne_leistung &&
        metricDate >= week.weekStart &&
        metricDate <= week.weekEnd
      );
    }).length;

    const mvzKartenFehlenFiles = fileOperations.filter(
      (f) =>
        f.fileType === FileType.karten_ohne_leistung &&
        f.fileDate &&
        f.fileDate >= week.weekStart &&
        f.fileDate <= week.weekEnd,
    ).length;

    const mvzKartenOhneLeistung = fileOperations.filter(
      (f) =>
        f.fileType === FileType.mvz_karten_fehlen &&
        f.fileDate &&
        f.fileDate >= week.weekStart &&
        f.fileDate <= week.weekEnd,
    ).length;

    return {
      week: week.week,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      kpis: {
        MVZ_karten_ohne_Leistung: mvzKartenOhneLeistung,
        MVZ_Karten_Fehlen: mvzKartenFehlenFiles,
        Fehlende_Doku: missignPatientMetrics,
        ohne_Leistung: ohneLeistungMetrics,
      },
    };
  });

  return {
    success: true,
    totalWeeks: 13,
    locationId: locationId ?? null,
    data: data,
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

  for (const items of data) {
    const key = items.kpiType.kpiName as keyof LastWorkingDayKpis;
    if (kpiMap[key] == 0) {
      kpiMap[key] = Number(items.metricValue ?? 0);
    }
  }

  const date = formatDate(lastWorkingDate);

  return {
    success: true,
    date: date || "",
    locationId: locationId,
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
  console.log(record);
  const currentPercentage: number = Number(record?.metricValue) || 0;
  const remainingPercentage: number = 100 - currentPercentage;

  return {
    success: true,
    date: formatDate(lastWorkingDate) || "",
    currentPercentage: currentPercentage,
    remainingPercentage: remainingPercentage,
  };
};
