import type { Llamada, Metricas, Rol } from './tipos'

// LA funcion de seguridad del dashboard: se usa tanto en la pagina como en la API
// para que el filtrado por rol nunca pueda divergir entre las dos.
export function filtrarPorRol(llamadas: Llamada[], rol: Rol, usuarioId: string): Llamada[] {
  if (rol === 'admin') return llamadas
  return llamadas.filter((l) => l.usuario_asignado === usuarioId)
}

export function filtrarPorFecha(llamadas: Llamada[], desde?: string, hasta?: string): Llamada[] {
  if (!desde && !hasta) return llamadas

  return llamadas.filter((l) => {
    if (!l.fecha) return false

    const fechaLlamada = l.fecha.slice(0, 10)
    if (desde && fechaLlamada < desde) return false
    if (hasta && fechaLlamada > hasta) return false
    return true
  })
}

export function calcularMetricas(llamadas: Llamada[]): Metricas {
  let costoTotal = 0
  let duracionTotal = 0
  let cantidadConDuracion = 0

  for (const l of llamadas) {
    const costo = Number(l.costo)
    if (l.costo !== null && !Number.isNaN(costo)) costoTotal += costo

    if (l.duracion !== null) {
      duracionTotal += l.duracion
      cantidadConDuracion++
    }
  }

  const duracionPromedio = cantidadConDuracion > 0 ? duracionTotal / cantidadConDuracion : 0

  return {
    totalLlamadas: llamadas.length,
    costoTotal,
    duracionPromedio,
    duracionTotal,
  }
}

export function formatearDuracion(segundos: number | null): string {
  if (segundos === null) return '-'

  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segs = Math.floor(segundos % 60)

  if (horas > 0) {
    return `${horas}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
  }
  return `${minutos}:${String(segs).padStart(2, '0')}`
}

export function formatearCosto(costo: string | number | null): string {
  if (costo === null) return '-'
  return `$${Number(costo).toFixed(4)}`
}

export function formatearFecha(fecha: string | null): string {
  if (!fecha) return '-'

  // Se parte el string directamente (sin new Date) para evitar que el navegador
  // reinterprete la fecha en otra zona horaria.
  const anio = fecha.slice(0, 4)
  const mes = fecha.slice(5, 7)
  const dia = fecha.slice(8, 10)
  const horaMin = fecha.slice(11, 16)

  return `${dia}/${mes}/${anio} ${horaMin}`
}
