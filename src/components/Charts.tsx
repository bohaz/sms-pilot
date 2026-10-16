"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SpiRow } from "@/lib/spi";

const AX = { fontSize: 12, fill: "#5B6B7B" };
const GRID = "#E6EAF0";

export function ReportsByMonthChart({ rows, height = 240 }: { rows: SpiRow[]; height?: number }) {
  const data = rows.map((r) => ({ mes: r.label.split(" ")[0], ASR: r.asr, MOR: r.mor }));
  return (
    <div style={{ height }} role="img" aria-label="Gráfica de reportes ASR y MOR por mes">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="mes" tick={AX} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis allowDecimals={false} tick={AX} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "#F2F4F7" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="ASR"
            name="ASR (voluntarios)"
            fill="#0B5CAD"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="MOR"
            name="MOR (obligatorios)"
            fill="#D9822B"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RateChart({ rows, height = 240 }: { rows: SpiRow[]; height?: number }) {
  const data = rows.map((r) => ({
    mes: r.label.split(" ")[0],
    tasa: r.rate === null ? null : Number(r.rate.toFixed(2)),
  }));
  return (
    <div style={{ height }} role="img" aria-label="Gráfica de la tasa de incidentes por mes">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="mes" tick={AX} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis tick={AX} tickLine={false} axisLine={false} unit=" %" />
          <Tooltip formatter={(v) => [`${v} %`, "Tasa de incidentes"]} />
          <ReferenceLine
            y={2}
            stroke="#B3261E"
            strokeDasharray="4 4"
            label={{
              value: "Alerta 2 %",
              fill: "#B3261E",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
          <Line
            type="monotone"
            dataKey="tasa"
            stroke="#0B5CAD"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({
  data,
  height = 260,
}: {
  data: { name: string; total: number }[];
  height?: number;
}) {
  return (
    <div style={{ height }} role="img" aria-label="Gráfica de reportes por categoría">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={AX} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={AX}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: "#F2F4F7" }} />
          <Bar
            dataKey="total"
            name="Reportes"
            fill="#0F2233"
            radius={[0, 3, 3, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
