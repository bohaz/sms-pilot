import type { Probability, Severity } from "./types";

export const PROBABILITIES: { v: Probability; label: string }[] = [
  { v: 5, label: "Frecuente" },
  { v: 4, label: "Ocasional" },
  { v: 3, label: "Remoto" },
  { v: 2, label: "Improbable" },
  { v: 1, label: "Sumamente improbable" },
];
export const SEVERITIES: { v: Severity; label: string }[] = [
  { v: "A", label: "Catastrófico" },
  { v: "B", label: "Peligroso" },
  { v: "C", label: "Grave" },
  { v: "D", label: "Leve" },
  { v: "E", label: "Insignificante" },
];

export type Tolerability = "Intolerable" | "Tolerable" | "Aceptable";

// Matriz de evaluación de riesgo de la OACI (Doc 9859). Ajustable por cada operador.
const INTOLERABLE = ["5A", "5B", "5C", "4A", "4B", "3A"];
const ACCEPTABLE = ["3E", "2D", "2E", "1B", "1C", "1D", "1E"];

export function tolerability(p: Probability, s: Severity): Tolerability {
  const k = `${p}${s}`;
  if (INTOLERABLE.includes(k)) return "Intolerable";
  if (ACCEPTABLE.includes(k)) return "Aceptable";
  return "Tolerable";
}

export const TOLERABILITY_TONE: Record<Tolerability, "bad" | "warn" | "ok"> = {
  Intolerable: "bad",
  Tolerable: "warn",
  Aceptable: "ok",
};

export const probLabel = (p: Probability) => PROBABILITIES.find((x) => x.v === p)?.label ?? "";
export const sevLabel = (s: Severity) => SEVERITIES.find((x) => x.v === s)?.label ?? "";
