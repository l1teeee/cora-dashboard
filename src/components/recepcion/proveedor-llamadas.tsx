"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AvisoLlamada } from "@/components/recepcion/aviso-llamada";
import { PanelLlamadaActiva } from "@/components/recepcion/panel-llamada-activa";
import { crearTonoEntrante } from "@/lib/tono-llamada";
import {
  COLA_INICIAL,
  ESTADOS,
  generarLlamada,
  type Asignable,
  type EstadoAgente,
  type EventoTurno,
  type LlamadaActiva,
  type LlamadaEnCola,
} from "@/lib/recepcion-mock";

type ContextoLlamadas = {
  estado: EstadoAgente;
  cambiarEstado: (estado: EstadoAgente) => void;
  cola: LlamadaEnCola[];
  eventos: EventoTurno[];
  tick: number;
  segundosEnLinea: number;
  puedeRecibir: boolean;
  puedeTransferir: boolean;
  asignables: Asignable[];
  simularLlamada: () => void;
  atenderDeCola: (id: string) => void;
  transferirDeCola: (id: string, destino: Asignable) => void;
};

const Contexto = createContext<ContextoLlamadas | null>(null);

export function useLlamadas(): ContextoLlamadas {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error("useLlamadas necesita estar dentro de ProveedorLlamadas");
  }
  return valor;
}

function comoActiva(llamada: LlamadaEnCola): LlamadaActiva {
  return {
    id: llamada.id,
    numero: llamada.numero,
    nombre: llamada.nombre,
    motivo: llamada.motivo,
  };
}

// El estado de la llamada vive aqui, por encima de las paginas, y no dentro de la
// pantalla de recepcion: una llamada entrante tiene que seguir sonando y el panel de
// la llamada en curso tiene que seguir en pantalla aunque el usuario navegue a otra
// seccion. Montado en el layout del dashboard, sobrevive a los cambios de ruta.
export function ProveedorLlamadas({
  puedeTransferir,
  asignables,
  children,
}: {
  puedeTransferir: boolean;
  asignables: Asignable[];
  children: ReactNode;
}) {
  const [estado, setEstado] = useState<EstadoAgente>("en-linea");
  const [cola, setCola] = useState<LlamadaEnCola[]>(COLA_INICIAL);
  const [entrante, setEntrante] = useState<LlamadaActiva | null>(null);
  const [activa, setActiva] = useState<LlamadaActiva | null>(null);
  const [silenciado, setSilenciado] = useState(false);
  const [eventos, setEventos] = useState<EventoTurno[]>([]);
  const [tick, setTick] = useState(0);
  const [segundosEnLinea, setSegundosEnLinea] = useState(0);

  // El reloj cuenta segundos desde el montaje, no desde una fecha real: asi el HTML
  // del servidor y el del cliente coinciden y no hay error de hidratacion.
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

  const registrar = useCallback(
    (tipo: EventoTurno["tipo"], numero: string, enTick: number, destino?: string) => {
      setEventos((previos) => [
        { id: `${tipo}-${numero}-${enTick}-${previos.length}`, tipo, numero, tick: enTick, destino },
        ...previos,
      ]);
    },
    []
  );

  const puedeRecibir = ESTADOS[estado].recibeLlamadas && !entrante && !activa;

  const simularLlamada = useCallback(() => {
    const llamada = generarLlamada(tick);

    // En break o ya ocupado la llamada no suena, se queda esperando en la cola:
    // es justo lo que distingue a los tres estados en el mockup.
    if (ESTADOS[estadoRef.current].recibeLlamadas && !entrante && !activa) {
      setEntrante(comoActiva(llamada));
      setSilenciado(false);
      return;
    }

    setCola((previa) => [...previa, llamada]);
  }, [activa, entrante, tick]);

  const atenderDeCola = useCallback(
    (id: string) => {
      if (entrante || activa) return;

      const llamada = cola.find((candidata) => candidata.id === id);
      if (!llamada) return;

      setCola((previa) => previa.filter((candidata) => candidata.id !== id));
      setEntrante(comoActiva(llamada));
      setSilenciado(false);
    },
    [activa, cola, entrante]
  );

  // Transferir saca la llamada de este puesto y la deja en manos de otro agente: no
  // vuelve a la cola propia, solo queda constancia en el historial del turno.
  const transferirDeCola = useCallback(
    (id: string, destino: Asignable) => {
      const llamada = cola.find((candidata) => candidata.id === id);
      if (!llamada) return;

      setCola((previa) => previa.filter((candidata) => candidata.id !== id));
      registrar("transferida", llamada.numero, tick, destino.nombre);
    },
    [cola, registrar, tick]
  );

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
      { ...entrante, esperaInicialSegundos: 0, agregadaEnTick: tick, prioritaria: false },
    ]);
    setEntrante(null);
    registrar("rechazada", entrante.numero, tick);
  }

  function colgar() {
    if (!activa) return;

    setActiva(null);
    setEstado("en-linea");
  }

  function transferirEntrante(destino: Asignable) {
    if (!entrante) return;

    registrar("transferida", entrante.numero, tick, destino.nombre);
    setEntrante(null);
  }

  function transferirActiva(destino: Asignable) {
    if (!activa) return;

    registrar("transferida", activa.numero, tick, destino.nombre);
    setActiva(null);
    setEstado("en-linea");
  }

  const asignablesSiPuede = puedeTransferir ? asignables : undefined;

  return (
    <Contexto.Provider
      value={{
        estado,
        cambiarEstado: setEstado,
        cola,
        eventos,
        tick,
        segundosEnLinea,
        puedeRecibir,
        puedeTransferir,
        asignables,
        simularLlamada,
        atenderDeCola,
        transferirDeCola,
      }}
    >
      {children}

      {entrante && (
        <AvisoLlamada
          llamada={entrante}
          silenciado={silenciado}
          onSilenciar={() => setSilenciado((valor) => !valor)}
          onAceptar={aceptar}
          onRechazar={rechazar}
          asignables={asignablesSiPuede}
          onTransferir={puedeTransferir ? transferirEntrante : undefined}
        />
      )}

      {activa && (
        <PanelLlamadaActiva
          llamada={activa}
          onColgar={colgar}
          asignables={asignablesSiPuede}
          onTransferir={puedeTransferir ? transferirActiva : undefined}
        />
      )}
    </Contexto.Provider>
  );
}
