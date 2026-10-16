import { describe, expect, it } from "vitest";
import { GENESIS, appendAudit, verifyChain } from "./audit";
import type { AuditEntry } from "./types";

const entry = (n: number) => ({
  actor: "Gerente SMS",
  action: "Crear",
  entity: "Reporte",
  entityId: `ASR-2026-00${n}`,
  summary: `Reporte ${n}`,
});

function buildLog(size: number): AuditEntry[] {
  let log: AuditEntry[] = [];
  for (let i = 1; i <= size; i++) log = appendAudit(log, entry(i), `2026-09-0${i}T12:00:00.000Z`);
  return log;
}

describe("appendAudit", () => {
  it("starts the chain from the genesis hash", () => {
    const [first] = buildLog(1);
    expect(first.seq).toBe(1);
    expect(first.prevHash).toBe(GENESIS);
  });

  it("links each entry to the hash of the previous one", () => {
    const log = buildLog(3);
    expect(log[1].prevHash).toBe(log[0].hash);
    expect(log[2].prevHash).toBe(log[1].hash);
  });

  it("does not mutate the existing log", () => {
    const log = buildLog(2);
    const copy = structuredClone(log);
    appendAudit(log, entry(3));
    expect(log).toEqual(copy);
  });
});

describe("verifyChain", () => {
  it("accepts an untouched chain", () => {
    expect(verifyChain(buildLog(5))).toEqual({ ok: true, checked: 5 });
  });

  it("accepts an empty log", () => {
    expect(verifyChain([])).toEqual({ ok: true, checked: 0 });
  });

  it("detects an edited entry and reports where", () => {
    const log = buildLog(5).map((e) => (e.seq === 4 ? { ...e, summary: "alterado" } : e));
    const result = verifyChain(log);

    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(4);
    expect(result.reason).toMatch(/modificado/);
  });

  it("detects a deleted entry", () => {
    const log = buildLog(5).filter((e) => e.seq !== 2);
    const result = verifyChain(log);

    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(3);
    expect(result.reason).toMatch(/vínculo/);
  });

  it("detects a recalculated hash that breaks the next link", () => {
    const log = buildLog(3);
    const forged = appendAudit(log.slice(0, 1), { ...entry(2), summary: "falso" });
    const tampered = [...forged, log[2]];

    expect(verifyChain(tampered)).toMatchObject({ ok: false, brokenAt: 3 });
  });
});
