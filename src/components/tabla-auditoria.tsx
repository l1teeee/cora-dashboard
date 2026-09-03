"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RegistroAuditoria = {
  id: number | string;
  usuario: string;
  accion: string;
  detalle: unknown;
  fecha: string;
};

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo" };

const ETIQUETAS_ACCION: Record<string, string> = {
  edito_asistente: "Edito el asistente",
  edito_system_prompt: "Edito el system prompt",
  subio_archivo: "Subio un archivo",
  elimino_archivo: "Elimino un archivo",
};

function etiquetaAccion(accion: string) {
  return ETIQUETAS_ACCION[accion] ?? accion;
}

function formatearFecha(fecha: string) {
  const [parteFecha, parteHora] = fecha.split(" ");
  if (!parteFecha || !parteHora) return fecha;

  const [anio, mes, dia] = parteFecha.split("-");
  const [horas, minutos] = parteHora.split(":");

  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

function renderDetalle(detalle: unknown) {
  if (detalle === null || detalle === undefined) return "-";
  if (typeof detalle === "string") return detalle;

  return (
    <div className="max-h-40 overflow-y-auto">
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(detalle, null, 2)}
      </pre>
    </div>
  );
}

export function TablaAuditoria() {
  const [filtro, setFiltro] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: "cargando" });

    const params = new URLSearchParams({ limit: "100" });
    if (filtro) params.set("accion", filtro);

    fetch(`/api/auditoria?${params.toString()}`)
      .then(async (respuesta) => {
        if (cancelado) return;

        if (!respuesta.ok) {
          const cuerpo = await respuesta.json().catch(() => null);
          setEstado({
            tipo: "error",
            mensaje: cuerpo?.error ?? "No se pudo cargar la auditoria.",
          });
          return;
        }

        const cuerpo: { data: RegistroAuditoria[] } = await respuesta.json();
        setRegistros(cuerpo.data);
        setEstado({ tipo: "listo" });
      })
      .catch(() => {
        if (!cancelado) {
          setEstado({ tipo: "error", mensaje: "No se pudo conectar con el servidor." });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [filtro]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5 sm:w-64">
        <label htmlFor="filtro-accion" className="text-xs text-muted-foreground">
          Filtrar por accion
        </label>
        <select
          id="filtro-accion"
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value)}
          className="h-8 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">Todas</option>
          {Object.entries(ETIQUETAS_ACCION).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      {estado.tipo === "cargando" && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {estado.tipo === "error" && (
        <p className="text-sm text-red-600">{estado.mensaje}</p>
      )}

      {estado.tipo === "listo" && (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Accion</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay registros de auditoria.
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>{formatearFecha(registro.fecha)}</TableCell>
                    <TableCell>{registro.usuario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{etiquetaAccion(registro.accion)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal align-top">
                      {renderDetalle(registro.detalle)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
