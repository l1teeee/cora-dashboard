"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

export type ItemNav = {
  href: string
  etiqueta: string
  icon: LucideIcon
  badge?: string | number
}

export type GrupoNav = { titulo?: string; items: ItemNav[] }

function Sidebar({
  colapsada = false,
  abiertaMovil = false,
  onCerrarMovil,
  className,
  children,
}: {
  colapsada?: boolean
  abiertaMovil?: boolean
  onCerrarMovil?: () => void
  className?: string
  children: React.ReactNode
}) {
  React.useEffect(() => {
    if (!abiertaMovil) return
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrarMovil?.()
    }
    document.addEventListener("keydown", alPresionarTecla)
    return () => document.removeEventListener("keydown", alPresionarTecla)
  }, [abiertaMovil, onCerrarMovil])

  return (
    <>
      {abiertaMovil && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
          onClick={onCerrarMovil}
        />
      )}
      <aside
        data-slot="sidebar"
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground",
          "fixed inset-y-0 left-0 z-50 w-[17rem] transition-transform duration-200 ease-out",
          abiertaMovil ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:translate-x-0 lg:shrink-0 lg:transition-[width] lg:duration-200 lg:ease-out",
          colapsada ? "lg:w-[4.5rem]" : "lg:w-[17rem]",
          className
        )}
      >
        {children}
      </aside>
    </>
  )
}

function SidebarHeader({ className, children }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4 shrink-0",
        className
      )}
    >
      {children}
    </div>
  )
}

function SidebarContent({ className, children }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-6",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
    >
      {children}
    </div>
  )
}

function SidebarFooter({ className, children }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto border-t border-sidebar-border p-3 shrink-0", className)}
    >
      {children}
    </div>
  )
}

function SeparadorGrupo() {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className="mx-auto my-3 h-px w-8 bg-linear-to-r from-transparent via-sidebar-foreground/25 to-transparent"
    />
  )
}

function EnlaceNav({
  item,
  activo,
  colapsada,
}: {
  item: ItemNav
  activo: boolean
  colapsada: boolean
}) {
  const clases = cn(
    "flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-[background-color,color,transform] duration-150 ease-out select-none",
    "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
    activo
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-[0_1px_3px_rgb(0_0_0_/_0.25)]"
      : "text-sidebar-foreground/62 hover:translate-x-0.5 hover:bg-white/8 hover:text-sidebar-foreground",
    colapsada && "justify-center px-0 hover:translate-x-0"
  )

  const contenido = (
    <>
      <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
      {colapsada ? (
        <span className="sr-only">{item.etiqueta}</span>
      ) : (
        <span className="truncate">{item.etiqueta}</span>
      )}
      {item.badge !== undefined && !colapsada && (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-[10px] font-semibold text-sidebar-primary-foreground">
          {item.badge}
        </span>
      )}
    </>
  )

  if (!colapsada) {
    return (
      <Link href={item.href} aria-current={activo ? "page" : undefined} className={clases}>
        {contenido}
      </Link>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link href={item.href} aria-current={activo ? "page" : undefined} className={clases} />
        }
      >
        {contenido}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={10}
        className="bg-sidebar-accent text-sidebar-accent-foreground ring-black/10 shadow-[0_8px_24px_rgb(0_0_0_/_0.35)]"
      >
        {item.etiqueta}
        {item.badge !== undefined && (
          <span className="ml-1.5 opacity-55">{item.badge}</span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarNav({
  grupos,
  colapsada = false,
  className,
}: {
  grupos: GrupoNav[]
  colapsada?: boolean
  className?: string
}) {
  const pathname = usePathname()

  return (
    <TooltipProvider delay={250} closeDelay={0}>
      <nav data-slot="sidebar-nav" className={cn("flex flex-col gap-6", className)}>
        {grupos.map((grupo, indice) => {
          if (grupo.items.length === 0) return null
          return (
            <div key={grupo.titulo ?? indice} className="flex flex-col gap-1">
              {grupo.titulo && !colapsada && (
                <span className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/45">
                  {grupo.titulo}
                </span>
              )}
              {grupo.titulo && colapsada && <SeparadorGrupo />}
              {grupo.items.map((item) => (
                <EnlaceNav
                  key={item.href}
                  item={item}
                  activo={pathname === item.href}
                  colapsada={colapsada}
                />
              ))}
            </div>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNav }
