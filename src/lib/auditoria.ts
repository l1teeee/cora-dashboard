import 'server-only'

function config(): { base: string; adminKey: string } {
  const base = process.env.RAILWAY_BACKEND_URL
  const adminKey = process.env.RAILWAY_ADMIN_KEY

  if (!base) throw new Error('Falta la variable de entorno RAILWAY_BACKEND_URL')
  if (!adminKey) throw new Error('Falta la variable de entorno RAILWAY_ADMIN_KEY')

  return { base: base.replace(/\/+$/, ''), adminKey }
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
