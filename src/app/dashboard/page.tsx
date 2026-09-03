import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PhoneOffIcon } from "lucide-react";
import { auth } from "@/auth";
import { obtenerLlamadas } from "@/lib/cora-api";
import { calcularMetricas, filtrarPorFecha, filtrarPorRol } from "@/lib/metricas";
import type { Llamada } from "@/lib/tipos";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
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
  const sinLlamadasAsignadas = sesion.user.rol === "agente" && llamadas.length === 0;

  return (
    <>
      <PageHeader titulo="Llamadas" descripcion="Registro de llamadas atendidas por el asistente" />

      {error ? (
        <Alert variant="destructive" titulo="No se pudo conectar con el backend de CORA">
          {error}
        </Alert>
      ) : (
        <>
          <TarjetasResumen metricas={metricas} llamadas={llamadas} />

          <Suspense fallback={<Skeleton className="h-[72px] w-full rounded-xl" />}>
            <FiltroFecha />
          </Suspense>

          {sinLlamadasAsignadas ? (
            <div className="rounded-xl bg-card ring-1 ring-border">
              <EmptyState
                icon={PhoneOffIcon}
                titulo="No tienes llamadas asignadas todavia."
                descripcion="Las llamadas se asignan mediante el campo usuario_asignado."
              />
            </div>
          ) : (
            <TablaLlamadas llamadas={llamadas} rol={sesion.user.rol} />
          )}
        </>
      )}
    </>
  );
}
