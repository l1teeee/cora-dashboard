export const MARCA_INICIO = '<!-- cora:kb -->'
export const MARCA_FIN = '<!-- /cora:kb -->'
export const INSTRUCCION_KB =
  'Cuando el usuario pregunte por informacion institucional (requisitos, fechas, becas, programas, costos o tramites), consulta primero los documentos de la base de conocimiento antes de responder. Si la informacion no esta ahi, dilo con claridad en vez de inventarla.'

function escaparRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Flag 's' (dotAll) para que el bloque se reconozca aunque abarque varios saltos de linea.
function patronBloque(): RegExp {
  return new RegExp(escaparRegExp(MARCA_INICIO) + '.*?' + escaparRegExp(MARCA_FIN), 's')
}

export function inyectarInstruccionKb(systemPrompt: string): string {
  const bloque = `${MARCA_INICIO}\n${INSTRUCCION_KB}\n${MARCA_FIN}`

  if (patronBloque().test(systemPrompt)) {
    return systemPrompt.replace(patronBloque(), bloque)
  }

  // Sin marcadores para detectar un bloque ya existente, cada subida de archivo
  // volveria a concatenar la instruccion al final y el prompt se llenaria de copias
  // identicas hasta desbordarlo.
  return systemPrompt ? `${systemPrompt}\n\n${bloque}` : bloque
}

// Deja el prompt tal como lo escribio el humano, sin el bloque generado, para mostrarlo en el formulario.
export function quitarInstruccionKb(systemPrompt: string): string {
  return systemPrompt
    .replace(patronBloque(), '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
