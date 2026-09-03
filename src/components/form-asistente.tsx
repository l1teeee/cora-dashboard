"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Asistente = {
  id: string;
  nombre: string;
  firstMessage: string;
  systemPrompt: string;
};

type CampoEditable = "nombre" | "firstMessage" | "systemPrompt";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo" };

const CAMPOS: { clave: CampoEditable; etiqueta: string }[] = [
  { clave: "nombre", etiqueta: "Nombre del asistente" },
  { clave: "firstMessage", etiqueta: "Primer mensaje" },
  { clave: "systemPrompt", etiqueta: "System prompt" },
];

function truncar(texto: string, limite = 200) {
  if (texto.length <= limite) return texto;
  return `${texto.slice(0, limite)}...`;
}

export function FormAsistente() {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [original, setOriginal] = useState<Asistente | null>(null);
  const [editable, setEditable] = useState<Asistente | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [avisoAuditoria, setAvisoAuditoria] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  async function cargarAsistente() {
    setEstado({ tipo: "cargando" });

    try {
      const respuesta = await fetch("/api/asistente");

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        setEstado({
          tipo: "error",
          mensaje:
            cuerpo?.error ?? "No se pudo cargar la configuracion del asistente.",
        });
        return;
      }

      const datos: Asistente = await respuesta.json();
      setOriginal(datos);
      setEditable(datos);
      setEstado({ tipo: "listo" });
    } catch {
      setEstado({ tipo: "error", mensaje: "No se pudo conectar con el servidor." });
    }
  }

  useEffect(() => {
    cargarAsistente();
  }, []);

  const camposCambiados =
    editable && original
      ? CAMPOS.filter((campo) => editable[campo.clave] !== original[campo.clave])
      : [];
  const hayCambios = camposCambiados.length > 0;

  function abrirConfirmacion() {
    setMensajeExito(null);
    setAvisoAuditoria(null);
    setMensajeError(null);
    setMostrarConfirmacion(true);
  }

  async function confirmarGuardado() {
    if (!editable || !original) return;

    setGuardando(true);

    const payload: Partial<Record<CampoEditable, string>> = {};
    for (const campo of camposCambiados) {
      payload[campo.clave] = editable[campo.clave];
    }

    try {
      const respuesta = await fetch("/api/asistente", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const cuerpo = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setMensajeError(cuerpo?.error ?? "No se pudo guardar el asistente.");
        setMostrarConfirmacion(false);
        return;
      }

      setOriginal(editable);
      setMensajeExito("Cambios guardados en Vapi.");
      if (cuerpo?.auditoriaRegistrada === false) {
        setAvisoAuditoria(
          "El cambio se aplico, pero no se pudo registrar en auditoria."
        );
      }
      setMostrarConfirmacion(false);
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
      setMostrarConfirmacion(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion del asistente</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {estado.tipo === "cargando" && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {estado.tipo === "error" && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{estado.mensaje}</p>
            <Button variant="outline" size="sm" onClick={cargarAsistente}>
              Reintentar
            </Button>
          </div>
        )}

        {estado.tipo === "listo" && editable && (
          <>
            <div className="space-y-1.5">
              <label htmlFor="nombre-asistente" className="text-sm font-medium">
                Nombre del asistente
              </label>
              <Input
                id="nombre-asistente"
                value={editable.nombre}
                onChange={(evento) =>
                  setEditable({ ...editable, nombre: evento.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="primer-mensaje" className="text-sm font-medium">
                Primer mensaje
              </label>
              <Input
                id="primer-mensaje"
                value={editable.firstMessage}
                onChange={(evento) =>
                  setEditable({ ...editable, firstMessage: evento.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="system-prompt" className="text-sm font-medium">
                System prompt
              </label>
              <textarea
                id="system-prompt"
                rows={16}
                value={editable.systemPrompt}
                onChange={(evento) =>
                  setEditable({ ...editable, systemPrompt: evento.target.value })
                }
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <p className="text-xs text-muted-foreground">
                El bloque delimitado por marcadores cora:kb se gestiona solo y no
                aparece aqui.
              </p>
            </div>
          </>
        )}
      </CardContent>

      {estado.tipo === "listo" && (
        <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button disabled={!hayCambios || guardando} onClick={abrirConfirmacion}>
            Guardar cambios
          </Button>

          <div className="space-y-1 text-sm">
            {mensajeExito && <p className="text-green-600">{mensajeExito}</p>}
            {avisoAuditoria && <p className="text-amber-600">{avisoAuditoria}</p>}
            {mensajeError && <p className="text-red-600">{mensajeError}</p>}
          </div>
        </CardFooter>
      )}

      <Dialog open={mostrarConfirmacion} onOpenChange={setMostrarConfirmacion}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar cambios</DialogTitle>
            <DialogDescription>
              Se aplicaran los siguientes cambios en Vapi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {camposCambiados.map((campo) => (
              <div key={campo.clave} className="space-y-1.5">
                <p className="text-sm font-medium">{campo.etiqueta}</p>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Valor anterior
                  </p>
                  <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-900 dark:bg-red-950/40 dark:text-red-200">
                    {truncar(original?.[campo.clave] ?? "")}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Valor nuevo</p>
                  <div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-900 dark:bg-green-950/40 dark:text-green-200">
                    {truncar(editable?.[campo.clave] ?? "")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={guardando} />}>
              Cancelar
            </DialogClose>
            <Button onClick={confirmarGuardado} disabled={guardando}>
              {guardando ? "Guardando..." : "Confirmar y guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
