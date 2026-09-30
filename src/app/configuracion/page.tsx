"use client";
import { useStore } from "@/lib/store";
import { TENANT } from "@/lib/tenant";
import { Button, Card, PageHeader } from "@/components/ui";

const ROADMAP = [
  "Autenticación y roles (gerente de SMS, jefes de área, auditor, solo lectura).",
  "Base de datos en la nube con aislamiento por operador (multiempresa) y respaldos.",
  "Adjuntos de evidencia y notificaciones por correo de acciones próximas a vencer.",
  "Metas e indicadores configurables por operador.",
  "Firma electrónica de informes y exportación a PDF en el servidor.",
];

export default function Configuracion() {
  const reset = useStore((s) => s.reset);
  return (
    <>
      <PageHeader title="Configuración" sub="Datos del piloto y hoja de ruta hacia producción." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Datos de demostración">
          <p className="text-sm">Esta versión guarda la información en el navegador de este equipo. Nada se envía a un servidor. Los datos pertenecen a <b>{TENANT.name}</b>, una organización ficticia.</p>
          <Button variant="danger" className="mt-4" onClick={() => window.confirm("Se borrarán los cambios y se cargarán de nuevo los datos de demostración. ¿Continuar?") && reset()}>Restablecer datos de demostración</Button>
        </Card>
        <Card title="Hoja de ruta hacia producción">
          <ul className="list-disc space-y-1.5 pl-5 text-sm">{ROADMAP.map((r) => <li key={r}>{r}</li>)}</ul>
        </Card>
      </div>
    </>
  );
}
