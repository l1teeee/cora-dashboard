export type SeccionPrompt = { titulo: string; cuerpo: string }

// El system prompt se escribe con encabezados en mayusculas ("IDENTIDAD Y TONO",
// "VARIEDAD DE LENGUAJE (evitar repeticion)"). No hay marcador explicito, asi que
// se detectan por forma: linea sin sangria, en mayusculas, que no es vineta ni
// frase. El parentesis aclaratorio puede ir en minusculas.
export function esEncabezado(linea: string): boolean {
  if (linea !== linea.trimStart()) return false

  const texto = linea.trim()
  if (texto.length === 0 || texto.length > 80) return false
  if (/^[*\-\d]/.test(texto)) return false
  if (texto.endsWith(".") || texto.endsWith(":") || texto.endsWith(",")) return false

  const sinParentesis = texto.replace(/\([^)]*\)/g, "").trim()
  if (sinParentesis.length === 0) return false
  if (!/[A-ZÁÉÍÓÚÑ]/.test(sinParentesis)) return false

  return sinParentesis === sinParentesis.toUpperCase()
}

export function dividirPrompt(prompt: string): {
  preambulo: string | null
  secciones: SeccionPrompt[]
} {
  const preambulo: string[] = []
  const secciones: { titulo: string; cuerpo: string[] }[] = []

  for (const linea of prompt.split("\n")) {
    if (esEncabezado(linea)) {
      secciones.push({ titulo: linea.trim(), cuerpo: [] })
    } else if (secciones.length === 0) {
      preambulo.push(linea)
    } else {
      secciones[secciones.length - 1]!.cuerpo.push(linea)
    }
  }

  return {
    preambulo: preambulo.length > 0 ? preambulo.join("\n") : null,
    secciones: secciones.map((seccion) => ({
      titulo: seccion.titulo,
      cuerpo: seccion.cuerpo.join("\n"),
    })),
  }
}

export type CambioSeccion = {
  titulo: string
  tipo: "agregada" | "eliminada" | "modificada"
  antes: string | null
  despues: string | null
}

// Compara por titulo, no por posicion: mover una seccion no debe leerse como un
// cambio. El precio es que renombrar una seccion aparece como una baja y un alta.
export function compararPrompts(antes: string, despues: string): CambioSeccion[] {
  const previo = dividirPrompt(antes)
  const nuevo = dividirPrompt(despues)

  const cambios: CambioSeccion[] = []

  if (previo.preambulo !== nuevo.preambulo) {
    cambios.push({
      titulo: "Introduccion",
      tipo: "modificada",
      antes: previo.preambulo,
      despues: nuevo.preambulo,
    })
  }

  const cuerposPrevios = new Map(previo.secciones.map((s) => [s.titulo, s.cuerpo]))
  const cuerposNuevos = new Map(nuevo.secciones.map((s) => [s.titulo, s.cuerpo]))

  for (const seccion of nuevo.secciones) {
    const cuerpoPrevio = cuerposPrevios.get(seccion.titulo)

    if (cuerpoPrevio === undefined) {
      cambios.push({
        titulo: seccion.titulo,
        tipo: "agregada",
        antes: null,
        despues: seccion.cuerpo,
      })
    } else if (cuerpoPrevio !== seccion.cuerpo) {
      cambios.push({
        titulo: seccion.titulo,
        tipo: "modificada",
        antes: cuerpoPrevio,
        despues: seccion.cuerpo,
      })
    }
  }

  for (const seccion of previo.secciones) {
    if (!cuerposNuevos.has(seccion.titulo)) {
      cambios.push({
        titulo: seccion.titulo,
        tipo: "eliminada",
        antes: seccion.cuerpo,
        despues: null,
      })
    }
  }

  return cambios
}

export function unirPrompt(
  preambulo: string | null,
  secciones: SeccionPrompt[]
): string {
  const lineas: string[] = []

  if (preambulo !== null) {
    lineas.push(...preambulo.split("\n"))
  }

  for (const seccion of secciones) {
    lineas.push(seccion.titulo)
    if (seccion.cuerpo !== "") {
      lineas.push(...seccion.cuerpo.split("\n"))
    }
  }

  return lineas.join("\n")
}
