import type { ActionItem, Hazard } from "./types";
import { today } from "./format";
import { tolerability } from "./risk";

export const isOverdue = (a: ActionItem) => a.status !== "Cerrada" && a.dueDate < today();
export const reviewOverdue = (h: Hazard) => h.status !== "Cerrado" && h.reviewDate < today();
export const residualTol = (h: Hazard) => tolerability(h.residualProbability, h.residualSeverity);
export const initialTol = (h: Hazard) => tolerability(h.probability, h.severity);
