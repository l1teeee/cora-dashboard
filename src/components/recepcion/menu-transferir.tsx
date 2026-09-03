"use client";

import { ForwardIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Asignable } from "@/lib/recepcion-mock";

// Solo lo monta quien administra. El agente ve unicamente aceptar y rechazar, asi que
// el control de permisos vive en quien decide renderizar esto, no aqui dentro.
export function MenuTransferir({
  asignables,
  onTransferir,
  className,
}: {
  asignables: Asignable[];
  onTransferir: (destino: Asignable) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      {/* El disparador lleva los estilos de boton en vez de envolver al componente Button:
          Base UI ya renderiza su propio <button> y anidar otro duplicaba el elemento. */}
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), className)}
      >
        <ForwardIcon strokeWidth={1.75} />
        Transferir
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Un div y no DropdownMenuLabel: ese componente envuelve Menu.GroupLabel de Base UI,
            que revienta en tiempo de ejecucion si no esta dentro de un Menu.Group. */}
        <div className="px-2.5 py-1.5 text-xs text-muted-foreground">Transferir a</div>

        {asignables.length === 0 ? (
          <DropdownMenuItem disabled>No hay agentes activos</DropdownMenuItem>
        ) : (
          asignables.map((asignable) => (
            <DropdownMenuItem key={asignable.id} onClick={() => onTransferir(asignable)}>
              {asignable.nombre}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
