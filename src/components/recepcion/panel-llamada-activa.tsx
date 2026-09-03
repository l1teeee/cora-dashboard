"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  GripVerticalIcon,
  MicIcon,
  MicOffIcon,
  PauseIcon,
  PhoneOffIcon,
  PlayIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatearSegundos, type LlamadaActiva } from "@/lib/recepcion-mock";

const MARGEN = 24;
const PASO_TECLADO = 20;

type Posicion = { x: number; y: number };

type ArrastreEnCurso = {
  inicioX: number;
  inicioY: number;
  origenX: number;
  origenY: number;
};

export function PanelLlamadaActiva({
  llamada,
  onColgar,
}: {
  llamada: LlamadaActiva;
  onColgar: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const arrastreRef = useRef<ArrastreEnCurso | null>(null);
  // null mientras no se conoce el tamano de la ventana: se resuelve tras el montaje.
  const [posicion, setPosicion] = useState<Posicion | null>(null);

  const [duracion, setDuracion] = useState(0);
  const [microfonoSilenciado, setMicrofonoSilenciado] = useState(false);
  const [enEspera, setEnEspera] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => setDuracion((s) => s + 1), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const acotar = useCallback((x: number, y: number): Posicion => {
    const panel = panelRef.current;
    const ancho = panel?.offsetWidth ?? 0;
    const alto = panel?.offsetHeight ?? 0;
    const maxX = Math.max(0, window.innerWidth - ancho);
    const maxY = Math.max(0, window.innerHeight - alto);
    return { x: Math.min(Math.max(x, 0), maxX), y: Math.min(Math.max(y, 0), maxY) };
  }, []);

  // window.innerWidth/innerHeight no existen durante el renderizado en el servidor, asi
  // que la posicion inicial (abajo a la derecha) solo puede calcularse despues del montaje.
  useEffect(() => {
    const panel = panelRef.current;
    const ancho = panel?.offsetWidth ?? 288;
    const alto = panel?.offsetHeight ?? 224;
    setPosicion({
      x: window.innerWidth - ancho - MARGEN,
      y: window.innerHeight - alto - MARGEN,
    });
  }, []);

  useEffect(() => {
    function manejarResize() {
      setPosicion((actual) => (actual ? acotar(actual.x, actual.y) : actual));
    }
    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, [acotar]);

  function manejarPointerDown(evento: ReactPointerEvent<HTMLDivElement>) {
    if (!posicion) return;
    // setPointerCapture ata los siguientes move/up a esta cabecera aunque el puntero
    // salga de ella durante el arrastre, para no perder el gesto a mitad de camino.
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrastreRef.current = {
      inicioX: evento.clientX,
      inicioY: evento.clientY,
      origenX: posicion.x,
      origenY: posicion.y,
    };
  }

  function manejarPointerMove(evento: ReactPointerEvent<HTMLDivElement>) {
    const arrastre = arrastreRef.current;
    if (!arrastre) return;
    const deltaX = evento.clientX - arrastre.inicioX;
    const deltaY = evento.clientY - arrastre.inicioY;
    setPosicion(acotar(arrastre.origenX + deltaX, arrastre.origenY + deltaY));
  }

  function manejarPointerUp(evento: ReactPointerEvent<HTMLDivElement>) {
    evento.currentTarget.releasePointerCapture(evento.pointerId);
    arrastreRef.current = null;
  }

  function manejarTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (!posicion) return;
    const movimientos: Record<string, Posicion> = {
      ArrowUp: { x: 0, y: -PASO_TECLADO },
      ArrowDown: { x: 0, y: PASO_TECLADO },
      ArrowLeft: { x: -PASO_TECLADO, y: 0 },
      ArrowRight: { x: PASO_TECLADO, y: 0 },
    };
    const movimiento = movimientos[evento.key];
    if (!movimiento) return;
    evento.preventDefault();
    setPosicion(acotar(posicion.x + movimiento.x, posicion.y + movimiento.y));
  }

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Llamada en curso"
      className="fixed z-50 w-72 rounded-3xl bg-card ring-1 ring-border shadow-[0_24px_48px_-16px_rgb(18_20_22_/_0.35)]"
      style={posicion ? { left: posicion.x, top: posicion.y } : { left: 0, top: 0, visibility: "hidden" }}
    >
      {/* El arrastre nace solo aqui, nunca en los botones de abajo, para que un clic en
          Colgar o Silenciar no se confunda con el inicio de un gesto de mover el panel. */}
      <div
        tabIndex={0}
        aria-label="Mover panel de llamada en curso. Arrastrar con el puntero o usar las flechas del teclado."
        onPointerDown={manejarPointerDown}
        onPointerMove={manejarPointerMove}
        onPointerUp={manejarPointerUp}
        onKeyDown={manejarTeclado}
        // select-none evita que arrastrar seleccione el texto de la cabecera, y touch-none
        // impide que en tactil el gesto se lo lleve el scroll de la pagina en vez del panel.
        className="flex touch-none cursor-grab select-none items-center gap-2 rounded-t-3xl border-b border-border px-4 py-3 active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
        <span className="text-sm font-medium">En llamada</span>
      </div>

      <div className="p-4">
        <p className="font-mono text-lg font-semibold tracking-tight">{llamada.numero}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{llamada.nombre ?? "Sin identificar"}</p>

        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-2xl font-semibold tracking-tight">
            {formatearSegundos(duracion)}
          </span>
          {enEspera && <Badge variant="warning">En espera</Badge>}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={microfonoSilenciado}
            aria-label={microfonoSilenciado ? "Activar microfono" : "Silenciar microfono"}
            onClick={() => setMicrofonoSilenciado((v) => !v)}
          >
            {microfonoSilenciado ? <MicOffIcon strokeWidth={1.75} /> : <MicIcon strokeWidth={1.75} />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-pressed={enEspera}
            aria-label={enEspera ? "Reanudar llamada" : "Poner llamada en espera"}
            onClick={() => setEnEspera((v) => !v)}
          >
            {enEspera ? <PlayIcon strokeWidth={1.75} /> : <PauseIcon strokeWidth={1.75} />}
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onColgar}>
            <PhoneOffIcon strokeWidth={1.75} />
            Colgar
          </Button>
        </div>
      </div>
    </div>
  );
}
