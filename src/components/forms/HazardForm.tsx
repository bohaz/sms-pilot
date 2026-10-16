"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AREAS, OWNERS } from "@/lib/tenant";
import { PROBABILITIES, SEVERITIES, TOLERABILITY_TONE, tolerability } from "@/lib/risk";
import { addDays, today } from "@/lib/format";
import { validateTitle } from "@/lib/validation";
import type { Hazard, Probability, Severity } from "@/lib/types";
import { Badge, Field, Input, Modal, Select, Textarea } from "../ui";
import { FormActions, FormError } from "./shared";

function RiskPicker({
  label,
  p,
  s,
  onP,
  onS,
}: {
  label: string;
  p: Probability;
  s: Severity;
  onP: (v: Probability) => void;
  onS: (v: Severity) => void;
}) {
  const t = tolerability(p, s);
  return (
    <fieldset className="rounded-md border border-line p-3">
      <legend className="px-1 text-xs font-semibold text-muted">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Probabilidad">
          <Select value={p} onChange={(e) => onP(Number(e.target.value) as Probability)}>
            {PROBABILITIES.map((x) => (
              <option key={x.v} value={x.v}>
                {x.v} · {x.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Severidad">
          <Select value={s} onChange={(e) => onS(e.target.value as Severity)}>
            {SEVERITIES.map((x) => (
              <option key={x.v} value={x.v}>
                {x.v} · {x.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <p className="mt-2 text-xs text-muted">
        Riesgo {p}
        {s}: <Badge tone={TOLERABILITY_TONE[t]}>{t}</Badge>
      </p>
    </fieldset>
  );
}

export function HazardForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Hazard;
}) {
  const add = useStore((s) => s.addHazard);
  const upd = useStore((s) => s.updateHazard);
  const blank = {
    title: "",
    description: "",
    area: AREAS[0],
    consequences: "",
    controls: "",
    probability: 3 as Probability,
    severity: "C" as Severity,
    residualProbability: 2 as Probability,
    residualSeverity: "C" as Severity,
    owner: OWNERS[0],
    status: "Abierto" as Hazard["status"],
    reviewDate: addDays(today(), 90),
  };
  const [f, setF] = useState(initial ? { ...initial } : blank);
  const [err, setErr] = useState("");
  const set = <K extends keyof typeof blank>(k: K, v: (typeof blank)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateTitle(f.title);
    if (error) return setErr(error);
    const data = {
      title: f.title.trim(),
      description: f.description.trim(),
      area: f.area,
      consequences: f.consequences.trim(),
      controls: f.controls.trim(),
      probability: f.probability,
      severity: f.severity,
      residualProbability: f.residualProbability,
      residualSeverity: f.residualSeverity,
      owner: f.owner,
      status: f.status,
      reviewDate: f.reviewDate,
    };
    if (initial)
      upd(
        initial.id,
        data,
        `Peligro actualizado: ${data.title} (riesgo residual ${data.residualProbability}${data.residualSeverity}, ${data.status})`,
      );
    else add(data);
    setErr("");
    onClose();
    if (!initial) setF(blank);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Editar ${initial.code}` : "Nuevo peligro"}
      wide
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Peligro" className="sm:col-span-2">
          <Input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Condición u objeto con potencial de causar daño"
            required
          />
        </Field>
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea value={f.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Área">
          <Select value={f.area} onChange={(e) => set("area", e.target.value)}>
            {AREAS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Responsable">
          <Select value={f.owner} onChange={(e) => set("owner", e.target.value)}>
            {OWNERS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Consecuencias posibles" className="sm:col-span-2">
          <Textarea value={f.consequences} onChange={(e) => set("consequences", e.target.value)} />
        </Field>
        <Field label="Controles existentes" className="sm:col-span-2">
          <Textarea value={f.controls} onChange={(e) => set("controls", e.target.value)} />
        </Field>
        <RiskPicker
          label="Riesgo inicial"
          p={f.probability}
          s={f.severity}
          onP={(v) => set("probability", v)}
          onS={(v) => set("severity", v)}
        />
        <RiskPicker
          label="Riesgo residual (con controles)"
          p={f.residualProbability}
          s={f.residualSeverity}
          onP={(v) => set("residualProbability", v)}
          onS={(v) => set("residualSeverity", v)}
        />
        <Field label="Estado">
          <Select
            value={f.status}
            onChange={(e) => set("status", e.target.value as Hazard["status"])}
          >
            {["Abierto", "Mitigado", "Aceptado", "Cerrado"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Próxima revisión">
          <Input
            type="date"
            value={f.reviewDate}
            onChange={(e) => set("reviewDate", e.target.value)}
          />
        </Field>
        {err && (
          <div className="sm:col-span-2">
            <FormError text={err} />
          </div>
        )}
        <div className="sm:col-span-2">
          <FormActions
            onClose={onClose}
            label={initial ? "Guardar cambios" : "Registrar peligro"}
          />
        </div>
      </form>
    </Modal>
  );
}
