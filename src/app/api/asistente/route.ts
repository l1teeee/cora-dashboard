import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { leerAsistente, actualizarAsistente, ConflictoDeVersion } from '@/lib/vapi'
import { inyectarInstruccionKb, quitarInstruccionKb } from '@/lib/prompt-kb'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const refrescar = new URL(request.url).searchParams.get('refrescar') === '1'

  try {
    const config = await leerAsistente({ refrescar })
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
    const cambios: {
      nombre?: string
      firstMessage?: string
      systemPrompt?: string
      updatedAt?: string | null
    } = await request.json()

    // Lectura fresca: el detalle de auditoria tiene que registrar el valor que
    // realmente se esta reemplazando, no uno servido desde el cache del backend.
    const actual = await leerAsistente({ refrescar: true })
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

    const { auditoriaRegistrada, updatedAt } = await actualizarAsistente(
      {
        nombre: cambios.nombre,
        firstMessage: cambios.firstMessage,
        // El bloque de KB tiene que sobrevivir a las ediciones del admin: se reinyecta
        // aqui en vez de dejar que el admin lo borre sin darse cuenta.
        systemPrompt: cambios.systemPrompt !== undefined ? inyectarInstruccionKb(cambios.systemPrompt) : undefined,
        updatedAt: cambios.updatedAt,
      },
      sesion.user.name ?? sesion.user.id
    )

    return NextResponse.json({ ok: true, auditoriaRegistrada, updatedAt })
  } catch (error) {
    if (error instanceof ConflictoDeVersion) {
      return NextResponse.json(
        {
          error:
            'Otro administrador guardo cambios mientras tenias el formulario abierto. Recarga para ver la version actual.',
          conflicto: true,
          actualizadoEn: error.actualizadoEn,
        },
        { status: 409 }
      )
    }

    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
