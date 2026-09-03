export type Rol = 'admin' | 'agente'

export type Llamada = {
  id: number
  call_id: string
  fecha: string | null
  duracion: number | null
  costo: string | null
  resumen: string | null
  razon_finalizacion: string | null
  numero_telefono: string | null
  url_grabacion: string | null
  usuario_asignado: string | null
  created_at: string
}

export type LlamadaDetalle = Llamada & { transcripcion: string | null }

export type Metricas = {
  totalLlamadas: number
  costoTotal: number
  duracionPromedio: number
  duracionTotal: number
}
