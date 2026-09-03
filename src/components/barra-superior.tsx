"use client";

import { usePathname } from "next/navigation";
import {
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import type { Rol } from "@/lib/tipos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TemaToggle } from "@/components/tema-toggle";
import { BotonSimularLlamada } from "@/components/recepcion/boton-simular";

const SECCIONES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/recepcion": "Recepcion",
  "/dashboard/llamadas": "Llamadas",
  "/dashboard/asistente": "Asistente",
  "/dashboard/contactos": "Contactos",
  "/dashboard/usuarios": "Usuarios",
  "/dashboard/auditoria": "Auditoria",
  "/dashboard/configuracion": "Configuracion",
};

export function BarraSuperior({
  usuario,
  rol,
  colapsada,
  onToggleColapsada,
  onAbrirMovil,
}: {
  usuario: string;
  rol: Rol;
  colapsada: boolean;
  onToggleColapsada: () => void;
  onAbrirMovil: () => void;
}) {
  const pathname = usePathname();
  const seccion = SECCIONES[pathname] ?? "Panel";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        aria-label="Abrir menu"
        onClick={onAbrirMovil}
      >
        <MenuIcon className="size-4" strokeWidth={1.75} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="hidden lg:inline-flex"
        aria-label={colapsada ? "Expandir barra lateral" : "Colapsar barra lateral"}
        onClick={onToggleColapsada}
      >
        {colapsada ? (
          <PanelLeftOpenIcon className="size-4" strokeWidth={1.75} />
        ) : (
          <PanelLeftCloseIcon className="size-4" strokeWidth={1.75} />
        )}
      </Button>

      <div className="flex items-center gap-1.5">
        <span className="hidden text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground sm:inline">CORA</span>
        <span className="hidden text-muted-foreground sm:inline">/</span>
        <span className="text-sm font-semibold text-foreground">{seccion}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <BotonSimularLlamada />
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <Badge variant="secondary">{rol === "admin" ? "Administrador" : "Agente"}</Badge>
        <span className="hidden text-sm font-medium sm:inline">{usuario}</span>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <TemaToggle />
      </div>
    </header>
  );
}
