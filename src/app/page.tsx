"use client";
import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, FileWarning, Inbox, Siren } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildSpiRows, SEM_TONE } from "@/lib/spi";
import { isOverdue, residualTol, reviewOverdue } from "@/lib/derive";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { Badge, Card, Empty, PageHeader } from "@/components/ui";
import { RiskMatrix } from "@/components/RiskMatrix";
import { ReportsByMonthChart } from "@/components/Charts";

export default function Panel() {
  const { reports, hazards, actions, ops, audit } = useStore();
  const rows = useMemo(() => buildSpiRows(ops, reports), [ops, reports]);
  const last = [...rows].reverse().find((r) => r.flights > 0) ?? rows[rows.length - 1];

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    hazards.filter((h) => h.status !== "Cerrado").forEach((h) => { const k = `${h.residualProbability}${h.residualSeverity}`; c[k] = (c[k] ?? 0) + 1; });
    return c;
  }, [hazards]);

  const attention = [
    ...hazards.filter((h) => h.status !== "Cerrado" && residualTol(h) === "Intolerable").map((h) => ({ icon: Siren, tone: "bad" as const, text: `${h.code} tiene riesgo residual intolerable`, sub: h.title, href: "/peligros" })),
    ...actions.filter(isOverdue).map((a) => ({ icon: CalendarClock, tone: "bad" as const, text: `${a.code} está vencida desde el ${fmtDate(a.dueDate)}`, sub: `${a.title} · ${a.owner}`, href: "/acciones" })),
    ...hazards.filter(reviewOverdue).map((h) => ({ icon: AlertTriangle, tone: "warn" as const, text: `${h.code} tiene la revisión vencida`, sub: h.title, href: "/peligros" })),
    ...reports.filter((r) => r.type === "MOR" && !r.notifiedAuthority && r.status !== "Cerrado").map((r) => ({ icon: FileWarning, tone: "warn" as const, text: `${r.code} sin marca de notificación a la autoridad`, sub: r.description, href: `/reportes/${r.id}` })),
    ...(reports.filter((r) => r.status === "Nuevo").length ? [{ icon: Inbox, tone: "brand" as const, text: `${reports.filter((r) => r.status === "Nuevo").length} reportes nuevos por analizar`, sub: "Asigne análisis y clasifique la causa.", href: "/reportes" }] : []),
  ];

  const tiles = last ? [
    { label: "Incidentes MOR", value: String(last.mor), sem: last.semInc },
    { label: "Reportes ASR", value: String(last.asr), sem: last.semAsr },
    { label: "Excedencias de fatiga", value: last.fatigue === null ? "Sin dato" : String(last.fatigue), sem: last.semFat },
    { label: "Tasa de incidentes", value: last.rate === null ? "Sin dato" : `${last.rate.toFixed(2)} %`, sem: last.semRate },
  ] : [];

  return (
    <>
      <PageHeader title="Panel de seguridad operacional" sub="Lo que necesita atención hoy y cómo se comporta el desempeño de seguridad." />

      {last && (
        <section aria-label={`Indicadores de ${last.label}`} className="mb-6">
          <h2 className="mb-2 text-sm font-bold">Indicadores de {last.label} <span className="font-normal text-muted">· {last.flights} vuelos</span></h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <Link href="/indicadores" key={t.label} className="rounded-lg border border-line bg-white p-4 hover:border-brand">
                <p className="text-xs font-semibold text-muted">{t.label}</p>
                <p className="mt-1 text-2xl font-bold">{t.value}</p>
                <div className="mt-2 h-6">{t.sem ? <Badge tone={SEM_TONE[t.sem]}>{t.sem}</Badge> : <Badge>Sin evaluar</Badge>}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Perfil de riesgo residual" className="lg:col-span-3" right={<Link href="/peligros" className="flex items-center gap-1 text-xs font-semibold text-brand">Ver peligros <ArrowRight size={14} /></Link>}>
          <RiskMatrix counts={counts} />
          <p className="mt-3 text-xs text-muted">Cada número es la cantidad de peligros abiertos con ese nivel de riesgo después de aplicar controles.</p>
        </Card>
        <Card title="Requiere atención" className="lg:col-span-2" pad={false}>
          {attention.length === 0 ? <Empty title="Todo al día" hint="No hay acciones vencidas ni riesgos intolerables." /> : (
            <ul className="divide-y divide-line">
              {attention.slice(0, 7).map((a, i) => (
                <li key={i}>
                  <Link href={a.href} className="flex gap-3 px-4 py-3 hover:bg-canvas">
                    <a.icon size={17} className={a.tone === "bad" ? "mt-0.5 shrink-0 text-bad" : a.tone === "warn" ? "mt-0.5 shrink-0 text-warn" : "mt-0.5 shrink-0 text-brand"} aria-hidden="true" />
                    <span className="min-w-0"><span className="block text-sm font-semibold">{a.text}</span><span className="block truncate text-xs text-muted">{a.sub}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card title="Reportes por mes" className="lg:col-span-3" right={<Link href="/indicadores" className="flex items-center gap-1 text-xs font-semibold text-brand">Ver indicadores <ArrowRight size={14} /></Link>}>
          <ReportsByMonthChart rows={rows} />
        </Card>
        <Card title="Actividad reciente" className="lg:col-span-2" pad={false} right={<Link href="/auditoria" className="text-xs font-semibold text-brand">Bitácora</Link>}>
          <ul className="divide-y divide-line">
            {[...audit].reverse().slice(0, 6).map((a) => (
              <li key={a.id} className="px-4 py-2.5">
                <p className="text-sm">{a.summary}</p>
                <p className="text-xs text-muted">{a.entityId} · {fmtDateTime(a.ts)}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
