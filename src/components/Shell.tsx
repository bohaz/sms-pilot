"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ClipboardList,
  FileBarChart2,
  FileText,
  History,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { TENANT } from "@/lib/tenant";
import { Badge, cn } from "./ui";

const NAV = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/reportes", label: "Reportes ASR y MOR", icon: FileText },
  { href: "/peligros", label: "Peligros y riesgos", icon: TriangleAlert },
  { href: "/acciones", label: "Acciones", icon: ListChecks },
  { href: "/indicadores", label: "Indicadores", icon: Activity },
  { href: "/cumplimiento", label: "Cumplimiento RAV 5", icon: ShieldCheck },
  { href: "/informes", label: "Informes", icon: FileBarChart2 },
  { href: "/auditoria", label: "Auditoría", icon: History },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="11" fill="none" stroke="#7FB4EA" strokeWidth="2" />
      <path d="M3 15.5h20" stroke="#7FB4EA" strokeWidth="2" />
      <path d="M8 15.5c1.2-4.2 3.2-6.3 5-6.3s3.8 2.1 5 6.3" fill="#7FB4EA" />
    </svg>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const pending = useStore((s) => s.reports.filter((r) => r.status === "Nuevo").length);

  useEffect(() => {
    const off = useStore.persist.onFinishHydration(() => setReady(true));
    Promise.resolve(useStore.persist.rehydrate()).then(() => setReady(true));
    return off;
  }, []);
  useEffect(() => setOpen(false), [path]);

  const nav = (
    <nav aria-label="Principal" className="flex flex-col gap-0.5 px-3 py-4">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-ink-soft text-white"
                : "text-[#B7C6D6] hover:bg-ink-soft/60 hover:text-white",
            )}
          >
            <Icon size={17} aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {href === "/reportes" && pending > 0 && (
              <span className="rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                {pending}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print hidden w-64 shrink-0 bg-ink lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex items-center gap-2.5 px-6 pt-6">
            <Mark />
            <div>
              <p className="text-base font-bold leading-none text-white">{TENANT.product}</p>
              <p className="mt-1 text-[11px] text-[#8FA5BA]">Seguridad operacional</p>
            </div>
          </div>
          {nav}
          <div className="mt-auto border-t border-ink-line px-6 py-4 text-xs text-[#8FA5BA]">
            Versión piloto 0.1
            <br />
            Basado en la RAV 5 y el Anexo 19
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="no-print fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
        >
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink">
            <div className="flex items-center justify-between px-6 pt-5">
              <div className="flex items-center gap-2.5">
                <Mark />
                <span className="font-bold text-white">{TENANT.product}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="text-white"
              >
                <X size={20} />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="app-header no-print sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:px-8">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="rounded p-1.5 text-text hover:bg-canvas lg:hidden"
          >
            <Menu size={20} />
          </button>
          <ClipboardList size={17} className="hidden text-muted sm:block" aria-hidden="true" />
          <span className="truncate text-sm font-semibold">{TENANT.name}</span>
          <Badge tone="warn" className="ml-auto">
            Datos de demostración
          </Badge>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          {ready ? (
            children
          ) : (
            <div className="py-24 text-center text-sm text-muted" role="status">
              Cargando datos…
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
