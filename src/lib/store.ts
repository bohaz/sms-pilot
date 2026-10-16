import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActionItem, AuditEntry, Hazard, OpsMonth, Rav5State, Report } from "./types";
import { buildSeed, type Snapshot } from "./seed";
import { appendAudit } from "./audit";
import { TENANT } from "./tenant";

const uid = () => Math.random().toString(36).slice(2, 10);
const pad = (n: number) => String(n).padStart(3, "0");
const nextNum = (codes: string[]) =>
  codes.reduce((m, c) => Math.max(m, Number(c.split("-").pop()) || 0), 0) + 1;

type NewReport = Omit<
  Report,
  "id" | "code" | "status" | "hazardIds" | "notifiedAuthority" | "createdAt"
>;
type NewHazard = Omit<Hazard, "id" | "code" | "createdAt">;
type NewAction = Omit<ActionItem, "id" | "code" | "createdAt" | "status" | "closedAt" | "evidence">;

interface Actions {
  addReport: (r: NewReport) => Report;
  updateReport: (id: string, patch: Partial<Report>, summary: string) => void;
  addHazard: (h: NewHazard) => Hazard;
  updateHazard: (id: string, patch: Partial<Hazard>, summary: string) => void;
  addAction: (a: NewAction) => ActionItem;
  updateAction: (id: string, patch: Partial<ActionItem>, summary: string) => void;
  setOps: (month: string, patch: Partial<OpsMonth>) => void;
  setRav5: (id: string, patch: Partial<Rav5State>) => void;
  logEvent: (action: string, entity: string, entityId: string, summary: string) => void;
  reset: () => void;
}
export type State = Snapshot & Actions;

const log = (
  audit: AuditEntry[],
  action: string,
  entity: string,
  entityId: string,
  summary: string,
) => appendAudit(audit, { actor: TENANT.actor, action, entity, entityId, summary });

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),

      addReport: (input) => {
        const s = get();
        const year = input.date.slice(0, 4);
        const n = nextNum(
          s.reports
            .filter((r) => r.type === input.type && r.date.startsWith(year))
            .map((r) => r.code),
        );
        const rep: Report = {
          ...input,
          id: uid(),
          code: `${input.type}-${year}-${pad(n)}`,
          status: "Nuevo",
          hazardIds: [],
          notifiedAuthority: false,
          createdAt: new Date().toISOString(),
        };
        set({
          reports: [rep, ...s.reports],
          audit: log(
            s.audit,
            "Crear",
            "Reporte",
            rep.code,
            `${rep.type} registrado: ${rep.category} en ${rep.station}`,
          ),
        });
        return rep;
      },
      updateReport: (id, patch, summary) => {
        const s = get();
        const cur = s.reports.find((r) => r.id === id);
        if (!cur) return;
        set({
          reports: s.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)),
          audit: log(s.audit, "Actualizar", "Reporte", cur.code, summary),
        });
      },

      addHazard: (input) => {
        const s = get();
        const h: Hazard = {
          ...input,
          id: uid(),
          code: `PEL-${pad(nextNum(s.hazards.map((x) => x.code)))}`,
          createdAt: new Date().toISOString(),
        };
        set({
          hazards: [h, ...s.hazards],
          audit: log(s.audit, "Crear", "Peligro", h.code, `Peligro registrado: ${h.title}`),
        });
        return h;
      },
      updateHazard: (id, patch, summary) => {
        const s = get();
        const cur = s.hazards.find((h) => h.id === id);
        if (!cur) return;
        set({
          hazards: s.hazards.map((h) => (h.id === id ? { ...h, ...patch } : h)),
          audit: log(s.audit, "Actualizar", "Peligro", cur.code, summary),
        });
      },

      addAction: (input) => {
        const s = get();
        const a: ActionItem = {
          ...input,
          id: uid(),
          code: `CAP-${pad(nextNum(s.actions.map((x) => x.code)))}`,
          status: "Abierta",
          createdAt: new Date().toISOString(),
        };
        set({
          actions: [a, ...s.actions],
          audit: log(s.audit, "Crear", "Acción", a.code, `Acción creada: ${a.title}`),
        });
        return a;
      },
      updateAction: (id, patch, summary) => {
        const s = get();
        const cur = s.actions.find((a) => a.id === id);
        if (!cur) return;
        set({
          actions: s.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          audit: log(s.audit, "Actualizar", "Acción", cur.code, summary),
        });
      },

      setOps: (month, patch) => {
        const s = get();
        const exists = s.ops.some((o) => o.month === month);
        const ops = exists
          ? s.ops.map((o) => (o.month === month ? { ...o, ...patch } : o))
          : [...s.ops, { month, flights: 0, fatigue: null, ...patch }];
        const desc = Object.entries(patch)
          .map(
            ([k, v]) =>
              `${k === "flights" ? "vuelos" : "excedencias de fatiga"}: ${v ?? "sin dato"}`,
          )
          .join(", ");
        set({
          ops,
          audit: log(
            s.audit,
            "Actualizar",
            "Indicadores",
            month,
            `Datos operacionales de ${month}: ${desc}`,
          ),
        });
      },
      setRav5: (id, patch) => {
        const s = get();
        set({
          rav5: { ...s.rav5, [id]: { ...s.rav5[id], ...patch } },
          audit: log(
            s.audit,
            "Actualizar",
            "RAV 5",
            id,
            `Elemento ${id}: ${patch.status ? `estado ${patch.status}` : "nota actualizada"}`,
          ),
        });
      },
      logEvent: (action, entity, entityId, summary) =>
        set({ audit: log(get().audit, action, entity, entityId, summary) }),

      reset: () => set({ ...buildSeed() }),
    }),
    {
      name: "vigia-sms-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        reports: s.reports,
        hazards: s.hazards,
        actions: s.actions,
        ops: s.ops,
        rav5: s.rav5,
        audit: s.audit,
      }),
    },
  ),
);
