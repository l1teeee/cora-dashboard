"use client"

import type { PuntoGrafica } from "@/lib/tipos"
import { formatearLlamadas } from "@/lib/metricas"
import { GraficaBarras } from "@/components/ui/grafica"

export function LlamadasPorDiaSemana({ datos }: { datos: PuntoGrafica[] }) {
  return (
    <GraficaBarras
      datos={datos}
      claveX="etiqueta"
      claveY="valor"
      formatearValor={(valor) => formatearLlamadas(valor)}
    />
  )
}
