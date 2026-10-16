import type {
  ActionItem,
  AuditEntry,
  Hazard,
  OpsMonth,
  Rav5State,
  Report,
  ReportStatus,
} from "./types";
import { RAV5, TENANT, FLEET } from "./tenant";
import { addDays, addMonths, daysBetween, monthKey, toDateKey } from "./format";
import { appendAudit } from "./audit";

export interface Snapshot {
  reports: Report[];
  hazards: Hazard[];
  actions: ActionItem[];
  ops: OpsMonth[];
  rav5: Record<string, Rav5State>;
  audit: AuditEntry[];
}

const FLIGHTS = [38, 41, 45, 52, 47, 55, 60, 58, 49];
const FATIGUE = [0, 0, 0, 0, 1, 0, 0, 0, 0];
const ASR_COUNT = [3, 2, 4, 2, 1, 3, 2, 3, 2];
const MOR_COUNT = [0, 1, 0, 0, 2, 0, 1, 0, 0];
const DAYS = [4, 9, 14, 19, 24, 27];
const WHO = [
  "Piloto",
  "Copiloto",
  "Técnico de mantenimiento",
  "Despachador",
  "Agente de rampa",
  "Sobrecargo",
];

// [área, categoría, estación, descripción]
const ASR_T: [string, string, string, string][] = [
  [
    "Operaciones de vuelo",
    "Fatiga",
    "SVMI Maiquetía",
    "Tripulación reporta cansancio tras tres rotaciones consecutivas de madrugada.",
  ],
  [
    "Mantenimiento",
    "Procedimientos",
    "SVVA Valencia",
    "Tarjeta de trabajo con revisión desactualizada disponible en el hangar de línea.",
  ],
  [
    "Rampa y tierra",
    "Rampa y tierra",
    "SVMG Margarita",
    "Vehículo de servicio estacionado dentro de la zona de seguridad del ala durante el embarque.",
  ],
  [
    "Despacho",
    "Meteorología",
    "SVMI Maiquetía",
    "Pronóstico de tormentas en ruta comunicado a la tripulación con retraso.",
  ],
  [
    "Operaciones de vuelo",
    "Comunicaciones",
    "SVBC Barcelona",
    "Colación ambigua de la autorización de rodaje con la torre; se aclaró antes de mover la aeronave.",
  ],
  [
    "Cabina de pasajeros",
    "Procedimientos",
    "SVMI Maiquetía",
    "Equipaje de mano voluminoso obstruyendo una salida de emergencia durante el embarque.",
  ],
  [
    "Mantenimiento",
    "Falla técnica",
    "SVMD Mérida",
    "Herramienta con calibración vencida detectada antes de usarse en un torque crítico.",
  ],
  [
    "Operaciones de vuelo",
    "Error humano",
    "SVPR Puerto Ordaz",
    "Ajuste de altímetro omitido en la lista de verificación de descenso; corregido por el copiloto.",
  ],
  [
    "Rampa y tierra",
    "Fauna",
    "SVMG Margarita",
    "Presencia de fauna en la zona de la pista observada durante el rodaje.",
  ],
  [
    "Despacho",
    "Procedimientos",
    "SVMC Maracaibo",
    "Hoja de peso y balance firmada con datos de carga sin actualizar.",
  ],
  [
    "Operaciones de vuelo",
    "Fatiga",
    "SVVA Valencia",
    "Tiempo de servicio cercano al límite por retrasos encadenados.",
  ],
  [
    "Mantenimiento",
    "Procedimientos",
    "SVMI Maiquetía",
    "Repuesto sin etiqueta de trazabilidad recibido en el almacén.",
  ],
  [
    "Rampa y tierra",
    "Mercancías peligrosas",
    "SVMI Maiquetía",
    "Pasajero intentó abordar con baterías de litio sueltas en el equipaje facturado.",
  ],
  [
    "Cabina de pasajeros",
    "Comunicaciones",
    "SVBM Barquisimeto",
    "Información de seguridad a bordo interrumpida por falla del sistema de audio.",
  ],
];
const MOR_T: [string, string, string, string][] = [
  [
    "Operaciones de vuelo",
    "Fauna",
    "SVMG Margarita",
    "Impacto con ave durante el despegue. Inspección posterior sin daños estructurales.",
  ],
  [
    "Operaciones de vuelo",
    "Falla técnica",
    "SVMI Maiquetía",
    "Alerta de baja presión hidráulica en aproximación. Aterrizaje normal.",
  ],
  [
    "Operaciones de vuelo",
    "Error humano",
    "SVMD Mérida",
    "Aproximación no estabilizada por debajo de 500 pies. Se ejecutó aproximación frustrada.",
  ],
  [
    "Operaciones de vuelo",
    "Fatiga",
    "SVVA Valencia",
    "Exceso del tiempo de servicio de la tripulación por retrasos encadenados.",
  ],
];

