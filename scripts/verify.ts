import { createHash } from "node:crypto";
import { sha256 } from "../src/lib/sha256";
import { buildSeed } from "../src/lib/seed";
import { appendAudit, verifyChain } from "../src/lib/audit";
import { buildSpiRows } from "../src/lib/spi";
import { tolerability } from "../src/lib/risk";

for (const s of ["", "abc", "x".repeat(55), "x".repeat(56), "x".repeat(64), "Aerolínea Demo ñ ✈".repeat(20)]) {
  const a = sha256(s), b = createHash("sha256").update(s).digest("hex");
  if (a !== b) throw new Error("sha mismatch for len " + s.length);
}
console.log("sha256 OK contra node:crypto");

const seed = buildSeed(new Date("2026-09-29T12:00:00Z"));
const rows = buildSpiRows(seed.ops, seed.reports);
console.log(rows.map(r => `${r.label}: v${r.flights} asr${r.asr} mor${r.mor} fat${r.fatigue} tasa${r.rate?.toFixed(2)} ${r.semInc}/${r.semAsr}/${r.semFat}`).join("\n"));
console.log("reportes:", seed.reports.length, "codes únicos:", new Set(seed.reports.map(r => r.code)).size);
console.log("fechas futuras:", seed.reports.filter(r => r.date > "2026-09-29").length);

let log = seed.audit;
for (let i = 0; i < 5; i++) log = appendAudit(log, { actor: "t", action: "Crear", entity: "X", entityId: "X" + i, summary: "s" + i });
console.log("cadena íntegra:", verifyChain(log));
const t = log.map((e, i) => i === 3 ? { ...e, summary: "alterado" } : e);
console.log("cadena alterada:", verifyChain(t));
console.log("5A", tolerability(5, "A"), "3E", tolerability(3, "E"), "3C", tolerability(3, "C"));
const closed = seed.actions.filter(a => a.status === "Cerrada").length;
console.log("acciones", seed.actions.length, "cerradas", closed, "vencidas", seed.actions.filter(a => a.status !== "Cerrada" && a.dueDate < "2026-09-29").length);
