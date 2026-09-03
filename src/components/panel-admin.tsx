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
import { LlamadasPorHora } from "@/components/llamadas-por-hora";
import { CargaAgentes } from "@/components/carga-agentes";
import { TablaLlamadas } from "@/components/tabla-llamadas";
import { PANEL_ADMIN } from "@/lib/panel-layout";
import {
  formatearCosto,
  formatearDuracion,
  llamadasPorHora,
} from "@/lib/metricas";
import type { Llamada, Metricas, MetricasOperacion, Rol } from "@/lib/tipos";

function serieUltimos14Dias(llamadas: Llamada[]): number[] {
  const claves: string[] = [];
  const hoy = new Date();

  for (let diasAtras = 13; diasAtras >= 0; diasAtras--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - diasAtras);

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    claves.push(`${anio}-${mes}-${dia}`);
  }

  return claves.map(
    (clave) => llamadas.filter((l) => l.fecha?.slice(0, 10) === clave).length
  );
}

function desgloseFinalizacion(llamadas: Llamada[]) {
  const conteos = new Map<string, number>();

  for (const llamada of llamadas) {
    const razon = llamada.razon_finalizacion ?? "Sin dato";
    conteos.set(razon, (conteos.get(razon) ?? 0) + 1);
  }

  const filas: { razon: string; cantidad: number }[] = [];
  for (const [razon, cantidad] of conteos) {
    filas.push({ razon, cantidad });
  }
  filas.sort((a, b) => b.cantidad - a.cantidad);

  return filas;
}

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
  const serieLlamadas = serieUltimos14Dias(llamadas);
  const hayDatosEnSerie = serieLlamadas.some((valor) => valor > 0);

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
          <LlamadasPorHora conteos={llamadasPorHora(llamadas)} />
        </TarjetaWidget>
      ),
    },
    {
      id: "carga",
      contenido: (
        <TarjetaWidget
          titulo="Carga por asesor"
          descripcion="Llamadas asignadas a cada agente activo"
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
        >
          <BarrasFinalizacion
            filas={desgloseFinalizacion(llamadas)}
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
  ];

  return <PanelTarjetas panel={PANEL_ADMIN} widgets={widgets} />;
}
