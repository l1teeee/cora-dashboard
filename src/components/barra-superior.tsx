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

const SECCIONES: Record<string, string> = {
  "/dashboard": "Llamadas",
  "/dashboard/asistente": "Asistente",
  "/dashboard/auditoria": "Auditoria",
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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
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
        <span className="hidden text-sm text-muted-foreground sm:inline">CORA /</span>
        <span className="text-sm font-medium text-foreground">{seccion}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant="secondary">{rol === "admin" ? "Administrador" : "Agente"}</Badge>
        <span className="hidden text-sm font-medium sm:inline">{usuario}</span>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <TemaToggle />
      </div>
    </header>
  );
}
