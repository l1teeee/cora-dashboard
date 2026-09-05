"use client";

import { CheckIcon, PencilIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BarraPersonalizacionProps = {
  editando: boolean;
  esEscritorio: boolean;
  ocultos: string[];
  etiquetas: Record<string, string>;
  hayLayoutPropio: boolean;
  idAyuda: string;
  onAgregar: (widgetId: string) => void;
  onRestablecer: () => void;
  onTerminar: () => void;
  onEntrarAEdicion: () => void;
};

export function BarraPersonalizacion({
  editando,
  esEscritorio,
  ocultos,
  etiquetas,
  hayLayoutPropio,
  idAyuda,
  onAgregar,
  onRestablecer,
  onTerminar,
  onEntrarAEdicion,
}: BarraPersonalizacionProps) {
  return (
    <TooltipProvider delay={250} closeDelay={0}>
      <div className="flex items-center justify-end">
        {editando ? (
          <>
            {/* La ayuda deja de ocupar una franja del dashboard: los gestos se
                descubren al usarlos, pero aria-describedby sigue necesitandola. */}
            <p id={idAyuda} className="sr-only">
              Arrastra una tarjeta para moverla, usa los puntos laterales para
              cambiar su tamano y la X para quitarla del panel.
            </p>

            <div className="panel-barra-flotante" role="toolbar" aria-label="Personalizar panel">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      size="sm"
                      variant="ghost"
                      className="panel-barra-flotante-accion"
                      disabled={ocultos.length === 0}
                    />
                  }
                >
                  <PlusIcon strokeWidth={1.75} />
                  Agregar
                  {ocultos.length > 0 && (
                    <span className="panel-barra-flotante-cuenta">{ocultos.length}</span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" sideOffset={10}>
                  {ocultos.map((widgetId) => (
                    <DropdownMenuItem key={widgetId} onClick={() => onAgregar(widgetId)}>
                      <PlusIcon strokeWidth={1.75} />
                      {etiquetas[widgetId] ?? widgetId}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                variant="ghost"
                className="panel-barra-flotante-accion"
                disabled={!hayLayoutPropio}
                onClick={onRestablecer}
              >
                <RotateCcwIcon strokeWidth={1.75} />
                Restablecer
              </Button>

              <span className="panel-barra-flotante-division" aria-hidden="true" />

              <Button size="sm" onClick={onTerminar}>
                <CheckIcon strokeWidth={1.75} />
                Listo
              </Button>
            </div>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={!esEscritorio}
                  onClick={onEntrarAEdicion}
                  aria-label="Personalizar"
                />
              }
            >
              <PencilIcon strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent side="left">
              {esEscritorio ? "Personalizar" : "Personalizar (solo en escritorio)"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
