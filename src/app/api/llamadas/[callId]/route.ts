import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { obtenerLlamada } from '@/lib/cora-api'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const llamada = await obtenerLlamada(callId)

    if (!llamada) {
      return NextResponse.json({ error: 'Llamada no encontrada' }, { status: 404 })
    }

    // Control de acceso critico: sin esta comprobacion cualquier agente leeria
    // transcripciones ajenas con solo cambiar el call_id en la URL. No confiar
    // en nada que venga del cliente, la verificacion tiene que ser server-side.
    if (sesion.user.rol === 'agente' && llamada.usuario_asignado !== sesion.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json(llamada)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error consultando el backend de CORA' }, { status: 500 })
  }
}
