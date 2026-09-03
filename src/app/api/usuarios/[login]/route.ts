import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { actualizarUsuario, desactivarUsuario, ErrorDeUsuarios } from '@/lib/usuarios-api'
import type { Rol } from '@/lib/usuarios'

export const dynamic = 'force-dynamic'

const LARGO_MINIMO_PASSWORD = 8

export async function PATCH(request: Request, { params }: { params: Promise<{ login: string }> }) {
  const { login } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const cuerpo: {
    nombre?: unknown
    rol?: unknown
    activo?: unknown
    password?: unknown
  } | null = await request.json().catch(() => null)

  if (!cuerpo) {
    return NextResponse.json({ error: 'El cuerpo de la peticion no es JSON valido.' }, { status: 400 })
  }

  const cambios: { nombre?: string; rol?: Rol; activo?: number; password?: string } = {}

  if (cuerpo.nombre !== undefined) {
    const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim() : ''
    if (nombre === '') {
      return NextResponse.json({ error: 'El nombre no puede estar vacio.' }, { status: 400 })
    }
    cambios.nombre = nombre
  }

  if (cuerpo.rol !== undefined) {
    if (cuerpo.rol !== 'admin' && cuerpo.rol !== 'agente') {
      return NextResponse.json({ error: 'El rol tiene que ser admin o agente.' }, { status: 400 })
    }
    cambios.rol = cuerpo.rol
  }

  if (cuerpo.activo !== undefined) {
    if (cuerpo.activo !== 0 && cuerpo.activo !== 1) {
      return NextResponse.json({ error: 'El estado activo tiene que ser 0 o 1.' }, { status: 400 })
    }
    cambios.activo = cuerpo.activo
  }

  // Una password vacia significa "no cambiar": el formulario de edicion la deja en
  // blanco cuando el admin solo quiere tocar el nombre o el rol.
  if (typeof cuerpo.password === 'string' && cuerpo.password !== '') {
    if (cuerpo.password.length < LARGO_MINIMO_PASSWORD) {
      return NextResponse.json(
        { error: `La contrasena tiene que tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.` },
        { status: 400 }
      )
    }
    cambios.password = cuerpo.password
  }

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ error: 'No hay ningun cambio que aplicar.' }, { status: 400 })
  }

  try {
    await actualizarUsuario(login, cambios, sesion.user.name ?? sesion.user.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ErrorDeUsuarios) {
      return NextResponse.json({ error: error.message }, { status: error.estado })
    }

    console.error(error)
    return NextResponse.json({ error: 'Error actualizando el usuario en el backend de CORA' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ login: string }> }) {
  const { login } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    await desactivarUsuario(login, sesion.user.name ?? sesion.user.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ErrorDeUsuarios) {
      return NextResponse.json({ error: error.message }, { status: error.estado })
    }

    console.error(error)
    return NextResponse.json({ error: 'Error desactivando el usuario en el backend de CORA' }, { status: 500 })
  }
}
