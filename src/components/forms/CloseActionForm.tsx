"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { today } from "@/lib/format";
import { validateClosure } from "@/lib/validation";
import type { ActionItem } from "@/lib/types";
import { Field, Modal, Textarea } from "../ui";
import { FormActions, FormError } from "./shared";

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
          const error = validateClosure(ev);
          if (error) return setErr(error);
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
        {err && <FormError text={err} />}
        <FormActions onClose={onClose} label="Cerrar acción" />
      </form>
    </Modal>
  );
}
