"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { describirFinalizacion, type ClaseFinalizacion } from "@/lib/finalizacion";

gsap.registerPlugin(useGSAP);

const COLOR_BARRA: Record<ClaseFinalizacion, string> = {
  exito: "bg-success",
  error: "bg-destructive",
  neutro: "bg-muted-foreground/45",
};

export function BarrasFinalizacion({
  filas,
  total,
}: {
  filas: { razon: string; cantidad: number }[];
  total: number;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-slot=barra-finalizacion]", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.05,
        });
      });

      return () => media.revert();
    },
    { scope: contenedor }
  );

  return (
    <div ref={contenedor} className="space-y-4">
      {filas.map((fila) => {
        const porcentaje = Math.round((fila.cantidad / total) * 100);
        const { descripcion, clase } = describirFinalizacion(fila.razon);

        return (
          <div key={fila.razon} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm">
                <span className="font-medium text-foreground">{fila.razon}</span>
                <span className="ml-1.5 text-muted-foreground">({descripcion})</span>
              </p>
              <span className="shrink-0 text-sm text-muted-foreground">
                {fila.cantidad}
                <span className="ml-1.5 text-xs">{porcentaje}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                data-slot="barra-finalizacion"
                className={`h-full rounded-full ${COLOR_BARRA[clase]}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
