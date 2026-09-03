"use client";

import { useEffect, useState } from "react";
import { ScrollTextIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="max-h-40 overflow-y-auto rounded-lg bg-muted p-2">
      <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
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
      <Field label="Filtrar por accion" htmlFor="filtro-accion" className="sm:w-64">
        <select
          id="filtro-accion"
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">Todas</option>
          {Object.entries(ETIQUETAS_ACCION).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </Field>

      {estado.tipo === "cargando" && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {estado.tipo === "error" && (
        <Alert variant="destructive" titulo="No se pudo cargar la auditoria">
          {estado.mensaje}
        </Alert>
      )}

      {estado.tipo === "listo" && (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border">
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
                  <TableCell colSpan={4} className="h-28 p-0">
                    <EmptyState icon={ScrollTextIcon} titulo="No hay registros de auditoria." />
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-medium text-foreground">
                      {formatearFecha(registro.fecha)}
                    </TableCell>
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
