"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { RAV5, RAV5_COMPONENTS } from "@/lib/tenant";
import type { Rav5Status } from "@/lib/types";
import { Badge, Card, Input, PageHeader, Select, type Tone } from "@/components/ui";

const TONE: Record<Rav5Status, Tone> = {
  Implementado: "ok",
  "En progreso": "warn",
  Pendiente: "neutral",
};

export default function Cumplimiento() {
  const { rav5, setRav5 } = useStore();
  const done = RAV5.filter((e) => rav5[e.id]?.status === "Implementado").length;
  const prog = RAV5.filter((e) => rav5[e.id]?.status === "En progreso").length;
  const pct = Math.round((done / RAV5.length) * 100);

  return (
    <>
      <PageHeader
        title="Cumplimiento del SMS (RAV 5)"
        sub="Cuatro componentes y doce elementos. Registre el estado de cada elemento y su evidencia para la inspección de la autoridad."
      />
      <Card className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-sm">
            <span className="text-2xl font-bold">{done}</span> de {RAV5.length} elementos
            implementados <span className="text-muted">· {prog} en progreso</span>
          </p>
          <span className="text-sm font-semibold">{pct} %</span>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-canvas"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avance de implementación del SMS"
        >
          <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      </Card>
      <div className="space-y-6">
        {RAV5_COMPONENTS.map((c, ci) => (
          <Card key={c} title={`Componente ${ci + 1}. ${c}`} pad={false}>
            <ul className="divide-y divide-line">
              {RAV5.filter((e) => e.component === c).map((e) => {
                const st = rav5[e.id] ?? { status: "Pendiente" as Rav5Status, note: "" };
                return (
                  <li key={e.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_11rem]">
                    <div>
                      <p className="text-sm font-semibold">
                        {e.id} · {e.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {e.evidence}{" "}
                        {e.href && (
                          <Link href={e.href} className="font-semibold text-brand">
                            Ver en el sistema
                          </Link>
                        )}
                      </p>
                      <Input
                        key={`${e.id}-${st.note}`}
                        aria-label={`Nota de evidencia del elemento ${e.id}`}
                        placeholder="Referencia de evidencia (documento, fecha, ubicación)"
                        defaultValue={st.note}
                        className="mt-2 py-1.5 text-xs"
                        onBlur={(ev) =>
                          ev.target.value !== st.note && setRav5(e.id, { note: ev.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Select
                        aria-label={`Estado del elemento ${e.id}`}
                        value={st.status}
                        onChange={(ev) => setRav5(e.id, { status: ev.target.value as Rav5Status })}
                      >
                        {["Pendiente", "En progreso", "Implementado"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Select>
                      <Badge tone={TONE[st.status]}>{st.status}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Estructura según el INAC y el Anexo 19 de la OACI. Verifique los requisitos de detalle en la
        edición vigente de la RAV 5 publicada por el INAC.
      </p>
    </>
  );
}
