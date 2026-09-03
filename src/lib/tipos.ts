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
  // Los captura el asistente durante la llamada via structured outputs de Vapi;
  // llegan en null mientras el analisis no termina o cuando no aplican.
  nombre_capturado: string | null
  motivo: string | null
  requiere_seguimiento: number | null
  created_at: string
}

export type LlamadaDetalle = Llamada & { transcripcion: string | null }

export type Metricas = {
  totalLlamadas: number
  costoTotal: number
  duracionPromedio: number
  duracionTotal: number
}

export type MetricasAgente = {
  total: number
  seguimiento: number
  quejas: number
  sinResumen: number
  personas: number
  duracionPromedio: number
  ultimaLlamada: string | null
}

export type MetricasOperacion = {
  fallidas: number
  tasaExito: number
  transferenciasFallidas: number
  sinAsignar: number
  llamadasCortas: number
  duracionMediana: number
  costoPromedio: number
  numerosUnicos: number
  recurrentes: number
}
