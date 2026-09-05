"use client";

import dynamic from "next/dynamic";

import { EsqueletoGrafica } from "@/components/ui/esqueleto-grafica";

// Recharts pesa mas que todo el resto del dashboard junto. Entrando por aqui queda
// en su propio chunk y no bloquea la primera carga: las cifras y las tablas pintan
// enseguida y las graficas llegan despues de hidratar.
//
// El transform de Next lee las opciones de dynamic en compilacion, asi que tienen
// que ir como literal en cada llamada; una constante compartida rompe el build.
export const LlamadasPorHora = dynamic(
  () =>
    import("@/components/llamadas-por-hora").then((modulo) => modulo.LlamadasPorHora),
  { ssr: false, loading: EsqueletoGrafica }
);

export const LlamadasPorDia = dynamic(
  () =>
    import("@/components/graficas/llamadas-por-dia").then(
      (modulo) => modulo.LlamadasPorDia
    ),
  { ssr: false, loading: EsqueletoGrafica }
);

export const CostoPorDia = dynamic(
  () =>
    import("@/components/graficas/costo-por-dia").then((modulo) => modulo.CostoPorDia),
  { ssr: false, loading: EsqueletoGrafica }
);

export const DuracionPorRangos = dynamic(
  () =>
    import("@/components/graficas/duracion-por-rangos").then(
      (modulo) => modulo.DuracionPorRangos
    ),
  { ssr: false, loading: EsqueletoGrafica }
);

export const LlamadasPorDiaSemana = dynamic(
  () =>
    import("@/components/graficas/llamadas-por-dia-semana").then(
      (modulo) => modulo.LlamadasPorDiaSemana
    ),
  { ssr: false, loading: EsqueletoGrafica }
);
