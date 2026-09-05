"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TooltipContentProps } from "recharts"

type PropsTooltipGrafica = Partial<
  Pick<TooltipContentProps<number, string>, "active" | "payload" | "label">
> & {
  formatearValor?: (valor: number) => string
}

// Lectura compartida por las graficas de Recharts. El valor manda y la etiqueta
// va secundaria: quien pasa el puntero ya sabe que serie mira, busca el numero.
function TooltipGrafica({ active, payload, label, formatearValor }: PropsTooltipGrafica) {
  if (!active || !payload?.length) return null

  const dato = payload[0]
  // Recharts tipa value como number | string | Array; el default a 0 es solo el
  // borde cosmetico del tooltip, no un valor de dominio, asi que lanzar aqui
  // romperia el hover de toda la grafica por algo que no afecta los datos reales.
  const valor = typeof dato.value === "number" ? dato.value : 0

  return (
    <div className="rounded-[0.6rem] bg-popover px-2.5 py-1.5 text-popover-foreground shadow-[0_1px_2px_rgb(18_20_22_/_0.08),0_8px_20px_-8px_rgb(18_20_22_/_0.22)] ring-1 ring-border">
      <p className="text-[13px] font-semibold tabular-nums leading-tight">
        {formatearValor ? formatearValor(valor) : valor}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span
          aria-hidden="true"
          className="inline-block h-0.5 w-3 rounded-full"
          style={{ background: dato.color }}
        />
        {label}
      </p>
    </div>
  )
}

// Especificacion visual fija de las barras del dashboard: grosor, radio de punta,
// rejilla, ticks y cursor del tooltip van hardcodeados aqui para que las cuatro
// graficas de barras no puedan divergir entre si.
function GraficaBarras({
  datos,
  claveX,
  claveY,
  formatearValor,
  ejeYDecimal = false,
  formatearTickX,
}: {
  datos: Array<Record<string, string | number>>
  claveX: string
  claveY: string
  formatearValor: (valor: number) => string
  ejeYDecimal?: boolean
  formatearTickX?: (etiqueta: string, indice: number) => string
}) {
  return (
    <div className="h-full min-h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datos}
          // Con etiquetas decimales en el eje Y, -22 corta el primer digito;
          // -8 deja el espacio justo para que quepan.
          margin={{ top: 8, right: 4, bottom: 0, left: ejeYDecimal ? -8 : -22 }}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
          <XAxis
            dataKey={claveX}
            // Recharts recorta ticks cuando calcula que no caben; quien pasa un
            // formateador necesita que se dibujen todos para poder vaciar algunos.
            interval={formatearTickX ? 0 : "preserveEnd"}
            tickFormatter={formatearTickX}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <YAxis
            allowDecimals={ejeYDecimal}
            width={44}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.55 }}
            content={<TooltipGrafica formatearValor={formatearValor} />}
          />
          <Bar dataKey={claveY} fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { TooltipGrafica, GraficaBarras }
