import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { leerAsistente, actualizarAsistente, listarArchivos, subirArchivo, sincronizarKnowledgeBase } from '@/lib/vapi'
import { inyectarInstruccionKb } from '@/lib/prompt-kb'
import { guardarAuditoria } from '@/lib/auditoria'

export const dynamic = 'force-dynamic'

const EXTENSIONES_PERMITIDAS = ['pdf', 'docx', 'txt']

// Vapi (via el navegador de quien sube) manda mimetypes distintos para el mismo tipo
// de archivo segun el SO/navegador; la lista cubre las variantes conocidas mas un
// mimetype generico que algunos navegadores usan como fallback.
const MIMES_PERMITIDOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'application/octet-stream',
]

const TAMANO_MAXIMO_BYTES = 300 * 1024

export async function GET() {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    return NextResponse.json({ archivos: await listarArchivos() })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const form = await request.formData()
    const archivo = form.get('archivo')

    // No confiar en el frontend: la validacion real de tipo y tamano se hace aqui.
    if (!(archivo instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo a subir' }, { status: 400 })
    }

    const extension = archivo.name.split('.').pop()?.toLowerCase() ?? ''
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      return NextResponse.json(
        { error: `Extension no permitida: .${extension || '(sin extension)'}. Usa pdf, docx o txt.` },
        { status: 400 }
      )
    }

    if (archivo.type && !MIMES_PERMITIDOS.includes(archivo.type)) {
      return NextResponse.json({ error: `Tipo de archivo no permitido: ${archivo.type}` }, { status: 400 })
    }

    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      return NextResponse.json(
        { error: `El archivo supera el tamaño maximo permitido de ${TAMANO_MAXIMO_BYTES / 1024} KB` },
        { status: 400 }
      )
    }

    const archivoSubido = await subirArchivo(archivo)
    await sincronizarKnowledgeBase()

    const actual = await leerAsistente()
    const promptConKb = inyectarInstruccionKb(actual.systemPrompt)
    if (promptConKb !== actual.systemPrompt) {
      await actualizarAsistente({ systemPrompt: promptConKb })
    }

    const usuario = sesion.user.name ?? sesion.user.id
    const auditoriaRegistrada = await guardarAuditoria(usuario, 'subio_archivo', {
      nombre: archivoSubido.nombre,
      tamano: archivoSubido.tamano,
      fileId: archivoSubido.id,
    })

    return NextResponse.json({ ok: true, archivo: archivoSubido, auditoriaRegistrada }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
}
