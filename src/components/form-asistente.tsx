"use client";

import { useEffect, useState } from "react";
import { RefreshCwIcon } from "lucide-react";
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
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

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
            <Alert variant="destructive" titulo="No se pudo cargar el asistente">
              {estado.mensaje}
            </Alert>
            <Button variant="outline" size="sm" onClick={cargarAsistente}>
              <RefreshCwIcon strokeWidth={1.75} />
              Reintentar
            </Button>
          </div>
        )}

        {estado.tipo === "listo" && editable && (
          <>
            <Field label="Nombre del asistente" htmlFor="nombre-asistente">
              <Input
                id="nombre-asistente"
                value={editable.nombre}
                onChange={(evento) =>
                  setEditable({ ...editable, nombre: evento.target.value })
                }
              />
            </Field>

            <Field label="Primer mensaje" htmlFor="primer-mensaje">
              <Input
                id="primer-mensaje"
                value={editable.firstMessage}
                onChange={(evento) =>
                  setEditable({ ...editable, firstMessage: evento.target.value })
                }
              />
            </Field>

            <Field
              label="System prompt"
              htmlFor="system-prompt"
              hint="El bloque delimitado por marcadores cora:kb se gestiona solo y no aparece aqui."
            >
              <Textarea
                id="system-prompt"
                rows={16}
                className="font-mono text-xs"
                value={editable.systemPrompt}
                onChange={(evento) =>
                  setEditable({ ...editable, systemPrompt: evento.target.value })
                }
              />
            </Field>
          </>
        )}
      </CardContent>

      {estado.tipo === "listo" && (
        <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button disabled={!hayCambios || guardando} onClick={abrirConfirmacion}>
            Guardar cambios
          </Button>

          <div className="space-y-2">
            {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}
            {avisoAuditoria && <Alert variant="warning">{avisoAuditoria}</Alert>}
            {mensajeError && <Alert variant="destructive">{mensajeError}</Alert>}
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
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {campo.etiqueta}
                </p>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Valor anterior
                  </p>
                  <div className="rounded-lg bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
                    {truncar(original?.[campo.clave] ?? "")}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Valor nuevo</p>
                  <div className="rounded-lg bg-success/10 px-3 py-2 font-mono text-xs text-success">
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
