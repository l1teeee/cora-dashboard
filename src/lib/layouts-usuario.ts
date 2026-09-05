import 'server-only'
// La admin key del backend nunca puede viajar al cliente: si un Client Component
// importa este modulo por accidente, el build falla.

import type { ItemLayout } from './tipos'

// El backend de CORA todavia no expone donde guardar la distribucion del panel.
// Esta variable es el interruptor: mientras no exista, la ruta de API responde
// 501 y el navegador se queda con su copia local. Cuando el endpoint exista,
// basta con definirla y estas dos funciones ya hacen el resto.
const RUTA_LAYOUTS = process.env.RAILWAY_LAYOUTS_PATH

export function persistenciaConfigurada(): boolean {
  return Boolean(RUTA_LAYOUTS)
}

async function pedir(ruta: string, init?: RequestInit): Promise<Response> {
  const base = process.env.RAILWAY_BACKEND_URL
  const adminKey = process.env.RAILWAY_ADMIN_KEY

  if (!base) throw new Error('Falta la variable de entorno RAILWAY_BACKEND_URL')
  if (!adminKey) throw new Error('Falta la variable de entorno RAILWAY_ADMIN_KEY')

  const baseSinBarra = base.replace(/\/+$/, '')

  return fetch(`${baseSinBarra}${ruta}`, {
    ...init,
    headers: { 'x-admin-key': adminKey, 'content-type': 'application/json', ...init?.headers },
    cache: 'no-store',
  })
}

const rutaDe = (usuarioId: string, panel: string) =>
  `${RUTA_LAYOUTS}/${encodeURIComponent(usuarioId)}/${encodeURIComponent(panel)}`

// Devuelve null cuando el usuario nunca guardo nada: es una respuesta legitima,
// no un error, y el cliente la traduce a "usa el layout por defecto".
export async function leerLayoutDeUsuario(
  usuarioId: string,
  panel: string
): Promise<ItemLayout[] | null> {
  if (!RUTA_LAYOUTS) throw new Error('Falta la variable de entorno RAILWAY_LAYOUTS_PATH')

  const res = await pedir(rutaDe(usuarioId, panel))
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const { items }: { items?: ItemLayout[] } = await res.json()
  return items ?? null
}

export async function guardarLayoutDeUsuario(
  usuarioId: string,
  panel: string,
  items: ItemLayout[]
): Promise<void> {
  if (!RUTA_LAYOUTS) throw new Error('Falta la variable de entorno RAILWAY_LAYOUTS_PATH')

  const res = await pedir(rutaDe(usuarioId, panel), {
    method: 'PUT',
    body: JSON.stringify({ items }),
  })

  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)
}
