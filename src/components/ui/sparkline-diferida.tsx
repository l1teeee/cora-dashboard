"use client"

import dynamic from "next/dynamic"

import { EsqueletoGrafica } from "@/components/ui/esqueleto-grafica"

// El transform de Next lee estas opciones en compilacion, asi que tienen que ir
// como literal en cada llamada; una constante compartida rompe el build.
export const SparklineDiferida = dynamic(
  () => import("@/components/ui/sparkline").then((modulo) => modulo.Sparkline),
  { ssr: false, loading: EsqueletoGrafica }
)
