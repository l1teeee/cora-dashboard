import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { leerAuditoria } from '@/lib/auditoria'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const accion = searchParams.get('accion')

    const resultado = await leerAuditoria({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      accion: accion ?? undefined,
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
