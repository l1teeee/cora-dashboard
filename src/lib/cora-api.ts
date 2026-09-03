import 'server-only'
// Garantiza que este modulo (y la admin key que maneja) nunca se empaquete en el
// bundle del cliente: si un Client Component lo importa por accidente, el build falla.

import type { Llamada, LlamadaDetalle } from './tipos'

type RespuestaLlamadas = {
  data: Llamada[]
  paginacion: { page: number; limit: number; total: number; totalPages: number }
}

async function pedir(ruta: string): Promise<Response> {
  const base = process.env.RAILWAY_BACKEND_URL
  const adminKey = process.env.RAILWAY_ADMIN_KEY

  if (!base) throw new Error('Falta la variable de entorno RAILWAY_BACKEND_URL')
  if (!adminKey) throw new Error('Falta la variable de entorno RAILWAY_ADMIN_KEY')

  const baseSinBarra = base.replace(/\/+$/, '')

  return fetch(`${baseSinBarra}${ruta}`, {
    headers: { 'x-admin-key': adminKey },
    cache: 'no-store', // los datos deben ser en vivo, nunca cacheados
  })
}

export async function obtenerLlamadas(): Promise<Llamada[]> {
  const llamadas: Llamada[] = []

  // Tope deliberado de 5 paginas (500 llamadas): es una demo y el backend no
  // filtra por agente, asi que hay que traer todo y filtrar en memoria despues.
  const TOPE_PAGINAS = 5

  for (let page = 1; page <= TOPE_PAGINAS; page++) {
    const res = await pedir(`/llamadas?page=${page}&limit=100`)
    if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

    const { data, paginacion }: RespuestaLlamadas = await res.json()
    llamadas.push(...data)

    if (paginacion.page >= paginacion.totalPages) break
  }

  return llamadas
}

export async function obtenerLlamada(callId: string): Promise<LlamadaDetalle | null> {
  const res = await pedir(`/llamadas/${encodeURIComponent(callId)}`)

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  return res.json()
}
