import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/solo-admin";
import { listarAsignables } from "@/lib/usuarios";
import { ShellDashboard } from "@/components/shell-dashboard";
import { ProveedorLlamadas } from "@/components/recepcion/proveedor-llamadas";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const sesion = await auth();
  if (!sesion?.user) redirect("/login");

  // La lista de agentes solo se pide si quien mira puede delegar: al agente no le sirve
  // de nada y no tiene por que salir del servidor hacia su navegador.
  const administra = esAdmin(sesion);
  const asignables = administra ? await listarAsignables() : [];

  return (
    // El proveedor envuelve al shell y no al reves: el aviso de llamada y el panel de
    // la llamada en curso se pintan fuera del marco, que recorta con overflow-hidden.
    <ProveedorLlamadas puedeTransferir={administra} asignables={asignables}>
      <ShellDashboard rol={sesion.user.rol} usuario={sesion.user.name ?? "Usuario"}>
        {children}
      </ShellDashboard>
    </ProveedorLlamadas>
  );
}
