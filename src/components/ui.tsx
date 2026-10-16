"use client";
import clsx from "clsx";
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { X } from "lucide-react";

export const cn = clsx;
export type Tone = "ok" | "warn" | "bad" | "brand" | "neutral";

const TONES: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  brand: "bg-brand-soft text-brand-dark",
  neutral: "bg-canvas text-muted",
};
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};
export function Button({ variant = "secondary", size = "md", className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
        variant === "secondary" && "border border-line bg-white text-text hover:bg-canvas",
        variant === "ghost" && "text-brand hover:bg-brand-soft",
        variant === "danger" && "bg-bad text-white hover:opacity-90",
        className,
      )}
    />
  );
}

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  right,
  children,
  className,
  pad = true,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={cn("min-w-0 rounded-lg border border-line bg-white", className)}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          {title && <h2 className="text-sm font-bold">{title}</h2>}
          {right}
        </div>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
const inputCls =
  "rounded-md border border-line bg-white px-3 py-2 text-sm placeholder:text-muted/70 focus:border-brand";
const wcls = (c?: string) => (c && /(^|\s)w-/.test(c) ? "" : "w-full");
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={cn(inputCls, wcls(p.className), p.className)} />
);
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={cn(inputCls, wcls(p.className), p.className)} />
);
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={cn(inputCls, wcls(p.className), "min-h-[88px]", p.className)} />
);

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        "m-auto w-[calc(100%-1.5rem)] rounded-xl bg-white shadow-2xl",
        wide ? "max-w-2xl" : "max-w-lg",
      )}
      aria-label={title}
    >
      {open && (
        <div className="max-h-[88vh] overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-3">
            <h2 className="text-base font-bold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded p-1 text-muted hover:bg-canvas"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">{children}</table>
  </div>
);
export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th
    className={cn(
      "whitespace-nowrap border-b border-line bg-canvas/60 px-3 py-2 text-xs font-semibold text-muted",
      className,
    )}
  >
    {children}
  </th>
);
export const Td = ({
  children,
  className,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) => (
  <td colSpan={colSpan} className={cn("border-b border-line px-3 py-2.5 align-top", className)}>
    {children}
  </td>
);
