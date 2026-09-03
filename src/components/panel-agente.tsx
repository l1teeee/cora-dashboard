import Link from "next/link";
import {
  ClockIcon,
  FlagIcon,
  HourglassIcon,
  MessageSquareWarningIcon,
  PhoneCallIcon,
  UsersRoundIcon,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PanelTarjetas, type Widget } from "@/components/panel-tarjetas";
import { TarjetaWidget } from "@/components/tarjeta-widget";
import { TablaLlamadas } from "@/components/tabla-llamadas";
import { PANEL_AGENTE } from "@/lib/panel-layout";
import { formatearDuracion, formatearFecha } from "@/lib/metricas";
import type { Llamada, MetricasAgente, Rol } from "@/lib/tipos";
import { FlagOffIcon } from "lucide-react";

export function PanelAgente({
  metricas,
  llamadas,
  rol,
}: {
  metricas: MetricasAgente;
  llamadas: Llamada[];
  rol: Rol;
}) {
  const pendientes = llamadas.filter((llamada) => llamada.requiere_seguimiento === 1);

  const widgets: Widget[] = [
    {
      id: "mias",
      anchoEnMovil: true,
      contenido: (
        <StatCard
          etiqueta="Mis llamadas"
          valor={metricas.total}
          icon={PhoneCallIcon}
          detalle={
            metricas.ultimaLlamada
              ? `Ultima el ${formatearFecha(metricas.ultimaLlamada)}`
              : "Todavia sin llamadas asignadas"
          }
        />
      ),
    },
    {
      id: "seguimiento",
      anchoEnMovil: true,
      contenido: (
        <StatCard
          etiqueta="Pendientes de seguimiento"
          valor={metricas.seguimiento}
          icon={FlagIcon}
          detalle="La persona espera que le devuelvan la llamada"
        />
      ),
    },
    {
      id: "quejas",
      contenido: (
        <StatCard
          etiqueta="Quejas"
          valor={metricas.quejas}
          icon={MessageSquareWarningIcon}
          detalle="Atienden primero"
        />
      ),
    },
    {
      id: "sin-resumen",
      contenido: (
        <StatCard
          etiqueta="Esperando resumen"
          valor={metricas.sinResumen}
          icon={HourglassIcon}
          detalle="El asistente aun lo esta generando"
        />
      ),
    },
    {
      id: "personas",
      contenido: (
        <StatCard
          etiqueta="Personas atendidas"
          valor={metricas.personas}
          icon={UsersRoundIcon}
          detalle="Numeros distintos"
        />
      ),
    },
    {
      id: "duracion",
      contenido: (
        <StatCard
          etiqueta="Duracion promedio"
          valor={formatearDuracion(Math.round(metricas.duracionPromedio))}
          icon={ClockIcon}
          detalle="De tus llamadas"
        />
      ),
    },
    {
      id: "pendientes",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Pendientes de seguimiento"
          descripcion="Estas personas esperan que les devuelvas la llamada"
        >
          {pendientes.length === 0 ? (
            <EmptyState
              icon={FlagOffIcon}
              titulo="Nada pendiente"
              descripcion="Ninguna de tus llamadas quedo marcada para seguimiento."
            />
          ) : (
            <TablaLlamadas llamadas={pendientes} rol={rol} />
          )}
        </TarjetaWidget>
      ),
    },
    {
      id: "recientes",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Mis llamadas recientes"
          accion={
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/llamadas" />}
            >
              Ver todas
            </Button>
          }
        >
          <TablaLlamadas llamadas={llamadas.slice(0, 5)} rol={rol} />
        </TarjetaWidget>
      ),
    },
  ];

  return <PanelTarjetas panel={PANEL_AGENTE} widgets={widgets} />;
}
