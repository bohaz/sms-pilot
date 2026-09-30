"use client";
import { PROBABILITIES, SEVERITIES, tolerability, type Tolerability } from "@/lib/risk";
import type { Probability, Severity } from "@/lib/types";
import { cn } from "./ui";

const BG: Record<Tolerability, string> = {
  Intolerable: "bg-bad text-white",
  Tolerable: "bg-[#F2C14E] text-[#3d2a00]",
  Aceptable: "bg-[#5DAE7A] text-[#0b2a18]",
};

export function RiskMatrix({
  counts, selected, onSelect, compact,
}: {
  counts?: Record<string, number>;
  selected?: { p: Probability; s: Severity } | null;
  onSelect?: (p: Probability, s: Severity) => void;
  compact?: boolean;
}) {
  const size = compact ? "h-9 w-full text-xs" : "h-14 w-full text-sm";
  return (
    <div role="group" aria-label="Matriz de riesgo: probabilidad por severidad">
      <div className="grid gap-1" style={{ gridTemplateColumns: `${compact ? "3.6rem" : "6.5rem"} repeat(5, minmax(0, 1fr))` }}>
        <div />
        {SEVERITIES.map((s) => (
          <div key={s.v} className="pb-1 text-center text-[11px] font-semibold leading-tight text-muted">
            {s.v}{!compact && <span className="block font-normal">{s.label}</span>}
          </div>
        ))}
        {PROBABILITIES.map((p) => (
          <div key={p.v} className="contents">
            <div className="flex items-center pr-2 text-[11px] font-semibold leading-tight text-muted">
              {p.v}{!compact && <span className="ml-1 font-normal">{p.label}</span>}
            </div>
            {SEVERITIES.map((s) => {
              const t = tolerability(p.v, s.v);
              const n = counts?.[`${p.v}${s.v}`] ?? 0;
              const isSel = selected?.p === p.v && selected?.s === s.v;
              return (
                <button
                  key={s.v}
                  type="button"
                  disabled={!onSelect}
                  onClick={() => onSelect?.(p.v, s.v)}
                  aria-label={`Probabilidad ${p.v}, severidad ${s.v}: ${t}${n ? `, ${n} peligros` : ""}`}
                  aria-pressed={isSel}
                  className={cn("rounded-sm font-bold transition-transform", size, BG[t], onSelect && "hover:scale-[1.04]", isSel && "ring-2 ring-ink ring-offset-2", !onSelect && "cursor-default")}
                >
                  {n > 0 ? n : compact ? "" : <span className="text-[10px] font-medium opacity-70">{p.v}{s.v}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-bad" />Intolerable</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#F2C14E]" />Tolerable con mitigación</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#5DAE7A]" />Aceptable</span>
      </div>
    </div>
  );
}
