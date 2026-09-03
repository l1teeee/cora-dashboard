import { ClockIcon, DollarSignIcon, PhoneCallIcon } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatearCosto, formatearDuracion } from "@/lib/metricas";
import type { Llamada, Metricas } from "@/lib/tipos";

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

  const conteos = claves.map((clave) => {
    const llamadasDelDia = llamadas.filter((l) => l.fecha?.slice(0, 10) === clave);
    return llamadasDelDia.length;
  });

  return conteos;
}

export function TarjetasResumen({
  metricas,
  llamadas,
}: {
  metricas: Metricas;
  llamadas: Llamada[];
}) {
  const serieLlamadas = serieUltimos14Dias(llamadas);
  const hayDatosEnSerie = serieLlamadas.some((valor) => valor > 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        etiqueta="Total de llamadas"
        valor={metricas.totalLlamadas}
        icon={PhoneCallIcon}
        detalle="Ultimos 14 dias"
        serie={hayDatosEnSerie ? serieLlamadas : undefined}
      />

      <StatCard
        etiqueta="Costo total"
        valor={formatearCosto(metricas.costoTotal)}
        icon={DollarSignIcon}
      />

      <StatCard
        etiqueta="Duracion promedio"
        valor={formatearDuracion(Math.round(metricas.duracionPromedio))}
        icon={ClockIcon}
        detalle={`Total ${formatearDuracion(metricas.duracionTotal)}`}
      />
    </div>
  );
}
