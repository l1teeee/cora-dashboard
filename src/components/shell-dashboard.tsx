"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Rol } from "@/lib/tipos";
import { BarraLateral } from "@/components/barra-lateral";
import { BarraSuperior } from "@/components/barra-superior";
import { TransicionSeccion } from "@/components/transicion-seccion";

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
    <div className="flex h-screen w-full bg-canvas p-2 sm:p-3 lg:p-4">
      {/* El marco toma el color de la barra lateral para que las esquinas
          redondeadas del panel de contenido revelen el fondo oscuro. */}
      <div className="flex h-full w-full overflow-hidden rounded-3xl border-2 border-frame-border bg-sidebar shadow-[0_24px_60px_-16px_rgb(0_0_0_/_0.35)]">
        <BarraLateral
          rol={rol}
          usuario={usuario}
          colapsada={colapsada}
          abiertaMovil={abiertaMovil}
          onCerrarMovil={() => setAbiertaMovil(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background lg:rounded-l-3xl">
          <BarraSuperior
            usuario={usuario}
            rol={rol}
            colapsada={colapsada}
            onToggleColapsada={alternarColapsada}
            onAbrirMovil={() => setAbiertaMovil(true)}
          />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
            <TransicionSeccion className="mx-auto w-full max-w-7xl space-y-7">
              {children}
            </TransicionSeccion>
          </main>
        </div>
      </div>
    </div>
  );
}
