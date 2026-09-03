"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import {
  formatearCosto,
  formatearDuracion,
  formatearFecha,
} from "@/lib/metricas";
import type { LlamadaDetalle } from "@/lib/tipos";
import { ReproductorGrabacion } from "@/components/reproductor-grabacion";

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

  useEffect(() => {
    if (!callId) return;

    // evita pisar el estado si el dialogo cambia de llamada antes de que responda el fetch anterior
    let cancelado = false;
    setEstado({ tipo: "cargando" });

    fetch(`/api/llamadas/${callId}`)
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

  return (
    <Dialog open={callId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        {estado.tipo === "cargando" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Cargando llamada...</DialogTitle>
            </DialogHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {estado.tipo === "error" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>No se pudo mostrar la llamada</DialogTitle>
            </DialogHeader>
            <Alert variant="destructive" titulo="No se pudo mostrar la llamada">
              {estado.mensaje}
            </Alert>
          </div>
        )}

        {estado.tipo === "listo" && <DetalleContenido datos={estado.datos} />}
      </DialogContent>
    </Dialog>
  );
}

function DetalleContenido({ datos }: { datos: LlamadaDetalle }) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>{formatearFecha(datos.fecha)}</DialogTitle>
        <DialogDescription>
          {datos.numero_telefono ?? "Numero no disponible"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-4">
        <div className="bg-card p-3">
          <p className="text-xs text-muted-foreground">Duracion</p>
          <p className="text-sm font-medium">{formatearDuracion(datos.duracion)}</p>
        </div>
        <div className="bg-card p-3">
          <p className="text-xs text-muted-foreground">Costo</p>
          <p className="text-sm font-medium">{formatearCosto(datos.costo)}</p>
        </div>
        <div className="bg-card p-3">
          <p className="text-xs text-muted-foreground">Finalizacion</p>
          <p className="text-sm font-medium">{datos.razon_finalizacion ?? "-"}</p>
        </div>
        <div className="bg-card p-3">
          <p className="text-xs text-muted-foreground">Asignado a</p>
          <p className="text-sm font-medium">{datos.usuario_asignado ?? "Sin asignar"}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Resumen
        </h3>
        <p className="text-sm text-muted-foreground">
          {datos.resumen ?? "El resumen aun no esta disponible."}
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Grabacion
        </h3>
        <ReproductorGrabacion callId={datos.call_id} />
      </div>

      <Separator />

      <div>
        <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Transcripcion
        </h3>
        {datos.transcripcion ? (
          <Transcripcion texto={datos.transcripcion} />
        ) : (
          <p className="text-sm text-muted-foreground">Sin transcripcion</p>
        )}
      </div>
    </div>
  );
}

function Transcripcion({ texto }: { texto: string }) {
  const lineas = texto.split("\n");

  return (
    <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto">
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
