import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/solo-admin";
import { AccesoDenegado } from "@/components/acceso-denegado";
import { PageHeader } from "@/components/ui/page-header";
import { PanelAsistente } from "@/components/panel-asistente";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  if (!esAdmin(sesion)) {
    return <AccesoDenegado seccion="asistente" />;
  }

  return (
    <>
      <PageHeader
        titulo="Asistente"
        descripcion="Configuracion, base de conocimiento e historial de cambios del asistente de voz"
      />
      <PanelAsistente />
    </>
  );
}
