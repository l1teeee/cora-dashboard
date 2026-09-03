import 'server-only'

import { obtenerLlamadas } from '@/lib/cora-api'
import { filtrarPorFecha, filtrarPorRol } from '@/lib/metricas'
import type { Llamada, Rol } from '@/lib/tipos'

// Las paginas de dashboard y llamadas comparten esta misma carga y filtrado,
// asi que vive en un solo lugar para que no puedan divergir.
export async function cargarLlamadas(
  rol: Rol,
  usuarioId: string,
  desde?: string,
  hasta?: string,
): Promise<{ llamadas: Llamada[]; error: string | null }> {
  try {
    const todas = await obtenerLlamadas()
    const asignadas = filtrarPorRol(todas, rol, usuarioId)
    const llamadas = filtrarPorFecha(asignadas, desde, hasta)
    return { llamadas, error: null }
  } catch (err) {
    return { llamadas: [], error: err instanceof Error ? err.message : String(err) }
  }
}
