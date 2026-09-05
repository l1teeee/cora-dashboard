"use client";

import { formatearLlamadas } from "@/lib/metricas";
import { GraficaBarras } from "@/components/ui/grafica";

// Cada 3 horas alcanza para leer el eje sin amontonar 24 etiquetas.
const HORAS_ROTULADAS = new Set([0, 3, 6, 9, 12, 15, 18, 21]);

const etiquetaHora = (hora: number) => `${String(hora).padStart(2, "0")}:00`;

export function LlamadasPorHora({ conteos }: { conteos: number[] }) {
  const datos = conteos.map((cantidad, hora) => ({
    hora: etiquetaHora(hora),
    cantidad,
  }));

  return (
    <GraficaBarras
      datos={datos}
      claveX="hora"
      claveY="cantidad"
      formatearValor={(valor) => formatearLlamadas(valor)}
      formatearTickX={(_etiqueta, hora) =>
        HORAS_ROTULADAS.has(hora) ? String(hora).padStart(2, "0") : ""
      }
    />
  );
}
