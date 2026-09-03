import type * as React from "react"

import { cn } from "@/lib/utils"

function PageHeader({
  titulo,
  descripcion,
  children,
  className,
}: {
  titulo: string
  descripcion?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
        {descripcion ? (
          <p className="text-sm text-muted-foreground mt-0.5">{descripcion}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      ) : null}
    </div>
  )
}

export { PageHeader }
