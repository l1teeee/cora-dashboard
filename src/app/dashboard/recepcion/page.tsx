import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/solo-admin";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Recepcion } from "@/components/recepcion/recepcion";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  const administra = esAdmin(sesion);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        titulo="Recepcion"
        descripcion={
          administra
            ? "Puesto de atencion: estado, cola de espera y reparto de llamadas"
            : "Tu puesto de atencion: estado, cola de espera y llamadas entrantes"
        }
      />

      <Alert titulo="Pantalla de demostracion">
        Nada de lo que ves aqui esta conectado al telefono todavia: las llamadas son de
        ejemplo y el tono se genera en el navegador. El boton de simular vive en la barra
        superior, asi que la llamada entra desde cualquier seccion del panel.
      </Alert>

      <Recepcion />
    </div>
  );
}
