"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { REPORT_STATUSES } from "@/lib/types";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { Badge, Button, Card, Empty, PageHeader, cn } from "@/components/ui";
import { ActionForm } from "@/components/forms";
import { STATUS_TONE } from "@/components/status";

export default function ReporteDetalle() {
  const { id } = useParams<{ id: string }>();
  const { reports, hazards, actions, audit, updateReport } = useStore();
  const [open, setOpen] = useState(false);
  const r = reports.find((x) => x.id === id);

  if (!r)
    return (
      <Empty
        title="No se encontró el reporte"
        hint="Puede haber sido eliminado al restablecer los datos."
        action={
          <Link href="/reportes" className="text-sm font-semibold text-brand">
            Volver a reportes
          </Link>
        }
      />
    );
  const linked = actions.filter(
    (a) => a.reportId === r.id || (a.hazardId && r.hazardIds.includes(a.hazardId)),
  );
  const trail = audit.filter((a) => a.entityId === r.code).reverse();
  const toggleHazard = (hid: string, code: string) => {
    const has = r.hazardIds.includes(hid);
    updateReport(
      r.id,
      { hazardIds: has ? r.hazardIds.filter((x) => x !== hid) : [...r.hazardIds, hid] },
      `${has ? "Peligro desvinculado" : "Peligro vinculado"}: ${code}`,
    );
  };

  const rows: [string, string][] = [
    ["Fecha", fmtDate(r.date)],
    ["Estación", r.station],
    ["Área", r.area],
    ["Aeronave", r.aircraft],
    ["Categoría", r.category],
    ["Reportado por", r.reporter],
  ];

  return (
    <>
      <Link
        href="/reportes"
        className="no-print mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
      >
        <ArrowLeft size={15} />
        Reportes
      </Link>
      <PageHeader
        title={r.code}
        sub={
          r.type === "ASR" ? "Reporte voluntario de seguridad" : "Reporte obligatorio de sucesos"
        }
        actions={<Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Descripción">
            <p className="text-sm leading-relaxed">{r.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-3">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold text-muted">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card
            title="Peligros vinculados"
            right={
              <span className="text-xs text-muted">
                Marque los peligros que este reporte evidencia
              </span>
            }
          >
            <ul className="space-y-1">
              {hazards.map((h) => (
                <li key={h.id}>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded p-1.5 hover:bg-canvas">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={r.hazardIds.includes(h.id)}
                      onChange={() => toggleHazard(h.id, h.code)}
                    />
                    <span className="text-sm">
                      <span className="font-semibold">{h.code}</span> · {h.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Card>
          <Card
            title="Acciones relacionadas"
            right={
              <Button size="sm" onClick={() => setOpen(true)}>
                <Plus size={14} />
                Crear acción
              </Button>
            }
            pad={false}
          >
            {linked.length === 0 ? (
              <Empty
                title="Sin acciones todavía"
                hint="Cree una acción si este reporte requiere una corrección."
              />
            ) : (
              <ul className="divide-y divide-line">
                {linked.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="text-sm">
                      <span className="font-semibold">{a.code}</span> · {a.title}
                    </span>
                    <Badge tone={a.status === "Cerrada" ? "ok" : "warn"}>{a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Estado del análisis">
            <div
              className="flex flex-col gap-1.5"
              role="radiogroup"
              aria-label="Estado del reporte"
            >
              {REPORT_STATUSES.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={r.status === s}
                  onClick={() =>
                    r.status !== s &&
                    updateReport(r.id, { status: s }, `Estado cambiado de ${r.status} a ${s}`)
                  }
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-sm font-medium",
                    r.status === s
                      ? "border-brand bg-brand-soft text-brand-dark"
                      : "border-line hover:bg-canvas",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {r.type === "MOR" && (
              <label className="mt-4 flex items-start gap-2.5 border-t border-line pt-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4"
                  checked={r.notifiedAuthority}
                  onChange={(e) =>
                    updateReport(
                      r.id,
                      { notifiedAuthority: e.target.checked },
                      e.target.checked
                        ? "Marcado como notificado a la autoridad aeronáutica"
                        : "Notificación a la autoridad desmarcada",
                    )
                  }
                />
                <span>
                  Notificado a la autoridad aeronáutica
                  <span className="block text-xs text-muted">
                    Confirme según los plazos de la reglamentación aplicable.
                  </span>
                </span>
              </label>
            )}
          </Card>
          <Card title="Historial" pad={false}>
            <ul className="divide-y divide-line">
              {trail.map((a) => (
                <li key={a.id} className="px-4 py-2.5">
                  <p className="text-sm">{a.summary}</p>
                  <p className="text-xs text-muted">
                    {fmtDateTime(a.ts)} · {a.actor}
                  </p>
                </li>
              ))}
              {trail.length === 0 && (
                <li className="px-4 py-3 text-sm text-muted">
                  Sin cambios registrados desde la carga inicial.
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
      <ActionForm
        key={r.id}
        open={open}
        onClose={() => setOpen(false)}
        preset={{ reportId: r.id, title: `Atender ${r.code}: ${r.category.toLowerCase()}` }}
      />
    </>
  );
}
