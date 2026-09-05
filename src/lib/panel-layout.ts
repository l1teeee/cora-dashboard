// El subpath /core expone la matematica de la rejilla sin arrastrar React ni el
// DOM: entrando por la raiz del paquete, este modulo de dominio terminaria
// dependiendo del arbol de componentes.
import { moveElement, verticalCompactor } from 'react-grid-layout/core'
import type { Layout, LayoutItem } from 'react-grid-layout/core'

export const PANEL_COLUMNAS = 12
export const PANEL_ALTO_FILA = 24
export const PANEL_ESPACIO = 20
export const PANEL_ANCHO_MINIMO_ESCRITORIO = 900

// Cada vista del dashboard tiene sus propios widgets, asi que el layout se define
// por panel en vez de en constantes globales: admin y agente no comparten tarjetas
// ni pueden compartir la distribucion guardada.
export type DefinicionPanel = {
  clave: string
  etiquetas: Record<string, string>
  // Catalogo completo: cada widget que el panel sabe dibujar, con su geometria.
  layout: Layout
  // Los que se ven sin personalizar. El resto existe pero solo aparece en
  // "Agregar", para no cargar de golpe todas las graficas posibles.
  visiblesPorDefecto: string[]
}

export type AccionLayout =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'resize'; dw: number; dh: number }

// v2: los items dejaron de ser el catalogo completo. Los widgets que el usuario
// quita simplemente no se guardan, asi que la lista de items tambien define cuales
// estan visibles.
type LayoutGuardado = {
  version: 2
  items: Array<Pick<LayoutItem, 'i' | 'x' | 'y' | 'w' | 'h'>>
}

type AlmacenLectura = Pick<Storage, 'getItem'>
type AlmacenEscritura = Pick<Storage, 'setItem' | 'removeItem'>

// Las coordenadas del catalogo asumen que estan todos los widgets, asi que al
// quedarse solo con los visibles hay que compactar o el panel abre con huecos.
const clonarPorDefecto = (panel: DefinicionPanel): LayoutItem[] => {
  const visibles = panel.layout
    .filter((item) => panel.visiblesPorDefecto.includes(item.i))
    .map((item) => ({ ...item }))

  return verticalCompactor.compact(visibles, PANEL_COLUMNAS).map((item) => ({ ...item }))
}

const esEnteroFinito = (valor: unknown): valor is number =>
  typeof valor === 'number' && Number.isFinite(valor) && Number.isInteger(valor)

// Un layout guardado puede venir de una version anterior, de otra pantalla o
// manipulado a mano. Si algo no cuadra se descarta entero y valen los defaults:
// medio layout restaurado deja tarjetas encimadas o fuera de la rejilla.
function restaurarConLimites(
  panel: DefinicionPanel,
  items: LayoutGuardado['items']
): LayoutItem[] | null {
  if (items.length > panel.layout.length) return null

  const restaurado: LayoutItem[] = []
  const vistos = new Set<string>()

  for (const item of items) {
    if (vistos.has(item.i)) return null
    vistos.add(item.i)

    const defecto = panel.layout.find((candidato) => candidato.i === item.i)
    if (!defecto) return null

    const valoresValidos = [item.x, item.y, item.w, item.h].every(esEnteroFinito)
    if (!valoresValidos || item.x < 0 || item.y < 0 || item.y > 200 || item.w < 1 || item.h < 1) {
      return null
    }

    const minW = defecto.minW ?? 1
    const minH = defecto.minH ?? 1
    const maxW = defecto.maxW ?? PANEL_COLUMNAS
    const maxH = defecto.maxH ?? Number.POSITIVE_INFINITY

    if (
      item.w < minW ||
      item.w > maxW ||
      item.h < minH ||
      item.h > maxH ||
      item.x + item.w > PANEL_COLUMNAS
    ) {
      return null
    }

    restaurado.push({ ...defecto, x: item.x, y: item.y, w: item.w, h: item.h })
  }

  return verticalCompactor.compact(restaurado, PANEL_COLUMNAS).map((item) => ({ ...item }))
}

