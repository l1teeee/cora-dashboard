// Tono de "ha entrado una llamada" generado con Web Audio API, sin archivos de audio.
// Es solo para el mockup de recepcion de llamadas del call center.

export type ControlTono = {
  /** Suena una vez de inmediato y luego se repite cada `intervaloMs` hasta llamar a detener(). */
  iniciar: () => void;
  detener: () => void;
  /** true mientras el bucle esta activo. */
  sonando: () => boolean;
};

const INTERVALO_POR_DEFECTO_MS = 3500;

// Perezoso y a nivel de modulo: en el servidor no existe AudioContext, y crearlo
// al importar el modulo romperia el render. Se crea en el primer uso real.
let contextoCompartido: AudioContext | null = null;

// El filtro se crea una sola vez y se reutiliza. Uno nuevo por repique se quedaria
// conectado al destino para siempre, y con el timbre en bucle se irian acumulando.
let filtroCompartido: BiquadFilterNode | null = null;

function soportaAudio(): boolean {
  return typeof window !== "undefined" && typeof window.AudioContext !== "undefined";
}

function obtenerContexto(): AudioContext | null {
  if (!soportaAudio()) {
    return null;
  }
  if (!contextoCompartido) {
    contextoCompartido = new window.AudioContext();
  }
  return contextoCompartido;
}

function reanudarSiHaceFalta(contexto: AudioContext): void {
  if (contexto.state === "suspended") {
    // Las politicas de autoplay bloquean el audio sin gesto del usuario. Si el
    // navegador rechaza el resume, se ignora: el mockup no debe romperse por eso.
    contexto.resume().catch(() => {});
  }
}

function sonarNota(contexto: AudioContext, filtro: BiquadFilterNode, frecuencia: number, inicio: number): void {
  const oscilador = contexto.createOscillator();
  const ganancia = contexto.createGain();

  oscilador.type = "sine";
  oscilador.frequency.setValueAtTime(frecuencia, inicio);

  const duracion = 0.5;
  const ataque = 0.02;
  ganancia.gain.setValueAtTime(0.0001, inicio);
  ganancia.gain.linearRampToValueAtTime(0.09, inicio + ataque);
  // exponentialRampToValueAtTime no admite 0 como destino, por eso se usa un valor casi nulo.
  ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);

  oscilador.connect(ganancia);
  ganancia.connect(filtro);

  oscilador.onended = () => {
    oscilador.disconnect();
    ganancia.disconnect();
  };

  oscilador.start(inicio);
  oscilador.stop(inicio + duracion);
}

/** Un unico repique, sin bucle. Para avisos puntuales. */
export function repicarUnaVez(): void {
  const contexto = obtenerContexto();
  if (!contexto) {
    return;
  }

  reanudarSiHaceFalta(contexto);

  if (!filtroCompartido) {
    filtroCompartido = contexto.createBiquadFilter();
    filtroCompartido.type = "lowpass";
    filtroCompartido.frequency.value = 2000;
    filtroCompartido.connect(contexto.destination);
  }

  const filtro = filtroCompartido;
  const ahora = contexto.currentTime;
  sonarNota(contexto, filtro, 660, ahora);
  sonarNota(contexto, filtro, 880, ahora + 0.18);
}

/** Crea el controlador del bucle de timbre. intervaloMs por defecto 3500. */
export function crearTonoEntrante(intervaloMs: number = INTERVALO_POR_DEFECTO_MS): ControlTono {
  let idIntervalo: ReturnType<typeof setInterval> | null = null;

  function iniciar(): void {
    if (idIntervalo !== null) {
      return;
    }
    repicarUnaVez();
    idIntervalo = setInterval(repicarUnaVez, intervaloMs);
  }

  function detener(): void {
    if (idIntervalo === null) {
      return;
    }
    clearInterval(idIntervalo);
    idIntervalo = null;
  }

  function sonando(): boolean {
    return idIntervalo !== null;
  }

  return { iniciar, detener, sonando };
}
