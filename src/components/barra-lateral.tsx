"use client";

import {
  LayoutDashboardIcon,
  PhoneCallIcon,
  HeadsetIcon,
  ContactRoundIcon,
  BotIcon,
  ScrollTextIcon,
  UsersRoundIcon,
} from "lucide-react";
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
import { MenuUsuario } from "@/components/menu-usuario";

const GRUPOS: { titulo?: string; items: (ItemNav & { soloAdmin?: boolean })[] }[] = [
  {
    items: [
      { href: "/dashboard", etiqueta: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/dashboard/recepcion", etiqueta: "Recepcion", icon: HeadsetIcon },
      { href: "/dashboard/llamadas", etiqueta: "Llamadas", icon: PhoneCallIcon },
    ],
  },
  {
    titulo: "Administracion",
    items: [
      { href: "/dashboard/asistente", etiqueta: "Asistente", icon: BotIcon, soloAdmin: true },
      { href: "/dashboard/contactos", etiqueta: "Contactos", icon: ContactRoundIcon, soloAdmin: true },
      { href: "/dashboard/usuarios", etiqueta: "Usuarios", icon: UsersRoundIcon, soloAdmin: true },
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
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground shadow-[0_2px_8px_rgb(0_0_0_/_0.18)]">
          C
        </div>
        {!colapsada && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">CORA</span>
            <span className="text-[11px] text-sidebar-foreground/50">Panel de llamadas</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav grupos={grupos} colapsada={colapsada} />
      </SidebarContent>
      <SidebarFooter>
        <MenuUsuario usuario={usuario} rol={rol} colapsada={colapsada} />
      </SidebarFooter>
    </Sidebar>
  );
}
