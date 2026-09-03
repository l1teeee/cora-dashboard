import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground ring-2 ring-primary/10",
  {
    variants: {
      size: {
        sm: "size-6 text-[10px]",
        default: "size-8 text-xs",
        lg: "size-10 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function obtenerIniciales(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return ""
  if (palabras.length === 1) return palabras[0]!.charAt(0).toUpperCase()
  return (palabras[0]!.charAt(0) + palabras[1]!.charAt(0)).toUpperCase()
}

function Avatar({
  nombre,
  size = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  nombre: string
  size?: "sm" | "default" | "lg"
}) {
  return (
    <span
      data-slot="avatar"
      title={nombre}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {obtenerIniciales(nombre)}
    </span>
  )
}

export { Avatar }
