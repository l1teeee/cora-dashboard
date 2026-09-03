"use client";

import { PhoneIncomingIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLlamadas } from "@/components/recepcion/proveedor-llamadas";

// Vive en la barra superior y no en la pantalla de recepcion: la maqueta tiene que
// poder dispararse desde cualquier seccion del panel, no solo desde una.
export function BotonSimularLlamada() {
  const { simularLlamada, puedeRecibir } = useLlamadas();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={simularLlamada}
      title={
        puedeRecibir
          ? "Hara sonar el aviso de llamada entrante"
          : "Entrara directo a la cola de espera"
      }
    >
      <PhoneIncomingIcon strokeWidth={1.75} />
      <span className="hidden sm:inline">Simular llamada</span>
    </Button>
  );
}
