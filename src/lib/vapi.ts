import 'server-only'

// El backend en Railway llama a esta misma clave VAPI_API_KEY. Se aceptan los dos nombres para
// que no haya que recordar cual usa cada proyecto: es el mismo valor, la private key de Vapi.
const FALTA_CLAVE = 'Falta la private key de Vapi: define VAPI_PRIVATE_KEY (o VAPI_API_KEY)'

function claveVapi(): string | undefined {
  return process.env.VAPI_PRIVATE_KEY ?? process.env.VAPI_API_KEY
}
// VAPI_PRIVATE_KEY nunca puede llegar al bundle del cliente: este import hace que el
// build falle si algun Client Component importa este modulo por error.

const VAPI_BASE = 'https://api.vapi.ai'

type VapiMensaje = { role: string; content: string }
type VapiModel = {
  messages?: VapiMensaje[]
  knowledgeBase?: { provider: string; fileIds: string[] }
  [clave: string]: unknown
}
type VapiAssistant = {
  id: string
  name?: string
  firstMessage?: string
  model?: VapiModel
}
type VapiFile = {
  id: string
  name?: string
  originalName?: string
  bytes?: number
  size?: number
  createdAt?: string
}

export type AsistenteConfig = { id: string; nombre: string; firstMessage: string; systemPrompt: string }
export type ArchivoKb = { id: string; nombre: string; tamano: number | null; creado: string | null }

async function pedirVapi<T = unknown>(ruta: string, init?: RequestInit): Promise<T> {
  const clavePrivada = claveVapi()
  if (!clavePrivada) throw new Error(FALTA_CLAVE)

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${clavePrivada}`)
  // FormData necesita que fetch calcule el boundary del multipart el solo; si se fija
  // Content-Type a mano aqui, el upload de archivos se rompe.
  if (!(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${VAPI_BASE}${ruta}`, { ...init, headers, cache: 'no-store' })

  if (!res.ok) {
    const texto = await res.text()
    throw new Error(`Vapi ${res.status}: ${texto.slice(0, 300)}`)
  }

  if (res.status === 204) return null as T
  return res.json()
}

let assistantIdCacheado: string | null = null

export async function obtenerAssistantId(): Promise<string> {
  if (assistantIdCacheado) return assistantIdCacheado

  const idFijo = process.env.VAPI_ASSISTANT_ID
  if (idFijo) {
    assistantIdCacheado = idFijo
    return assistantIdCacheado
  }

  const asistentes = await pedirVapi<VapiAssistant[]>('/assistant')
  const primero = asistentes[0]
  if (!primero) throw new Error('No hay ningun asistente configurado en Vapi')

  assistantIdCacheado = primero.id
  return assistantIdCacheado
}

export async function leerAsistente(): Promise<AsistenteConfig> {
  const id = await obtenerAssistantId()
  const asistente = await pedirVapi<VapiAssistant>(`/assistant/${id}`)

  const mensajeSistema = asistente.model?.messages?.find((m) => m.role === 'system')

  return {
    id: asistente.id,
    nombre: asistente.name ?? '',
    firstMessage: asistente.firstMessage ?? '',
    systemPrompt: mensajeSistema?.content ?? '',
  }
}

export async function actualizarAsistente(cambios: {
  nombre?: string
  firstMessage?: string
  systemPrompt?: string
}): Promise<void> {
  const id = await obtenerAssistantId()

  const body: { name?: string; firstMessage?: string; model?: VapiModel } = {}
  if (cambios.nombre !== undefined) body.name = cambios.nombre
  if (cambios.firstMessage !== undefined) body.firstMessage = cambios.firstMessage

  if (cambios.systemPrompt !== undefined) {
    // Vapi no soporta un PATCH parcial de `model`: mandar solo `messages` pisa el
    // resto de la configuracion del modelo (provider, temperatura, tools...). Por
    // eso hay que leer el modelo completo, tocar solo el mensaje de sistema, y
    // mandarlo de vuelta entero.
    const asistente = await pedirVapi<VapiAssistant>(`/assistant/${id}`)
    const model: VapiModel = { ...(asistente.model ?? {}) }
    const mensajes = [...(model.messages ?? [])]

    const indiceSistema = mensajes.findIndex((m) => m.role === 'system')
    if (indiceSistema >= 0) {
      mensajes[indiceSistema] = { ...mensajes[indiceSistema], content: cambios.systemPrompt }
    } else {
      mensajes.unshift({ role: 'system', content: cambios.systemPrompt })
    }

    model.messages = mensajes
    body.model = model
  }

  await pedirVapi(`/assistant/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

function mapearArchivo(a: VapiFile): ArchivoKb {
  return {
    id: a.id,
    nombre: a.name ?? a.originalName ?? a.id,
    tamano: a.bytes ?? a.size ?? null,
    creado: a.createdAt ?? null,
  }
}

// Vapi guarda las grabaciones en un bucket privado: la url_grabacion de nuestra base ya no es
// accesible. Este endpoint responde 302 hacia una URL firmada de vida corta, asi que hay que
// interceptar el redirect (redirect: 'manual') en vez de dejar que fetch lo siga.
export async function obtenerUrlGrabacion(callId: string): Promise<string | null> {
  const apiKey = claveVapi()

  if (!apiKey) throw new Error(FALTA_CLAVE)

  const res = await fetch(`https://api.vapi.ai/call/${encodeURIComponent(callId)}/stereo-recording`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    redirect: 'manual',
    cache: 'no-store',
  })

  if (res.status === 302 || res.status === 301 || res.status === 307) {
    return res.headers.get('location')
  }

  // 401/403/404: la grabacion no existe o no hay permiso. No es un fallo del servidor.
  if (res.status === 401 || res.status === 403 || res.status === 404) return null

  throw new Error(`Vapi ${res.status} al pedir la grabacion`)
}

export async function listarArchivos(): Promise<ArchivoKb[]> {
  const archivos = await pedirVapi<VapiFile[]>('/file')
  return archivos.map(mapearArchivo)
}

export async function subirArchivo(archivo: File): Promise<ArchivoKb> {
  const form = new FormData()
  form.append('file', archivo)

  const subido = await pedirVapi<VapiFile>('/file', { method: 'POST', body: form })
  return mapearArchivo(subido)
}

export async function eliminarArchivo(fileId: string): Promise<void> {
  await pedirVapi(`/file/${fileId}`, { method: 'DELETE' })
}

// La forma de vincular la knowledge base al asistente ha cambiado entre versiones de
// la API de Vapi: versiones nuevas usan `model.knowledgeBaseId` apuntando a un recurso
// /knowledge-base separado, versiones viejas usan `model.knowledgeBase.fileIds` inline.
// Esta funcion queda aislada a proposito para poder ajustarla solo aqui cuando se
// verifique el comportamiento real contra la API de Vapi.
export async function sincronizarKnowledgeBase(): Promise<void> {
  const id = await obtenerAssistantId()
  const [asistente, archivos] = await Promise.all([
    pedirVapi<VapiAssistant>(`/assistant/${id}`),
    pedirVapi<VapiFile[]>('/file'),
  ])

  const model: VapiModel = { ...(asistente.model ?? {}) }
  model.knowledgeBase = { provider: 'canonical', fileIds: archivos.map((a) => a.id) }

  await pedirVapi(`/assistant/${id}`, { method: 'PATCH', body: JSON.stringify({ model }) })
}
