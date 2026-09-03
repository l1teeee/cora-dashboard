import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { obtenerLlamadas } from '@/lib/cora-api'
import { calcularMetricas, filtrarPorFecha, filtrarPorRol } from '@/lib/metricas'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde') ?? undefined
    const hasta = searchParams.get('hasta') ?? undefined

    const todas = await obtenerLlamadas()
    const propias = filtrarPorRol(todas, sesion.user.rol, sesion.user.id)
    const llamadas = filtrarPorFecha(propias, desde, hasta)

    return NextResponse.json({
      llamadas,
      metricas: calcularMetricas(llamadas),
      rol: sesion.user.rol,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error consultando el backend de CORA' }, { status: 500 })
  }
}
