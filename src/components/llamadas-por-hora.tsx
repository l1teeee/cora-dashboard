"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Cada 3 horas alcanza para leer el eje sin amontonar 24 etiquetas.
const HORAS_ROTULADAS = new Set([0, 3, 6, 9, 12, 15, 18, 21]);

export function LlamadasPorHora({ conteos }: { conteos: number[] }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const maximo = Math.max(...conteos, 1);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-slot=barra-hora]", {
          scaleY: 0,
          transformOrigin: "bottom center",
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.015,
        });
      });

      return () => media.revert();
    },
    { scope: contenedor }
  );

  return (
    <div ref={contenedor}>
      <div className="flex h-32 items-end gap-1">
        {conteos.map((cantidad, hora) => (
          <div
            key={hora}
            className="group/hora flex h-full flex-1 flex-col justify-end"
            title={`${String(hora).padStart(2, "0")}:00 - ${cantidad} ${cantidad === 1 ? "llamada" : "llamadas"}`}
          >
            <div
              data-slot="barra-hora"
              className="w-full rounded-t-sm bg-primary/70 transition-colors duration-150 group-hover/hora:bg-primary"
              style={{ height: `${Math.max((cantidad / maximo) * 100, cantidad > 0 ? 4 : 1)}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-1">
        {conteos.map((_, hora) => (
          <span
            key={hora}
            className="flex-1 text-center text-[10px] text-muted-foreground tabular-nums"
          >
            {HORAS_ROTULADAS.has(hora) ? String(hora).padStart(2, "0") : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
