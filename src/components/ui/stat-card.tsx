import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Sparkline } from "@/components/ui/sparkline"

function StatCard({
  etiqueta,
  valor,
  icon: Icon,
  detalle,
  serie,
  className,
}: {
  etiqueta: string
  valor: string | number
  icon?: LucideIcon
  detalle?: string
  serie?: number[]
  className?: string
}) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "rounded-xl bg-card ring-1 ring-border p-4 flex flex-col gap-2",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">{etiqueta}</span>
        {Icon ? (
          <Icon
            className="size-4 text-muted-foreground/70 shrink-0"
            strokeWidth={1.75}
          />
        ) : null}
      </div>
      <span className="text-3xl font-semibold tracking-tight leading-none">
        {valor}
      </span>
      {detalle ? (
        <span className="text-xs text-muted-foreground">{detalle}</span>
      ) : null}
      {serie ? <Sparkline datos={serie} alto={28} className="mt-1" /> : null}
    </div>
  )
}

export { StatCard }
