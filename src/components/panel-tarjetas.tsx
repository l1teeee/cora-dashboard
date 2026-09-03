"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode, Ref } from "react";
import { CheckIcon, PencilIcon, RotateCcwIcon } from "lucide-react";
import { GridLayout, useContainerWidth } from "react-grid-layout";
import type { Layout, LayoutItem, ResizeHandleAxis } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./panel-widgets.css";

import { Button } from "@/components/ui/button";
import {
  actualizarLayout,
  cargarLayout,
  esLayoutPorDefecto,
  guardarLayout,
  restablecerLayout,
  PANEL_ALTO_FILA,
  PANEL_ANCHO_MINIMO_ESCRITORIO,
  PANEL_COLUMNAS,
  PANEL_ESPACIO,
  type DefinicionPanel,
} from "@/lib/panel-layout";

export type Widget = {
  id: string;
  contenido: ReactNode;
  // Solo en la vista apilada de movil: los widgets anchos ocupan las dos columnas.
  anchoEnMovil?: boolean;
};

const configuracionGrid = {
  cols: PANEL_COLUMNAS,
  rowHeight: PANEL_ALTO_FILA,
  margin: [PANEL_ESPACIO, PANEL_ESPACIO] as const,
  containerPadding: [0, 0] as const,
};

const obtenerAlmacen = () => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

// react-resizable clona el elemento devuelto y le inyecta los eventos de
// mouse/touch. Por eso debe ser un nodo DOM directo: envolverlo en un componente
// que no propague esos props deja un tirador visible pero inerte.
function tiradorDeTamano(eje: ResizeHandleAxis, refTirador: Ref<HTMLElement>) {
  return (
    <span
      ref={refTirador as Ref<HTMLSpanElement>}
      className={`panel-resize-handle panel-resize-handle-${eje} react-resizable-handle react-resizable-handle-${eje}`}
      data-resize-axis={eje}
      aria-hidden="true"
    >
      <span className="panel-resize-handle-dot" />
    </span>
  );
}

