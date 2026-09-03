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
import { Paginacion } from "@/components/ui/pagination";
import { DetalleLlamada } from "@/components/detalle-llamada";
import { SelectAsignacion } from "@/components/select-asignacion";
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
  porPagina,
  asignables = [],
}: {
  llamadas: Llamada[];
  rol: Rol;
  porPagina?: number;
  asignables?: { id: string; nombre: string }[];
}) {
  const [callIdSeleccionado, setCallIdSeleccionado] = useState<string | null>(
    null
  );
  const [pagina, setPagina] = useState(1);

  const columnas = rol === "admin" ? 7 : 6;

  const totalPaginas = porPagina
    ? Math.max(1, Math.ceil(llamadas.length / porPagina))
    : 1;
  const paginaSegura = Math.min(pagina, totalPaginas);
  const llamadasPagina = porPagina
    ? llamadas.slice(
        (paginaSegura - 1) * porPagina,
        paginaSegura * porPagina
      )
    : llamadas;

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_8px_-2px_rgb(18_20_22_/_0.08),0_1px_2px_rgb(18_20_22_/_0.04)] ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Quien llamo</TableHead>
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
              llamadasPagina.map((llamada) => (
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
                  className="cursor-pointer focus-visible:outline-none focus-visible:bg-primary/8"
                >
                  <TableCell className="font-medium text-foreground">
                    {formatearFecha(llamada.fecha)}
                  </TableCell>
                  <TableCell>
                    {llamada.nombre_capturado ? (
                      <>
                        <span className="text-foreground">{llamada.nombre_capturado}</span>
                        <span className="block font-mono text-xs text-muted-foreground">
                          {llamada.numero_telefono ?? "-"}
                        </span>
                      </>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        {llamada.numero_telefono ?? "-"}
                      </span>
                    )}
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
                      {asignables.length > 0 ? (
                        <SelectAsignacion
                          callId={llamada.call_id}
                          asignadoA={llamada.usuario_asignado}
                          asignables={asignables}
                        />
                      ) : (
                        (llamada.usuario_asignado ?? "Sin asignar")
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {porPagina && llamadas.length > 0 && (
          <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Mostrando {(paginaSegura - 1) * porPagina + 1}-
              {Math.min(paginaSegura * porPagina, llamadas.length)} de{" "}
              {llamadas.length} llamadas
            </p>
            <Paginacion
              paginaActual={paginaSegura}
              totalPaginas={totalPaginas}
              onCambiar={setPagina}
            />
          </div>
        )}
      </div>

      <DetalleLlamada
        callId={callIdSeleccionado}
        onClose={() => setCallIdSeleccionado(null)}
      />
    </>
  );
}
