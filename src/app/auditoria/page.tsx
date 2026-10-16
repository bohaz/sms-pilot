"use client";
import { useMemo, useState } from "react";
import { Download, ShieldAlert, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { verifyChain, type Integrity } from "@/lib/audit";
import { downloadFile, fmtDateTime, toCsv } from "@/lib/format";
import { Badge, Button, Card, PageHeader, Select, Table, Td, Th } from "@/components/ui";

export default function Auditoria() {
  const audit = useStore((s) => s.audit);
  const [entity, setEntity] = useState("");
  const [res, setRes] = useState<Integrity | null>(null);
  const entities = useMemo(() => Array.from(new Set(audit.map((a) => a.entity))), [audit]);
  const list = [...audit].reverse().filter((a) => !entity || a.entity === entity);

  const verify = () => setRes(verifyChain(useStore.getState().audit));
  function tamper() {
    if (
      !window.confirm(
        "Esto altera un registro para demostrar la detección de manipulación. Puede revertirlo desde Configuración con «Restablecer datos». ¿Continuar?",
      )
    )
      return;
    const s = useStore.getState();
    if (s.audit.length < 2) return;
    const i = Math.floor(s.audit.length / 2);
    useStore.setState({
      audit: s.audit.map((a, k) => (k === i ? { ...a, summary: a.summary + " (alterado)" } : a)),
    });
    setRes(null);
  }
  const exportCsv = () =>
    downloadFile(
      "bitacora-auditoria.csv",
      toCsv([
        ["N°", "Fecha", "Usuario", "Acción", "Entidad", "Referencia", "Detalle", "Huella"],
        ...audit.map((a) => [
          a.seq,
          a.ts,
          a.actor,
          a.action,
          a.entity,
          a.entityId,
          a.summary,
          a.hash,
        ]),
      ]),
    );

  return (
    <>
      <PageHeader
        title="Bitácora de auditoría"
        sub="Cada acción queda registrada y encadenada con la anterior mediante una huella SHA-256. Si alguien modifica un registro, la verificación lo detecta."
        actions={
          <>
            <Button onClick={exportCsv}>
              <Download size={16} />
              Exportar CSV
            </Button>
            <Button variant="primary" onClick={verify}>
              <ShieldCheck size={16} />
              Verificar integridad
            </Button>
          </>
        }
      />

      {res && (
        <div
          role="status"
          className={`mb-4 flex items-start gap-3 rounded-lg border p-4 ${res.ok ? "border-ok/30 bg-ok-soft text-ok" : "border-bad/30 bg-bad-soft text-bad"}`}
        >
          {res.ok ? (
            <ShieldCheck size={20} className="mt-0.5 shrink-0" />
          ) : (
            <ShieldAlert size={20} className="mt-0.5 shrink-0" />
          )}
          <div className="text-sm">
            {res.ok ? (
              <>
                <p className="font-bold">La bitácora está íntegra</p>
                <p>Se verificaron {res.checked} registros. Ninguno fue alterado.</p>
              </>
            ) : (
              <>
                <p className="font-bold">
                  Se detectó una alteración en el registro N° {res.brokenAt}
                </p>
                <p>
                  {res.reason} Los registros anteriores al N° {res.brokenAt} siguen siendo válidos.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <Card pad={false} right={undefined}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3">
          <Select
            aria-label="Filtrar por entidad"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="w-auto"
          >
            <option value="">Todas las entidades</option>
            {entities.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </Select>
          <span className="text-xs text-muted">{list.length} registros</span>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>N°</Th>
              <Th>Fecha y hora</Th>
              <Th>Acción</Th>
              <Th>Detalle</Th>
              <Th>Huella</Th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <Td>{a.seq}</Td>
                <Td className="whitespace-nowrap">
                  {fmtDateTime(a.ts)}
                  <span className="block text-xs text-muted">{a.actor}</span>
                </Td>
                <Td>
                  <Badge
                    tone={
                      a.action === "Crear" ? "ok" : a.action === "Actualizar" ? "brand" : "neutral"
                    }
                  >
                    {a.action}
                  </Badge>
                  <span className="mt-0.5 block text-xs text-muted">
                    {a.entity} {a.entityId}
                  </span>
                </Td>
                <Td className="max-w-md">{a.summary}</Td>
                <Td className="font-mono text-xs text-muted">{a.hash.slice(0, 10)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      <div className="mt-4 rounded-lg border border-dashed border-line p-4 text-sm">
        <p className="font-semibold">Para presentar a un cliente</p>
        <p className="mt-1 text-muted">
          Verifique la integridad, altere un registro y verifique otra vez para mostrar cómo se
          detecta la manipulación.
        </p>
        <Button size="sm" className="mt-3" onClick={tamper}>
          Simular manipulación de un registro
        </Button>
      </div>
    </>
  );
}
