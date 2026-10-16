"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { OWNERS } from "@/lib/tenant";
import { addDays, today } from "@/lib/format";
import { validateAction } from "@/lib/validation";
import type { Priority } from "@/lib/types";
import { Field, Input, Modal, Select, Textarea } from "../ui";
import { FormActions, FormError } from "./shared";

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
    const error = validateAction(f, today());
    if (error) return setErr(error);
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
        {err && <FormError text={err} />}
        <FormActions onClose={onClose} label="Crear acción" />
      </form>
    </Modal>
  );
}
