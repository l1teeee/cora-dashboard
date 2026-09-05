import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  guardarLayoutDeUsuario,
  leerLayoutDeUsuario,
  persistenciaConfigurada,
} from '@/lib/layouts-usuario'
import type { ItemLayout } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

// Tope holgado sobre el catalogo mas grande. Existe para que un cuerpo enorme no
// llegue al backend, no para validar el panel: de eso se encarga el cliente, que
// es el unico que conoce el catalogo y los limites de cada widget.
const MAXIMO_ITEMS = 40

const esEnteroEnRango = (valor: unknown, maximo: number): valor is number =>
  typeof valor === 'number' && Number.isInteger(valor) && valor >= 0 && valor <= maximo

function parsearItems(cuerpo: unknown): ItemLayout[] | null {
  if (typeof cuerpo !== 'object' || cuerpo === null) return null

  const { items } = cuerpo as { items?: unknown }
  if (!Array.isArray(items) || items.length > MAXIMO_ITEMS) return null

  const validos: ItemLayout[] = []

  for (const item of items) {
    if (typeof item !== 'object' || item === null) return null

    const { i, x, y, w, h } = item as Record<string, unknown>
    if (typeof i !== 'string' || i.length === 0 || i.length > 64) return null
    if (!esEnteroEnRango(x, 12) || !esEnteroEnRango(y, 200)) return null
    if (!esEnteroEnRango(w, 12) || !esEnteroEnRango(h, 40)) return null
    if (w === 0 || h === 0) return null

    validos.push({ i, x, y, w, h })
  }

  return validos
}

// El panel viaja en la ruta, pero el usuario sale de la sesion y nunca del cliente:
// si no, cualquiera podria leer o pisar la distribucion de otra cuenta.
export async function GET(_request: Request, { params }: { params: Promise<{ panel: string }> }) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!persistenciaConfigurada()) {
    return NextResponse.json({ error: 'Persistencia de layout no configurada' }, { status: 501 })
  }

  const { panel } = await params

  try {
    const items = await leerLayoutDeUsuario(sesion.user.id, panel)
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Fallo leyendo el layout del panel', error)
    return NextResponse.json({ error: 'Error consultando el backend de CORA' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ panel: string }> }) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!persistenciaConfigurada()) {
    return NextResponse.json({ error: 'Persistencia de layout no configurada' }, { status: 501 })
  }

  const cuerpo = await request.json().catch(() => null)
  const items = parsearItems(cuerpo)

  if (items === null) {
    return NextResponse.json({ error: 'Layout invalido' }, { status: 400 })
  }

  const { panel } = await params

  try {
    await guardarLayoutDeUsuario(sesion.user.id, panel, items)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Fallo guardando el layout del panel', error)
    return NextResponse.json({ error: 'Error consultando el backend de CORA' }, { status: 500 })
  }
}
