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
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-[1.875rem]">{titulo}</h1>
        {descripcion ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{descripcion}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      ) : null}
    </div>
  )
}

export { PageHeader }
