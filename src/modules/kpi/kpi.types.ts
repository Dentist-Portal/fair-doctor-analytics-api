export interface KpiWeekEntry {
  week: string; // e.g. '2025-01-06 to 2025-01-12'
  weekStart: Date;
  weekEnd: Date;
  kpis: {
    MVZ_karten_ohne_Leistung: number;
    MVZ_Karten_Fehlen: number;
    Fehlende_Doku: number;
    ohne_Leistung: number;
  };
}
export interface KpiResponse {
  success: boolean;
  totalWeeks: number;
  locationId: number | null;
  data: KpiWeekEntry[];
}

export interface LastWorkingDayKpis {
  ohne_Leistung: number;
  Foxi: number;
  ohne_Folgetermin: number;
  MVZ_karten_ohne_Leistung: number;
  MVZ_Karten_Fehlen: number;
  Fehlende_Doku: number;
}

export interface LastWorkingDayResponse {
  success: boolean;
  date: string;
  locationId: number;
  kpis: LastWorkingDayKpis;
}

export interface FoxiChartResponse {
  success             : boolean
  date                : string
  currentPercentage   : number
  remainingPercentage : number
}