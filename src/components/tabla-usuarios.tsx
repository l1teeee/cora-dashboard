"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UsuarioRemoto } from "@/lib/usuarios-api";
import type { Rol } from "@/lib/usuarios";

const ROLES = [
  { value: "agente", label: "Agente" },
  { value: "admin", label: "Administrador" },
];

function esActivo(usuario: UsuarioRemoto) {
  return usuario.activo === 1;
}

export function TablaUsuarios({ usuarios }: { usuarios: UsuarioRemoto[] }) {
  const router = useRouter();
  const [creando, setCreando] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<UsuarioRemoto | null>(null);
  const [usuarioEnCambioDeEstado, setUsuarioEnCambioDeEstado] = useState<UsuarioRemoto | null>(null);

  function cerrarYRecargar() {
    setCreando(false);
    setUsuarioEnEdicion(null);
    setUsuarioEnCambioDeEstado(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setCreando(true)}>Nuevo usuario</Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-[0_2px_8px_-2px_rgb(18_20_22_/_0.08),0_1px_2px_rgb(18_20_22_/_0.04)] ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 p-0">
                  <EmptyState
                    icon={UsersIcon}
                    titulo="Todavia no hay usuarios"
                    descripcion="Crea la primera cuenta para que alguien pueda entrar al panel."
                  />
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium text-foreground">{usuario.nombre}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {usuario.login}
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.rol === "admin" ? "default" : "secondary"}>
                      {usuario.rol === "admin" ? "Administrador" : "Agente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={esActivo(usuario) ? "success" : "outline"}>
                      {esActivo(usuario) ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUsuarioEnEdicion(usuario)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={esActivo(usuario) ? "text-destructive hover:bg-destructive/10" : ""}
                        onClick={() => setUsuarioEnCambioDeEstado(usuario)}
                      >
                        {esActivo(usuario) ? "Desactivar" : "Reactivar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DialogoNuevoUsuario
        abierto={creando}
        onCerrar={() => setCreando(false)}
        onGuardado={cerrarYRecargar}
      />

      <DialogoEditarUsuario
        usuario={usuarioEnEdicion}
        onCerrar={() => setUsuarioEnEdicion(null)}
        onGuardado={cerrarYRecargar}
      />

      <DialogoCambiarEstado
        usuario={usuarioEnCambioDeEstado}
        onCerrar={() => setUsuarioEnCambioDeEstado(null)}
        onGuardado={cerrarYRecargar}
      />
    </div>
  );
}

function SelectRol({
  id,
  valor,
  onCambio,
  deshabilitado,
}: {
  id: string;
  valor: Rol;
  onCambio: (rol: Rol) => void;
  deshabilitado: boolean;
}) {
  return (
    <Select
      items={ROLES}
      value={valor}
      disabled={deshabilitado}
      onValueChange={(nuevoRol) => onCambio(nuevoRol === "admin" ? "admin" : "agente")}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((rol) => (
          <SelectItem key={rol.value} value={rol.value}>
            {rol.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DialogoNuevoUsuario({
  abierto,
  onCerrar,
  onGuardado,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [login, setLogin] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<Rol>("agente");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  function reiniciar() {
    setLogin("");
    setNombre("");
    setRol("agente");
    setPassword("");
    setMensajeError(null);
  }

  async function crear() {
    setEnviando(true);
    setMensajeError(null);

    try {
      const respuesta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, nombre, rol, password }),
      });

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        setMensajeError(cuerpo?.error ?? "No se pudo crear el usuario.");
        return;
      }

      reiniciar();
      onGuardado();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(open) => {
        if (!open) {
          reiniciar();
          onCerrar();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            La cuenta podra entrar al panel en cuanto se cree.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Login" htmlFor="nuevo-login" hint="Es el identificador con el que entra al panel.">
            <Input
              id="nuevo-login"
              value={login}
              disabled={enviando}
              onChange={(evento) => setLogin(evento.target.value)}
            />
          </Field>

          <Field label="Nombre" htmlFor="nuevo-nombre">
            <Input
              id="nuevo-nombre"
              value={nombre}
              disabled={enviando}
              onChange={(evento) => setNombre(evento.target.value)}
            />
          </Field>

          <Field label="Rol" htmlFor="nuevo-rol">
            <SelectRol id="nuevo-rol" valor={rol} onCambio={setRol} deshabilitado={enviando} />
          </Field>

          <Field label="Contrasena" htmlFor="nueva-password" hint="Minimo 8 caracteres.">
            <Input
              id="nueva-password"
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={enviando}
              onChange={(evento) => setPassword(evento.target.value)}
            />
          </Field>

          {mensajeError && <Alert variant="destructive">{mensajeError}</Alert>}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={enviando} />}>
            Cancelar
          </DialogClose>
          <Button onClick={crear} disabled={enviando}>
            {enviando ? "Creando..." : "Crear usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogoEditarUsuario({
  usuario,
  onCerrar,
  onGuardado,
}: {
  usuario: UsuarioRemoto | null;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<Rol>("agente");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [loginCargado, setLoginCargado] = useState<string | null>(null);

  // El dialogo se reutiliza para cada fila: al abrirse sobre otro usuario hay que
  // volver a sembrar el formulario con los datos de ese usuario.
  if (usuario && usuario.login !== loginCargado) {
    setLoginCargado(usuario.login);
    setNombre(usuario.nombre);
    setRol(usuario.rol);
    setPassword("");
    setMensajeError(null);
  }

  async function guardar() {
    if (!usuario) return;

    setEnviando(true);
    setMensajeError(null);

    try {
      const respuesta = await fetch(`/api/usuarios/${encodeURIComponent(usuario.login)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, rol, password }),
      });

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        setMensajeError(cuerpo?.error ?? "No se pudo guardar el usuario.");
        return;
      }

      onGuardado();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={usuario !== null}
      onOpenChange={(open) => {
        if (!open) {
          // Olvidar que usuario se sembro obliga a releer sus datos si se vuelve a
          // abrir la misma fila, en vez de conservar lo que se dejo escrito.
          setLoginCargado(null);
          onCerrar();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Cuenta{" "}
            <span className="font-mono text-xs text-foreground">{usuario?.login}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Nombre" htmlFor="editar-nombre">
            <Input
              id="editar-nombre"
              value={nombre}
              disabled={enviando}
              onChange={(evento) => setNombre(evento.target.value)}
            />
          </Field>

          <Field label="Rol" htmlFor="editar-rol">
            <SelectRol id="editar-rol" valor={rol} onCambio={setRol} deshabilitado={enviando} />
          </Field>

          <Field
            label="Nueva contrasena"
            htmlFor="editar-password"
            hint="Dejala vacia para no cambiarla. Minimo 8 caracteres."
          >
            <Input
              id="editar-password"
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={enviando}
              onChange={(evento) => setPassword(evento.target.value)}
            />
          </Field>

          {mensajeError && <Alert variant="destructive">{mensajeError}</Alert>}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={enviando} />}>
            Cancelar
          </DialogClose>
          <Button onClick={guardar} disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogoCambiarEstado({
  usuario,
  onCerrar,
  onGuardado,
}: {
  usuario: UsuarioRemoto | null;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const desactivando = usuario !== null && esActivo(usuario);

  async function confirmar() {
    if (!usuario) return;

    setEnviando(true);
    setMensajeError(null);

    const ruta = `/api/usuarios/${encodeURIComponent(usuario.login)}`;
    const peticion: RequestInit = desactivando
      ? { method: "DELETE" }
      : {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo: 1 }),
        };

    try {
      const respuesta = await fetch(ruta, peticion);

      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => null);
        setMensajeError(cuerpo?.error ?? "No se pudo cambiar el estado del usuario.");
        return;
      }

      onGuardado();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog
      open={usuario !== null}
      onOpenChange={(open) => {
        if (!open) {
          setMensajeError(null);
          onCerrar();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{desactivando ? "Desactivar usuario" : "Reactivar usuario"}</DialogTitle>
          <DialogDescription>
            {desactivando ? (
              <>
                <span className="font-medium text-foreground">{usuario?.nombre}</span> dejara de
                poder entrar al panel. Sus llamadas asignadas se conservan tal cual.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{usuario?.nombre}</span> volvera a
                poder entrar al panel y a recibir llamadas asignadas.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {mensajeError && <Alert variant="destructive">{mensajeError}</Alert>}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={enviando} />}>
            Cancelar
          </DialogClose>
          <Button
            variant={desactivando ? "destructive" : "default"}
            onClick={confirmar}
            disabled={enviando}
          >
            {enviando ? "Aplicando..." : desactivando ? "Desactivar" : "Reactivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
