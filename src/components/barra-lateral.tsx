"use client";

import { PhoneCallIcon, BotIcon, ScrollTextIcon } from "lucide-react";
import type { Rol } from "@/lib/tipos";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  type GrupoNav,
  type ItemNav,
} from "@/components/ui/sidebar";
import { Avatar } from "@/components/ui/avatar";
import { BotonLogout } from "@/components/boton-logout";

const GRUPOS: { titulo?: string; items: (ItemNav & { soloAdmin?: boolean })[] }[] = [
  { items: [{ href: "/dashboard", etiqueta: "Llamadas", icon: PhoneCallIcon }] },
  {
    titulo: "Administracion",
    items: [
      { href: "/dashboard/asistente", etiqueta: "Asistente", icon: BotIcon, soloAdmin: true },
      { href: "/dashboard/auditoria", etiqueta: "Auditoria", icon: ScrollTextIcon, soloAdmin: true },
    ],
  },
];

export function BarraLateral({
  rol,
  usuario,
  colapsada,
  abiertaMovil,
  onCerrarMovil,
}: {
  rol: Rol;
  usuario: string;
  colapsada: boolean;
  abiertaMovil: boolean;
  onCerrarMovil: () => void;
}) {
  // Filtrado ANTES de renderizar: para el rol "agente" los enlaces y el titulo
  // "Administracion" nunca llegan al HTML (no es un ocultamiento por CSS).
  const grupos: GrupoNav[] = GRUPOS.map((g) => ({
    titulo: g.titulo,
    items: g.items.filter((i) => rol === "admin" || !i.soloAdmin),
  })).filter((g) => g.items.length > 0);

  return (
    <Sidebar colapsada={colapsada} abiertaMovil={abiertaMovil} onCerrarMovil={onCerrarMovil}>
      <SidebarHeader>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
          C
        </div>
        {!colapsada && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">CORA</span>
            <span className="text-[11px] text-muted-foreground">Panel de llamadas</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav grupos={grupos} colapsada={colapsada} />
      </SidebarContent>
      <SidebarFooter>
        <Avatar nombre={usuario} size="sm" />
        {!colapsada && (
          <>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium">{usuario}</span>
              <span className="text-[11px] text-muted-foreground">
                {rol === "admin" ? "Administrador" : "Agente"}
              </span>
            </div>
            <BotonLogout />
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
