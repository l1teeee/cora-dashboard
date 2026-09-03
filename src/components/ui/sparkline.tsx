import { useId } from "react"

import { cn } from "@/lib/utils"

// Espacio de coordenadas interno del viewBox, no pixeles: con preserveAspectRatio="none"
// el SVG se estira a la altura real que le dé su contenedor.
const ALTO_VIEWBOX = 32

function trazarCurvaSuave(puntos: { x: number; y: number }[]) {
  let d = `M ${puntos[0].x} ${puntos[0].y}`
  for (let i = 0; i < puntos.length - 1; i++) {
    const actual = puntos[i]
    const siguiente = puntos[i + 1]
    const puntoMedio = { x: (actual.x + siguiente.x) / 2, y: (actual.y + siguiente.y) / 2 }
    d += ` Q ${actual.x} ${actual.y} ${puntoMedio.x} ${puntoMedio.y}`
  }
  const ultimo = puntos[puntos.length - 1]
  d += ` Q ${ultimo.x} ${ultimo.y} ${ultimo.x} ${ultimo.y}`
  return d
}

function Sparkline({ datos, className }: { datos: number[]; className?: string }) {
  const idGradiente = useId()

  if (datos.length < 2) return null

  const min = Math.min(...datos)
  const max = Math.max(...datos)
  const rango = max - min

  const puntos = datos.map((valor, i) => {
    const x = (i / (datos.length - 1)) * 100
    const y =
      rango === 0
        ? ALTO_VIEWBOX / 2
        : ALTO_VIEWBOX - 2 - ((valor - min) / rango) * (ALTO_VIEWBOX - 4)
    return { x, y }
  })

  const curva = trazarCurvaSuave(puntos)
  const ultimo = puntos[puntos.length - 1]
  const primero = puntos[0]
  const areaBajoLaCurva = `${curva} L ${ultimo.x} ${ALTO_VIEWBOX} L ${primero.x} ${ALTO_VIEWBOX} Z`

  return (
    <svg
      viewBox={`0 0 100 ${ALTO_VIEWBOX}`}
      preserveAspectRatio="none"
      // La altura la pone el contenedor, no el SVG: dentro de una rejilla redimensionable
      // una altura propia en pixeles desborda la tarjeta en cuanto la celda es mas baja.
      className={cn("block h-full w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${idGradiente}-linea`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-chart-2)" />
          <stop offset="100%" stopColor="var(--color-chart-3)" />
        </linearGradient>
        <linearGradient id={`${idGradiente}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.22} />
          <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaBajoLaCurva} fill={`url(#${idGradiente}-area)`} stroke="none" />
      <path
        d={curva}
        fill="none"
        stroke={`url(#${idGradiente}-linea)`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={ultimo.x}
        cy={ultimo.y}
        r={2.25}
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
        className="text-chart-3"
      />
    </svg>
  )
}

export { Sparkline }
