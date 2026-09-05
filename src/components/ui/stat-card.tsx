import type * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { SparklineDiferida } from "@/components/ui/sparkline-diferida"
import type { PuntoGrafica } from "@/lib/tipos"

function StatCard({
  etiqueta,
  valor,
  icon: Icon,
  detalle,
  serie,
  unidadSerie,
  className,
}: {
  etiqueta: string
  valor: React.ReactNode
  icon?: LucideIcon
  detalle?: string
  serie?: PuntoGrafica[]
  unidadSerie?: string
  className?: string
}) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "superficie superficie-interactiva h-full overflow-hidden p-5 flex flex-col gap-2.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{etiqueta}</span>
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon className="size-4 text-primary/70" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
      <span className="text-[1.85rem] font-semibold tracking-tight leading-none">
        {valor}
      </span>
      {detalle ? (
        <span className="text-xs text-muted-foreground">{detalle}</span>
      ) : null}
      {/* La grafica absorbe el alto sobrante en vez de tener uno propio: la altura de la
          tarjeta la decide la celda de la rejilla, y con un alto fijo la curva terminaba
          empujada fuera del borde inferior y recortada. */}
      {serie ? (
        <div className="mt-1 min-h-0 flex-1">
          <SparklineDiferida datos={serie} unidad={unidadSerie} />
        </div>
      ) : null}
    </div>
  )
}

export { StatCard }
