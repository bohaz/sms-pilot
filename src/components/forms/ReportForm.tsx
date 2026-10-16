"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AREAS, CATEGORIES, FLEET, STATIONS } from "@/lib/tenant";
import { today } from "@/lib/format";
import { validateReport } from "@/lib/validation";
import type { ReportType } from "@/lib/types";
import { Field, Input, Modal, Select, Textarea, cn } from "../ui";
import { FormActions, FormError } from "./shared";

export function ReportForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const add = useStore((s) => s.addReport);
  const router = useRouter();
  const [type, setType] = useState<ReportType>("ASR");
  const [f, setF] = useState({
    date: today(),
    station: STATIONS[0],
    area: AREAS[0],
    aircraft: FLEET[0],
    category: CATEGORIES[0],
    description: "",
    anonymous: false,
    reporter: "",
  });
  const [err, setErr] = useState("");
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateReport(f, today());
    if (error) return setErr(error);
    const anonymous = type === "ASR" && f.anonymous;
    const rep = add({
      type,
      date: f.date,
      station: f.station,
      area: f.area,
      aircraft: f.aircraft,
      category: f.category,
      description: f.description.trim(),
      anonymous,
      reporter: anonymous ? "Anónimo" : f.reporter.trim() || "Sin nombre",
    });
    setErr("");
    onClose();
    setF((p) => ({ ...p, description: "" }));
    router.push(`/reportes/${rep.id}`);
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo reporte" wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-muted">Tipo de reporte</span>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de reporte">
            {(
              [
                ["ASR", "ASR · Voluntario", "Confidencial y no punitivo"],
                ["MOR", "MOR · Obligatorio", "Sucesos de reporte obligatorio"],
              ] as const
            ).map(([v, t, d]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={type === v}
                onClick={() => setType(v)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left",
                  type === v
                    ? "border-brand bg-brand-soft"
                    : "border-line bg-white hover:bg-canvas",
                )}
              >
                <span className="block text-sm font-semibold">{t}</span>
                <span className="text-xs text-muted">{d}</span>
              </button>
            ))}
          </div>
        </div>
        <Field label="Fecha del suceso">
          <Input
            type="date"
            value={f.date}
            max={today()}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </Field>
        <Field label="Estación">
          <Select value={f.station} onChange={(e) => set("station", e.target.value)}>
            {STATIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Área involucrada">
          <Select value={f.area} onChange={(e) => set("area", e.target.value)}>
            {AREAS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Aeronave">
          <Select value={f.aircraft} onChange={(e) => set("aircraft", e.target.value)}>
            {FLEET.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Categoría" className="sm:col-span-2">
          <Select value={f.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field
          label="¿Qué ocurrió?"
          hint="Describa los hechos, sin juicios sobre personas."
          className="sm:col-span-2"
        >
          <Textarea
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </Field>
        {type === "ASR" && (
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={f.anonymous}
              onChange={(e) => set("anonymous", e.target.checked)}
              className="h-4 w-4"
            />
            Enviar de forma anónima
          </label>
        )}
        {!(type === "ASR" && f.anonymous) && (
          <Field label="Reportado por" className="sm:col-span-2">
            <Input
              value={f.reporter}
              onChange={(e) => set("reporter", e.target.value)}
              placeholder="Cargo o nombre"
            />
          </Field>
        )}
        {err && (
          <div className="sm:col-span-2">
            <FormError text={err} />
          </div>
        )}
        <div className="sm:col-span-2">
          <FormActions onClose={onClose} label="Registrar reporte" />
        </div>
      </form>
    </Modal>
  );
}
