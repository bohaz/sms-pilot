import { sha256 } from "./sha256";
import type { AuditEntry } from "./types";

export const GENESIS = "0".repeat(64);

type NewEntry = Pick<AuditEntry, "actor" | "action" | "entity" | "entityId" | "summary">;

function payload(e: Omit<AuditEntry, "hash">): string {
  return JSON.stringify([
    e.id,
    e.seq,
    e.ts,
    e.actor,
    e.action,
    e.entity,
    e.entityId,
    e.summary,
    e.prevHash,
  ]);
}

export function appendAudit(
  log: AuditEntry[],
  e: NewEntry,
  ts = new Date().toISOString(),
): AuditEntry[] {
  const prev = log[log.length - 1];
  const base = {
    id: `au${log.length + 1}-${Math.random().toString(36).slice(2, 7)}`,
    seq: log.length + 1,
    ts,
    ...e,
    prevHash: prev ? prev.hash : GENESIS,
  };
  return [...log, { ...base, hash: sha256(payload(base)) }];
}

export interface Integrity {
  ok: boolean;
  checked: number;
  brokenAt?: number;
  reason?: string;
}

export function verifyChain(log: AuditEntry[]): Integrity {
  let prev = GENESIS;
  for (let i = 0; i < log.length; i++) {
    const e = log[i];
    const { hash, ...rest } = e;
    if (e.prevHash !== prev)
      return {
        ok: false,
        checked: i,
        brokenAt: e.seq,
        reason: "El vínculo con el registro anterior no coincide.",
      };
    if (sha256(payload(rest)) !== hash)
      return {
        ok: false,
        checked: i,
        brokenAt: e.seq,
        reason: "El contenido del registro fue modificado.",
      };
    prev = hash;
  }
  return { ok: true, checked: log.length };
}
