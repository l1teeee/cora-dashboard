"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ListFilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FiltroFecha() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // El filtro vive tanto en el dashboard como en el listado de llamadas: se
  // navega sobre la ruta actual para no sacar al usuario de su pantalla.
  const pathname = usePathname();

  const [desde, setDesde] = useState(searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(searchParams.get("hasta") ?? "");

  function filtrar() {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function limpiar() {
    setDesde("");
    setHasta("");
    router.push(pathname);
  }

  return (
    <div className="flex w-full flex-col gap-3 superficie p-4 sm:flex-row sm:flex-wrap sm:items-end xl:w-auto xl:flex-nowrap">
      <Field label="Desde" htmlFor="filtro-desde">
        <Input
          id="filtro-desde"
          type="date"
          value={desde}
          onChange={(evento) => setDesde(evento.target.value)}
          className="w-full sm:w-40"
        />
      </Field>

      <Field label="Hasta" htmlFor="filtro-hasta">
        <Input
          id="filtro-hasta"
          type="date"
          value={hasta}
          onChange={(evento) => setHasta(evento.target.value)}
          className="w-full sm:w-40"
        />
      </Field>

      <div className="flex gap-2 sm:ml-auto">
        <Button size="sm" onClick={filtrar}>
          <ListFilterIcon strokeWidth={1.75} />
          Filtrar
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={limpiar}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
