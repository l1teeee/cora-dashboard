import { redirect } from "next/navigation";
import { PhoneOffIcon } from "lucide-react";
import { auth } from "@/auth";
import { cargarLlamadas } from "@/lib/llamadas-sesion";
import {
  calcularMetricas,
  calcularMetricasAgente,
  calcularMetricasOperacion,
  llamadasPorAgente,
} from "@/lib/metricas";
import { listarAsignables } from "@/lib/usuarios";
import { esAdmin } from "@/lib/solo-admin";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PanelAdmin } from "@/components/panel-admin";
import { PanelAgente } from "@/components/panel-agente";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  const { llamadas, error } = await cargarLlamadas(sesion.user.rol, sesion.user.id);
  const administra = esAdmin(sesion);
  const nombre = sesion.user.name ?? sesion.user.id;

  const cabecera = (
    <PageHeader
      titulo="Dashboard"
      descripcion={
        administra
          ? "Metricas de operacion y actividad reciente del asistente"
          : `Tu trabajo del momento, ${nombre}`
      }
    />
  );

  if (error) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {cabecera}
        <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-6">
          <Alert variant="destructive" titulo="No se pudo conectar con el backend de CORA">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  if (!administra && llamadas.length === 0) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {cabecera}
        <div className="rounded-3xl bg-card shadow-sm ring-1 ring-border">
          <EmptyState
            icon={PhoneOffIcon}
            titulo="No tienes llamadas asignadas todavia."
            descripcion="Cuando un administrador te asigne una llamada, apareceran aqui con su resumen y su transcripcion."
          />
        </div>
      </div>
    );
  }

  if (!administra) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {cabecera}
        <PanelAgente
          metricas={calcularMetricasAgente(llamadas)}
          llamadas={llamadas}
          rol={sesion.user.rol}
        />
      </div>
    );
  }

  const asignables = await listarAsignables();
  const conteoPorAgente = llamadasPorAgente(llamadas);
  const carga = asignables.map((agente) => ({
    ...agente,
    asignadas: conteoPorAgente.get(agente.id) ?? 0,
  }));

  return (
    <div className="space-y-5 sm:space-y-6">
      {cabecera}
      <PanelAdmin
        metricas={calcularMetricas(llamadas)}
        operacion={calcularMetricasOperacion(llamadas)}
        llamadas={llamadas}
        carga={carga}
        asignables={asignables}
        rol={sesion.user.rol}
      />
    </div>
  );
}