export function buildSeed(now = new Date()): Snapshot {
  const t = toDateKey(now);
  const cm = monthKey(t);
  const months = Array.from({ length: 9 }, (_, i) => addMonths(cm, i - 8));
  const ops: OpsMonth[] = months.map((m, i) => ({
    month: m,
    flights: FLIGHTS[i],
    fatigue: FATIGUE[i],
  }));

  const raw: Omit<Report, "code" | "status">[] = [];
  let a = 0,
    mo = 0,
    n = 0;
  months.forEach((m, i) => {
    const push = (type: "ASR" | "MOR", tpl: [string, string, string, string], k: number) => {
      let d = `${m}-${String(DAYS[k % DAYS.length]).padStart(2, "0")}`;
      if (d > t) d = t;
      const anonymous = type === "ASR" && n % 3 === 0;
      raw.push({
        id: `r${++n}`,
        type,
        date: d,
        area: tpl[0],
        category: tpl[1],
        station: tpl[2],
        description: tpl[3],
        aircraft: FLEET[n % FLEET.length],
        anonymous,
        reporter: anonymous ? "Anónimo" : WHO[n % WHO.length],
        hazardIds: [],
        notifiedAuthority: type === "MOR",
        createdAt: `${d}T09:00:00.000Z`,
      });
    };
    for (let k = 0; k < ASR_COUNT[i]; k++) push("ASR", ASR_T[a++ % ASR_T.length], k);
    for (let k = 0; k < MOR_COUNT[i]; k++) push("MOR", MOR_T[mo++ % MOR_T.length], k + 3);
  });
  raw.sort((x, y) => x.date.localeCompare(y.date));
  const counters: Record<string, number> = {};
  const reports: Report[] = raw
    .map((r) => {
      const key = `${r.type}-${r.date.slice(0, 4)}`;
      counters[key] = (counters[key] ?? 0) + 1;
      const age = daysBetween(r.date, t);
      const status: ReportStatus =
        age > 60 ? "Cerrado" : age > 30 ? "Acción abierta" : age > 10 ? "En análisis" : "Nuevo";
      return { ...r, code: `${key}-${String(counters[key]).padStart(3, "0")}`, status };
    })
    .reverse();

  // Vínculos ejemplo entre reportes y peligros
  const link = (pred: (r: Report) => boolean, hz: string) =>
    reports.filter(pred).forEach((r) => r.hazardIds.push(hz));
  link((r) => r.category === "Fatiga", "h1");
  link((r) => r.category === "Fauna", "h5");
  link((r) => r.category === "Rampa y tierra" && r.area === "Rampa y tierra", "h7");

  const H = (id: number, o: Omit<Hazard, "id" | "code" | "createdAt">): Hazard => ({
    id: `h${id}`,
    code: `PEL-${String(id).padStart(3, "0")}`,
    createdAt: addDays(t, -120 + id * 7) + "T10:00:00.000Z",
    ...o,
  });
  const hazards: Hazard[] = [
    H(1, {
      title: "Fatiga acumulada por rotaciones de madrugada",
      description:
        "Programaciones con varias salidas antes de las 06:00 reducen el descanso efectivo de las tripulaciones.",
      area: "Operaciones de vuelo",
      consequences: "Error de la tripulación en fases críticas del vuelo.",
      controls:
        "Límites de servicio programados con margen, revisión mensual de horarios y reporte de fatiga sin sanción.",
      probability: 4,
      severity: "B",
      residualProbability: 3,
      residualSeverity: "C",
      owner: "Director de operaciones",
      status: "Mitigado",
      reviewDate: addDays(t, 40),
    }),
    H(2, {
      title: "Combustible contaminado en estaciones remotas",
      description:
        "Control de calidad de combustible limitado en estaciones con pocos proveedores.",
      area: "Rampa y tierra",
      consequences: "Pérdida de potencia o falla de motor.",
      controls: "Muestreo antes de cada suministro y proveedores auditados.",
      probability: 2,
      severity: "A",
      residualProbability: 1,
      residualSeverity: "A",
      owner: "Coordinador de rampa",
      status: "Mitigado",
      reviewDate: addDays(t, 75),
    }),
    H(3, {
      title: "Aproximaciones no estabilizadas en aeropuertos de terreno elevado",
      description: "Perfiles de descenso exigentes con viento cruzado y orografía.",
      area: "Operaciones de vuelo",
      consequences: "Salida de pista o impacto contra el terreno.",
      controls: "Entrenamiento en simulador, criterios de aproximación frustrada obligatoria.",
      probability: 3,
      severity: "A",
      residualProbability: 2,
      residualSeverity: "A",
      owner: "Jefe de pilotos",
      status: "Abierto",
      reviewDate: addDays(t, -6),
    }),
    H(4, {
      title: "Comunicaciones no estandarizadas con la torre",
      description: "Colaciones ambiguas en frecuencias congestionadas.",
      area: "Operaciones de vuelo",
      consequences: "Incursión en pista o error de ruta de rodaje.",
      controls: "Fraseología estándar reforzada en entrenamiento recurrente.",
      probability: 3,
      severity: "B",
      residualProbability: 2,
      residualSeverity: "B",
      owner: "Jefe de entrenamiento",
      status: "Abierto",
      reviewDate: addDays(t, 28),
    }),
    H(5, {
      title: "Impacto con aves en aeródromos costeros",
      description: "Presencia frecuente de fauna en las cercanías de pista.",
      area: "Operaciones de vuelo",
      consequences: "Daño a motor o parabrisas.",
      controls:
        "Reporte de fauna a la administración del aeropuerto y revisión posterior al vuelo.",
      probability: 4,
      severity: "C",
      residualProbability: 3,
      residualSeverity: "C",
      owner: "Director de operaciones",
      status: "Abierto",
      reviewDate: addDays(t, 14),
    }),
    H(6, {
      title: "Herramientas con calibración vencida en línea",
      description: "Control de calibración insuficiente en bases secundarias.",
      area: "Mantenimiento",
      consequences: "Torque incorrecto en componentes críticos.",
      controls: "Etiquetado de calibración y auditoría mensual de herramientas.",
      probability: 3,
      severity: "B",
      residualProbability: 2,
      residualSeverity: "C",
      owner: "Jefe de mantenimiento",
      status: "Mitigado",
      reviewDate: addDays(t, 55),
    }),
    H(7, {
      title: "Daño a la aeronave por equipos de rampa",
      description: "Vehículos operando cerca del fuselaje durante la atención en tierra.",
      area: "Rampa y tierra",
      consequences: "Daño estructural no detectado.",
      controls: "Zonas de seguridad marcadas y capacitación de operadores de equipos.",
      probability: 4,
      severity: "D",
      residualProbability: 3,
      residualSeverity: "D",
      owner: "Coordinador de rampa",
      status: "Abierto",
      reviewDate: addDays(t, 20),
    }),
    H(8, {
      title: "Competencia insuficiente en mercancías peligrosas",
      description: "Personal de mostrador y rampa con capacitación vencida.",
      area: "Entrenamiento",
      consequences: "Incendio a bordo por baterías de litio o carga no declarada.",
      controls: "Plan de recurrentes anual y verificación en el embarque.",
      probability: 2,
      severity: "A",
      residualProbability: 2,
      residualSeverity: "B",
      owner: "Jefe de entrenamiento",
      status: "Abierto",
      reviewDate: addDays(t, 33),
    }),
  ];

  const A = (i: number, o: Omit<ActionItem, "id" | "code" | "createdAt">): ActionItem => ({
    id: `a${i}`,
    code: `CAP-${String(i).padStart(3, "0")}`,
    createdAt: addDays(t, -90 + i * 6) + "T10:00:00.000Z",
    ...o,
  });
  const actions: ActionItem[] = [
    A(1, {
      title: "Revisar programación de rotaciones de madrugada",
      description: "Reducir salidas consecutivas antes de las 06:00 y ampliar el descanso mínimo.",
      hazardId: "h1",
      owner: "Director de operaciones",
      dueDate: addDays(t, -12),
      priority: "Alta",
      status: "En curso",
    }),
    A(2, {
      title: "Recurrente de aproximaciones estabilizadas en simulador",
      description:
        "Sesión obligatoria para toda la flota con énfasis en aeropuertos de terreno elevado.",
      hazardId: "h3",
      owner: "Jefe de pilotos",
      dueDate: addDays(t, -3),
      priority: "Alta",
      status: "Abierta",
    }),
    A(3, {
      title: "Coordinar con el aeropuerto el control de fauna en pista",
      description: "Solicitar plan de manejo de fauna y reporte trimestral.",
      hazardId: "h5",
      owner: "Director de operaciones",
      dueDate: addDays(t, 9),
      priority: "Media",
      status: "En curso",
    }),
    A(4, {
      title: "Auditar calibración de herramientas en bases secundarias",
      description: "Inspección de etiquetas y registros en las tres bases con mayor actividad.",
      hazardId: "h6",
      owner: "Jefe de mantenimiento",
      dueDate: addDays(t, 21),
      priority: "Media",
      status: "Abierta",
    }),
    A(5, {
      title: "Marcar zonas de seguridad de aeronave en plataforma",
      description: "Señalización y briefing a operadores de equipos de tierra.",
      hazardId: "h7",
      owner: "Coordinador de rampa",
      dueDate: addDays(t, 35),
      priority: "Media",
      status: "Abierta",
    }),
    A(6, {
      title: "Actualizar capacitación de mercancías peligrosas",
      description: "Recurrente para mostrador y rampa con evaluación registrada.",
      hazardId: "h8",
      owner: "Jefe de entrenamiento",
      dueDate: addDays(t, 60),
      priority: "Alta",
      status: "Abierta",
    }),
    A(7, {
      title: "Reforzar fraseología estándar en entrenamiento recurrente",
      description: "Módulo de comunicaciones con casos reales reportados.",
      hazardId: "h4",
      owner: "Jefe de entrenamiento",
      dueDate: addDays(t, -40),
      priority: "Media",
      status: "Cerrada",
      closedAt: addDays(t, -44),
      evidence: "Módulo dictado a 100 % de las tripulaciones. Lista de asistencia archivada.",
    }),
    A(8, {
      title: "Implementar muestreo de combustible en cada suministro",
      description: "Procedimiento y registro en todas las estaciones.",
      hazardId: "h2",
      owner: "Coordinador de rampa",
      dueDate: addDays(t, -70),
      priority: "Alta",
      status: "Cerrada",
      closedAt: addDays(t, -75),
      evidence: "Procedimiento emitido y registros verificados en auditoría interna.",
    }),
    A(9, {
      title: "Corregir revisión de tarjetas de trabajo en hangar de línea",
      description:
        "Retirar copias impresas obsoletas y usar solo el sistema de documentación controlada.",
      owner: "Jefe de mantenimiento",
      dueDate: addDays(t, -20),
      priority: "Baja",
      status: "Cerrada",
      closedAt: addDays(t, -22),
      evidence: "Documentación obsoleta retirada. Verificación fotográfica.",
    }),
  ];

  const rav5: Record<string, Rav5State> = {};
  const preset: Record<string, Rav5State["status"]> = {
    "1.1": "Implementado",
    "1.2": "Implementado",
    "1.3": "Implementado",
    "1.4": "En progreso",
    "1.5": "Implementado",
    "2.1": "Implementado",
    "2.2": "Implementado",
    "3.1": "Implementado",
    "3.2": "Pendiente",
    "3.3": "En progreso",
    "4.1": "En progreso",
    "4.2": "En progreso",
  };
  RAV5.forEach((e) => (rav5[e.id] = { status: preset[e.id], note: "" }));

  const audit = appendAudit(
    [],
    {
      actor: "Sistema",
      action: "Iniciar",
      entity: "Sistema",
      entityId: "DEMO",
      summary: `Datos de demostración cargados para ${TENANT.name}`,
    },
    now.toISOString(),
  );
  return { reports, hazards, actions, ops, rav5, audit };
}
