import type * as React from "react"
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
  valor: React.ReactNode
  icon?: LucideIcon
  detalle?: string
  serie?: number[]
  className?: string
}) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "rounded-2xl bg-card p-5 shadow-[0_2px_8px_-2px_rgb(18_20_22_/_0.08),0_1px_2px_rgb(18_20_22_/_0.04)] ring-1 ring-border flex flex-col gap-2.5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgb(18_20_22_/_0.16)]",
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
      {serie ? <Sparkline datos={serie} alto={28} className="mt-1" /> : null}
    </div>
  )
}

export { StatCard }
