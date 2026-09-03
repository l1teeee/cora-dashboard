"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DetalleLlamada } from "@/components/detalle-llamada";
import {
  formatearCosto,
  formatearDuracion,
  formatearFecha,
} from "@/lib/metricas";
import type { Llamada, Rol } from "@/lib/tipos";

function truncar(texto: string, limite: number) {
  if (texto.length <= limite) return texto;
  return `${texto.slice(0, limite)}...`;
}

export function TablaLlamadas({
  llamadas,
  rol,
}: {
  llamadas: Llamada[];
  rol: Rol;
}) {
  const [callIdSeleccionado, setCallIdSeleccionado] = useState<string | null>(
    null
  );

  const columnas = rol === "admin" ? 7 : 6;

  return (
    <>
      <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Numero</TableHead>
              <TableHead>Duracion</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Finalizacion</TableHead>
              <TableHead>Resumen</TableHead>
              {rol === "admin" && <TableHead>Asignado a</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {llamadas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnas}
                  className="text-center text-muted-foreground"
                >
                  No hay llamadas para mostrar
                </TableCell>
              </TableRow>
            ) : (
              llamadas.map((llamada) => (
                <TableRow
                  key={llamada.id}
                  className="cursor-pointer"
                  onClick={() => setCallIdSeleccionado(llamada.call_id)}
                >
                  <TableCell>{formatearFecha(llamada.fecha)}</TableCell>
                  <TableCell>{llamada.numero_telefono ?? "-"}</TableCell>
                  <TableCell>{formatearDuracion(llamada.duracion)}</TableCell>
                  <TableCell>{formatearCosto(llamada.costo)}</TableCell>
                  <TableCell>
                    {llamada.razon_finalizacion ? (
                      <Badge variant="outline">{llamada.razon_finalizacion}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal">
                    {/* el resumen de Vapi llega despues de forma asincrona */}
                    {llamada.resumen ? (
                      truncar(llamada.resumen, 70)
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </TableCell>
                  {rol === "admin" && (
                    <TableCell>
                      {llamada.usuario_asignado ?? "Sin asignar"}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DetalleLlamada
        callId={callIdSeleccionado}
        onClose={() => setCallIdSeleccionado(null)}
      />
    </>
  );
}
