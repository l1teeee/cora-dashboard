"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { FileTextIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type Archivo = {
  id: string;
  nombre: string;
  tamano: number | null;
  creado: string | null;
};

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo" };

const EXTENSIONES_PERMITIDAS = ["pdf", "docx", "txt"];
const TAMANO_MAXIMO = 300 * 1024;

function formatearTamano(bytes: number | null) {
  if (bytes === null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
}

function formatearFecha(iso: string | null) {
  if (!iso) return "-";
  const fecha = new Date(iso);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()} ${horas}:${minutos}`;
}

export function PanelConocimiento() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [avisoAuditoria, setAvisoAuditoria] = useState<string | null>(null);
  const [archivoAEliminar, setArchivoAEliminar] = useState<Archivo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargarArchivos() {
    setEstado({ tipo: "cargando" });

    try {
      const respuesta = await fetch("/api/conocimiento");

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        setEstado({
          tipo: "error",
          mensaje: cuerpo?.error ?? "No se pudo cargar la base de conocimiento.",
        });
        return;
      }

      const datos: { archivos: Archivo[] } = await respuesta.json();
      setArchivos(datos.archivos);
      setEstado({ tipo: "listo" });
    } catch {
      setEstado({ tipo: "error", mensaje: "No se pudo conectar con el servidor." });
    }
  }

  useEffect(() => {
    cargarArchivos();
  }, []);

  async function subirArchivo(archivo: File) {
    setSubiendo(true);
    setMensajeError(null);
    setAvisoAuditoria(null);

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      const respuesta = await fetch("/api/conocimiento", {
        method: "POST",
        body: formData,
      });

      const cuerpo = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setMensajeError(cuerpo?.error ?? "No se pudo subir el archivo.");
        return;
      }

      if (cuerpo?.auditoriaRegistrada === false) {
        setAvisoAuditoria(
          "El cambio se aplico, pero no se pudo registrar en auditoria."
        );
      }

      await cargarArchivos();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setSubiendo(false);
    }
  }

  function manejarSeleccionArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    setErrorValidacion(null);

    const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "";
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      setErrorValidacion("Solo se admiten PDF, DOCX o TXT.");
      return;
    }

    if (archivo.size > TAMANO_MAXIMO) {
      setErrorValidacion(
        `El archivo supera el maximo de 300 KB. Tamano actual: ${formatearTamano(archivo.size)}.`
      );
      return;
    }

    subirArchivo(archivo);
  }

  async function confirmarEliminacion() {
    if (!archivoAEliminar) return;

    setEliminando(true);
    setMensajeError(null);
    setAvisoAuditoria(null);

    try {
      const respuesta = await fetch(`/api/conocimiento/${archivoAEliminar.id}`, {
        method: "DELETE",
      });

      const cuerpo = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setMensajeError(cuerpo?.error ?? "No se pudo eliminar el archivo.");
        setArchivoAEliminar(null);
        return;
      }

      if (cuerpo?.auditoriaRegistrada === false) {
        setAvisoAuditoria(
          "El cambio se aplico, pero no se pudo registrar en auditoria."
        );
      }

      setArchivoAEliminar(null);
      await cargarArchivos();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
      setArchivoAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base de conocimiento</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <Field
            label="Subir documento"
            htmlFor="archivo-conocimiento"
            hint="PDF, DOCX o TXT, maximo 300 KB"
            error={errorValidacion ?? undefined}
          >
            <input
              id="archivo-conocimiento"
              type="file"
              accept=".pdf,.docx,.txt"
              disabled={subiendo}
              onChange={manejarSeleccionArchivo}
              className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-input file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent disabled:pointer-events-none disabled:opacity-50"
            />
          </Field>
          {subiendo && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" strokeWidth={1.75} />
              Subiendo...
            </span>
          )}
        </div>

        {estado.tipo === "cargando" && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {estado.tipo === "error" && (
          <div className="space-y-3">
            <Alert variant="destructive">{estado.mensaje}</Alert>
            <Button variant="outline" size="sm" onClick={cargarArchivos}>
              Reintentar
            </Button>
          </div>
        )}

        {estado.tipo === "listo" && (
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Subido</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-28 p-0">
                      <EmptyState
                        icon={FileTextIcon}
                        titulo="No hay documentos en la base de conocimiento."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  archivos.map((archivo) => (
                    <TableRow key={archivo.id}>
                      <TableCell className="max-w-xs truncate font-medium text-foreground">
                        {archivo.nombre}
                      </TableCell>
                      <TableCell>{formatearTamano(archivo.tamano)}</TableCell>
                      <TableCell>{formatearFecha(archivo.creado)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar ${archivo.nombre}`}
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setArchivoAEliminar(archivo)}
                        >
                          <Trash2Icon strokeWidth={1.75} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {mensajeError && <Alert variant="destructive">{mensajeError}</Alert>}
        {avisoAuditoria && <Alert variant="warning">{avisoAuditoria}</Alert>}
      </CardContent>

      <Dialog
        open={archivoAEliminar !== null}
        onOpenChange={(open) => !open && setArchivoAEliminar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar archivo</DialogTitle>
            <DialogDescription>
              Se eliminara{" "}
              <span className="font-medium text-foreground">
                {archivoAEliminar?.nombre}
              </span>{" "}
              de la base de conocimiento del asistente. Esta accion no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={eliminando} />}>
              Cancelar
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmarEliminacion}
              disabled={eliminando}
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
