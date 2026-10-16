"use client";
import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { isOverdue } from "@/lib/derive";
import { downloadFile, fmtDate, today, toCsv } from "@/lib/format";
import type { ActionItem } from "@/lib/types";
import { Badge, Button, Card, Empty, PageHeader, Table, Td, Th, cn } from "@/components/ui";
import { ActionForm, CloseActionForm } from "@/components/forms";

const FILTERS = ["Todas", "Abiertas", "Vencidas", "Cerradas"] as const;

export default function Acciones() {
  const { actions, hazards, updateAction } = useStore();
  const [f, setF] = useState<(typeof FILTERS)[number]>("Todas");
  const [creating, setCreating] = useState(false);
  const [closing, setClosing] = useState<ActionItem | null>(null);

  const list = actions
    .filter(
      (a) =>
        f === "Todas" ||
        (f === "Abiertas" && a.status !== "Cerrada") ||
        (f === "Vencidas" && isOverdue(a)) ||
        (f === "Cerradas" && a.status === "Cerrada"),
    )
    .sort(
      (a, b) =>
        Number(a.status === "Cerrada") - Number(b.status === "Cerrada") ||
        a.dueDate.localeCompare(b.dueDate),
    );
  const overdue = actions.filter(isOverdue).length;
  const onTime = actions.filter(
    (a) => a.status === "Cerrada" && a.closedAt && a.closedAt <= a.dueDate,
  ).length;
  const closed = actions.filter((a) => a.status === "Cerrada").length;

  function exportCsv() {
    downloadFile(
      "acciones-sms.csv",
      toCsv([
        [
          "Código",
          "Acción",
          "Responsable",
          "Prioridad",
          "Estado",
          "Fecha límite",
          "Cierre",
          "Evidencia",
        ],
        ...actions.map((a) => [
          a.code,
          a.title,
          a.owner,
          a.priority,
          isOverdue(a) ? "Vencida" : a.status,
          a.dueDate,
          a.closedAt,
          a.evidence,
        ]),
      ]),
    );
  }

  return (
    <>
      <PageHeader
        title="Acciones correctivas y preventivas"
        sub="Seguimiento de responsables, fechas límite y evidencia de cierre."
        actions={
          <>
            <Button onClick={exportCsv}>
              <Download size={16} />
              Exportar CSV
            </Button>
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              Nueva acción
            </Button>
          </>
        }
      />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          ["Abiertas", String(actions.filter((a) => a.status !== "Cerrada").length)],
          ["Vencidas", String(overdue)],
          ["Cierre a tiempo", closed ? `${Math.round((onTime / closed) * 100)} %` : "Sin datos"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-line bg-white p-3">
            <p className="text-xs font-semibold text-muted">{k}</p>
            <p
              className={cn(
                "mt-0.5 text-xl font-bold",
                k === "Vencidas" && overdue > 0 && "text-bad",
              )}
            >
              {v}
            </p>
          </div>
        ))}
      </div>
      <Card pad={false}>
        <div
          className="flex gap-1 border-b border-line p-2"
          role="tablist"
          aria-label="Filtrar acciones"
        >
          {FILTERS.map((x) => (
            <button
              key={x}
              role="tab"
              aria-selected={f === x}
              onClick={() => setF(x)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold",
                f === x ? "bg-ink text-white" : "text-muted hover:bg-canvas",
              )}
            >
              {x}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <Empty title="No hay acciones en esta vista" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Acción</Th>
                <Th>Responsable</Th>
                <Th>Fecha límite</Th>
                <Th>Estado</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const h = hazards.find((x) => x.id === a.hazardId);
                return (
                  <tr key={a.id}>
                    <Td>
                      <span className="font-semibold">{a.code}</span> · {a.title}
                      <span className="block text-xs text-muted">
                        {a.priority === "Alta"
                          ? "Prioridad alta"
                          : `Prioridad ${a.priority.toLowerCase()}`}
                        {h ? ` · ${h.code}` : ""}
                      </span>
                      {a.evidence && (
                        <span className="mt-1 block text-xs text-muted">
                          Evidencia: {a.evidence}
                        </span>
                      )}
                    </Td>
                    <Td>{a.owner}</Td>
                    <Td className="whitespace-nowrap">
                      {fmtDate(a.dueDate)}
                      {a.status !== "Cerrada" && a.dueDate >= today() && (
                        <span className="block text-xs text-muted">
                          en{" "}
                          {Math.max(
                            0,
                            Math.round(
                              (new Date(a.dueDate).getTime() - new Date(today()).getTime()) /
                                86400000,
                            ),
                          )}{" "}
                          días
                        </span>
                      )}
                    </Td>
                    <Td>
                      {a.status === "Cerrada" ? (
                        <Badge tone="ok">Cerrada {fmtDate(a.closedAt)}</Badge>
                      ) : isOverdue(a) ? (
                        <Badge tone="bad">Vencida</Badge>
                      ) : (
                        <Badge tone={a.status === "En curso" ? "brand" : "neutral"}>
                          {a.status}
                        </Badge>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-right">
                      {a.status === "Abierta" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateAction(
                              a.id,
                              { status: "En curso" },
                              `Acción iniciada: ${a.title}`,
                            )
                          }
                        >
                          Iniciar
                        </Button>
                      )}{" "}
                      {a.status !== "Cerrada" && (
                        <Button size="sm" variant="primary" onClick={() => setClosing(a)}>
                          Cerrar
                        </Button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
      <ActionForm
        key={creating ? "open" : "closed"}
        open={creating}
        onClose={() => setCreating(false)}
      />
      <CloseActionForm
        key={closing?.id ?? "none"}
        action={closing}
        onClose={() => setClosing(null)}
      />
    </>
  );
}
