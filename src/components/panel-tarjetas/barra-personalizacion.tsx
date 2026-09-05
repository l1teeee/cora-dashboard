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
      <div className="flex items-center justify-end gap-2">
        {editando ? (
          <div className="panel-barra-edicion">
            <span className="panel-barra-edicion-estado">Edicion activa</span>
            <p id={idAyuda} className="panel-barra-edicion-copy">
              Arrastra para mover, usa los puntos laterales para redimensionar y la X
              para quitar.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" disabled={ocultos.length === 0} />
                }
              >
                <PlusIcon strokeWidth={1.75} />
                Agregar
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ocultos.map((widgetId) => (
                  <DropdownMenuItem key={widgetId} onClick={() => onAgregar(widgetId)}>
                    <PlusIcon strokeWidth={1.75} />
                    {etiquetas[widgetId] ?? widgetId}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hayLayoutPropio}
              onClick={onRestablecer}
            >
              <RotateCcwIcon strokeWidth={1.75} />
              Restablecer
            </Button>
            <Button size="sm" onClick={onTerminar}>
              <CheckIcon strokeWidth={1.75} />
              Listo
            </Button>
          </div>
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
