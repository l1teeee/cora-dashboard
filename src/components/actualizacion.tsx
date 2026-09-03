"use client";

import { createContext, useCallback, useContext, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Actualizacion = {
  refrescando: boolean;
  refrescar: () => void;
};

const Contexto = createContext<Actualizacion | null>(null);

function useActualizacion() {
  const valor = useContext(Contexto);
  if (!valor) {
    throw new Error("BotonRefrescar y ContenidoActualizable requieren ProveedorActualizacion");
  }
  return valor;
}

// router.refresh() vuelve a ejecutar el Server Component y sustituye los datos sin perder
// el estado del cliente. Envuelto en una transicion, `pendiente` cubre exactamente el hueco
// entre pedir los datos nuevos y tenerlos pintados, que es lo que se desenfoca.
export function ProveedorActualizacion({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();

  const refrescar = useCallback(() => {
    iniciarTransicion(() => router.refresh());
  }, [router]);

  return (
    <Contexto.Provider value={{ refrescando: pendiente, refrescar }}>
      {children}
    </Contexto.Provider>
  );
}

export function BotonRefrescar({ className }: { className?: string }) {
  const { refrescando, refrescar } = useActualizacion();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={refrescar}
      disabled={refrescando}
      aria-label="Actualizar los datos"
      className={className}
    >
      <RefreshCwIcon
        strokeWidth={1.75}
        className={cn("transition-transform", refrescando && "animate-spin")}
      />
      {refrescando ? "Actualizando..." : "Actualizar"}
    </Button>
  );
}

export function ContenidoActualizable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { refrescando } = useActualizacion();

  return (
    <div
      aria-busy={refrescando}
      className={cn(
        "transition-[filter,opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        refrescando && "scale-[0.995] opacity-55 blur-[3px] motion-reduce:blur-none",
        className
      )}
    >
      {children}
    </div>
  );
}
