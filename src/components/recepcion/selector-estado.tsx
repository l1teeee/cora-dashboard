"use client";

import { cn } from "@/lib/utils";
import { ESTADOS, type EstadoAgente } from "@/lib/recepcion-mock";

const ORDEN: EstadoAgente[] = ["en-linea", "ocupado", "en-break"];

const COLOR_PUNTO: Record<EstadoAgente, string> = {
  "en-linea": "bg-success",
  ocupado: "bg-warning",
  "en-break": "bg-muted-foreground",
};

export function SelectorEstado({
  estado,
  onCambiar,
}: {
  estado: EstadoAgente;
  onCambiar: (estado: EstadoAgente) => void;
}) {
  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label="Estado del agente"
        className="inline-flex items-center gap-1 rounded-full bg-muted p-1"
      >
        {ORDEN.map((opcion) => {
          const activo = opcion === estado;
          return (
            <button
              key={opcion}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onCambiar(opcion)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                activo
                  ? "bg-card text-foreground shadow-[0_1px_2px_rgb(18_20_22_/_0.12)] ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative flex size-2">
                {opcion === "en-linea" && activo && (
                  <span
                    className={cn(
                      "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
                      COLOR_PUNTO[opcion]
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    activo ? COLOR_PUNTO[opcion] : "bg-muted-foreground/40"
                  )}
                />
              </span>
              {ESTADOS[opcion].etiqueta}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">{ESTADOS[estado].descripcion}</p>
    </div>
  );
}
