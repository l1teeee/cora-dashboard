"use client";

import { PhoneOffIcon } from "lucide-react";
import { TarjetaWidget } from "@/components/tarjeta-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { MenuTransferir } from "@/components/recepcion/menu-transferir";
import {
  esperaDe,
  formatearSegundos,
  MOTIVOS,
  type Asignable,
  type LlamadaEnCola,
} from "@/lib/recepcion-mock";

const UMBRAL_DESTRUCTIVO = 180;
const UMBRAL_ADVERTENCIA = 90;

function ordenarCola(llamadas: LlamadaEnCola[], tick: number): LlamadaEnCola[] {
  return [...llamadas].sort((a, b) => {
    if (a.prioritaria !== b.prioritaria) return a.prioritaria ? -1 : 1;
    return esperaDe(b, tick) - esperaDe(a, tick);
  });
}

export function ColaLlamadas({
  llamadas,
  tick,
  onAtender,
  asignables,
  onTransferir,
}: {
  llamadas: LlamadaEnCola[];
  tick: number;
  onAtender: (id: string) => void;
  /** Solo llegan con rol admin: sin ellas las filas no ofrecen transferir. */
  asignables?: Asignable[];
  onTransferir?: (id: string, destino: Asignable) => void;
}) {
  const ordenadas = ordenarCola(llamadas, tick);

  return (
    <TarjetaWidget
      titulo="Llamadas en cola"
      descripcion="Ordenadas por prioridad y tiempo de espera"
    >
      {ordenadas.length === 0 ? (
        <EmptyState
          icon={PhoneOffIcon}
          titulo="No hay nadie esperando"
          descripcion="Las llamadas nuevas apareceran aqui en cuanto entren a la cola."
        />
      ) : (
        <ul className="divide-y divide-border">
          {ordenadas.map((llamada) => {
            const espera = esperaDe(llamada, tick);
            return (
              <li
                key={llamada.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm">{llamada.numero}</span>
                    <Badge variant="outline">{MOTIVOS[llamada.motivo]}</Badge>
                    {llamada.prioritaria && (
                      <Badge variant="destructive">Prioritaria</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {llamada.nombre ?? "Sin identificar"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "font-mono text-sm",
                      espera > UMBRAL_DESTRUCTIVO
                        ? "text-destructive"
                        : espera > UMBRAL_ADVERTENCIA
                          ? "text-warning"
                          : "text-muted-foreground"
                    )}
                  >
                    {formatearSegundos(espera)}
                  </span>
                  <Button size="sm" onClick={() => onAtender(llamada.id)}>
                    Atender
                  </Button>
                  {onTransferir && (
                    <MenuTransferir
                      asignables={asignables ?? []}
                      onTransferir={(destino) => onTransferir(llamada.id, destino)}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </TarjetaWidget>
  );
}