export function cargarLayout(panel: DefinicionPanel, almacen?: AlmacenLectura): LayoutItem[] {
  if (!almacen) return clonarPorDefecto(panel)

  try {
    const crudo = almacen.getItem(panel.clave)
    if (!crudo) return clonarPorDefecto(panel)

    const parseado = JSON.parse(crudo) as Partial<LayoutGuardado>
    if (parseado.version !== 2 || !Array.isArray(parseado.items)) return clonarPorDefecto(panel)

    return restaurarConLimites(panel, parseado.items as LayoutGuardado['items'])
      ?? clonarPorDefecto(panel)
  } catch {
    return clonarPorDefecto(panel)
  }
}

export function guardarLayout(
  panel: DefinicionPanel,
  layout: Layout,
  almacen?: AlmacenEscritura
): void {
  if (!almacen) return

  const payload: LayoutGuardado = {
    version: 2,
    items: layout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })),
  }

  try {
    almacen.setItem(panel.clave, JSON.stringify(payload))
  } catch {
    // El dashboard sigue siendo utilizable aunque el navegador bloquee localStorage.
  }
}

export function esLayoutPorDefecto(panel: DefinicionPanel, layout: Layout): boolean {
  const defecto = clonarPorDefecto(panel)
  if (layout.length !== defecto.length) return false

  return defecto.every((esperado) => {
    const item = layout.find((candidato) => candidato.i === esperado.i)
    return Boolean(
      item &&
        item.x === esperado.x &&
        item.y === esperado.y &&
        item.w === esperado.w &&
        item.h === esperado.h
    )
  })
}

export function restablecerLayout(
  panel: DefinicionPanel,
  almacen?: AlmacenEscritura
): LayoutItem[] {
  try {
    almacen?.removeItem(panel.clave)
  } catch {
    // sin persistencia igual queda restablecido en pantalla
  }

  return clonarPorDefecto(panel)
}

export function actualizarLayout(
  layout: Layout,
  widgetId: string,
  accion: AccionLayout
): LayoutItem[] {
  const clonado = layout.map((item) => ({ ...item }))
  const item = clonado.find((candidato) => candidato.i === widgetId)
  if (!item) return clonado

  if (accion.type === 'move') {
    const x = Math.max(0, Math.min(PANEL_COLUMNAS - item.w, item.x + accion.dx))
    const y = Math.max(0, item.y + accion.dy)
    if (x === item.x && y === item.y) return clonado

    const movido = moveElement(clonado, item, x, y, true, false, 'vertical', PANEL_COLUMNAS, false)
    return verticalCompactor.compact(movido, PANEL_COLUMNAS).map((candidato) => ({ ...candidato }))
  }

  const minW = item.minW ?? 1
  const minH = item.minH ?? 1
  const maxW = Math.min(item.maxW ?? PANEL_COLUMNAS, PANEL_COLUMNAS - item.x)
  const maxH = item.maxH ?? Number.POSITIVE_INFINITY
  const w = Math.max(minW, Math.min(maxW, item.w + accion.dw))
  const h = Math.max(minH, Math.min(maxH, item.h + accion.dh))
  if (w === item.w && h === item.h) return clonado

  item.w = w
  item.h = h
  return verticalCompactor.compact(clonado, PANEL_COLUMNAS).map((candidato) => ({ ...candidato }))
}

export function widgetsOcultos(panel: DefinicionPanel, layout: Layout): string[] {
  const visibles = new Set(layout.map((item) => item.i))
  return panel.layout.filter((defecto) => !visibles.has(defecto.i)).map((defecto) => defecto.i)
}

export function quitarWidget(layout: Layout, widgetId: string): LayoutItem[] {
  const restantes = layout
    .filter((item) => item.i !== widgetId)
    .map((item) => ({ ...item }))

  return verticalCompactor.compact(restantes, PANEL_COLUMNAS).map((item) => ({ ...item }))
}

export function agregarWidget(
  panel: DefinicionPanel,
  layout: Layout,
  widgetId: string
): LayoutItem[] {
  const clonado = layout.map((item) => ({ ...item }))
  if (clonado.some((item) => item.i === widgetId)) return clonado

  const defecto = panel.layout.find((item) => item.i === widgetId)
  if (!defecto) return clonado

  // Entra debajo de todo lo demas para no desplazar lo que el usuario ya coloco.
  const primeraFilaLibre = clonado.reduce((maximo, item) => Math.max(maximo, item.y + item.h), 0)
  clonado.push({ ...defecto, x: 0, y: primeraFilaLibre })

  return verticalCompactor.compact(clonado, PANEL_COLUMNAS).map((item) => ({ ...item }))
}

