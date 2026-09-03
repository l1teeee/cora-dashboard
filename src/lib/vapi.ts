import 'server-only'
// Protege la admin key del backend de CORA, no la private key de Vapi: esa ya no vive
// en este proyecto, solo en el backend de Railway. Si un Client Component importara
// este modulo por error, el build fallaria antes de exponer la clave al navegador.

export type AsistenteConfig = { id: string; nombre: string; firstMessage: string; systemPrompt: string }
export type ArchivoKb = { id: string; nombre: string; tamano: number | null; creado: string | null }

// El backend devuelve tambien voice/model/analysisPlan, que este dashboard no edita.
type AsistenteRespuesta = AsistenteConfig & { voice?: unknown; model?: unknown; analysisPlan?: unknown }

async function pedir(ruta: string, init?: RequestInit): Promise<Response> {
  const base = process.env.RAILWAY_BACKEND_URL
  const adminKey = process.env.RAILWAY_ADMIN_KEY

  if (!base) throw new Error('Falta la variable de entorno RAILWAY_BACKEND_URL')
  if (!adminKey) throw new Error('Falta la variable de entorno RAILWAY_ADMIN_KEY')

  const baseSinBarra = base.replace(/\/+$/, '')
  const headers = new Headers(init?.headers)
  headers.set('x-admin-key', adminKey)
  if (init?.body !== undefined) headers.set('Content-Type', 'application/json')

  return fetch(`${baseSinBarra}${ruta}`, {
    ...init,
    headers,
    cache: 'no-store', // los datos deben ser en vivo, nunca cacheados
  })
}

export async function leerAsistente(): Promise<AsistenteConfig> {
  const res = await pedir('/vapi/asistente')
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const asistente: AsistenteRespuesta = await res.json()
  return {
    id: asistente.id,
    nombre: asistente.nombre,
    firstMessage: asistente.firstMessage,
    systemPrompt: asistente.systemPrompt,
  }
}

export async function actualizarAsistente(cambios: {
  nombre?: string
  firstMessage?: string
  systemPrompt?: string
}): Promise<void> {
  const res = await pedir('/vapi/asistente', { method: 'PATCH', body: JSON.stringify(cambios) })
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)
}

export async function listarArchivos(): Promise<ArchivoKb[]> {
  const res = await pedir('/vapi/archivos')
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const { archivos }: { archivos: ArchivoKb[] } = await res.json()
  return archivos
}

export async function subirArchivo(archivo: File): Promise<ArchivoKb> {
  // Reenviar un multipart de un servicio a otro obliga a manejar el boundary a mano;
  // con ficheros de como mucho 300KB el base64 es mas simple y cabe de sobra en el
  // limite de 10MB del backend.
  const bytes = Buffer.from(await archivo.arrayBuffer()).toString('base64')

  const res = await pedir('/vapi/archivos', {
    method: 'POST',
    body: JSON.stringify({ nombre: archivo.name, tipo: archivo.type, base64: bytes }),
  })
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const { archivo: archivoSubido }: { ok: boolean; archivo: ArchivoKb } = await res.json()
  return archivoSubido
}

export async function eliminarArchivo(fileId: string): Promise<void> {
  const res = await pedir(`/vapi/archivos/${encodeURIComponent(fileId)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)
}

// El backend responde con un redirect 302 hacia una URL firmada de vida corta: hay que
// interceptarlo (redirect: 'manual') en vez de dejar que fetch lo siga.
export async function obtenerUrlGrabacion(callId: string): Promise<string | null> {
  const res = await pedir(`/vapi/grabacion/${encodeURIComponent(callId)}`, { redirect: 'manual' })

  if (res.status === 301 || res.status === 302 || res.status === 307) {
    return res.headers.get('location')
  }

  if (res.status === 404) return null

  throw new Error(`Backend CORA ${res.status} al pedir la grabacion`)
}
