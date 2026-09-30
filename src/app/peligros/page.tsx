"use client";
import { useMemo, useState } from "react";
import { Download, Pencil, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { TOLERABILITY_TONE, tolerability } from "@/lib/risk";
import { initialTol, residualTol, reviewOverdue } from "@/lib/derive";
import { downloadFile, fmtDate, toCsv } from "@/lib/format";
import type { Hazard, Probability, Severity } from "@/lib/types";
import { Badge, Button, Card, Empty, PageHeader, Table, Td, Th, cn } from "@/components/ui";
import { RiskMatrix } from "@/components/RiskMatrix";
import { HazardForm } from "@/components/forms";

export default function Peligros() {
  const { hazards, reports, actions } = useStore();
  const [mode, setMode] = useState<"residual" | "initial">("residual");
  const [sel, setSel] = useState<{ p: Probability; s: Severity } | null>(null);
  const [editing, setEditing] = useState<Hazard | null>(null);
  const [creating, setCreating] = useState(false);

  const active = hazards.filter((h) => h.status !== "Cerrado");
  const key = (h: Hazard) => (mode === "residual" ? `${h.residualProbability}${h.residualSeverity}` : `${h.probability}${h.severity}`);
  const counts = useMemo(() => { const c: Record<string, number> = {}; active.forEach((h) => (c[key(h)] = (c[key(h)] ?? 0) + 1)); return c; }, [hazards, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = hazards.filter((h) => !sel || key(h) === `${sel.p}${sel.s}`);

  function exportCsv() {
    downloadFile("registro-de-peligros.csv", toCsv([["Código", "Peligro", "Área", "Responsable", "Estado", "Riesgo inicial", "Riesgo residual", "Próxima revisión", "Controles"], ...hazards.map((h) => [h.code, h.title, h.area, h.owner, h.status, `${h.probability}${h.severity} ${initialTol(h)}`, `${h.residualProbability}${h.residualSeverity} ${residualTol(h)}`, h.reviewDate, h.controls])]));
  }

  return (
    <>
      <PageHeader title="Peligros y riesgos" sub="Registro de peligros con evaluación inicial y residual según la matriz de riesgo de la OACI."
        actions={<><Button onClick={exportCsv}><Download size={16} />Exportar CSV</Button><Button variant="primary" onClick={() => setCreating(true)}><Plus size={16} />Nuevo peligro</Button></>} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Matriz de riesgo" className="lg:col-span-2" right={
          <div className="flex rounded-md border border-line p-0.5 text-xs font-semibold" role="radiogroup" aria-label="Tipo de evaluación">
            {(["residual", "initial"] as const).map((m) => <button key={m} role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={cn("rounded px-2.5 py-1", mode === m ? "bg-ink text-white" : "text-muted")}>{m === "residual" ? "Residual" : "Inicial"}</button>)}
          </div>}>
          <RiskMatrix compact counts={counts} selected={sel} onSelect={(p, s) => setSel(sel?.p === p && sel?.s === s ? null : { p, s })} />
          <p className="mt-3 text-xs text-muted">{sel ? <>Filtrando por {sel.p}{sel.s} ({tolerability(sel.p, sel.s)}). <button className="font-semibold text-brand" onClick={() => setSel(null)}>Quitar filtro</button></> : "Toque una celda para filtrar los peligros."}</p>
        </Card>
        <Card title={`Registro (${list.length})`} className="lg:col-span-3" pad={false}>
          {list.length === 0 ? <Empty title="No hay peligros en esa celda" /> : (
            <Table>
              <thead><tr><Th>Peligro</Th><Th>Inicial</Th><Th>Residual</Th><Th>Estado</Th><Th /></tr></thead>
              <tbody>
                {list.map((h) => (
                  <tr key={h.id}>
                    <Td><span className="font-semibold">{h.code}</span> · {h.title}
                      <span className="mt-0.5 block text-xs text-muted">{h.owner} · {reports.filter((r) => r.hazardIds.includes(h.id)).length} reportes · {actions.filter((a) => a.hazardId === h.id && a.status !== "Cerrada").length} acciones abiertas</span>
                      {reviewOverdue(h) && <Badge tone="warn" className="mt-1">Revisión vencida {fmtDate(h.reviewDate)}</Badge>}</Td>
                    <Td><Badge tone={TOLERABILITY_TONE[initialTol(h)]}>{h.probability}{h.severity}</Badge></Td>
                    <Td><Badge tone={TOLERABILITY_TONE[residualTol(h)]}>{h.residualProbability}{h.residualSeverity}</Badge><span className="mt-0.5 block text-xs text-muted">{residualTol(h)}</span></Td>
                    <Td className="whitespace-nowrap">{h.status}</Td>
                    <Td><button onClick={() => setEditing(h)} aria-label={`Editar ${h.code}`} className="rounded p-1.5 text-muted hover:bg-canvas"><Pencil size={15} /></button></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
      <HazardForm key={editing?.id ?? "edit"} open={!!editing} initial={editing ?? undefined} onClose={() => setEditing(null)} />
      <HazardForm key={creating ? "new-open" : "new"} open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
