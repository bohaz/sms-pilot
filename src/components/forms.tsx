"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AREAS, CATEGORIES, FLEET, OWNERS, STATIONS } from "@/lib/tenant";
import { PROBABILITIES, SEVERITIES, TOLERABILITY_TONE, tolerability } from "@/lib/risk";
import { addDays, today } from "@/lib/format";
import type { ActionItem, Hazard, Priority, Probability, ReportType, Severity } from "@/lib/types";
import { Badge, Button, Field, Input, Modal, Select, Textarea, cn } from "./ui";

const Error = ({ text }: { text: string }) => (
  <p role="alert" className="text-xs font-semibold text-bad">
    {text}
  </p>
);
const Actions = ({ onClose, label }: { onClose: () => void; label: string }) => (
  <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
    <Button type="button" onClick={onClose}>
      Cancelar
    </Button>
    <Button type="submit" variant="primary">
      {label}
    </Button>
  </div>
);

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
    if (f.description.trim().length < 15)
      return setErr("Describa lo ocurrido con al menos 15 caracteres.");
    if (f.date > today()) return setErr("La fecha no puede ser futura.");
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
            <Error text={err} />
          </div>
        )}
        <div className="sm:col-span-2">
          <Actions onClose={onClose} label="Registrar reporte" />
        </div>
      </form>
    </Modal>
  );
}

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
    if (f.title.trim().length < 5) return setErr("Escriba un título de al menos 5 caracteres.");
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
            <Error text={err} />
          </div>
        )}
        <div className="sm:col-span-2">
          <Actions onClose={onClose} label={initial ? "Guardar cambios" : "Registrar peligro"} />
        </div>
      </form>
    </Modal>
  );
}

export function ActionForm({
  open,
  onClose,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  preset?: { hazardId?: string; reportId?: string; title?: string };
}) {
  const add = useStore((s) => s.addAction);
  const hazards = useStore((s) => s.hazards);
  const [f, setF] = useState({
    title: preset?.title ?? "",
    description: "",
    hazardId: preset?.hazardId ?? "",
    owner: OWNERS[1],
    dueDate: addDays(today(), 30),
    priority: "Media" as Priority,
  });
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.title.trim().length < 5) return setErr("Escriba un título de al menos 5 caracteres.");
    if (f.dueDate < today()) return setErr("La fecha límite no puede estar en el pasado.");
    add({
      title: f.title.trim(),
      description: f.description.trim(),
      hazardId: f.hazardId || undefined,
      reportId: preset?.reportId,
      owner: f.owner,
      dueDate: f.dueDate,
      priority: f.priority,
    });
    setErr("");
    onClose();
    setF((p) => ({ ...p, title: "", description: "" }));
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva acción correctiva o preventiva">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Acción">
          <Input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Qué se hará"
            required
          />
        </Field>
        <Field label="Detalle">
          <Textarea value={f.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Responsable">
            <Select value={f.owner} onChange={(e) => set("owner", e.target.value)}>
              {OWNERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha límite">
            <Input
              type="date"
              value={f.dueDate}
              min={today()}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </Field>
          <Field label="Prioridad">
            <Select value={f.priority} onChange={(e) => set("priority", e.target.value)}>
              {["Alta", "Media", "Baja"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Peligro relacionado">
            <Select value={f.hazardId} onChange={(e) => set("hazardId", e.target.value)}>
              <option value="">Ninguno</option>
              {hazards.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code} · {h.title.slice(0, 40)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {err && <Error text={err} />}
        <Actions onClose={onClose} label="Crear acción" />
      </form>
    </Modal>
  );
}

export function CloseActionForm({
  action,
  onClose,
}: {
  action: ActionItem | null;
  onClose: () => void;
}) {
  const upd = useStore((s) => s.updateAction);
  const [ev, setEv] = useState("");
  const [err, setErr] = useState("");
  return (
    <Modal
      open={!!action}
      onClose={onClose}
      title={action ? `Cerrar ${action.code}` : "Cerrar acción"}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!action) return;
          if (ev.trim().length < 10)
            return setErr("Describa la evidencia de cierre (mínimo 10 caracteres).");
          upd(
            action.id,
            { status: "Cerrada", closedAt: today(), evidence: ev.trim() },
            `Acción cerrada: ${action.title}`,
          );
          setEv("");
          setErr("");
          onClose();
        }}
        className="grid gap-4"
      >
        <p className="text-sm text-muted">{action?.title}</p>
        <Field label="Evidencia de cierre" hint="Quedará en la bitácora de auditoría.">
          <Textarea
            value={ev}
            onChange={(e) => setEv(e.target.value)}
            placeholder="Qué se hizo y dónde está el respaldo"
          />
        </Field>
        {err && <Error text={err} />}
        <Actions onClose={onClose} label="Cerrar acción" />
      </form>
    </Modal>
  );
}
