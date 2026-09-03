import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { obtenerLlamadas } from "@/lib/cora-api";
import { calcularMetricas, filtrarPorFecha, filtrarPorRol } from "@/lib/metricas";
import type { Llamada } from "@/lib/tipos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BotonLogout } from "@/components/boton-logout";
import { NavAdmin } from "@/components/nav-admin";
import { FiltroFecha } from "@/components/filtro-fecha";
import { TablaLlamadas } from "@/components/tabla-llamadas";
import { TarjetasResumen } from "@/components/tarjetas-resumen";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  const { desde, hasta } = await searchParams;

  let llamadas: Llamada[] = [];
  let error: string | null = null;

  try {
    const todas = await obtenerLlamadas();
    const asignadas = filtrarPorRol(todas, sesion.user.rol, sesion.user.id);
    llamadas = filtrarPorFecha(asignadas, desde, hasta);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const metricas = calcularMetricas(llamadas);
  const rolEtiqueta = sesion.user.rol === "admin" ? "Administrador" : "Agente";
  const sinLlamadasAsignadas = sesion.user.rol === "agente" && llamadas.length === 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CORA</h1>
            <p className="text-sm text-muted-foreground">Panel de llamadas</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{sesion.user.name}</span>
            <Badge variant="secondary">{rolEtiqueta}</Badge>
            <BotonLogout />
          </div>
        </header>

        {sesion.user.rol === "admin" && <NavAdmin />}

        <main className="mt-8 space-y-6">
          {error ? (
            <Card>
              <CardHeader>
                <CardTitle>No se pudo conectar con el backend de CORA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <TarjetasResumen metricas={metricas} />

              <Suspense fallback={<Skeleton className="h-[92px] w-full rounded-xl" />}>
                <FiltroFecha />
              </Suspense>

              {sinLlamadasAsignadas ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="font-medium">No tienes llamadas asignadas todavia.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Las llamadas se asignan mediante el campo usuario_asignado.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <TablaLlamadas llamadas={llamadas} rol={sesion.user.rol} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
