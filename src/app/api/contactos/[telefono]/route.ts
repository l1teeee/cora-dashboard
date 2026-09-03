import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { actualizarContacto, obtenerContacto, type FichaDeContacto } from '@/lib/contactos'

export const dynamic = 'force-dynamic'

// Regla unica de acceso, usada por la lectura y por la edicion. El admin entra siempre;
// el agente solo si esa persona lo llamo a el alguna vez. Duplicar esta condicion en las
// dos rutas seria suficiente para que una se quedara atras y abriera la agenda entera.
function puedeVer(ficha: FichaDeContacto, sesion: Session): boolean {
  if (esAdmin(sesion)) return true
  return ficha.llamadas.some((llamada) => llamada.usuario_asignado === sesion.user.id)
}

export async function GET(request: Request, { params }: { params: Promise<{ telefono: string }> }) {
  const { telefono } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const ficha = await obtenerContacto(telefono)

    if (!ficha) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    if (!puedeVer(ficha, sesion)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // El historial va completo, incluidas las llamadas que atendio otro asesor: quien
    // esta atendiendo a esta persona necesita saber que se le dijo antes, no solo lo suyo.
    return NextResponse.json(ficha)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error consultando el backend de CORA' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ telefono: string }> }) {
  const { telefono } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const ficha = await obtenerContacto(telefono)

    if (!ficha) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    }

    if (!puedeVer(ficha, sesion)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const cambios: { nombre?: string | null; notas?: string | null } = await request.json()

    const { auditoriaRegistrada } = await actualizarContacto(
      telefono,
      { nombre: cambios.nombre, notas: cambios.notas },
      sesion.user.name ?? sesion.user.id
    )

    return NextResponse.json({ ok: true, auditoriaRegistrada })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
