"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TemaToggle() {
  // El script inline de app/layout.tsx ya aplica la clase antes del primer paint;
  // aqui solo se lee el DOM en el montaje para no desincronizar la hidratacion.
  const [oscuro, setOscuro] = useState(false);

  useEffect(() => {
    setOscuro(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const nuevoOscuro = !oscuro;
    document.documentElement.classList.toggle("dark", nuevoOscuro);
    localStorage.setItem("cora-tema", nuevoOscuro ? "dark" : "light");
    setOscuro(nuevoOscuro);
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={alternar}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {oscuro ? (
        <SunIcon className="size-4" strokeWidth={1.75} />
      ) : (
        <MoonIcon className="size-4" strokeWidth={1.75} />
      )}
      <span className="sr-only">
        {oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      </span>
    </Button>
  );
}
