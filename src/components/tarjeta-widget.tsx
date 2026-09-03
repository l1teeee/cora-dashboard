import type * as React from "react";

import { cn } from "@/lib/utils";

// Contenedor de los widgets que no son una cifra suelta. Al vivir en una rejilla
// redimensionable la altura la manda el grid, no el contenido: por eso la cabecera
// es fija y el cuerpo scrollea en vez de desbordar la tarjeta.
export function TarjetaWidget({
  titulo,
  descripcion,
  accion,
  className,
  children,
}: {
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl bg-card text-sm text-card-foreground shadow-[0_2px_8px_-2px_rgb(18_20_22_/_0.08),0_1px_2px_rgb(18_20_22_/_0.04)] ring-1 ring-border",
        className
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold leading-snug tracking-tight">
            {titulo}
          </h3>
          {descripcion && (
            <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
          )}
        </div>
        {accion && <div className="shrink-0">{accion}</div>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
    </div>
  );
}
