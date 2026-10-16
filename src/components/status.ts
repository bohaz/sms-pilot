import type { ReportStatus } from "@/lib/types";
import type { Tone } from "./ui";

export const STATUS_TONE: Record<ReportStatus, Tone> = {
  Nuevo: "brand",
  "En análisis": "warn",
  "Acción abierta": "warn",
  Cerrado: "ok",
};
