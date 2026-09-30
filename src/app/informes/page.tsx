"use client";
import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildSpiRows, SEM_TONE, type Sem } from "@/lib/spi";
import { verifyChain } from "@/lib/audit";
import { isOverdue, residualTol } from "@/lib/derive";
import { TOLERABILITY_TONE } from "@/lib/risk";
import { downloadFile, fmtDate, fmtDateTime, monthLabel, toCsv } from "@/lib/format";
import { TENANT } from "@/lib/tenant";
import { Badge, Button, Card, PageHeader, Select, Table, Td, Th } from "@/components/ui";
import { ReportsByMonthChart } from "@/components/Charts";

const SemBadge = ({ s }: { s: Sem | null }) => (s ? <Badge tone={SEM_TONE[s]}>{s}</Badge> : <span className="text-xs text-muted">—</span>);
const H2 = ({ n, t }: { n: number; t: string }) => <h2 className="mb-2 mt-7 border-b border-line pb-1 text-base font-bold">{n}. {t}</h2>;

export default function Informes() {
  const { ops, reports, hazards, actions, audit, logEvent } = useStore();
  const all = useMemo(() => buildSpiRows(ops, reports), [ops, reports]);
  const months = all.map((r) => r.month);
  const [from, setFrom] = useState(months[Math.max(0, months.length - 3)] ?? "");
  const [to, setTo] = useState(months[months.length - 1] ?? "");
  const rows = all.filter((r) => r.month >= from && r.month <= to);
  const reps = reports.filter((r) => r.date.slice(0, 7) >= from && r.date.slice(0, 7) <= to).sort((a, b) => a.date.localeCompare(b.date));
  const integ = useMemo(() => verifyChain(audit), [audit]);
  const head = audit[audit.length - 1]?.hash.slice(0, 16) ?? "";

  const flights = rows.reduce((s, r) => s + r.flights, 0);
  const asr = rows.reduce((s, r) => s + r.asr, 0);
  const mor = rows.reduce((s, r) => s + r.mor, 0);
  const fat = rows.reduce((s, r) => s + (r.fatigue ?? 0), 0);
  const rate = flights ? (mor / flights) * 100 : 0;
  const intol = hazards.filter((h) => h.status !== "Cerrado" && residualTol(h) === "Intolerable").length;
  const open = actions.filter((a) => a.status !== "Cerrada");
  const overdue = actions.filter(isOverdue).length;
  const period = from === to ? monthLabel(from) : `${monthLabel(from)} a ${monthLabel(to)}`;

  function print() {
    logEvent("Generar", "Informe", period, `Informe de seguridad operacional generado (${period}), huella de bitácora ${head}`);
    setTimeout(() => window.print(), 50);
  }
  const csv = () => downloadFile(`informe-sms-${from}-${to}.csv`, toCsv([["Código", "Tipo", "Fecha", "Estación", "Categoría", "Estado", "Descripción"], ...reps.map((r) => [r.code, r.type, r.date, r.station, r.category, r.status, r.description])]));

  return (
    <>
      <PageHeader title="Informes" sub="Genere el informe de seguridad operacional del período y guárdelo como PDF desde el cuadro de impresión."
        actions={<><Button onClick={csv}><Download size={16} />Reportes en CSV</Button><Button variant="primary" onClick={print}><Printer size={16} />Imprimir o guardar PDF</Button></>} />
      <div className="no-print mb-4 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-muted">Desde<Select value={from} onChange={(e) => { setFrom(e.target.value); if (e.target.value > to) setTo(e.target.value); }} className="mt-1 w-auto">{months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</Select></label>
        <label className="text-xs font-semibold text-muted">Hasta<Select value={to} onChange={(e) => { setTo(e.target.value); if (e.target.value < from) setFrom(e.target.value); }} className="mt-1 w-auto">{months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</Select></label>
      </div>

      <Card className="print-area">
        <header className="border-b-2 border-ink pb-4">
          <p className="text-sm font-semibold text-brand">{TENANT.name}</p>
          <h2 className="text-2xl font-bold">Informe de seguridad operacional</h2>
          <p className="text-sm text-muted">Período: {period} · Generado el {fmtDateTime(new Date().toISOString())} por {TENANT.actor}</p>
          <p className="mt-1 text-xs text-muted">Huella de la bitácora: <span className="font-mono">{head}</span> · {integ.ok ? `Integridad verificada (${integ.checked} ${integ.checked === 1 ? "registro" : "registros"})` : `Alteración detectada en el registro ${integ.brokenAt}`}</p>
        </header>

        <H2 n={1} t="Resumen" />
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>{flights} vuelos realizados, con {asr} reportes voluntarios (ASR) y {mor} obligatorios (MOR).</li>
          <li>Tasa de incidentes del período: {rate.toFixed(2)} %. Excedencias de fatiga: {fat}.</li>
          <li>{intol === 0 ? "No hay peligros con riesgo residual intolerable." : `${intol} peligro(s) con riesgo residual intolerable requieren decisión de la dirección.`}</li>
          <li>{open.length} acciones abiertas, {overdue} vencidas.</li>
        </ul>

        <H2 n={2} t="Indicadores de desempeño" />
        <Table>
          <thead><tr><Th>Mes</Th><Th>Vuelos</Th><Th>ASR</Th><Th>MOR</Th><Th>Fatiga</Th><Th>Tasa %</Th><Th>Incidentes</Th><Th>Cultura ASR</Th><Th>Fatiga</Th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.month}><Td className="font-semibold">{r.label}</Td><Td>{r.flights}</Td><Td>{r.asr}</Td><Td>{r.mor}</Td><Td>{r.fatigue ?? "—"}</Td><Td>{r.rate === null ? "—" : r.rate.toFixed(2)}</Td><Td><SemBadge s={r.semInc} /></Td><Td><SemBadge s={r.semAsr} /></Td><Td><SemBadge s={r.semFat} /></Td></tr>)}</tbody>
        </Table>
        <div className="mt-4"><ReportsByMonthChart rows={rows} height={200} /></div>

        <H2 n={3} t="Reportes del período" />
        <Table>
          <thead><Th>Código</Th><Th>Fecha</Th><Th>Categoría</Th><Th>Estación</Th><Th>Estado</Th></thead>
          <tbody>{reps.map((r) => <tr key={r.id}><Td className="whitespace-nowrap font-semibold">{r.code}</Td><Td className="whitespace-nowrap">{fmtDate(r.date)}</Td><Td>{r.category}</Td><Td>{r.station}</Td><Td>{r.status}</Td></tr>)}</tbody>
        </Table>

        <div className="print-break" />
        <H2 n={4} t="Peligros y riesgo residual" />
        <Table>
          <thead><tr><Th>Peligro</Th><Th>Responsable</Th><Th>Riesgo residual</Th><Th>Estado</Th></tr></thead>
          <tbody>{hazards.map((h) => <tr key={h.id}><Td><span className="font-semibold">{h.code}</span> · {h.title}</Td><Td>{h.owner}</Td><Td><Badge tone={TOLERABILITY_TONE[residualTol(h)]}>{h.residualProbability}{h.residualSeverity} · {residualTol(h)}</Badge></Td><Td>{h.status}</Td></tr>)}</tbody>
        </Table>

        <H2 n={5} t="Acciones abiertas" />
        <Table>
          <thead><tr><Th>Acción</Th><Th>Responsable</Th><Th>Fecha límite</Th><Th>Estado</Th></tr></thead>
          <tbody>{open.map((a) => <tr key={a.id}><Td><span className="font-semibold">{a.code}</span> · {a.title}</Td><Td>{a.owner}</Td><Td className="whitespace-nowrap">{fmtDate(a.dueDate)}</Td><Td>{isOverdue(a) ? "Vencida" : a.status}</Td></tr>)}</tbody>
        </Table>

        <div className="mt-12 grid grid-cols-2 gap-10 text-sm">
          {["Gerente de seguridad operacional", "Gerente responsable"].map((r) => <div key={r}><div className="h-10 border-b border-text" /><p className="mt-1 text-xs text-muted">{r}</p></div>)}
        </div>
      </Card>
    </>
  );
}