export const PANEL_ADMIN: DefinicionPanel = {
  // v3: el formato guardado paso a admitir subconjuntos de widgets. Un layout v2 no
  // distingue "widget quitado" de "widget faltante", asi que se descarta al cargar.
  clave: 'cora-dashboard:layout-admin:v3',
  etiquetas: {
    total: 'Total de llamadas',
    exito: 'Tasa de exito',
    duracion: 'Duracion promedio',
    costo: 'Costo total',
    transferencias: 'Transferencias fallidas',
    'sin-asignar': 'Sin asignar',
    recurrentes: 'Personas que repiten',
    'por-hora': 'Llamadas por hora',
    carga: 'Carga por asesor',
    finalizacion: 'Finalizacion de llamadas',
    ultimas: 'Ultimas llamadas',
    tendencia: 'Llamadas por dia',
    'costo-dia': 'Costo por dia',
    'duracion-rangos': 'Duracion por rangos',
    'dia-semana': 'Llamadas por dia de la semana',
  },
  visiblesPorDefecto: [
    'total',
    'exito',
    'duracion',
    'costo',
    'transferencias',
    'sin-asignar',
    'recurrentes',
    'por-hora',
    'carga',
    'finalizacion',
    'ultimas',
  ],
  // Los minimos dejan al menos dos pasos de reduccion desde la vista inicial, para
  // que cada tarjeta se pueda ensanchar, estrechar, alargar y acortar de verdad.
  layout: [
    { i: 'total', x: 0, y: 0, w: 6, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'exito', x: 6, y: 0, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'duracion', x: 9, y: 0, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'costo', x: 0, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'transferencias', x: 3, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'sin-asignar', x: 6, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'recurrentes', x: 9, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'por-hora', x: 0, y: 10, w: 8, h: 10, minW: 4, minH: 7, maxW: 12, maxH: 20 },
    { i: 'carga', x: 8, y: 10, w: 4, h: 10, minW: 3, minH: 7, maxW: 12, maxH: 20 },
    { i: 'finalizacion', x: 0, y: 20, w: 12, h: 12, minW: 4, minH: 7, maxW: 12, maxH: 24 },
    { i: 'ultimas', x: 0, y: 32, w: 12, h: 13, minW: 4, minH: 7, maxW: 12, maxH: 26 },
    { i: 'tendencia', x: 0, y: 45, w: 6, h: 10, minW: 4, minH: 7, maxW: 12, maxH: 20 },
    { i: 'costo-dia', x: 6, y: 45, w: 6, h: 10, minW: 4, minH: 7, maxW: 12, maxH: 20 },
    { i: 'duracion-rangos', x: 0, y: 55, w: 6, h: 10, minW: 4, minH: 7, maxW: 12, maxH: 20 },
    { i: 'dia-semana', x: 6, y: 55, w: 6, h: 10, minW: 4, minH: 7, maxW: 12, maxH: 20 },
  ],
}

export const PANEL_AGENTE: DefinicionPanel = {
  clave: 'cora-dashboard:layout-agente:v3',
  etiquetas: {
    mias: 'Mis llamadas',
    seguimiento: 'Pendientes de seguimiento',
    quejas: 'Quejas',
    'sin-resumen': 'Esperando resumen',
    personas: 'Personas atendidas',
    duracion: 'Duracion promedio',
    pendientes: 'Llamadas pendientes de seguimiento',
    recientes: 'Mis llamadas recientes',
  },
  visiblesPorDefecto: [
    'mias',
    'seguimiento',
    'quejas',
    'sin-resumen',
    'personas',
    'duracion',
    'pendientes',
    'recientes',
  ],
  layout: [
    { i: 'mias', x: 0, y: 0, w: 6, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'seguimiento', x: 6, y: 0, w: 6, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'quejas', x: 0, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'sin-resumen', x: 3, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'personas', x: 6, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'duracion', x: 9, y: 5, w: 3, h: 5, minW: 3, minH: 4, maxW: 12, maxH: 12 },
    { i: 'pendientes', x: 0, y: 10, w: 12, h: 11, minW: 4, minH: 7, maxW: 12, maxH: 24 },
    { i: 'recientes', x: 0, y: 21, w: 12, h: 13, minW: 4, minH: 7, maxW: 12, maxH: 26 },
  ],
}
