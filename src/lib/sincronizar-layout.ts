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

    // Un 501 es el estado normal hasta que exista el endpoint en el backend; el
    // resto de codigos si son un problema real y tienen que quedar en la consola.
    if (!res.ok && res.status !== 501) {
      console.error(`No se pudo guardar el layout en el servidor: ${res.status}`)
    }
  } catch (error) {
    console.error('No se pudo guardar el layout en el servidor', error)
  }
}
