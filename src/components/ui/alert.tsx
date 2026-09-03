import * as React from "react"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
  {
    variants: {
      variant: {
        info: "border-border bg-muted text-foreground",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const iconVariants = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  destructive: CircleAlertIcon,
} as const

function Alert({
  variant = "info",
  titulo,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    titulo?: string
  }) {
  const varianteResuelta = variant ?? "info"
  const Icon = iconVariants[varianteResuelta]

  return (
    <div
      data-slot="alert"
      role={varianteResuelta === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant: varianteResuelta }), className)}
      {...props}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 mt-px",
          varianteResuelta === "info" && "text-muted-foreground"
        )}
        strokeWidth={1.75}
      />
      <div className="min-w-0 flex-1">
        {titulo ? <p className="font-medium">{titulo}</p> : null}
        <div className="text-sm [&_p]:leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export { Alert }
