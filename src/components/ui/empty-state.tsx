import type * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function EmptyState({
  icon: Icon,
  titulo,
  descripcion,
  children,
  className,
}: {
  icon?: LucideIcon
  titulo: string
  descripcion?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
      ) : null}
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {descripcion ? (
        <p className="text-sm text-muted-foreground max-w-sm">{descripcion}</p>
      ) : null}
      {children ? (
        <div className="mt-1 flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  )
}

export { EmptyState }
