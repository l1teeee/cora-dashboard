"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PhoneOffIcon, UserRoundIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { describirFinalizacion } from "@/lib/finalizacion";
import { formatearCosto, formatearDuracion, formatearFecha } from "@/lib/metricas";
import type { Contacto, LlamadaDeContacto } from "@/lib/contactos";

gsap.registerPlugin(useGSAP);

type Ficha = { contacto: Contacto; llamadas: LlamadaDeContacto[] };

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; datos: Ficha };

// El backend guarda null cuando el campo queda vacio; el formulario trabaja con "".
function aValorGuardado(texto: string): string | null {
  const limpio = texto.trim();
  return limpio === "" ? null : limpio;
}

export function FichaContacto({
  telefono,
  onClose,
}: {
  telefono: string | null;
  onClose: () => void;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [nombre, setNombre] = useState("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    if (!telefono) return;

    // evita pisar el estado si el dialogo cambia de contacto antes de que responda el fetch anterior
    let cancelado = false;
    setEstado({ tipo: "cargando" });
    setMensajeExito(null);
    setMensajeError(null);

    fetch(`/api/contactos/${encodeURIComponent(telefono)}`)
      .then(async (respuesta) => {
        if (cancelado) return;

        if (respuesta.status === 403) {
          setEstado({ tipo: "error", mensaje: "No tienes acceso a este contacto." });
          return;
        }

        if (respuesta.status === 404) {
          setEstado({ tipo: "error", mensaje: "El contacto ya no existe." });
          return;
        }

        if (!respuesta.ok) {
          setEstado({ tipo: "error", mensaje: "No se pudo cargar el contacto." });
          return;
        }

        const datos: Ficha = await respuesta.json();
        setNombre(datos.contacto.nombre ?? "");
        setNotas(datos.contacto.notas ?? "");
        setEstado({ tipo: "listo", datos });
      })
      .catch(() => {
        if (!cancelado) {
          setEstado({ tipo: "error", mensaje: "No se pudo cargar el contacto." });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [telefono]);

  const guardado = estado.tipo === "listo" ? estado.datos.contacto : null;
  const hayCambios =
    guardado !== null &&
    (nombre !== (guardado.nombre ?? "") || notas !== (guardado.notas ?? ""));

  async function guardar() {
    if (!telefono || estado.tipo !== "listo") return;

    const nombreNuevo = aValorGuardado(nombre);
    const notasNuevas = aValorGuardado(notas);

    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    try {
      const respuesta = await fetch(`/api/contactos/${encodeURIComponent(telefono)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreNuevo, notas: notasNuevas }),
      });

      const cuerpo = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setMensajeError(cuerpo?.error ?? "No se pudo guardar el contacto.");
        return;
      }

      setEstado({
        tipo: "listo",
        datos: {
          ...estado.datos,
          contacto: { ...estado.datos.contacto, nombre: nombreNuevo, notas: notasNuevas },
        },
      });
      setNombre(nombreNuevo ?? "");
      setNotas(notasNuevas ?? "");
      setMensajeExito("Contacto actualizado.");
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={telefono !== null} onOpenChange={(open) => !open && onClose()}>
      {/* Columna flex con el cuerpo scrolleable: con overflow en la raiz el dialogo crecia
          mas que la ventana y el historial quedaba cortado por abajo. */}
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 sm:max-w-3xl">
        {estado.tipo === "cargando" && (
          <div className="space-y-4 p-5">
            <DialogHeader>
              <DialogTitle>Cargando historial...</DialogTitle>
            </DialogHeader>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {estado.tipo === "error" && (
          <div className="space-y-4 p-5">
            <DialogHeader>
              <DialogTitle>No se pudo mostrar el historial</DialogTitle>
            </DialogHeader>
            <Alert variant="destructive" titulo="No se pudo mostrar el historial">
              {estado.mensaje}
            </Alert>
          </div>
        )}

        {estado.tipo === "listo" && (
          <Contenido
            datos={estado.datos}
            nombre={nombre}
            notas={notas}
            hayCambios={hayCambios}
            guardando={guardando}
            mensajeExito={mensajeExito}
            mensajeError={mensajeError}
            onNombre={setNombre}
            onNotas={setNotas}
            onGuardar={guardar}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Contenido({
  datos,
  nombre,
  notas,
  hayCambios,
  guardando,
  mensajeExito,
  mensajeError,
  onNombre,
  onNotas,
  onGuardar,
}: {
  datos: Ficha;
  nombre: string;
  notas: string;
  hayCambios: boolean;
  guardando: boolean;
  mensajeExito: string | null;
  mensajeError: string | null;
  onNombre: (valor: string) => void;
  onNotas: (valor: string) => void;
  onGuardar: () => void;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const { contacto, llamadas } = datos;

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const linea = gsap.timeline({
          defaults: { duration: 0.35, ease: "power2.out" },
        });

        linea
          .from("[data-slot=ficha-cabecera]", { opacity: 0, y: -8 })
          .from("[data-slot=ficha-dato]", { opacity: 0, y: 8, stagger: 0.05 }, "<0.1")
          .from("[data-slot=ficha-panel]", { opacity: 0, y: 10, stagger: 0.08 }, "<0.1")
          .from("[data-slot=ficha-llamada]", { opacity: 0, x: -10, stagger: 0.04 }, "<0.05");
      });

      return () => media.revert();
    },
    { scope: raiz }
  );

  return (
    <div ref={raiz} className="flex min-h-0 flex-col">
      <div
        data-slot="ficha-cabecera"
        className="flex items-center gap-3 border-b border-border px-5 py-4"
      >
        {/* Sin nombre, las iniciales saldrian del telefono ("+"): mejor un icono neutro. */}
        {contacto.nombre ? (
          <Avatar nombre={contacto.nombre} size="lg" />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <UserRoundIcon className="size-5 text-muted-foreground" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <DialogTitle>Historial de usuario</DialogTitle>
          <DialogDescription className="mt-0.5 flex flex-wrap items-center gap-x-2">
            <span className="font-medium text-foreground">
              {contacto.nombre ?? "Sin nombre"}
            </span>
            <span className="font-mono text-xs">{contacto.telefono}</span>
          </DialogDescription>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border">
          <Dato etiqueta="Llamadas" valor={String(contacto.total_llamadas)} />
          <Dato etiqueta="Primera" valor={formatearFecha(contacto.primera_llamada)} />
          <Dato etiqueta="Ultima" valor={formatearFecha(contacto.ultima_llamada)} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <section data-slot="ficha-panel" className="space-y-4">
            <h3 className="text-[13px] font-medium">Datos de la persona</h3>

            <Field label="Nombre" htmlFor="nombre-contacto">
              <Input
                id="nombre-contacto"
                placeholder="Sin nombre"
                value={nombre}
                onChange={(evento) => onNombre(evento.target.value)}
              />
            </Field>

            <Field label="Notas" htmlFor="notas-contacto">
              <Textarea
                id="notas-contacto"
                rows={5}
                placeholder="Anotaciones internas sobre esta persona"
                value={notas}
                onChange={(evento) => onNotas(evento.target.value)}
              />
            </Field>

            <div className="space-y-2">
              <Button disabled={!hayCambios || guardando} onClick={onGuardar}>
                {guardando ? "Guardando..." : "Guardar"}
              </Button>

              {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}
              {mensajeError && <Alert variant="destructive">{mensajeError}</Alert>}
            </div>
          </section>

          <section data-slot="ficha-panel" className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[13px] font-medium">Llamadas anteriores</h3>
              <span className="text-xs text-muted-foreground">
                {llamadas.length} {llamadas.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            <Historial llamadas={llamadas} />
          </section>
        </div>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div data-slot="ficha-dato" className="bg-card px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="mt-0.5 text-sm font-medium">{valor}</p>
    </div>
  );
}

function Historial({ llamadas }: { llamadas: LlamadaDeContacto[] }) {
  if (llamadas.length === 0) {
    return (
      <EmptyState
        icon={PhoneOffIcon}
        titulo="Sin llamadas registradas"
        descripcion="Esta persona todavia no tiene llamadas guardadas."
      />
    );
  }

  return (
    <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
      {llamadas.map((llamada) => {
        const finalizacion = describirFinalizacion(llamada.razon_finalizacion);

        return (
          <li
            key={llamada.id}
            data-slot="ficha-llamada"
            className="rounded-xl bg-muted/60 p-3 ring-1 ring-border/60"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium">{formatearFecha(llamada.fecha)}</span>
              <span className="text-xs text-muted-foreground">
                {formatearDuracion(llamada.duracion)} · {formatearCosto(llamada.costo)}
              </span>
              {llamada.motivo && <Badge variant="secondary">{llamada.motivo}</Badge>}
              <Badge
                variant={finalizacion.clase === "error" ? "destructive" : "outline"}
                className="ml-auto"
              >
                {finalizacion.descripcion}
              </Badge>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserRoundIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
              {llamada.usuario_asignado ?? "Sin asignar"}
            </div>

            {/* el resumen de Vapi llega despues de forma asincrona */}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {llamada.resumen ?? "Resumen pendiente"}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
