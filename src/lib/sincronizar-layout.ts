import type { ItemLayout } from './tipos'

// localStorage sigue siendo la copia inmediata: pinta sin esperar a la red y
// mantiene el panel usable si el backend no responde. Estas dos funciones son la
// capa de arriba, la que hace que la distribucion siga al usuario entre equipos.
//
// Mientras el backend no tenga donde guardarla, la ruta responde 501. Eso no es
// un fallo: es "todavia no hay servidor", y el panel sigue funcionando en local.

const ruta = (panel: string) => `/api/panel-layout/${encodeURIComponent(panel)}`

export async function leerLayoutRemoto(panel: string): Promise<ItemLayout[] | null> {
  try {
    const res = await fetch(ruta(panel), { cache: 'no-store' })
    if (!res.ok) return null

    const { items }: { items?: ItemLayout[] | null } = await res.json()
    return items ?? null
  } catch {
    return null
  }
}

export async function guardarLayoutRemoto(panel: string, items: ItemLayout[]): Promise<void> {
  try {
    const res = await fetch(ruta(panel), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items }),
    })

    // 501 mientras el backend no tenga donde guardar, 401 cuando la sesion vencio
    // con la pestana abierta. Ninguno es un fallo: el panel sigue con su copia
    // local. El resto de codigos si son un problema y tienen que verse.
    if (!res.ok && res.status !== 501 && res.status !== 401) {
      console.error(`No se pudo guardar el layout en el servidor: ${res.status}`)
    }
  } catch (error) {
    console.error('No se pudo guardar el layout en el servidor', error)
  }
}
