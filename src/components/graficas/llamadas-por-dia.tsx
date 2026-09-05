"use client"

import { useId } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { PuntoGrafica } from "@/lib/tipos"
import { formatearLlamadas } from "@/lib/metricas"
import { TooltipGrafica } from "@/components/ui/grafica"

export function LlamadasPorDia({ datos }: { datos: PuntoGrafica[] }) {
  const idGradiente = useId()

  return (
    <div className="h-full min-h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={datos} margin={{ top: 8, right: 4, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
          <XAxis
            dataKey="etiqueta"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <YAxis
            allowDecimals={false}
            width={44}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={<TooltipGrafica formatearValor={(valor) => formatearLlamadas(valor)} />}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="var(--color-chart-3)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={`url(#${idGradiente})`}
            activeDot={{
              r: 4,
              strokeWidth: 2,
              stroke: "var(--color-card)",
              fill: "var(--color-chart-3)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
