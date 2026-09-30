"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { REPORT_STATUSES } from "@/lib/types";
import { downloadFile, fmtDate, toCsv } from "@/lib/format";
import { Badge, Button, Card, Empty, Input, PageHeader, Select, Table, Td, Th } from "@/components/ui";
import { ReportForm } from "@/components/forms";
import { STATUS_TONE } from "@/components/status";


export default function Reportes() {
  const reports = useStore((s) => s.reports);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);

  const list = useMemo(() => reports.filter((r) =>
    (!type || r.type === type) && (!status || r.status === status) &&
    (!q || `${r.code} ${r.description} ${r.category} ${r.station} ${r.area} ${r.aircraft}`.toLowerCase().includes(q.toLowerCase()))
  ).sort((a, b) => b.date.localeCompare(a.date) || b.code.localeCompare(a.code)), [reports, q, type, status]);

  function exportCsv() {
    downloadFile("reportes-sms.csv", toCsv([["Código", "Tipo", "Fecha", "Estación", "Área", "Aeronave", "Categoría", "Estado", "Reportado por", "Descripción"], ...list.map((r) => [r.code, r.type, r.date, r.station, r.area, r.aircraft, r.category, r.status, r.reporter, r.description])]));
  }

  return (
    <>
      <PageHeader title="Reportes ASR y MOR" sub="Reportes voluntarios y obligatorios. Cada cambio queda registrado en la bitácora de auditoría."
        actions={<><Button onClick={exportCsv}><Download size={16} />Exportar CSV</Button><Button variant="primary" onClick={() => setOpen(true)}><Plus size={16} />Nuevo reporte</Button></>} />
      <Card pad={false}>
        <div className="flex flex-wrap gap-3 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <Input aria-label="Buscar reportes" placeholder="Buscar por código, texto, estación o matrícula" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select aria-label="Filtrar por tipo" value={type} onChange={(e) => setType(e.target.value)} className="w-auto"><option value="">Todos los tipos</option><option>ASR</option><option>MOR</option></Select>
          <Select aria-label="Filtrar por estado" value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto"><option value="">Todos los estados</option>{REPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
        </div>
        {list.length === 0 ? <Empty title="No hay reportes con esos filtros" hint="Cambie los filtros o registre un reporte nuevo." /> : (
          <Table>
            <thead><tr><Th>Código</Th><Th>Fecha</Th><Th>Categoría y área</Th><Th>Estación</Th><Th>Estado</Th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="hover:bg-canvas/60">
                  <Td className="whitespace-nowrap"><Link href={`/reportes/${r.id}`} className="font-semibold text-brand hover:underline">{r.code}</Link> <Badge tone={r.type === "MOR" ? "warn" : "brand"} className="ml-1">{r.type}</Badge></Td>
                  <Td className="whitespace-nowrap">{fmtDate(r.date)}</Td>
                  <Td><span className="font-medium">{r.category}</span><span className="block max-w-md truncate text-xs text-muted">{r.description}</span></Td>
                  <Td className="whitespace-nowrap">{r.station}</Td>
                  <Td><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <p className="mt-2 text-xs text-muted">{list.length} de {reports.length} reportes</p>
      <ReportForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
