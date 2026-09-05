"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, Ref } from "react";
import { GridLayout, useContainerWidth } from "react-grid-layout";
import type { Layout, LayoutItem, ResizeHandleAxis } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./panel-widgets.css";

import { WidgetTarjeta } from "@/components/panel-tarjetas/widget-tarjeta";
import type { Widget } from "@/components/panel-tarjetas/tipos";
import { BarraPersonalizacion } from "@/components/panel-tarjetas/barra-personalizacion";
import {
  actualizarLayout,
  agregarWidget,
  cargarLayout,
  esLayoutPorDefecto,
  restaurarLayout,
  guardarLayout,
  quitarWidget,
  restablecerLayout,
  widgetsOcultos,
  PANEL_ALTO_FILA,
  PANEL_ANCHO_MINIMO_ESCRITORIO,
  PANEL_COLUMNAS,
  PANEL_ESPACIO,
  type DefinicionPanel,
} from "@/lib/panel-layout";
import { guardarLayoutRemoto, leerLayoutRemoto } from "@/lib/sincronizar-layout";

export type { Widget };

const ESPERA_GUARDADO_REMOTO_MS = 800;

// Lo que dura el resalte del widget recien agregado: suficiente para encontrarlo
// con la vista despues del scroll, corto para no quedarse parpadeando.
const DURACION_RESALTE_MS = 2600;

// react-grid-layout anima la posicion de cada tarjeta 200ms (css/styles.css). Antes
// de que termine, el nodo todavia mide desde su posicion vieja y el scroll apunta
// al lugar equivocado.
const ESPERA_COLOCACION_MS = 260;

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
  const [recienAgregado, setRecienAgregado] = useState<string | null>(null);
  const envioPendiente = useRef<ReturnType<typeof setTimeout> | null>(null);

  const esEscritorio = mounted && width >= PANEL_ANCHO_MINIMO_ESCRITORIO;
  const hayLayoutPropio = !esLayoutPorDefecto(panel, layout);
  const ocultos = widgetsOcultos(panel, layout);

  const visibles = useMemo(() => {
    const posicion = new Map(layout.map((item, indice) => [item.i, indice]));
    return widgets
      .filter((widget) => posicion.has(widget.id))
      .sort((a, b) => (posicion.get(a.id) ?? 0) - (posicion.get(b.id) ?? 0));
  }, [layout, widgets]);

  // localStorage no existe en el render del servidor: se lee tras el montaje para
  // no romper la hidratacion. La copia del servidor llega despues y pisa a la
  // local, que es la que hace que el panel pinte sin esperar a la red.
  useEffect(() => {
    setLayout(cargarLayout(panel, obtenerAlmacen()));

    let vigente = true;
    leerLayoutRemoto(panel.clave).then((items) => {
      if (!vigente || !items) return;

      const restaurado = restaurarLayout(panel, items);
      if (restaurado) setLayout(restaurado);
    });

    return () => {
      vigente = false;
    };
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

      // Cada arrastre y cada tecla llaman aqui: sin la espera, mover una tarjeta
      // dispararia una peticion por fotograma del gesto.
      if (envioPendiente.current) clearTimeout(envioPendiente.current);
      envioPendiente.current = setTimeout(() => {
        guardarLayoutRemoto(
          panel.clave,
          normalizado.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
        );
      }, ESPERA_GUARDADO_REMOTO_MS);
    },
    [panel]
  );

  useEffect(() => () => {
    if (envioPendiente.current) clearTimeout(envioPendiente.current);
  }, []);

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

  const quitar = useCallback(
    (widgetId: string) => {
      persistirLayout(quitarWidget(layout, widgetId));
      setSeleccionado((actual) => (actual === widgetId ? null : actual));
      setAnuncio(`${panel.etiquetas[widgetId] ?? widgetId} se quito del panel.`);
    },
    [layout, panel.etiquetas, persistirLayout]
  );

  const agregar = useCallback(
    (widgetId: string) => {
      persistirLayout(agregarWidget(panel, layout, widgetId));
      setSeleccionado(widgetId);
      setRecienAgregado(widgetId);
      setAnuncio(`${panel.etiquetas[widgetId] ?? widgetId} se agrego al panel.`);
    },
    [layout, panel, persistirLayout]
  );

  // El widget entra al final del panel, casi siempre fuera de pantalla. La rejilla
  // es duena del ref de cada tarjeta, asi que aqui se busca el nodo por su atributo
  // en vez de disputarle esa referencia.
  useEffect(() => {
    if (!recienAgregado) return;

    const colocacion = setTimeout(() => {
      const nodo = document.querySelector(`[data-widget-id="${recienAgregado}"]`);
      nodo?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, ESPERA_COLOCACION_MS);

    const temporizador = setTimeout(() => setRecienAgregado(null), DURACION_RESALTE_MS);

    return () => {
      clearTimeout(colocacion);
      clearTimeout(temporizador);
    };
  }, [recienAgregado]);

  const hijos = useMemo(
    () =>
      visibles.map((widget) => {
        const item = layout.find((elemento) => elemento.i === widget.id);
        return (
          <WidgetTarjeta
            key={widget.id}
            widget={widget}
            etiqueta={panel.etiquetas[widget.id] ?? widget.id}
            editando={editando}
            seleccionado={seleccionado === widget.id}
            esNuevo={recienAgregado === widget.id}
            medida={item ? { ancho: item.w, alto: item.h } : undefined}
            idAyuda={`${panel.clave}-ayuda`}
            onSeleccionar={() => setSeleccionado(widget.id)}
            onQuitar={() => quitar(widget.id)}
            onTeclear={(evento) => alTeclear(widget.id, evento)}
          />
        );
      }),
    [
      alTeclear,
      editando,
      layout,
      panel.clave,
      panel.etiquetas,
      quitar,
      recienAgregado,
      seleccionado,
      visibles,
    ]
  );

  function restablecer() {
    persistirLayout(restablecerLayout(panel, obtenerAlmacen()));
    setAnuncio("Se restauro la distribucion original de los widgets.");
  }

  function entrarAEdicion() {
    if (!esEscritorio) return;
    setEditando(true);
    setSeleccionado(visibles[0]?.id ?? null);
    setAnuncio(
      "Edicion activa. Arrastra una tarjeta para moverla, usa los puntos laterales para cambiar su tamano o la X para quitarla."
    );
  }

  function terminarEdicion() {
    setEditando(false);
    setSeleccionado(null);
    setAnuncio("Distribucion guardada.");
  }

  return (
    <div className="space-y-4">
      <BarraPersonalizacion
        editando={editando}
        esEscritorio={esEscritorio}
        ocultos={ocultos}
        etiquetas={panel.etiquetas}
        hayLayoutPropio={hayLayoutPropio}
        idAyuda={`${panel.clave}-ayuda`}
        onAgregar={agregar}
        onRestablecer={restablecer}
        onTerminar={terminarEdicion}
        onEntrarAEdicion={entrarAEdicion}
      />

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
              cancel: ".panel-resize-handle,.panel-widget-quitar",
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
            {visibles.map((widget) => (
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
