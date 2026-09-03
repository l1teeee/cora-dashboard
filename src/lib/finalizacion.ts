// Vapi devuelve `endedReason` como un slug tecnico ("call.in-progress.error-transfer-failed")
// que no dice nada a quien opera el call center. Aqui se traduce y, sobre todo, se clasifica:
// distinguir un cierre normal de un fallo real es lo que permite medir si el asistente funciona.

export type ClaseFinalizacion = "exito" | "error" | "neutro"

export type Finalizacion = {
  etiqueta: string
  descripcion: string
  clase: ClaseFinalizacion
}

const GLOSARIO: Record<string, Finalizacion> = {
  "customer-ended-call": {
    etiqueta: "customer-ended-call",
    descripcion: "La persona colgo",
    clase: "exito",
  },
  "assistant-ended-call": {
    etiqueta: "assistant-ended-call",
    descripcion: "El asistente cerro la llamada",
    clase: "exito",
  },
  "assistant-forwarded-call": {
    etiqueta: "assistant-forwarded-call",
    descripcion: "Transferida a un asesor",
    clase: "exito",
  },
  "call.in-progress.sip-completed-call": {
    etiqueta: "call.in-progress.sip-completed-call",
    descripcion: "Cerrada por la telefonia (SIP)",
    clase: "neutro",
  },
  "call.in-progress.error-transfer-failed": {
    etiqueta: "call.in-progress.error-transfer-failed",
    descripcion: "Fallo la transferencia a un asesor",
    clase: "error",
  },
  "call.start.error-vapi-number-international": {
    etiqueta: "call.start.error-vapi-number-international",
    descripcion: "No se pudo iniciar: numero internacional no habilitado",
    clase: "error",
  },
  "pipeline-error-eleven-labs-voice-failed": {
    etiqueta: "pipeline-error-eleven-labs-voice-failed",
    descripcion: "Fallo la sintesis de voz",
    clase: "error",
  },
  "silence-timed-out": {
    etiqueta: "silence-timed-out",
    descripcion: "Cortada por silencio prolongado",
    clase: "neutro",
  },
  "customer-did-not-answer": {
    etiqueta: "customer-did-not-answer",
    descripcion: "La persona no contesto",
    clase: "neutro",
  },
  "customer-busy": {
    etiqueta: "customer-busy",
    descripcion: "Linea ocupada",
    clase: "neutro",
  },
  "voicemail": {
    etiqueta: "voicemail",
    descripcion: "Entro al buzon de voz",
    clase: "neutro",
  },
  "exceeded-max-duration": {
    etiqueta: "exceeded-max-duration",
    descripcion: "Alcanzo la duracion maxima permitida",
    clase: "neutro",
  },
}

// Los slugs de Vapi son abiertos y aparecen valores nuevos sin aviso. En vez de mostrar
// "Sin descripcion", se deduce por prefijo lo unico que de verdad importa: si fue un fallo.
function porPrefijo(razon: string): Finalizacion {
  if (razon.startsWith("pipeline-error")) {
    return { etiqueta: razon, descripcion: "Fallo tecnico del asistente", clase: "error" }
  }
  if (razon.startsWith("call.start.error")) {
    return { etiqueta: razon, descripcion: "La llamada no llego a iniciarse", clase: "error" }
  }
  if (razon.includes("error")) {
    return { etiqueta: razon, descripcion: "Fallo durante la llamada", clase: "error" }
  }
  return { etiqueta: razon, descripcion: "Sin descripcion", clase: "neutro" }
}

export function describirFinalizacion(razon: string | null): Finalizacion {
  if (razon === null || razon === "") {
    return { etiqueta: "Sin dato", descripcion: "La llamada no reporto una razon", clase: "neutro" }
  }

  return GLOSARIO[razon] ?? porPrefijo(razon)
}

export function esFallida(razon: string | null): boolean {
  return describirFinalizacion(razon).clase === "error"
}
