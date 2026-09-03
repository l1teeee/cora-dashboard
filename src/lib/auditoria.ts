import 'server-only'

export type Accion = 'edito_system_prompt' | 'edito_asistente' | 'subio_archivo' | 'elimino_archivo'

function config(): { base: string; adminKey: string } {
  const base = process.env.RAILWAY_BACKEND_URL
  const adminKey = process.env.RAILWAY_ADMIN_KEY

  if (!base) throw new Error('Falta la variable de entorno RAILWAY_BACKEND_URL')
  if (!adminKey) throw new Error('Falta la variable de entorno RAILWAY_ADMIN_KEY')

  return { base: base.replace(/\/+$/, ''), adminKey }
}

export async function guardarAuditoria(usuario: string, accion: Accion, detalle?: unknown): Promise<boolean> {
  try {
    const { base, adminKey } = config()

    const res = await fetch(`${base}/auditoria`, {
      method: 'POST',
      headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, accion, detalle }),
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Backend CORA ${res.status}`)
    return true
  } catch (error) {
    // La mutacion ya ocurrio (en Vapi, o la accion que se esta auditando) y es
    // irreversible desde aqui: si propagamos este error, el admin veria un fallo y
    // creeria que su cambio no se aplico, cuando en realidad si se aplico. Quien
    // llama usa el booleano devuelto para avisar en la UI sin bloquear el flujo.
    console.error('Error guardando auditoria:', error)
    return false
  }
}

export async function leerAuditoria(params: { page?: number; limit?: number; accion?: string }): Promise<unknown> {
  const { base, adminKey } = config()

  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.accion !== undefined) query.set('accion', params.accion)

  const res = await fetch(`${base}/auditoria?${query.toString()}`, {
    headers: { 'x-admin-key': adminKey },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)
  return res.json()
}
