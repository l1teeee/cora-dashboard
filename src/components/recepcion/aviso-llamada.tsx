"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { BellIcon, BellOffIcon, PhoneIcon, PhoneOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatearSegundos, MOTIVOS, type LlamadaActiva } from "@/lib/recepcion-mock";

export function AvisoLlamada({
  llamada,
  silenciado,
  onSilenciar,
  onAceptar,
  onRechazar,
}: {
  llamada: LlamadaActiva;
  silenciado: boolean;
  onSilenciar: () => void;
  onAceptar: () => void;
  onRechazar: () => void;
}) {
  const [segundos, setSegundos] = useState(0);
  const botonAceptarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const intervalo = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(intervalo);
  }, []);

  // El foco va al boton Aceptar apenas aparece el aviso para que Enter/Escape respondan
  // de inmediato, pero no se atrapa: un Tab normal saca al usuario del aviso sin problema.
  useEffect(() => {
    botonAceptarRef.current?.focus();
  }, []);

  function manejarTecla(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Escape") {
      onRechazar();
    }
  }

  return (
    <div
      role="region"
      aria-live="assertive"
      aria-label="Llamada entrante"
      onKeyDown={manejarTecla}
      className={cn(
        "fixed bottom-6 right-6 z-50 w-[22rem] max-w-[calc(100vw-3rem)]",
        "rounded-3xl bg-card ring-1 ring-border shadow-[0_24px_48px_-16px_rgb(18_20_22_/_0.35)]",
        "animate-element motion-reduce:animate-none"
      )}
    >
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <PhoneIcon
            className="size-4 animate-pulse text-primary motion-reduce:animate-none"
            strokeWidth={1.75}
          />
          Llamada entrante
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={silenciado}
          aria-label={silenciado ? "Activar sonido de llamada" : "Silenciar sonido de llamada"}
          onClick={onSilenciar}
        >
          {silenciado ? <BellOffIcon strokeWidth={1.75} /> : <BellIcon strokeWidth={1.75} />}
        </Button>
      </div>

      <div className="px-5 pb-4">
        <p className="font-mono text-2xl font-semibold tracking-tight">{llamada.numero}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{llamada.nombre ?? "Sin identificar"}</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline">{MOTIVOS[llamada.motivo]}</Badge>
          <span className="text-xs text-muted-foreground">sonando {formatearSegundos(segundos)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border p-4">
        <Button ref={botonAceptarRef} variant="default" className="flex-1" onClick={onAceptar}>
          <PhoneIcon strokeWidth={1.75} />
          Aceptar
        </Button>
        <Button variant="destructive" className="flex-1" onClick={onRechazar}>
          <PhoneOffIcon strokeWidth={1.75} />
          Rechazar
        </Button>
      </div>
    </div>
  );
}
