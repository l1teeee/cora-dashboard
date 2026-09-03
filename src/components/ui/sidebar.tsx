"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

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
          "flex flex-col bg-sidebar border-r border-sidebar-border",
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300",
          abiertaMovil ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:translate-x-0 lg:shrink-0 lg:transition-[width] lg:duration-300 lg:ease-in-out",
          colapsada ? "lg:w-16" : "lg:w-64",
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
        "flex h-14 items-center gap-2 border-b border-sidebar-border px-3 shrink-0",
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
        "flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-5",
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
      className={cn("mt-auto border-t border-sidebar-border p-2 shrink-0", className)}
    >
      {children}
    </div>
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
    <nav data-slot="sidebar-nav" className={cn("flex flex-col gap-5", className)}>
      {grupos.map((grupo, indice) => {
        if (grupo.items.length === 0) return null
        return (
          <div key={grupo.titulo ?? indice} className="flex flex-col gap-0.5">
            {grupo.titulo && !colapsada && (
              <span className="px-2.5 mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {grupo.titulo}
              </span>
            )}
            {grupo.titulo && colapsada && <Separator className="my-2" />}
            {grupo.items.map((item) => {
              const activo = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={activo ? "page" : undefined}
                  title={colapsada ? item.etiqueta : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors duration-200 select-none",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
                    activo
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    colapsada && "justify-center px-0"
                  )}
                >
                  <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                  {colapsada ? (
                    <span className="sr-only">{item.etiqueta}</span>
                  ) : (
                    <span className="truncate">{item.etiqueta}</span>
                  )}
                  {item.badge !== undefined && !colapsada && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNav }
