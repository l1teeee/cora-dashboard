"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HistoryIcon, Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Snapshot = {
  id: number;
  assistant_id: string;
  usuario: string;
  fecha: string;
  tamano: number;
};

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo" };

// Se parte el string a mano en vez de pasarlo por Date: la fecha ya viene en hora
// local del backend y construir un Date reinterpretaria "YYYY-MM-DD HH:MM:SS" como
// UTC, desplazando la hora mostrada.
function formatearFecha(fecha: string) {
  const [parteFecha, parteHora] = fecha.split(" ");
  if (!parteFecha || !parteHora) return fecha;

  const [anio, mes, dia] = parteFecha.split("-");
  const [horas, minutos] = parteHora.split(":");

  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

function formatearTamano(bytes: number) {
  return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
}

type Props = {
  onRevertido?: () => void;
};

export function HistorialAsistente({ onRevertido }: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [versiones, setVersiones] = useState<Snapshot[]>([]);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [versionARevertir, setVersionARevertir] = useState<Snapshot | null>(null);
  const [revirtiendo, setRevirtiendo] = useState(false);

  async function cargarHistorial() {
    setEstado({ tipo: "cargando" });

    try {
      const respuesta = await fetch("/api/historial");

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        setEstado({
          tipo: "error",
          mensaje: cuerpo?.error ?? "No se pudo cargar el historial de cambios.",
        });
        return;
      }

      const datos: { data: Snapshot[] } = await respuesta.json();
      setVersiones(datos.data);
      setEstado({ tipo: "listo" });
    } catch {
      setEstado({ tipo: "error", mensaje: "No se pudo conectar con el servidor." });
    }
  }

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function confirmarReversion() {
    if (!versionARevertir) return;

    setRevirtiendo(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const respuesta = await fetch(`/api/historial/${versionARevertir.id}/revertir`, {
        method: "POST",
      });

      const cuerpo = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        setMensajeError(cuerpo?.error ?? "No se pudo revertir la configuracion.");
        setVersionARevertir(null);
        return;
      }

      setVersionARevertir(null);
      setMensajeExito("Configuracion restaurada");
      await cargarHistorial();
      onRevertido?.();
      // El formulario del asistente vive en un componente hermano y lee sus datos
      // solo al montarse: se fuerza un refresh del server tree para que se remonte
      // con la config recien revertida (ver key en dashboard/asistente/page.tsx).
      router.refresh();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
      setVersionARevertir(null);
    } finally {
      setRevirtiendo(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de cambios</CardTitle>
        <CardDescription>
          Cada modificacion guarda automaticamente la configuracion anterior.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {estado.tipo === "cargando" && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {estado.tipo === "error" && <Alert variant="destructive">{estado.mensaje}</Alert>}

        {estado.tipo === "listo" && (
          <div className="superficie overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versiones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-28 p-0">
                      <EmptyState
                        icon={HistoryIcon}
                        titulo="Todavia no hay versiones guardadas."
                        descripcion="Cada cambio en el asistente guarda automaticamente la version anterior."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  versiones.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium text-foreground">
                        {formatearFecha(version.fecha)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{version.usuario}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatearTamano(version.tamano)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVersionARevertir(version)}
                        >
                          <Undo2Icon className="size-4" strokeWidth={1.75} />
                          Revertir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {mensajeExito && <Alert variant="success">{mensajeExito}</Alert>}
        {mensajeError && <Alert variant="destructive">{mensajeError}</Alert>}
      </CardContent>

      <Dialog
        open={versionARevertir !== null}
        onOpenChange={(open) => !open && setVersionARevertir(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revertir a version anterior</DialogTitle>
            <DialogDescription>
              Se restaurara la configuracion del asistente tal y como estaba el{" "}
              <span className="font-medium text-foreground">
                {versionARevertir ? formatearFecha(versionARevertir.fecha) : ""}
              </span>
              . La configuracion actual se guardara antes como una version nueva, asi
              que esta accion tambien se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={revirtiendo} />}>
              Cancelar
            </DialogClose>
            <Button onClick={confirmarReversion} disabled={revirtiendo}>
              {revirtiendo ? "Revirtiendo..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
