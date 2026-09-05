import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/solo-admin";
import { listarUsuarios, type UsuarioRemoto } from "@/lib/usuarios-api";
import { AccesoDenegado } from "@/components/acceso-denegado";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { TablaUsuarios } from "@/components/tabla-usuarios";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  if (!esAdmin(sesion)) {
    return <AccesoDenegado seccion="usuarios" />;
  }

  let usuarios: UsuarioRemoto[] = [];
  let error: string | null = null;

  try {
    usuarios = await listarUsuarios();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas que pueden entrar al panel y recibir llamadas asignadas"
      />

      {error ? (
        <div className="superficie p-4 sm:p-6">
          <Alert variant="destructive" titulo="No se pudo conectar con el backend de CORA">
            {error}
          </Alert>
        </div>
      ) : (
        <TablaUsuarios usuarios={usuarios} />
      )}
    </div>
  );
}
