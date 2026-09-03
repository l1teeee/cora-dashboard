import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PhoneOffIcon } from "lucide-react";
import { auth } from "@/auth";
import { cargarLlamadas } from "@/lib/llamadas-sesion";
import { listarAsignables } from "@/lib/usuarios";
import { esAdmin } from "@/lib/solo-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { FiltroFecha } from "@/components/filtro-fecha";
import { TablaLlamadas } from "@/components/tabla-llamadas";

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

  const { llamadas, error } = await cargarLlamadas(sesion.user.rol, sesion.user.id, desde, hasta);

  const asignables = esAdmin(sesion) ? await listarAsignables() : [];

  const sinLlamadasAsignadas = sesion.user.rol === "agente" && llamadas.length === 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        titulo="Llamadas"
        descripcion="Registro completo de las llamadas atendidas por el asistente"
        className="items-stretch sm:flex-col sm:items-stretch xl:flex-row xl:items-end"
      >
        <Suspense
          fallback={
            <Skeleton className="h-[76px] w-full rounded-2xl xl:w-[34rem]" />
          }
        >
          <FiltroFecha />
        </Suspense>
      </PageHeader>

      {error ? (
        <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-6">
          <Alert variant="destructive" titulo="No se pudo conectar con el backend de CORA">
            {error}
          </Alert>
        </div>
      ) : sinLlamadasAsignadas ? (
        <div className="rounded-3xl bg-card shadow-sm ring-1 ring-border">
          <EmptyState
            icon={PhoneOffIcon}
            titulo="No tienes llamadas asignadas todavia."
            descripcion="Las llamadas se asignan mediante el campo usuario_asignado."
          />
        </div>
      ) : (
        <TablaLlamadas
          llamadas={llamadas}
          rol={sesion.user.rol}
          porPagina={10}
          asignables={asignables}
        />
      )}
    </div>
  );
}
