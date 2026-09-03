"use client";

import { useState } from "react";
import { PhoneOffIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-border">
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
                <TableCell colSpan={columnas} className="h-32 p-0">
                  <EmptyState
                    icon={PhoneOffIcon}
                    titulo="No hay llamadas para mostrar"
                    descripcion="Prueba a ampliar el rango de fechas."
                  />
                </TableCell>
              </TableRow>
            ) : (
              llamadas.map((llamada) => (
                <TableRow
                  key={llamada.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver detalle de la llamada del ${formatearFecha(llamada.fecha)}`}
                  onClick={() => setCallIdSeleccionado(llamada.call_id)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter") {
                      setCallIdSeleccionado(llamada.call_id);
                    } else if (evento.key === " ") {
                      evento.preventDefault();
                      setCallIdSeleccionado(llamada.call_id);
                    }
                  }}
                  className="cursor-pointer focus-visible:outline-none focus-visible:bg-muted/60"
                >
                  <TableCell className="font-medium text-foreground">
                    {formatearFecha(llamada.fecha)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {llamada.numero_telefono ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatearDuracion(llamada.duracion)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatearCosto(llamada.costo)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
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
                    <TableCell className="text-muted-foreground">
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
