import type { OpsMonth, Report } from "./types";
import { monthLabel } from "./format";

export type Sem = "VERDE" | "AMARILLO" | "ROJO";

// Criterios por defecto (configurables por operador en producción).
export const semInc = (mor: number): Sem => (mor === 0 ? "VERDE" : mor === 1 ? "AMARILLO" : "ROJO");
export const semAsr = (asr: number): Sem => (asr >= 2 ? "VERDE" : asr === 1 ? "AMARILLO" : "ROJO");
export const semFat = (f: number): Sem => (f === 0 ? "VERDE" : "ROJO");
export const semRate = (r: number): Sem => (r === 0 ? "VERDE" : r <= 2 ? "AMARILLO" : "ROJO");

export const SPI_DEFS = [
  {
    key: "inc",
    name: "Incidentes reportados (MOR)",
    how: "MOR del mes",
    green: "0",
    yellow: "1",
    red: "2 o más",
  },
  {
    key: "asr",
    name: "Cultura de reporte (ASR)",
    how: "ASR del mes",
    green: "2 o más",
    yellow: "1",
    red: "0",
  },
  {
    key: "fat",
    name: "Excedencias de fatiga",
    how: "Excedencias de los límites de tiempo de vuelo y servicio",
    green: "0",
    yellow: "—",
    red: "1 o más",
  },
  {
    key: "rate",
    name: "Tasa de incidentes",
    how: "(MOR ÷ vuelos) × 100",
    green: "0 %",
    yellow: "hasta 2 %",
    red: "más de 2 %",
  },
];

export interface SpiRow {
  month: string;
  label: string;
  flights: number;
  asr: number;
  mor: number;
  fatigue: number | null;
  rate: number | null;
  semInc: Sem | null;
  semAsr: Sem | null;
  semFat: Sem | null;
  semRate: Sem | null;
}

export function buildSpiRows(ops: OpsMonth[], reports: Report[]): SpiRow[] {
  return [...ops]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((o) => {
      const inMonth = reports.filter((r) => r.date.startsWith(o.month));
      const asr = inMonth.filter((r) => r.type === "ASR").length;
      const mor = inMonth.filter((r) => r.type === "MOR").length;
      const hasData = o.flights > 0;
      const rate = hasData ? (mor / o.flights) * 100 : null;
      return {
        month: o.month,
        label: monthLabel(o.month),
        flights: o.flights,
        asr,
        mor,
        fatigue: o.fatigue,
        rate,
        semInc: hasData ? semInc(mor) : null,
        semAsr: hasData ? semAsr(asr) : null,
        semFat: hasData && o.fatigue !== null ? semFat(o.fatigue) : null,
        semRate: rate !== null ? semRate(rate) : null,
      };
    });
}

export const SEM_TONE: Record<Sem, "ok" | "warn" | "bad"> = {
  VERDE: "ok",
  AMARILLO: "warn",
  ROJO: "bad",
};
