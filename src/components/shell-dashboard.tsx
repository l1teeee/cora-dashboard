"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Rol } from "@/lib/tipos";
import { BarraLateral } from "@/components/barra-lateral";
import { BarraSuperior } from "@/components/barra-superior";

const CLAVE_COLAPSADA = "cora-lateral-colapsada";

export function ShellDashboard({
  rol,
  usuario,
  children,
}: {
  rol: Rol;
  usuario: string;
  children: React.ReactNode;
}) {
  const [colapsada, setColapsada] = useState(false);
  const [abiertaMovil, setAbiertaMovil] = useState(false);
  const pathname = usePathname();

  // Leer localStorage en el render rompería la hidratación (server no lo conoce);
  // se aplica tras el montaje.
  useEffect(() => {
    setColapsada(localStorage.getItem(CLAVE_COLAPSADA) === "true");
  }, []);

  useEffect(() => {
    setAbiertaMovil(false);
  }, [pathname]);

  function alternarColapsada() {
    const nuevoValor = !colapsada;
    setColapsada(nuevoValor);
    localStorage.setItem(CLAVE_COLAPSADA, String(nuevoValor));
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <BarraLateral
        rol={rol}
        usuario={usuario}
        colapsada={colapsada}
        abiertaMovil={abiertaMovil}
        onCerrarMovil={() => setAbiertaMovil(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior
          usuario={usuario}
          rol={rol}
          colapsada={colapsada}
          onToggleColapsada={alternarColapsada}
          onAbrirMovil={() => setAbiertaMovil(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
