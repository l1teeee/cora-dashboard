"use client"

import type { PuntoGrafica } from "@/lib/tipos"
import { formatearCosto } from "@/lib/metricas"
import { GraficaBarras } from "@/components/ui/grafica"

export function CostoPorDia({ datos }: { datos: PuntoGrafica[] }) {
  return (
    <GraficaBarras
      datos={datos}
      claveX="etiqueta"
      claveY="valor"
      formatearValor={formatearCosto}
      ejeYDecimal
    />
  )
}
