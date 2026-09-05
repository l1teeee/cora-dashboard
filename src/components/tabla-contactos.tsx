"use client";

import { useState } from "react";
import { SearchIcon, UsersIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { FichaContacto } from "@/components/ficha-contacto";
import { formatearFecha } from "@/lib/metricas";
import type { Contacto } from "@/lib/contactos";

// Los nombres capturados llevan tildes: buscar "jose" tiene que encontrar "José".
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function TablaContactos({ contactos }: { contactos: Contacto[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [telefonoSeleccionado, setTelefonoSeleccionado] = useState<string | null>(null);

  const termino = normalizar(busqueda.trim());
  const visibles =
    termino === ""
      ? contactos
      : contactos.filter(
          (contacto) =>
            normalizar(contacto.nombre ?? "").includes(termino) ||
            normalizar(contacto.telefono).includes(termino)
        );

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre o telefono"
          aria-label="Buscar contactos"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
      </div>

      <div className="overflow-hidden superficie">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Llamadas</TableHead>
              <TableHead>Ultima llamada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 p-0">
                  {contactos.length === 0 ? (
                    <EmptyState
                      icon={UsersIcon}
                      titulo="Todavia no hay contactos"
                      descripcion="Los contactos se crean solos con la primera llamada de cada persona."
                    />
                  ) : (
                    <EmptyState
                      icon={SearchIcon}
                      titulo="Ningun contacto coincide"
                      descripcion={`No hay resultados para "${busqueda}".`}
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              visibles.map((contacto) => (
                <TableRow
                  key={contacto.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver ficha de ${contacto.nombre ?? contacto.telefono}`}
                  onClick={() => setTelefonoSeleccionado(contacto.telefono)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter") {
                      setTelefonoSeleccionado(contacto.telefono);
                    } else if (evento.key === " ") {
                      evento.preventDefault();
                      setTelefonoSeleccionado(contacto.telefono);
                    }
                  }}
                  className="cursor-pointer focus-visible:outline-none focus-visible:bg-primary/8"
                >
                  <TableCell className="font-medium text-foreground">
                    {contacto.nombre ?? (
                      <span className="font-normal text-muted-foreground">Sin nombre</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {contacto.telefono}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contacto.total_llamadas}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatearFecha(contacto.ultima_llamada)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FichaContacto
        telefono={telefonoSeleccionado}
        onClose={() => setTelefonoSeleccionado(null)}
      />
    </div>
  );
}
