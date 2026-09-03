import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { eliminarArchivo, sincronizarKnowledgeBase } from '@/lib/vapi'
import { guardarAuditoria } from '@/lib/auditoria'

export const dynamic = 'force-dynamic'

export async function DELETE(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    await eliminarArchivo(fileId)
    await sincronizarKnowledgeBase()

    const usuario = sesion.user.name ?? sesion.user.id
    const auditoriaRegistrada = await guardarAuditoria(usuario, 'elimino_archivo', { fileId })

    return NextResponse.json({ ok: true, auditoriaRegistrada })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
