# Vigía SMS

Sistema de gestión de seguridad operacional (SMS) para operadores aéreos venezolanos. Versión piloto para demostración.

Estructura del sistema basada en la **RAV 5** (4 componentes, 12 elementos) y el **Anexo 19** de la OACI.

## Publicar gratis en Vercel

1. Suba esta carpeta a un repositorio de GitHub.
2. En vercel.com, elija **Add New > Project** e importe el repositorio.
3. No cambie ninguna configuración. Vercel detecta Next.js solo. Pulse **Deploy**.

Para probar en su equipo: `npm install` y luego `npm run dev` (http://localhost:3000).

## Qué incluye el piloto

| Módulo | Qué hace |
|---|---|
| Panel | Semáforos del mes, matriz de riesgo residual, alertas y actividad reciente |
| Reportes ASR y MOR | Registro, filtros, estados de análisis, vínculo con peligros, marca de notificación a la autoridad, exportación CSV |
| Peligros y riesgos | Registro con riesgo inicial y residual (matriz OACI Doc 9859) |
| Acciones | Responsables, fechas límite, vencimientos y evidencia de cierre obligatoria |
| Indicadores | SPI con semáforos, tendencias y registro mensual editable |
| Cumplimiento RAV 5 | Estado y evidencia de cada uno de los 12 elementos |
| Informes | Informe del período listo para imprimir o guardar como PDF, con huella de la bitácora |
| Auditoría | Bitácora encadenada con SHA-256 y verificación de integridad |

## Guion de demostración (5 minutos)

1. **Panel:** muestre lo que requiere atención y la matriz de riesgo.
2. **Reportes:** cree un MOR, cámbielo a "En análisis", marque la notificación y cree una acción desde el mismo reporte.
3. **Acciones:** cierre una acción con evidencia.
4. **Indicadores:** cambie los vuelos de un mes y vea cómo se recalculan los semáforos.
5. **Auditoría:** verifique la integridad, use "Simular manipulación" y verifique otra vez.
6. **Informes:** genere el informe del trimestre y guárdelo como PDF.

Al terminar, en **Configuración** use "Restablecer datos de demostración".

## Arquitectura

- Next.js 15 (App Router), TypeScript, Tailwind CSS 3, Recharts, Zustand.
- `src/lib/types.ts`: modelo de dominio.
- `src/lib/store.ts`: **único punto de acceso a los datos**. Hoy persiste en el navegador; para producción se reemplaza por llamadas a una base de datos sin tocar las pantallas.
- `src/lib/audit.ts`: bitácora encadenada. Cada registro incluye la huella del anterior.
- `src/lib/risk.ts` y `src/lib/spi.ts`: matriz de riesgo y criterios de semáforo (configurables por operador).
- `src/lib/tenant.ts`: datos de la organización y catálogo RAV 5. Es la base para el modo multiempresa.
- `npm run verify` comprueba la huella SHA-256, los indicadores de la semilla y la detección de alteraciones.

## Camino a producción

1. **Base de datos y autenticación:** Supabase (Postgres) con seguridad por fila y una organización por operador.
2. **Roles:** gerente de SMS, jefe de área, auditor, solo lectura.
3. **Bitácora en el servidor:** la cadena de huellas se calcula y guarda del lado servidor, en tablas de solo inserción.
4. **Adjuntos, correos de vencimiento y firma electrónica de informes.**
5. **Metas de seguridad configurables** por operador.

## Advertencia sobre la normativa

La estructura de componentes y elementos sigue lo publicado por el INAC. Los umbrales de los semáforos, los plazos de notificación y los criterios de reporte son valores de ejemplo. Antes de vender el sistema, valídelos con la edición vigente de la RAV 5 y con un especialista en cumplimiento aeronáutico venezolano.