export function PanelTarjetas({
  panel,
  widgets,
}: {
  panel: DefinicionPanel;
  widgets: Widget[];
}) {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true });
  const [layout, setLayout] = useState<LayoutItem[]>(() => cargarLayout(panel));
  const [anuncio, setAnuncio] = useState("");
  const [editando, setEditando] = useState(false);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const esEscritorio = mounted && width >= PANEL_ANCHO_MINIMO_ESCRITORIO;
  const hayLayoutPropio = !esLayoutPorDefecto(panel, layout);

  // localStorage no existe en el render del servidor: se lee tras el montaje para
  // no romper la hidratacion.
  useEffect(() => {
    setLayout(cargarLayout(panel, obtenerAlmacen()));
  }, [panel]);

  useEffect(() => {
    if (!esEscritorio && editando) {
      setEditando(false);
      setSeleccionado(null);
    }
  }, [esEscritorio, editando]);

  const persistirLayout = useCallback(
    (siguiente: Layout) => {
      const normalizado = siguiente.map((item) => ({ ...item }));
      setLayout(normalizado);
      guardarLayout(panel, normalizado, obtenerAlmacen());
    },
    [panel]
  );

  const alCambiarLayout = useCallback((siguiente: Layout) => {
    // Mantiene la previsualizacion fluida; el guardado ocurre al soltar el gesto.
    setLayout(siguiente.map((item) => ({ ...item })));
  }, []);

  const alTeclear = useCallback(
    (widgetId: string, evento: KeyboardEvent<HTMLDivElement>) => {
      const direccion = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[evento.key];
      if (!direccion || !editando) return;

      evento.preventDefault();
      evento.stopPropagation();

      const [horizontal, vertical] = direccion;
      const siguiente = actualizarLayout(
        layout,
        widgetId,
        evento.shiftKey
          ? { type: "resize", dw: horizontal, dh: vertical }
          : { type: "move", dx: horizontal, dy: vertical }
      );
      persistirLayout(siguiente);

      const accion = evento.shiftKey ? "Tamano actualizado" : "Posicion actualizada";
      setAnuncio(`${accion}: ${panel.etiquetas[widgetId] ?? widgetId}.`);
    },
    [editando, layout, panel.etiquetas, persistirLayout]
  );

  const hijos = useMemo(
    () =>
      widgets.map((widget) => (
        <div
          key={widget.id}
          data-widget-id={widget.id}
          className={`panel-widget-frame group relative h-full ${editando ? "panel-widget-frame-editando" : ""} ${seleccionado === widget.id ? "panel-widget-frame-seleccionado" : ""}`}
          onPointerDown={() => {
            if (editando) setSeleccionado(widget.id);
          }}
          onFocus={() => {
            if (editando) setSeleccionado(widget.id);
          }}
          onKeyDown={(evento) => alTeclear(widget.id, evento)}
          tabIndex={editando ? 0 : -1}
          role={editando ? "group" : "region"}
          aria-label={
            editando
              ? `Editar ${panel.etiquetas[widget.id] ?? widget.id}`
              : (panel.etiquetas[widget.id] ?? widget.id)
          }
          aria-describedby={editando ? `${panel.clave}-ayuda` : undefined}
          aria-keyshortcuts={
            editando
              ? "ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown"
              : undefined
          }
        >
          {editando && seleccionado === widget.id && (
            <span className="panel-widget-medida" aria-live="polite">
              Ancho {layout.find((item) => item.i === widget.id)?.w}
              {" · "}
              Alto {layout.find((item) => item.i === widget.id)?.h}
            </span>
          )}
          <div
            className="panel-widget-contenido h-full overflow-hidden [&>*]:h-full [&>*]:w-full"
            inert={editando}
            aria-hidden={editando || undefined}
          >
            {widget.contenido}
          </div>
        </div>
      )),
    [alTeclear, editando, layout, panel.clave, panel.etiquetas, seleccionado, widgets]
  );

  function restablecer() {
    persistirLayout(restablecerLayout(panel, obtenerAlmacen()));
    setAnuncio("Se restauro la distribucion original de los widgets.");
  }

  function entrarAEdicion() {
    if (!esEscritorio) return;
    setEditando(true);
    setSeleccionado(widgets[0]?.id ?? null);
    setAnuncio(
      "Edicion activa. Arrastra una tarjeta o usa los puntos laterales para cambiar su tamano."
    );
  }

  function terminarEdicion() {
    setEditando(false);
    setSeleccionado(null);
    setAnuncio("Distribucion guardada.");
  }

  return (
    <div className="space-y-4">
      <div className={`panel-toolbar ${editando ? "panel-toolbar-activa" : ""}`}>
        <div className="min-w-0">
          <p className="panel-toolbar-titulo">
            {editando ? "Edicion activa" : "Distribucion personalizable"}
          </p>
          <p id={`${panel.clave}-ayuda`} className="panel-toolbar-copy">
            {esEscritorio
              ? editando
                ? "Arrastra cualquier parte de una tarjeta para moverla. Usa los cuatro puntos laterales para cambiar ancho o alto."
                : "Personaliza el espacio de trabajo cuando lo necesites. Tus cambios se guardan automaticamente."
              : "En pantallas pequenas los widgets se muestran apilados. La personalizacion esta disponible en escritorio."}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {editando ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hayLayoutPropio}
                onClick={restablecer}
              >
                <RotateCcwIcon strokeWidth={1.75} />
                Restablecer
              </Button>
              <Button size="sm" onClick={terminarEdicion}>
                <CheckIcon strokeWidth={1.75} />
                Listo
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={!esEscritorio}
              onClick={entrarAEdicion}
              title={
                esEscritorio
                  ? "Editar la distribucion de widgets"
                  : "Disponible en escritorio"
              }
            >
              <PencilIcon strokeWidth={1.75} />
              Personalizar
            </Button>
          )}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {anuncio}
      </p>

      <div ref={containerRef} className="relative min-w-0">
        {esEscritorio ? (
          <GridLayout
            width={width}
            layout={layout}
            gridConfig={configuracionGrid}
            dragConfig={{
              enabled: editando,
              bounded: true,
              threshold: 8,
              cancel: ".panel-resize-handle",
            }}
            resizeConfig={{
              enabled: editando,
              handles: ["n", "e", "s", "w"],
              handleComponent: tiradorDeTamano,
            }}
            className={`panel-widget-grid ${editando ? "panel-widget-grid-editando" : ""}`}
            onLayoutChange={alCambiarLayout}
            onDragStop={(siguiente, _anterior, nuevo) => {
              persistirLayout(siguiente);
              if (nuevo) {
                setAnuncio(`Posicion actualizada: ${panel.etiquetas[nuevo.i] ?? nuevo.i}.`);
              }
            }}
            onResizeStart={(_siguiente, _anterior, nuevo) => {
              if (nuevo) setSeleccionado(nuevo.i);
            }}
            onResize={(siguiente, _anterior, nuevo) => {
              // Actualiza la insignia mientras se mueve el tirador; la persistencia
              // sigue ocurriendo unicamente al terminar.
              setLayout(siguiente.map((item) => ({ ...item })));
              if (nuevo) setSeleccionado(nuevo.i);
            }}
            onResizeStop={(siguiente, _anterior, nuevo) => {
              persistirLayout(siguiente);
              if (nuevo) {
                setAnuncio(`Tamano actualizado: ${panel.etiquetas[nuevo.i] ?? nuevo.i}.`);
              }
            }}
          >
            {hijos}
          </GridLayout>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                data-widget-id={widget.id}
                role="region"
                aria-label={panel.etiquetas[widget.id] ?? widget.id}
                tabIndex={-1}
                className={widget.anchoEnMovil ? "md:col-span-2" : ""}
              >
                {widget.contenido}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
