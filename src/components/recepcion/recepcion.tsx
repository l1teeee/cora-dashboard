"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PhoneIncomingIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TarjetaWidget } from "@/components/tarjeta-widget";
import { AvisoLlamada } from "@/components/recepcion/aviso-llamada";
import { ColaLlamadas } from "@/components/recepcion/cola-llamadas";
import { MetricasTurno } from "@/components/recepcion/metricas-turno";
import { PanelLlamadaActiva } from "@/components/recepcion/panel-llamada-activa";
import { SelectorEstado } from "@/components/recepcion/selector-estado";
import { crearTonoEntrante } from "@/lib/tono-llamada";
import {
  COLA_INICIAL,
  ESTADOS,
  formatearSegundos,
  generarLlamada,
  type EstadoAgente,
  type EventoTurno,
  type LlamadaActiva,
  type LlamadaEnCola,
} from "@/lib/recepcion-mock";

function comoActiva(llamada: LlamadaEnCola): LlamadaActiva {
  return {
    id: llamada.id,
    numero: llamada.numero,
    nombre: llamada.nombre,
    motivo: llamada.motivo,
  };
}

export function Recepcion() {
  const [estado, setEstado] = useState<EstadoAgente>("en-linea");
  const [cola, setCola] = useState<LlamadaEnCola[]>(COLA_INICIAL);
  const [entrante, setEntrante] = useState<LlamadaActiva | null>(null);
  const [activa, setActiva] = useState<LlamadaActiva | null>(null);
  const [silenciado, setSilenciado] = useState(false);
  const [eventos, setEventos] = useState<EventoTurno[]>([]);
  const [tick, setTick] = useState(0);
  const [segundosEnLinea, setSegundosEnLinea] = useState(0);

  // El reloj de la seccion cuenta segundos desde el montaje, no desde una fecha real:
  // asi el HTML del servidor y el del cliente coinciden y no hay error de hidratacion.
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  useEffect(() => {
    const id = setInterval(() => {
      setTick((valor) => valor + 1);
      if (estadoRef.current !== "en-break") {
        setSegundosEnLinea((valor) => valor + 1);
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // El timbre vive en un ref y no en el estado porque no se pinta: recrearlo en cada
  // render cortaria el bucle a media llamada.
  const tono = useRef(crearTonoEntrante());

  useEffect(() => {
    const timbre = tono.current;

    if (entrante && !silenciado) {
      timbre.iniciar();
    } else {
      timbre.detener();
    }

    return () => timbre.detener();
  }, [entrante, silenciado]);

  const registrar = useCallback((tipo: EventoTurno["tipo"], numero: string, enTick: number) => {
    setEventos((previos) => [
      { id: `${tipo}-${numero}-${enTick}-${previos.length}`, tipo, numero, tick: enTick },
      ...previos,
    ]);
  }, []);

  const puedeRecibir = ESTADOS[estado].recibeLlamadas && !entrante && !activa;

  function simularLlamada() {
    const llamada = generarLlamada(tick);

    // En break o ya ocupado la llamada no suena, se queda esperando en la cola:
    // es justo lo que distingue a los tres estados en el mockup.
    if (puedeRecibir) {
      setEntrante(comoActiva(llamada));
      setSilenciado(false);
      return;
    }

    setCola((previa) => [...previa, llamada]);
  }

  function atenderDeCola(id: string) {
    const llamada = cola.find((candidata) => candidata.id === id);
    if (!llamada || entrante || activa) return;

    setCola((previa) => previa.filter((candidata) => candidata.id !== id));
    setEntrante(comoActiva(llamada));
    setSilenciado(false);
  }

  function aceptar() {
    if (!entrante) return;

    setActiva(entrante);
    setEntrante(null);
    setEstado("ocupado");
    registrar("aceptada", entrante.numero, tick);
  }

  function rechazar() {
    if (!entrante) return;

    // Vuelve al final de la cola en vez de desaparecer: rechazar no es colgarle
    // a la persona, es devolverla a la espera.
    setCola((previa) => [
      ...previa,
      {
        ...entrante,
        esperaInicialSegundos: 0,
        agregadaEnTick: tick,
        prioritaria: false,
      },
    ]);
    setEntrante(null);
    registrar("rechazada", entrante.numero, tick);
  }

  function colgar() {
    if (!activa) return;

    setActiva(null);
    setEstado("en-linea");
  }

  const atendidas = eventos.filter((evento) => evento.tipo === "aceptada").length;
  const rechazadas = eventos.filter((evento) => evento.tipo === "rechazada").length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SelectorEstado estado={estado} onCambiar={setEstado} />

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Button onClick={simularLlamada}>
              <PhoneIncomingIcon strokeWidth={1.75} />
              Simular llamada entrante
            </Button>
            <p className="text-xs text-muted-foreground">
              {puedeRecibir
                ? "Sonara el aviso de llamada"
                : "Entrara directo a la cola de espera"}
            </p>
          </div>
        </div>
      </div>

      <MetricasTurno
        atendidas={atendidas}
        rechazadas={rechazadas}
        enCola={cola.length}
        segundosEnLinea={segundosEnLinea}
      />

      <div className="grid gap-5 lg:grid-cols-3 sm:gap-6">
        <div className="lg:col-span-2">
          <ColaLlamadas llamadas={cola} tick={tick} onAtender={atenderDeCola} />
        </div>

        <HistorialTurno eventos={eventos} />
      </div>

      {entrante && (
        <AvisoLlamada
          llamada={entrante}
          silenciado={silenciado}
          onSilenciar={() => setSilenciado((valor) => !valor)}
          onAceptar={aceptar}
          onRechazar={rechazar}
        />
      )}

      {activa && <PanelLlamadaActiva llamada={activa} onColgar={colgar} />}
    </div>
  );
}

function HistorialTurno({ eventos }: { eventos: EventoTurno[] }) {
  return (
    <TarjetaWidget titulo="Historial del turno" descripcion="Lo que ha pasado desde que abriste la pantalla">
      {eventos.length === 0 ? (
        <EmptyState
          icon={SparklesIcon}
          titulo="Turno recien empezado"
          descripcion="Aqui apareceran las llamadas que aceptes o devuelvas a la cola."
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
              <Badge variant={evento.tipo === "aceptada" ? "success" : "warning"}>
                {evento.tipo === "aceptada" ? "Aceptada" : "Devuelta a la cola"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </TarjetaWidget>
  );
}
