import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { leerAsistente, actualizarAsistente } from '@/lib/vapi'
import { inyectarInstruccionKb, quitarInstruccionKb } from '@/lib/prompt-kb'
import { guardarAuditoria } from '@/lib/auditoria'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const config = await leerAsistente()
    return NextResponse.json({ ...config, systemPrompt: quitarInstruccionKb(config.systemPrompt) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const cambios: { nombre?: string; firstMessage?: string; systemPrompt?: string } = await request.json()
    const actual = await leerAsistente()
    const promptHumanoActual = quitarInstruccionKb(actual.systemPrompt)

    // Solo se audita lo que realmente cambia, comparado contra el prompt sin el
    // bloque de KB (que es lo que el admin ve y edita en el formulario).
    const detalle: Record<string, { antes: string; despues: string }> = {}

    if (cambios.nombre !== undefined && cambios.nombre !== actual.nombre) {
      detalle.nombre = { antes: actual.nombre, despues: cambios.nombre }
    }
    if (cambios.firstMessage !== undefined && cambios.firstMessage !== actual.firstMessage) {
      detalle.firstMessage = { antes: actual.firstMessage, despues: cambios.firstMessage }
    }
    if (cambios.systemPrompt !== undefined && cambios.systemPrompt !== promptHumanoActual) {
      detalle.systemPrompt = { antes: promptHumanoActual, despues: cambios.systemPrompt }
    }

    if (Object.keys(detalle).length === 0) {
      return NextResponse.json({ ok: true, sinCambios: true })
    }

    await actualizarAsistente({
      nombre: cambios.nombre,
      firstMessage: cambios.firstMessage,
      // El bloque de KB tiene que sobrevivir a las ediciones del admin: se reinyecta
      // aqui en vez de dejar que el admin lo borre sin darse cuenta.
      systemPrompt: cambios.systemPrompt !== undefined ? inyectarInstruccionKb(cambios.systemPrompt) : undefined,
    })

    const auditoriaRegistrada = await guardarAuditoria(sesion.user.name ?? sesion.user.id, 'edito_asistente', detalle)

    return NextResponse.json({ ok: true, auditoriaRegistrada })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
