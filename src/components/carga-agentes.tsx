"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { UserRoundIcon } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

gsap.registerPlugin(useGSAP);

export type CargaAgente = { id: string; nombre: string; asignadas: number };

export function CargaAgentes({
  agentes,
  sinAsignar,
}: {
  agentes: CargaAgente[];
  sinAsignar: number;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-slot=fila-agente]", {
          opacity: 0,
          x: -8,
          duration: 0.35,
          ease: "power2.out",
          stagger: 0.05,
        });
      });

      return () => media.revert();
    },
    { scope: contenedor }
  );

  if (agentes.length === 0) {
    return (
      <EmptyState
        icon={UserRoundIcon}
        titulo="No hay asesores activos"
        descripcion="Crea cuentas con rol agente para poder repartir las llamadas."
      />
    );
  }

  const maximo = Math.max(...agentes.map((agente) => agente.asignadas), 1);

  return (
    <div ref={contenedor} className="space-y-3">
      {agentes.map((agente) => (
        <div key={agente.id} data-slot="fila-agente" className="flex items-center gap-3">
          <Avatar nombre={agente.nombre} size="sm" />

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium">{agente.nombre}</span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {agente.asignadas}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(agente.asignadas / maximo) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}

      {sinAsignar > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Sin asignar</span>
          <Badge variant="secondary">{sinAsignar}</Badge>
        </div>
      )}
    </div>
  );
}
