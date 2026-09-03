import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { revertirA } from '@/lib/vapi'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const idNumerico = Number(id)
  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    return NextResponse.json({ error: 'Id invalido' }, { status: 400 })
  }

  try {
    // NO se registra auditoria aqui: el backend la escribe dentro de la misma
    // operacion de reversion, junto con el snapshot de la config previa a revertir.
    const resultado = await revertirA(idNumerico, sesion.user.name ?? sesion.user.id)
    return NextResponse.json({ ok: true, ...resultado })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 502 })
  }
}
