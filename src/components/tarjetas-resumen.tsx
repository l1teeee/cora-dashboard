import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearCosto, formatearDuracion } from "@/lib/metricas";
import type { Metricas } from "@/lib/tipos";

export function TarjetasResumen({ metricas }: { metricas: Metricas }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Total de llamadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{metricas.totalLlamadas}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Costo total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {formatearCosto(metricas.costoTotal)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Duracion promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {formatearDuracion(Math.round(metricas.duracionPromedio))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
