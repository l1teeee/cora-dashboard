"use client";

import { cn } from "@/lib/utils";
import { formatearSegundos } from "@/lib/recepcion-mock";

export function MetricasTurno({
  atendidas,
  rechazadas,
  enCola,
  segundosEnLinea,
}: {
  atendidas: number;
  rechazadas: number;
  enCola: number;
  segundosEnLinea: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-4">
      <Dato etiqueta="Atendidas" valor={String(atendidas)} />
      <Dato etiqueta="Rechazadas" valor={String(rechazadas)} />
      <Dato etiqueta="En cola" valor={String(enCola)} />
      <Dato
        etiqueta="Tiempo en linea"
        valor={formatearSegundos(segundosEnLinea)}
        valorFontMono
      />
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
  valorFontMono,
}: {
  etiqueta: string;
  valor: string;
  valorFontMono?: boolean;
}) {
  return (
    <div className="bg-card px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p
        className={cn(
          "mt-0.5 text-lg font-semibold tracking-tight",
          valorFontMono && "font-mono"
        )}
      >
        {valor}
      </p>
    </div>
  );
}
