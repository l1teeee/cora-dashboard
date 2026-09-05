import type { ReactNode } from "react";
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
import {
  BotonRefrescar,
  ContenidoActualizable,
  ProveedorActualizacion,
} from "@/components/actualizacion";
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

  let cuerpo: ReactNode;

  if (error) {
    cuerpo = (
      <div className="superficie p-4 sm:p-6">
        <Alert variant="destructive" titulo="No se pudo conectar con el backend de CORA">
          {error}
        </Alert>
      </div>
    );
  } else if (!administra && llamadas.length === 0) {
    cuerpo = (
      <div className="superficie">
        <EmptyState
          icon={PhoneOffIcon}
          titulo="No tienes llamadas asignadas todavia."
          descripcion="Cuando un administrador te asigne una llamada, apareceran aqui con su resumen y su transcripcion."
        />
      </div>
    );
  } else if (!administra) {
    cuerpo = (
      <PanelAgente
        metricas={calcularMetricasAgente(llamadas)}
        llamadas={llamadas}
        rol={sesion.user.rol}
      />
    );
  } else {
    const asignables = await listarAsignables();
    const conteoPorAgente = llamadasPorAgente(llamadas);
    const carga = asignables.map((agente) => ({
      ...agente,
      asignadas: conteoPorAgente.get(agente.id) ?? 0,
    }));

    cuerpo = (
      <PanelAdmin
        metricas={calcularMetricas(llamadas)}
        operacion={calcularMetricasOperacion(llamadas)}
        llamadas={llamadas}
        carga={carga}
        asignables={asignables}
        rol={sesion.user.rol}
      />
    );
  }

  return (
    <ProveedorActualizacion>
      <div className="space-y-5 sm:space-y-6">
        <PageHeader
          titulo="Dashboard"
          descripcion={
            administra
              ? "Metricas de operacion y actividad reciente del asistente"
              : `Tu trabajo del momento, ${nombre}`
          }
        >
          <BotonRefrescar />
        </PageHeader>

        <ContenidoActualizable>{cuerpo}</ContenidoActualizable>
      </div>
    </ProveedorActualizacion>
  );
}
