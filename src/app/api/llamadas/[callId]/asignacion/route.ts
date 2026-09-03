import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { listarAsignables } from '@/lib/usuarios'
import { asignarLlamada, ErrorDeUsuarios } from '@/lib/usuarios-api'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const cuerpo: { asignadoA?: unknown } | null = await request.json().catch(() => null)

  if (!cuerpo) {
    return NextResponse.json({ error: 'El cuerpo de la peticion no es JSON valido.' }, { status: 400 })
  }

  const asignadoA = cuerpo.asignadoA

  if (asignadoA !== null && typeof asignadoA !== 'string') {
    return NextResponse.json(
      { error: 'asignadoA tiene que ser el login de un agente o null.' },
      { status: 400 }
    )
  }

  // Sin esta comprobacion un admin podria escribir cualquier cadena y dejar la
  // llamada asignada a alguien que no existe, invisible para todos.
  if (asignadoA !== null) {
    const asignables = await listarAsignables()
    if (!asignables.some((asignable) => asignable.id === asignadoA)) {
      return NextResponse.json(
        { error: 'Ese usuario no existe o no esta activo como agente.' },
        { status: 400 }
      )
    }
  }

  try {
    const { auditoriaRegistrada } = await asignarLlamada(
      callId,
      asignadoA,
      sesion.user.name ?? sesion.user.id
    )

    return NextResponse.json({ ok: true, auditoriaRegistrada })
  } catch (error) {
    if (error instanceof ErrorDeUsuarios) {
      return NextResponse.json({ error: error.message }, { status: error.estado })
    }

    console.error(error)
    return NextResponse.json({ error: 'Error asignando la llamada en el backend de CORA' }, { status: 500 })
  }
}
