export type Categoria = { id: string; nombre: string; titulos: string[] }

// Los titulos del prompt llevan tildes; buscar "informacion" debe encontrar
// "INFORMACIÓN", asi que se comparan ambos lados sin diacriticos.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

// El agrupamiento es solo de presentacion: el texto del prompt no cambia, estos
// titulos son los que hoy escribe el asistente de voz, copiados tal cual.
export const CATEGORIAS: Categoria[] = [
  {
    id: "identidad",
    nombre: "Identidad y tono",
    titulos: [
      "IDENTIDAD Y TONO",
      "ACENTO Y EXPRESIONES GUATEMALTECAS (sutil, sin exagerar)",
      "VARIEDAD DE LENGUAJE (evitar repetición)",
    ],
  },
  {
    id: "respuesta",
    nombre: "Forma de respuesta",
    titulos: [
      "CÓMO MANEJAR LA INFORMACIÓN",
      "ESTRUCTURA DE LA CONVERSACIÓN",
      "REGLAS DE ORO",
      "RITMO DE VOZ Y LONGITUD DE RESPUESTA",
      "PAUSAS Y RITMO NATURAL",
      "COMPORTAMIENTO GENERAL",
    ],
  },
  {
    id: "quejas",
    nombre: "Manejo de quejas y conflictos",
    titulos: [
      "MANEJO DE QUEJAS Y ESTUDIANTES MOLESTOS",
      "MANEJO DE PERSONAS GROSERAS O AGRESIVAS",
      "INTERRUPCIONES Y PERSONAS QUE HABLAN ENCIMA",
    ],
  },
  {
    id: "especiales",
    nombre: "Casos especiales",
    titulos: [
      "PREGUNTAS FUERA DE TEMA",
      "SILENCIOS Y AUSENCIA DE RESPUESTA",
      "PERSONAS QUE HABLAN MUY RÁPIDO O AUDIO POCO CLARO",
      "LLAMADAS QUE SE CORTAN O TERMINAN ABRUPTAMENTE",
      "CASOS LÍMITE Y SOLICITUDES ESPECIALES",
      "IDIOMAS",
      "SI PREGUNTAN SI ERES UN BOT O INTELIGENCIA ARTIFICIAL",
    ],
  },
  {
    id: "datos",
    nombre: "Datos y privacidad",
    titulos: [
      "PRIVACIDAD E INFORMACIÓN CONFIDENCIAL",
      // Todavia no existe en el prompt: se agrega despues y ya cae en su categoria.
      "CAPTURA DE DATOS DE CONTACTO",
    ],
  },
  {
    id: "transferencias",
    nombre: "Transferencias y urgencias",
    titulos: [
      "TRANSFERENCIAS",
      "TRANSFERENCIAS SOLICITADAS POR EL USUARIO",
      "URGENCIAS Y TEMAS SENSIBLES",
    ],
  },
  {
    id: "ejemplos",
    nombre: "Ejemplos",
    titulos: [
      "EJEMPLO DE TONO CORRECTO (para referencia interna, no lo repitas literal)",
      "EJEMPLO 1 — ESTUDIANTE MOLESTO POR UN COBRO",
      "EJEMPLO 2 — PERSONA HABLA MUY RÁPIDO Y SE CORTA EL AUDIO",
      "EJEMPLO 3 — PREGUNTA SI ESTÁ HABLANDO CON UNA IA",
      "EJEMPLO 4 — SOLICITUD DE INFORMACIÓN PRIVADA",
      "EJEMPLO 5 — PERSONA GROSERA PERO CON UNA CONSULTA REAL",
    ],
  },
]

export const CATEGORIA_OTRAS: Categoria = {
  id: "otras",
  nombre: "Otras",
  titulos: [],
}

const CATEGORIA_POR_TITULO = new Map<string, string>()

for (const categoria of CATEGORIAS) {
  for (const titulo of categoria.titulos) {
    CATEGORIA_POR_TITULO.set(normalizar(titulo), categoria.id)
  }
}

export function categoriaDe(titulo: string): string {
  const id = CATEGORIA_POR_TITULO.get(normalizar(titulo.trim()))
  return id ?? CATEGORIA_OTRAS.id
}
