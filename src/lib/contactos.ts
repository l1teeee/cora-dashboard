import 'server-only'
// Protege la admin key del backend de CORA: si un Client Component importara este
// modulo por error, el build fallaria antes de exponer la clave al navegador.

import type { Llamada } from './tipos'

export type Contacto = {
  id: number
  telefono: string
  nombre: string | null
  notas: string | null
  primera_llamada: string | null
  ultima_llamada: string | null
  total_llamadas: number
}

export type Paginacion = { page: number; limit: number; total: number; totalPages: number }

// El backend agrega estos tres campos a las llamadas que devuelve la ficha del
// contacto; el tipo compartido de Llamada todavia no los declara.
export type LlamadaDeContacto = Llamada & {
  nombre_capturado: string | null
  motivo: string | null
  requiere_seguimiento: number | null
}

export type FichaDeContacto = { contacto: Contacto; llamadas: LlamadaDeContacto[] }

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

export async function listarContactos(
  params: { page?: number; limit?: number; q?: string } = {}
): Promise<{ data: Contacto[]; paginacion: Paginacion }> {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.q !== undefined) query.set('q', params.q)

  const cadena = query.toString()
  const res = await pedir(`/contactos${cadena === '' ? '' : `?${cadena}`}`)
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  return res.json()
}

export async function obtenerContacto(telefono: string): Promise<FichaDeContacto | null> {
  const res = await pedir(`/contactos/${encodeURIComponent(telefono)}`)

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  return res.json()
}

export async function actualizarContacto(
  telefono: string,
  cambios: { nombre?: string | null; notas?: string | null },
  usuario: string
): Promise<{ auditoriaRegistrada: boolean }> {
  const res = await pedir(`/contactos/${encodeURIComponent(telefono)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...cambios, usuario }),
  })
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const respuesta: { ok: boolean; auditoriaRegistrada: boolean } = await res.json()
  return { auditoriaRegistrada: respuesta.auditoriaRegistrada }
}
