import Link from "next/link";
import {
  ClockIcon,
  DollarSignIcon,
  PhoneCallIcon,
  CircleCheckIcon,
  PhoneForwardedIcon,
  UserRoundXIcon,
  RepeatIcon,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { PanelTarjetas, type Widget } from "@/components/panel-tarjetas";
import { TarjetaWidget } from "@/components/tarjeta-widget";
import { BarrasFinalizacion } from "@/components/barras-finalizacion";
import { CargaAgentes } from "@/components/carga-agentes";
import { TablaLlamadas } from "@/components/tabla-llamadas";
import {
  CostoPorDia,
  DuracionPorRangos,
  LlamadasPorDia,
  LlamadasPorDiaSemana,
  LlamadasPorHora,
} from "@/components/graficas/diferidas";
import { PANEL_ADMIN } from "@/lib/panel-layout";
import {
  costoPorDia,
  desgloseFinalizacion,
  duracionPorRangos,
  formatearCosto,
  formatearDuracion,
  llamadasPorDia,
  llamadasPorDiaSemana,
  llamadasPorHora,
} from "@/lib/metricas";
import type { Llamada, Metricas, MetricasOperacion, Rol } from "@/lib/tipos";

export function PanelAdmin({
  metricas,
  operacion,
  llamadas,
  carga,
  asignables,
  rol,
}: {
  metricas: Metricas;
  operacion: MetricasOperacion;
  llamadas: Llamada[];
  carga: { id: string; nombre: string; asignadas: number }[];
  asignables: { id: string; nombre: string }[];
  rol: Rol;
}) {
  const serieLlamadas = llamadasPorDia(llamadas, 14);
  const hayDatosEnSerie = serieLlamadas.some((punto) => punto.valor > 0);
  const conteosPorHora = llamadasPorHora(llamadas);
  const filasFinalizacion = desgloseFinalizacion(llamadas);
  const serieCostoPorDia = costoPorDia(llamadas, 14);
  const rangosDuracion = duracionPorRangos(llamadas);
  const serieDiaSemana = llamadasPorDiaSemana(llamadas);

  const widgets: Widget[] = [
    {
      id: "total",
      anchoEnMovil: true,
      contenido: (
        <StatCard
          etiqueta="Total de llamadas"
          valor={metricas.totalLlamadas}
          icon={PhoneCallIcon}
          detalle="Ultimos 14 dias"
          serie={hayDatosEnSerie ? serieLlamadas : undefined}
        />
      ),
    },
    {
      id: "exito",
      contenido: (
        <StatCard
          etiqueta="Tasa de exito"
          valor={`${Math.round(operacion.tasaExito)}%`}
          icon={CircleCheckIcon}
          detalle={`${operacion.fallidas} con fallo tecnico`}
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
          detalle={`Mediana ${formatearDuracion(Math.round(operacion.duracionMediana))}`}
        />
      ),
    },
    {
      id: "costo",
      contenido: (
        <StatCard
          etiqueta="Costo total"
          valor={formatearCosto(metricas.costoTotal)}
          icon={DollarSignIcon}
          detalle={`${formatearCosto(operacion.costoPromedio)} por llamada`}
        />
      ),
    },
    {
      id: "transferencias",
      contenido: (
        <StatCard
          etiqueta="Transferencias fallidas"
          valor={operacion.transferenciasFallidas}
          icon={PhoneForwardedIcon}
          detalle="No se logro pasar con un asesor"
        />
      ),
    },
    {
      id: "sin-asignar",
      contenido: (
        <StatCard
          etiqueta="Sin asignar"
          valor={operacion.sinAsignar}
          icon={UserRoundXIcon}
          detalle="Llamadas sin asesor responsable"
        />
      ),
    },
    {
      id: "recurrentes",
      contenido: (
        <StatCard
          etiqueta="Personas que repiten"
          valor={operacion.recurrentes}
          icon={RepeatIcon}
          detalle={`${operacion.numerosUnicos} numeros distintos`}
        />
      ),
    },
    {
      id: "por-hora",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Llamadas por hora"
          descripcion="En que franjas entra el volumen, para dimensionar los turnos"
        >
          <LlamadasPorHora conteos={conteosPorHora} />
        </TarjetaWidget>
      ),
    },
    {
      id: "carga",
      contenido: (
        <TarjetaWidget
          titulo="Carga por asesor"
          descripcion="Llamadas asignadas a cada agente activo"
          accion={
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/usuarios" />}
            >
              Ver asesores
            </Button>
          }
        >
          <CargaAgentes agentes={carga} sinAsignar={operacion.sinAsignar} />
        </TarjetaWidget>
      ),
    },
    {
      id: "finalizacion",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Finalizacion de llamadas"
          descripcion="Como termino cada llamada. Los slugs son los de Vapi; entre parentesis, que significan."
          accion={
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/llamadas" />}
            >
              Ver llamadas
            </Button>
          }
        >
          <BarrasFinalizacion
            filas={filasFinalizacion}
            total={llamadas.length}
          />
        </TarjetaWidget>
      ),
    },
    {
      id: "ultimas",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Ultimas llamadas"
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
          <TablaLlamadas
            llamadas={llamadas.slice(0, 5)}
            rol={rol}
            asignables={asignables}
          />
        </TarjetaWidget>
      ),
    },
    {
      id: "tendencia",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Llamadas por dia"
          descripcion="Volumen diario de los ultimos 14 dias"
        >
          <LlamadasPorDia datos={serieLlamadas} />
        </TarjetaWidget>
      ),
    },
    {
      id: "costo-dia",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Costo por dia"
          descripcion="Cuanto cuesta la operacion cada dia"
        >
          <CostoPorDia datos={serieCostoPorDia} />
        </TarjetaWidget>
      ),
    },
    {
      id: "duracion-rangos",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Duracion por rangos"
          descripcion="Cuantas llamadas caen en cada tramo de duracion"
        >
          <DuracionPorRangos datos={rangosDuracion} />
        </TarjetaWidget>
      ),
    },
    {
      id: "dia-semana",
      anchoEnMovil: true,
      contenido: (
        <TarjetaWidget
          titulo="Llamadas por dia de la semana"
          descripcion="Que dias concentran el volumen"
        >
          <LlamadasPorDiaSemana datos={serieDiaSemana} />
        </TarjetaWidget>
      ),
    },
  ];

  return <PanelTarjetas panel={PANEL_ADMIN} widgets={widgets} />;
}
