"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Base UI necesita un valor de tipo string para cada item; la cadena vacia es la
// que representa "sin asignar" y se traduce a null antes de mandarla al backend.
const SIN_ASIGNAR = "";

export function SelectAsignacion({
  callId,
  asignadoA,
  asignables,
  onAsignado,
}: {
  callId: string;
  asignadoA: string | null;
  asignables: { id: string; nombre: string }[];
  onAsignado?: (asignadoA: string | null) => void;
}) {
  const [valor, setValor] = useState(asignadoA ?? SIN_ASIGNAR);
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const opciones = [
    { value: SIN_ASIGNAR, label: "Sin asignar" },
    ...asignables.map((asignable) => ({ value: asignable.id, label: asignable.nombre })),
  ];

  async function guardarAsignacion(nuevoValor: string) {
    const valorAnterior = valor;
    const destino = nuevoValor === SIN_ASIGNAR ? null : nuevoValor;

    // Optimista: la celda muestra el nombre nuevo al instante y solo vuelve atras
    // si el PATCH falla, para que el click no espere al round trip.
    setValor(nuevoValor);
    setMensajeError(null);
    setGuardando(true);

    try {
      const respuesta = await fetch(
        `/api/llamadas/${encodeURIComponent(callId)}/asignacion`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asignadoA: destino }),
        }
      );

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        setValor(valorAnterior);
        setMensajeError(cuerpo?.error ?? "No se pudo cambiar la asignacion.");
        return;
      }

      onAsignado?.(destino);
    } catch {
      setValor(valorAnterior);
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      // El selector vive dentro de filas clicables: sin esto, abrirlo abriria
      // tambien el detalle de la llamada.
      onClick={(evento) => evento.stopPropagation()}
      onKeyDown={(evento) => evento.stopPropagation()}
      className="flex flex-col items-start gap-1"
    >
      <Select
        items={opciones}
        value={valor}
        disabled={guardando}
        onValueChange={(nuevoValor) => {
          void guardarAsignacion(nuevoValor ?? SIN_ASIGNAR);
        }}
      >
        <SelectTrigger size="sm" aria-label="Asignar llamada a un agente">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {opciones.map((opcion) => (
            <SelectItem key={opcion.value} value={opcion.value}>
              {opcion.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mensajeError && (
        <p role="alert" className="text-xs text-destructive">
          {mensajeError}
        </p>
      )}
    </div>
  );
}
