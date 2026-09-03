import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { listarContactos } from '@/lib/contactos'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  // El listado es la agenda completa de telefonos y nombres de estudiantes: un
  // agente solo puede llegar a un contacto suyo por su ficha, nunca a la lista.
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const q = searchParams.get('q')

    const resultado = await listarContactos({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      q: q ?? undefined,
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
