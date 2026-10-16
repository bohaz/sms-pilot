// Configuración de la organización. En producción vendrá de la base de datos (una por operador).
export const TENANT = {
  name: "Aerolínea Demo C.A.",
  product: "Vigía SMS",
  actor: "Gerente de seguridad operacional",
};

export const AREAS = [
  "Operaciones de vuelo",
  "Mantenimiento",
  "Despacho",
  "Rampa y tierra",
  "Cabina de pasajeros",
  "Entrenamiento",
  "Administración",
];
export const STATIONS = [
  "SVMI Maiquetía",
  "SVVA Valencia",
  "SVMG Margarita",
  "SVBC Barcelona",
  "SVMD Mérida",
  "SVMC Maracaibo",
  "SVPR Puerto Ordaz",
  "SVBM Barquisimeto",
];
export const FLEET = ["YV3001", "YV3002", "YV3003", "YV3004", "YV3005", "YV3006"];
export const CATEGORIES = [
  "Fatiga",
  "Meteorología",
  "Falla técnica",
  "Error humano",
  "Fauna",
  "Procedimientos",
  "Rampa y tierra",
  "Comunicaciones",
  "Mercancías peligrosas",
  "Otro",
];
export const OWNERS = [
  "Gerente de seguridad operacional",
  "Director de operaciones",
  "Jefe de pilotos",
  "Jefe de mantenimiento",
  "Coordinador de rampa",
  "Jefe de despacho",
  "Jefe de entrenamiento",
];

export interface Rav5Element {
  id: string;
  title: string;
  component: string;
  evidence: string;
  href?: string;
}
export const RAV5_COMPONENTS = [
  "Política y objetivos de seguridad operacional",
  "Gestión de riesgos de seguridad operacional",
  "Aseguramiento de la seguridad operacional",
  "Promoción de la seguridad operacional",
];

// Estructura de 4 componentes y 12 elementos (INAC / RAV 5, basada en el Anexo 19 de la OACI).
export const RAV5: Rav5Element[] = [
  {
    id: "1.1",
    component: RAV5_COMPONENTS[0],
    title: "Compromiso de la dirección",
    evidence: "Política de seguridad firmada y revisada por el gerente responsable.",
  },
  {
    id: "1.2",
    component: RAV5_COMPONENTS[0],
    title: "Obligación de rendición de cuentas y responsabilidades",
    evidence: "Responsables asignados en cada acción y peligro.",
    href: "/acciones",
  },
  {
    id: "1.3",
    component: RAV5_COMPONENTS[0],
    title: "Designación del personal clave de seguridad operacional",
    evidence: "Gerente de seguridad operacional designado.",
  },
  {
    id: "1.4",
    component: RAV5_COMPONENTS[0],
    title: "Coordinación de la planificación de respuestas ante emergencias",
    evidence: "Plan de respuesta ante emergencias coordinado con la autoridad y los aeropuertos.",
  },
  {
    id: "1.5",
    component: RAV5_COMPONENTS[0],
    title: "Documentación SMS",
    evidence: "Informes y bitácora de auditoría generados por el sistema.",
    href: "/informes",
  },
  {
    id: "2.1",
    component: RAV5_COMPONENTS[1],
    title: "Identificación de peligros",
    evidence: "Registro de peligros alimentado por los reportes ASR y MOR.",
    href: "/peligros",
  },
  {
    id: "2.2",
    component: RAV5_COMPONENTS[1],
    title: "Evaluación y mitigación de riesgos",
    evidence: "Matriz de riesgo con evaluación inicial y residual.",
    href: "/peligros",
  },
  {
    id: "3.1",
    component: RAV5_COMPONENTS[2],
    title: "Observación y medición del desempeño",
    evidence: "Indicadores de desempeño (SPI) con semáforos y tendencias.",
    href: "/indicadores",
  },
  {
    id: "3.2",
    component: RAV5_COMPONENTS[2],
    title: "Gestión del cambio",
    evidence: "Procedimiento de evaluación de riesgos ante cambios operacionales.",
  },
  {
    id: "3.3",
    component: RAV5_COMPONENTS[2],
    title: "Mejora continua del SMS",
    evidence: "Seguimiento de acciones correctivas y preventivas.",
    href: "/acciones",
  },
  {
    id: "4.1",
    component: RAV5_COMPONENTS[3],
    title: "Instrucción y educación",
    evidence: "Programa de capacitación en SMS para todo el personal.",
  },
  {
    id: "4.2",
    component: RAV5_COMPONENTS[3],
    title: "Comunicación de la seguridad operacional",
    evidence: "Difusión de lecciones aprendidas a partir de los reportes.",
    href: "/reportes",
  },
];
