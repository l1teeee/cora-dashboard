"use client";

import { SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TarjetaWidget } from "@/components/tarjeta-widget";
import { ColaLlamadas } from "@/components/recepcion/cola-llamadas";
import { MetricasTurno } from "@/components/recepcion/metricas-turno";
import { SelectorEstado } from "@/components/recepcion/selector-estado";
import { useLlamadas } from "@/components/recepcion/proveedor-llamadas";
import { formatearSegundos, type EventoTurno } from "@/lib/recepcion-mock";

export function Recepcion() {
  const {
    estado,
    cambiarEstado,
    cola,
    eventos,
    tick,
    segundosEnLinea,
    puedeRecibir,
    puedeTransferir,
    asignables,
    atenderDeCola,
    transferirDeCola,
  } = useLlamadas();

  const atendidas = eventos.filter((evento) => evento.tipo === "aceptada").length;
  const rechazadas = eventos.filter((evento) => evento.tipo === "rechazada").length;
  const transferidas = eventos.filter((evento) => evento.tipo === "transferida").length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="superficie p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SelectorEstado estado={estado} onCambiar={cambiarEstado} />

          <p className="text-xs text-muted-foreground">
            {puedeRecibir
              ? "La proxima llamada simulada hara sonar el aviso"
              : "La proxima llamada simulada entrara directo a la cola"}
          </p>
        </div>
      </div>

      <MetricasTurno
        atendidas={atendidas}
        rechazadas={rechazadas}
        transferidas={transferidas}
        enCola={cola.length}
        segundosEnLinea={segundosEnLinea}
      />

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ColaLlamadas
            llamadas={cola}
            tick={tick}
            onAtender={atenderDeCola}
            asignables={puedeTransferir ? asignables : undefined}
            onTransferir={puedeTransferir ? transferirDeCola : undefined}
          />
        </div>

        <HistorialTurno eventos={eventos} />
      </div>
    </div>
  );
}

const ETIQUETA_EVENTO: Record<
  EventoTurno["tipo"],
  { texto: string; variante: "success" | "warning" | "secondary" }
> = {
  aceptada: { texto: "Aceptada", variante: "success" },
  rechazada: { texto: "Devuelta a la cola", variante: "warning" },
  transferida: { texto: "Transferida", variante: "secondary" },
};

function HistorialTurno({ eventos }: { eventos: EventoTurno[] }) {
  return (
    <TarjetaWidget
      titulo="Historial del turno"
      descripcion="Lo que ha pasado desde que abriste el panel"
    >
      {eventos.length === 0 ? (
        <EmptyState
          icon={SparklesIcon}
          titulo="Turno recien empezado"
          descripcion="Aqui apareceran las llamadas que aceptes, devuelvas a la cola o transfieras."
        />
      ) : (
        <ul className="space-y-2">
          {eventos.map((evento) => (
            <li
              key={evento.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-xs">{evento.numero}</p>
                <p className="text-xs text-muted-foreground">
                  minuto {formatearSegundos(evento.tick)}
                </p>
              </div>
              <Badge variant={ETIQUETA_EVENTO[evento.tipo].variante}>
                {evento.tipo === "transferida" && evento.destino
                  ? `Transferida a ${evento.destino}`
                  : ETIQUETA_EVENTO[evento.tipo].texto}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </TarjetaWidget>
  );
}
