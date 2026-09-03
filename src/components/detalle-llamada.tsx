"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ContactRoundIcon, MaximizeIcon } from "lucide-react";
import { FichaContacto } from "@/components/ficha-contacto";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { describirFinalizacion } from "@/lib/finalizacion";
import {
  formatearCosto,
  formatearDuracion,
  formatearFecha,
} from "@/lib/metricas";
import type { LlamadaDetalle } from "@/lib/tipos";
import { ReproductorGrabacion } from "@/components/reproductor-grabacion";

gsap.registerPlugin(useGSAP);

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; datos: LlamadaDetalle };

export function DetalleLlamada({
  callId,
  onClose,
}: {
  callId: string | null;
  onClose: () => void;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [fichaAbierta, setFichaAbierta] = useState(false);
  const [transcripcionAbierta, setTranscripcionAbierta] = useState(false);

  useEffect(() => {
    if (!callId) return;

    // evita pisar el estado si el dialogo cambia de llamada antes de que responda el fetch anterior
    let cancelado = false;
    setEstado({ tipo: "cargando" });
    setFichaAbierta(false);
    setTranscripcionAbierta(false);

    fetch(`/api/llamadas/${encodeURIComponent(callId)}`)
      .then(async (respuesta) => {
        if (cancelado) return;

        if (respuesta.status === 403) {
          setEstado({ tipo: "error", mensaje: "No tienes acceso a esta llamada." });
          return;
        }

        if (!respuesta.ok) {
          setEstado({ tipo: "error", mensaje: "No se pudo cargar la llamada." });
          return;
        }

        const datos: LlamadaDetalle = await respuesta.json();
        setEstado({ tipo: "listo", datos });
      })
      .catch(() => {
        if (!cancelado) {
          setEstado({ tipo: "error", mensaje: "No se pudo cargar la llamada." });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [callId]);

  const telefono = estado.tipo === "listo" ? estado.datos.numero_telefono : null;
  const transcripcion = estado.tipo === "listo" ? estado.datos.transcripcion : null;
  const hayOtroDialogo = fichaAbierta || transcripcionAbierta;

  return (
    <>
      {/* Al abrir el historial o la transcripcion completa este dialogo se cierra en vez de
          quedar detras: dos modales apilados se leen como un error. El componente sigue
          montado, asi que los datos ya cargados siguen ahi cuando el otro se cierra. */}
      <Dialog
        open={callId !== null && !hayOtroDialogo}
        onOpenChange={(open) => {
          if (!open && !hayOtroDialogo) onClose();
        }}
      >
        <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 sm:max-w-3xl">
          {estado.tipo === "cargando" && (
            <div className="space-y-4 p-5">
              <DialogHeader>
                <DialogTitle>Cargando llamada...</DialogTitle>
              </DialogHeader>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {estado.tipo === "error" && (
            <div className="space-y-4 p-5">
              <DialogHeader>
                <DialogTitle>No se pudo mostrar la llamada</DialogTitle>
              </DialogHeader>
              <Alert variant="destructive" titulo="No se pudo mostrar la llamada">
                {estado.mensaje}
              </Alert>
            </div>
          )}

          {estado.tipo === "listo" && (
            <DetalleContenido
              datos={estado.datos}
              onVerContacto={() => setFichaAbierta(true)}
              onVerTranscripcion={() => setTranscripcionAbierta(true)}
            />
          )}
        </DialogContent>
      </Dialog>

      {fichaAbierta && (
        <FichaContacto telefono={telefono} onClose={() => setFichaAbierta(false)} />
      )}

      {transcripcionAbierta && transcripcion && (
        <TranscripcionCompleta
          texto={transcripcion}
          onClose={() => setTranscripcionAbierta(false)}
        />
      )}
    </>
  );
}

function DetalleContenido({
  datos,
  onVerContacto,
  onVerTranscripcion,
}: {
  datos: LlamadaDetalle;
  onVerContacto: () => void;
  onVerTranscripcion: () => void;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const finalizacion = describirFinalizacion(datos.razon_finalizacion);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const linea = gsap.timeline({
          defaults: { duration: 0.35, ease: "power2.out" },
        });

        linea
          .from("[data-slot=detalle-cabecera]", { opacity: 0, y: -8 })
          .from("[data-slot=detalle-dato]", { opacity: 0, y: 8, stagger: 0.04 }, "<0.1")
          .from("[data-slot=detalle-bloque]", { opacity: 0, y: 10, stagger: 0.07 }, "<0.1");
      });

      return () => media.revert();
    },
    { scope: raiz }
  );

  return (
    <div ref={raiz} className="flex min-h-0 flex-col">
      <div
        data-slot="detalle-cabecera"
        className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 pr-12"
      >
        <div className="min-w-0">
          <DialogTitle>{formatearFecha(datos.fecha)}</DialogTitle>
          <DialogDescription className="mt-0.5 font-mono text-xs">
            {datos.numero_telefono ?? "Numero no disponible"}
          </DialogDescription>
        </div>

        {datos.numero_telefono && (
          <Button variant="outline" size="sm" onClick={onVerContacto}>
            <ContactRoundIcon strokeWidth={1.75} />
            Historial de usuario
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border sm:grid-cols-4">
          <Dato etiqueta="Duracion" valor={formatearDuracion(datos.duracion)} />
          <Dato etiqueta="Costo" valor={formatearCosto(datos.costo)} />
          <Dato etiqueta="Asignado a" valor={datos.usuario_asignado ?? "Sin asignar"} />
          <Dato
            etiqueta="Quien llamo"
            valor={datos.nombre_capturado ?? "Sin identificar"}
          />
        </div>

        <Bloque titulo="Finalizacion">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={finalizacion.clase === "error" ? "destructive" : "outline"}>
              {finalizacion.descripcion}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {datos.razon_finalizacion ?? "sin dato"}
            </span>
            {datos.motivo && <Badge variant="secondary">{datos.motivo}</Badge>}
          </div>
        </Bloque>

        <Bloque titulo="Resumen">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {datos.resumen ?? "El resumen aun no esta disponible."}
          </p>
        </Bloque>

        <Bloque titulo="Grabacion">
          <ReproductorGrabacion callId={datos.call_id} />
        </Bloque>

        <Bloque titulo="Transcripcion">
          {datos.transcripcion ? (
            <Transcripcion texto={datos.transcripcion} onVerCompleta={onVerTranscripcion} />
          ) : (
            <p className="text-sm text-muted-foreground">Sin transcripcion</p>
          )}
        </Bloque>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div data-slot="detalle-dato" className="bg-card px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="mt-0.5 truncate text-sm font-medium" title={valor}>
        {valor}
      </p>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section data-slot="detalle-bloque" className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

const LINEAS_VISTA_PREVIA = 4;

function Transcripcion({ texto, onVerCompleta }: { texto: string; onVerCompleta: () => void }) {
  const lineas = texto.split("\n");
  const hayMas = lineas.length > LINEAS_VISTA_PREVIA;

  return (
    <div className="space-y-2">
      <LineasTranscripcion
        lineas={lineas.slice(0, LINEAS_VISTA_PREVIA)}
        className="max-h-44 overflow-hidden"
      />

      {hayMas && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onVerCompleta}>
            <MaximizeIcon strokeWidth={1.75} />
            Leer toda la transcripcion
          </Button>
          <span className="text-xs text-muted-foreground">
            {lineas.length} intervenciones
          </span>
        </div>
      )}
    </div>
  );
}

// Vive fuera del dialogo de detalle, no anidada dentro: montada aqui el detalle puede
// cerrarse mientras esta abierta, en lugar de quedar visible por debajo.
function TranscripcionCompleta({ texto, onClose }: { texto: string; onClose: () => void }) {
  const lineas = texto.split("\n");

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Transcripcion completa</DialogTitle>
          <DialogDescription>
            {lineas.length} intervenciones entre el asistente y la persona que llamo.
          </DialogDescription>
        </DialogHeader>

        <LineasTranscripcion lineas={lineas} className="min-h-0 flex-1 overflow-y-auto" />
      </DialogContent>
    </Dialog>
  );
}

function LineasTranscripcion({
  lineas,
  className,
}: {
  lineas: string[];
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "whitespace-pre-wrap rounded-xl bg-muted p-3 font-mono text-xs leading-relaxed",
        className
      )}
    >
      {lineas.map((linea, indice) => {
        // las lineas vienen como "ETIQUETA: texto" (USUARIO / ASISTENTE); se resalta lo previo a los ":"
        const separador = linea.indexOf(":");
        if (separador === -1) {
          return <div key={indice}>{linea}</div>;
        }

        const etiqueta = linea.slice(0, separador);
        const resto = linea.slice(separador + 1);

        return (
          <div key={indice}>
            <strong className="text-foreground">{etiqueta}:</strong>
            <span className="text-muted-foreground">{resto}</span>
          </div>
        );
      })}
    </pre>
  );
}
