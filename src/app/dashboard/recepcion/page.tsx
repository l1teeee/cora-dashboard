import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { Recepcion } from "@/components/recepcion/recepcion";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        titulo="Recepcion"
        descripcion="Tu puesto de atencion: estado, cola de espera y llamadas entrantes"
      />

      <Alert titulo="Pantalla de demostracion">
        Nada de lo que ves aqui esta conectado al telefono todavia: las llamadas son
        de ejemplo y el tono se genera en el navegador. Sirve para acordar como
        deberia funcionar el puesto antes de construirlo.
      </Alert>

      <Recepcion />
    </div>
  );
}
