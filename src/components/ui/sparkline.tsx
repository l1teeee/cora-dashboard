import { cn } from "@/lib/utils"

function Sparkline({
  datos,
  alto = 32,
  className,
}: {
  datos: number[]
  alto?: number
  className?: string
}) {
  if (datos.length < 2) return null

  const min = Math.min(...datos)
  const max = Math.max(...datos)
  const rango = max - min

  const puntos = datos.map((valor, i) => {
    const x = (i / (datos.length - 1)) * 100
    const y = rango === 0 ? alto / 2 : alto - 2 - ((valor - min) / rango) * (alto - 4)
    return { x, y }
  })

  const puntosStr = puntos.map((p) => `${p.x},${p.y}`).join(" ")
  const ultimo = puntos[puntos.length - 1]

  return (
    <svg
      viewBox={`0 0 100 ${alto}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      aria-hidden="true"
    >
      <polyline
        points={puntosStr}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="text-muted-foreground/50"
      />
      <circle
        cx={ultimo.x}
        cy={ultimo.y}
        r={2}
        fill="currentColor"
        vectorEffect="non-scaling-stroke"
        className="text-primary"
      />
    </svg>
  )
}

export { Sparkline }
