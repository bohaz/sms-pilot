"use client";
import { Button } from "../ui";

export const FormError = ({ text }: { text: string }) => (
  <p role="alert" className="text-xs font-semibold text-bad">
    {text}
  </p>
);
export const FormActions = ({ onClose, label }: { onClose: () => void; label: string }) => (
  <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
    <Button type="button" onClick={onClose}>
      Cancelar
    </Button>
    <Button type="submit" variant="primary">
      {label}
    </Button>
  </div>
);
