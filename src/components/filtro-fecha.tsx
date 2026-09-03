"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ListFilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FiltroFecha() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [desde, setDesde] = useState(searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(searchParams.get("hasta") ?? "");

  function filtrar() {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);

    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  }

  function limpiar() {
    setDesde("");
    setHasta("");
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-card p-3 ring-1 ring-border">
      <Field label="Desde" htmlFor="filtro-desde">
        <Input
          id="filtro-desde"
          type="date"
          value={desde}
          onChange={(evento) => setDesde(evento.target.value)}
          className="w-40"
        />
      </Field>

      <Field label="Hasta" htmlFor="filtro-hasta">
        <Input
          id="filtro-hasta"
          type="date"
          value={hasta}
          onChange={(evento) => setHasta(evento.target.value)}
          className="w-40"
        />
      </Field>

      <div className="ml-auto flex gap-2">
        <Button size="sm" onClick={filtrar}>
          <ListFilterIcon strokeWidth={1.75} />
          Filtrar
        </Button>
        <Button variant="ghost" size="sm" onClick={limpiar}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
