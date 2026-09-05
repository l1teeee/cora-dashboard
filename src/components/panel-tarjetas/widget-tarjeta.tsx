"use client";

import type { ComponentProps, KeyboardEvent } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Widget } from "@/components/panel-tarjetas/tipos";

type WidgetTarjetaProps = {
  widget: Widget;
  etiqueta: string;
  editando: boolean;
  seleccionado: boolean;
  medida?: { ancho: number; alto: number };
  idAyuda?: string;
  esNuevo: boolean;
  onSeleccionar: () => void;
  onQuitar: () => void;
  onTeclear: (evento: KeyboardEvent<HTMLDivElement>) => void;
} & ComponentProps<"div">;

export function WidgetTarjeta({
  widget,
  etiqueta,
  editando,
  seleccionado,
  medida,
  idAyuda,
  esNuevo,
  onSeleccionar,
  onQuitar,
  onTeclear,
  // react-grid-layout clona este elemento para inyectarle su ref, su clase y la
  // posicion calculada. Si no llegan al nodo raiz la tarjeta nunca entra en la
  // rejilla ni se puede arrastrar, y el panel se ve como una sola tarjeta gigante.
  ref,
  className,
  style,
  // react-resizable clona el mismo elemento y mete los cuatro tiradores en sus
  // children. Sin renderizarlos la tarjeta se coloca y se arrastra, pero no hay
  // por donde cambiarle el tamano.
  children,
  ...resto
}: WidgetTarjetaProps) {
  return (
    <div
      {...resto}
      ref={ref}
      style={style}
      data-widget-id={widget.id}
      className={cn(
        "panel-widget-frame group relative h-full",
        editando && "panel-widget-frame-editando",
        seleccionado && "panel-widget-frame-seleccionado",
        esNuevo && "panel-widget-frame-nuevo",
        className
      )}
      onPointerDown={() => {
        if (editando) onSeleccionar();
      }}
      onFocus={() => {
        if (editando) onSeleccionar();
      }}
      onKeyDown={onTeclear}
      tabIndex={editando ? 0 : -1}
      role={editando ? "group" : "region"}
      aria-label={editando ? `Editar ${etiqueta}` : etiqueta}
      aria-describedby={editando ? idAyuda : undefined}
      aria-keyshortcuts={
        editando
          ? "ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown"
          : undefined
      }
    >
      {editando && (
        <button
          type="button"
          className="panel-widget-quitar"
          // El pointerdown del marco arranca el arrastre: sin frenarlo aqui,
          // quitar la tarjeta se convierte en un gesto de mover.
          onPointerDown={(evento) => evento.stopPropagation()}
          onClick={onQuitar}
          aria-label={`Quitar ${etiqueta}`}
        >
          <XIcon className="size-3.5" strokeWidth={2.25} />
        </button>
      )}
      {editando && seleccionado && medida && (
        <span className="panel-widget-medida" aria-live="polite">
          Ancho {medida.ancho}
          {" · "}
          Alto {medida.alto}
        </span>
      )}
      <div
        className="panel-widget-contenido h-full overflow-hidden [&>*]:h-full [&>*]:w-full"
        inert={editando}
        aria-hidden={editando || undefined}
      >
        {widget.contenido}
      </div>
      {children}
    </div>
  );
}
