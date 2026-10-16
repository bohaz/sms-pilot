import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "./store";
import { verifyChain } from "./audit";

const newReport = {
  type: "MOR" as const,
  date: "2026-09-15",
  station: "SVMI Maiquetía",
  area: "Operaciones de vuelo",
  aircraft: "YV3001",
  category: "Fauna",
  description: "Impacto con ave durante el despegue.",
  anonymous: false,
  reporter: "Piloto",
};

beforeEach(() => {
  useStore.getState().reset();
});

describe("store", () => {
  it("adds a report with the next code in its series and logs it", () => {
    const { reports } = useStore.getState();
    const lastMor2026 = reports
      .filter((r) => r.type === "MOR" && r.date.startsWith("2026"))
      .map((r) => Number(r.code.slice(-3)));
    const expected = `MOR-2026-${String(Math.max(0, ...lastMor2026) + 1).padStart(3, "0")}`;

    const created = useStore.getState().addReport(newReport);
    const state = useStore.getState();

    expect(created.code).toBe(expected);
    expect(created.status).toBe("Nuevo");
    expect(state.reports[0]).toEqual(created);
    expect(state.audit.at(-1)).toMatchObject({ action: "Crear", entityId: created.code });
  });

  it("records every change in a chain that still verifies", () => {
    const report = useStore.getState().addReport(newReport);
    useStore.getState().updateReport(report.id, { status: "En análisis" }, "En análisis");
    const hazard = useStore.getState().hazards[0];
    useStore.getState().updateHazard(hazard.id, { status: "Mitigado" }, "Mitigado");
    useStore.getState().setOps("2026-09", { flights: 70 });

    const { audit } = useStore.getState();
    expect(audit.length).toBe(5);
    expect(verifyChain(audit).ok).toBe(true);
  });

  it("ignores updates to records that do not exist", () => {
    const before = useStore.getState().audit.length;
    useStore.getState().updateAction("missing", { status: "Cerrada" }, "x");
    expect(useStore.getState().audit.length).toBe(before);
  });

  it("adds a month of operations when it is missing", () => {
    useStore.getState().setOps("2030-01", { flights: 12 });
    expect(useStore.getState().ops.find((o) => o.month === "2030-01")).toEqual({
      month: "2030-01",
      flights: 12,
      fatigue: null,
    });
  });

  it("numbers new hazards and actions after the existing ones", () => {
    const hazard = useStore.getState().addHazard({
      ...useStore.getState().hazards[0],
      title: "Nuevo peligro",
    });
    const action = useStore.getState().addAction({
      title: "Nueva acción",
      description: "",
      owner: "Jefe de pilotos",
      dueDate: "2030-01-01",
      priority: "Media",
    });

    expect(hazard.code).toBe("PEL-009");
    expect(action.code).toBe("CAP-010");
    expect(action.status).toBe("Abierta");
  });

  it("restores the demo data on reset", () => {
    useStore.getState().addReport(newReport);
    useStore.getState().reset();
    expect(useStore.getState().audit).toHaveLength(1);
  });
});
