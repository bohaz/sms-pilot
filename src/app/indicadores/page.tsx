"use client";
import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildSpiRows, SEM_TONE, SPI_DEFS, type Sem } from "@/lib/spi";
import { addMonths, downloadFile, monthKey, monthLabel, today, toCsv } from "@/lib/format";
import { Badge, Button, Card, Input, PageHeader, Select, Table, Td, Th } from "@/components/ui";
import { CategoryChart, RateChart, ReportsByMonthChart } from "@/components/Charts";

const SemBadge = ({ s }: { s: Sem | null }) => (s ? <Badge tone={SEM_TONE[s]}>{s}</Badge> : <span className="text-xs text-muted">—</span>);

export default function Indicadores() {
  const { ops, reports, setOps } = useStore();
  const rows = useMemo(() => buildSpiRows(ops, reports), [ops, reports]);
  const [sel, setSel] = useState("");
  const cur = rows.find((r) => r.month === sel) ?? [...rows].reverse().find((r) => r.flights > 0) ?? rows[rows.length - 1];
  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    reports.forEach((r) => (m[r.category] = (m[r.category] ?? 0) + 1));
    return Object.entries(m).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [reports]);

  const addMonth = () => setOps(rows.length ? addMonths(rows[rows.length - 1].month, 1) : monthKey(today()), { flights: 0, fatigue: null });
  const exportCsv = () => downloadFile("indicadores-sms.csv", toCsv([["Mes", "Vuelos", "ASR", "MOR", "Excedencias de fatiga", "Tasa de incidentes %", "Semáforo incidentes", "Semáforo cultura ASR", "Semáforo fatiga"], ...rows.map((r) => [r.label, r.flights, r.asr, r.mor, r.fatigue, r.rate?.toFixed(2), r.semInc, r.semAsr, r.semFat])]));

  return (
    <>
      <PageHeader title="Indicadores de desempeño (SPI)" sub="Los reportes ASR y MOR se cuentan solos. Usted registra los vuelos y las excedencias de fatiga de cada mes."
        actions={<Button onClick={exportCsv}><Download size={16} />Exportar CSV</Button>} />

      {cur && (
        <section className="mb-6" aria-label="Semáforos del mes">
          <div className="mb-2 flex items-center gap-2"><h2 className="text-sm font-bold">Semáforos de</h2>
            <Select aria-label="Mes" value={cur.month} onChange={(e) => setSel(e.target.value)} className="w-auto py-1">{rows.map((r) => <option key={r.month} value={r.month}>{r.label}</option>)}</Select></div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["Incidentes MOR", String(cur.mor), cur.semInc], ["Reportes ASR", String(cur.asr), cur.semAsr], ["Excedencias de fatiga", cur.fatigue === null ? "Sin dato" : String(cur.fatigue), cur.semFat], ["Tasa de incidentes", cur.rate === null ? "Sin dato" : `${cur.rate.toFixed(2)} %`, cur.semRate]].map(([k, v, s]) => (
              <div key={k as string} className="rounded-lg border border-line bg-white p-4"><p className="text-xs font-semibold text-muted">{k}</p><p className="mt-1 text-2xl font-bold">{v}</p><div className="mt-2 h-6"><SemBadge s={s as Sem | null} /></div></div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Reportes por mes"><ReportsByMonthChart rows={rows} /></Card>
        <Card title="Tasa de incidentes (MOR ÷ vuelos)"><RateChart rows={rows} /></Card>
      </div>
      <Card title="Reportes por categoría" className="mt-6"><CategoryChart data={byCat} /></Card>

      <Card title="Registro mensual" className="mt-6" pad={false} right={<Button size="sm" onClick={addMonth}><Plus size={14} />Agregar mes</Button>}>
        <Table>
          <thead><tr><Th>Mes</Th><Th>Vuelos</Th><Th>ASR</Th><Th>MOR</Th><Th>Fatiga</Th><Th>Tasa %</Th><Th>Incidentes</Th><Th>Cultura ASR</Th><Th>Fatiga</Th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month}>
                <Td className="whitespace-nowrap font-semibold">{monthLabel(r.month)}</Td>
                <Td><Input key={`f-${r.month}-${r.flights}`} aria-label={`Vuelos de ${r.label}`} type="number" min={0} defaultValue={r.flights} className="w-20 py-1"
                  onBlur={(e) => { const v = Math.max(0, Math.floor(Number(e.target.value) || 0)); if (v !== r.flights) setOps(r.month, { flights: v }); }} /></Td>
                <Td>{r.asr}</Td><Td>{r.mor}</Td>
                <Td><Input key={`x-${r.month}-${r.fatigue}`} aria-label={`Excedencias de fatiga de ${r.label}`} type="number" min={0} defaultValue={r.fatigue ?? ""} placeholder="—" className="w-20 py-1"
                  onBlur={(e) => { const v = e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)); if (v !== r.fatigue) setOps(r.month, { fatigue: v }); }} /></Td>
                <Td>{r.rate === null ? "—" : r.rate.toFixed(2)}</Td>
                <Td><SemBadge s={r.semInc} /></Td><Td><SemBadge s={r.semAsr} /></Td><Td><SemBadge s={r.semFat} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card title="Cómo se evalúa cada indicador" className="mt-6" pad={false}>
        <Table>
          <thead><tr><Th>Indicador</Th><Th>Cálculo</Th><Th>Verde</Th><Th>Amarillo</Th><Th>Rojo</Th></tr></thead>
          <tbody>{SPI_DEFS.map((d) => <tr key={d.key}><Td className="font-semibold">{d.name}</Td><Td>{d.how}</Td><Td>{d.green}</Td><Td>{d.yellow}</Td><Td>{d.red}</Td></tr>)}</tbody>
        </Table>
        <p className="border-t border-line px-4 py-3 text-xs text-muted">Los umbrales son los valores iniciales del piloto. Cada operador define sus propias metas de seguridad operacional.</p>
      </Card>
    </>
  );
}
