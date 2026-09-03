import type { Llamada, Metricas, MetricasAgente, MetricasOperacion, Rol } from './tipos'
import { esFallida } from './finalizacion'

// Debajo de este umbral la llamada no alcanzo a ser una conversacion: casi siempre es
// un cuelgue inmediato o un fallo de conexion, y conviene vigilarlo aparte del total.
const SEGUNDOS_LLAMADA_CORTA = 15

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

export function calcularMetricasOperacion(llamadas: Llamada[]): MetricasOperacion {
  let fallidas = 0
  let transferenciasFallidas = 0
  let sinAsignar = 0
  let llamadasCortas = 0
  let costoTotal = 0

  const duraciones: number[] = []
  const porNumero = new Map<string, number>()

  for (const llamada of llamadas) {
    if (esFallida(llamada.razon_finalizacion)) fallidas++
    if (llamada.razon_finalizacion === 'call.in-progress.error-transfer-failed') {
      transferenciasFallidas++
    }
    if (llamada.usuario_asignado === null) sinAsignar++

    if (llamada.duracion !== null) {
      duraciones.push(llamada.duracion)
      if (llamada.duracion < SEGUNDOS_LLAMADA_CORTA) llamadasCortas++
    }

    const costo = Number(llamada.costo)
    if (llamada.costo !== null && !Number.isNaN(costo)) costoTotal += costo

    if (llamada.numero_telefono !== null) {
      porNumero.set(llamada.numero_telefono, (porNumero.get(llamada.numero_telefono) ?? 0) + 1)
    }
  }

  let recurrentes = 0
  for (const veces of porNumero.values()) {
    if (veces > 1) recurrentes++
  }

  return {
    fallidas,
    tasaExito: llamadas.length > 0 ? ((llamadas.length - fallidas) / llamadas.length) * 100 : 0,
    transferenciasFallidas,
    sinAsignar,
    llamadasCortas,
    duracionMediana: mediana(duraciones),
    costoPromedio: llamadas.length > 0 ? costoTotal / llamadas.length : 0,
    numerosUnicos: porNumero.size,
    recurrentes,
  }
}

// El agente no necesita saber cuanto cuesta la operacion ni como va el asistente:
// necesita saber que tiene pendiente. Por eso son metricas distintas y no un subconjunto.
export function calcularMetricasAgente(llamadas: Llamada[]): MetricasAgente {
  let seguimiento = 0
  let quejas = 0
  let sinResumen = 0
  let duracionTotal = 0
  let conDuracion = 0
  let ultimaLlamada: string | null = null

  const personas = new Set<string>()

  for (const llamada of llamadas) {
    if (llamada.requiere_seguimiento === 1) seguimiento++
    if (llamada.motivo === 'queja') quejas++
    if (llamada.resumen === null) sinResumen++

    if (llamada.duracion !== null) {
      duracionTotal += llamada.duracion
      conDuracion++
    }

    if (llamada.numero_telefono !== null) personas.add(llamada.numero_telefono)

    if (llamada.fecha !== null && (ultimaLlamada === null || llamada.fecha > ultimaLlamada)) {
      ultimaLlamada = llamada.fecha
    }
  }

  return {
    total: llamadas.length,
    seguimiento,
    quejas,
    sinResumen,
    personas: personas.size,
    duracionPromedio: conDuracion > 0 ? duracionTotal / conDuracion : 0,
    ultimaLlamada,
  }
}

// La mediana resiste los valores extremos que el promedio no: una sola llamada de 20
// minutos mueve el promedio de todo el dia, la mediana no.
function mediana(valores: number[]): number {
  if (valores.length === 0) return 0

  const ordenados = [...valores].sort((a, b) => a - b)
  const medio = Math.floor(ordenados.length / 2)

  if (ordenados.length % 2 === 1) return ordenados[medio]!
  return (ordenados[medio - 1]! + ordenados[medio]!) / 2
}

// La hora se lee del string sin construir un Date, por el mismo motivo que formatearFecha:
// dejar que el navegador reinterprete la zona horaria correria las llamadas de franja.
export function llamadasPorHora(llamadas: Llamada[]): number[] {
  const conteos = new Array<number>(24).fill(0)

  for (const llamada of llamadas) {
    if (llamada.fecha === null) continue

    const hora = Number(llamada.fecha.slice(11, 13))
    if (Number.isInteger(hora) && hora >= 0 && hora < 24) conteos[hora]++
  }

  return conteos
}

export function llamadasPorAgente(llamadas: Llamada[]): Map<string, number> {
  const conteos = new Map<string, number>()

  for (const llamada of llamadas) {
    if (llamada.usuario_asignado === null) continue
    conteos.set(llamada.usuario_asignado, (conteos.get(llamada.usuario_asignado) ?? 0) + 1)
  }

  return conteos
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
