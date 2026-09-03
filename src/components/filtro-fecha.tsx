"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-desde" className="text-xs text-muted-foreground">
            Desde
          </label>
          <Input
            id="filtro-desde"
            type="date"
            value={desde}
            onChange={(evento) => setDesde(evento.target.value)}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-hasta" className="text-xs text-muted-foreground">
            Hasta
          </label>
          <Input
            id="filtro-hasta"
            type="date"
            value={hasta}
            onChange={(evento) => setHasta(evento.target.value)}
            className="w-40"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={filtrar}>Filtrar</Button>
          <Button variant="outline" onClick={limpiar}>
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
