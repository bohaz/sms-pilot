export type ReportType = "ASR" | "MOR";
export type ReportStatus = "Nuevo" | "En análisis" | "Acción abierta" | "Cerrado";
export const REPORT_STATUSES: ReportStatus[] = ["Nuevo", "En análisis", "Acción abierta", "Cerrado"];

export type Probability = 1 | 2 | 3 | 4 | 5;
export type Severity = "A" | "B" | "C" | "D" | "E";
export type HazardStatus = "Abierto" | "Mitigado" | "Aceptado" | "Cerrado";
export type ActionStatus = "Abierta" | "En curso" | "Cerrada";
export type Priority = "Alta" | "Media" | "Baja";
export type Rav5Status = "Pendiente" | "En progreso" | "Implementado";

export interface Report {
  id: string;
  code: string;
  type: ReportType;
  date: string; // YYYY-MM-DD
  area: string;
  station: string;
  aircraft: string;
  category: string;
  description: string;
  anonymous: boolean;
  reporter: string;
  status: ReportStatus;
  hazardIds: string[];
  notifiedAuthority: boolean; // MOR: notificado a la autoridad
  createdAt: string;
}

export interface Hazard {
  id: string;
  code: string;
  title: string;
  description: string;
  area: string;
  consequences: string;
  controls: string;
  probability: Probability;
  severity: Severity;
  residualProbability: Probability;
  residualSeverity: Severity;
  owner: string;
  status: HazardStatus;
  reviewDate: string;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  code: string;
  title: string;
  description: string;
  hazardId?: string;
  reportId?: string;
  owner: string;
  dueDate: string;
  priority: Priority;
  status: ActionStatus;
  closedAt?: string;
  evidence?: string;
  createdAt: string;
}

export interface OpsMonth {
  month: string; // YYYY-MM
  flights: number;
  fatigue: number | null; // excedencias de fatiga; null = sin dato
}

export interface AuditEntry {
  id: string;
  seq: number;
  ts: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  prevHash: string;
  hash: string;
}

export interface Rav5State {
  status: Rav5Status;
  note: string;
}
