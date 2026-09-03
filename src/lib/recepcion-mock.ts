// Datos y tipos de la seccion de recepcion. Todo es mockup: no hay backend detras,
// ninguna de estas llamadas existe y nada de esto se persiste.
//
// Ni un solo Date.now() en los datos iniciales a proposito. Los componentes se renderizan
// tambien en el servidor, y una marca de tiempo real daria un HTML distinto en cada lado:
// la espera se cuenta en ticks de un contador que arranca en cero despues del montaje.

export type EstadoAgente = "en-linea" | "en-break" | "ocupado";

export type MotivoLlamada = "consulta" | "queja" | "tramite" | "transferencia";

export type LlamadaEnCola = {
  id: string;
  numero: string;
  nombre: string | null;
  motivo: MotivoLlamada;
  /** Segundos que ya llevaba esperando en el primer render. */
  esperaInicialSegundos: number;
  /** Valor del contador de la seccion cuando entro a la cola. Las iniciales valen 0. */
  agregadaEnTick: number;
  prioritaria: boolean;
};

export type LlamadaActiva = {
  id: string;
  numero: string;
  nombre: string | null;
  motivo: MotivoLlamada;
};

export type EventoTurno = {
  id: string;
  tipo: "aceptada" | "rechazada" | "perdida";
  numero: string;
  /** Tick de la seccion en que ocurrio, para ordenarlos sin relojes reales. */
  tick: number;
};

export const ESTADOS: Record<
  EstadoAgente,
  { etiqueta: string; descripcion: string; recibeLlamadas: boolean }
> = {
  "en-linea": {
    etiqueta: "En linea",
    descripcion: "Disponible para recibir llamadas",
    recibeLlamadas: true,
  },
  ocupado: {
    etiqueta: "Ocupado",
    descripcion: "Atendiendo, no entran llamadas nuevas",
    recibeLlamadas: false,
  },
  "en-break": {
    etiqueta: "En break",
    descripcion: "Fuera de turno, las llamadas van a la cola",
    recibeLlamadas: false,
  },
};

export const MOTIVOS: Record<MotivoLlamada, string> = {
  consulta: "Consulta",
  queja: "Queja",
  tramite: "Tramite",
  transferencia: "Transferencia",
};

export const COLA_INICIAL: LlamadaEnCola[] = [
  {
    id: "cola-1",
    numero: "+504 9812 4467",
    nombre: "Marcela Rivas",
    motivo: "tramite",
    esperaInicialSegundos: 214,
    agregadaEnTick: 0,
    prioritaria: true,
  },
  {
    id: "cola-2",
    numero: "+504 3345 9021",
    nombre: null,
    motivo: "consulta",
    esperaInicialSegundos: 137,
    agregadaEnTick: 0,
    prioritaria: false,
  },
  {
    id: "cola-3",
    numero: "+504 8877 1230",
    nombre: "Jose Portillo",
    motivo: "queja",
    esperaInicialSegundos: 63,
    agregadaEnTick: 0,
    prioritaria: true,
  },
  {
    id: "cola-4",
    numero: "+504 9120 5588",
    nombre: null,
    motivo: "transferencia",
    esperaInicialSegundos: 18,
    agregadaEnTick: 0,
    prioritaria: false,
  },
];

const NOMBRES_FALSOS = [
  "Ana Sagastume",
  "Luis Mejia",
  "Karla Bonilla",
  "Diego Fuentes",
  "Rebeca Andino",
  null,
  null,
];

const MOTIVOS_POSIBLES: MotivoLlamada[] = ["consulta", "queja", "tramite", "transferencia"];

function alAzar<T>(opciones: T[]): T {
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function numeroFalso(): string {
  const bloque = () => String(Math.floor(1000 + Math.random() * 9000));
  return `+504 ${bloque()} ${bloque()}`;
}

// Solo se llama desde un manejador de eventos, nunca durante el render: Math.random en
// el cuerpo de un componente daria un valor distinto en servidor y cliente.
export function generarLlamada(tick: number): LlamadaEnCola {
  return {
    id: `sim-${tick}-${Math.floor(Math.random() * 100000)}`,
    numero: numeroFalso(),
    nombre: alAzar(NOMBRES_FALSOS),
    motivo: alAzar(MOTIVOS_POSIBLES),
    esperaInicialSegundos: 0,
    agregadaEnTick: tick,
    prioritaria: Math.random() < 0.3,
  };
}

export function esperaDe(llamada: LlamadaEnCola, tickActual: number): number {
  return llamada.esperaInicialSegundos + (tickActual - llamada.agregadaEnTick);
}

export function formatearSegundos(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}
