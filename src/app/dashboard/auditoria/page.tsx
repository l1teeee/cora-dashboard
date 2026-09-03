import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/solo-admin";
import { AccesoDenegado } from "@/components/acceso-denegado";
import { PageHeader } from "@/components/ui/page-header";
import { TablaAuditoria } from "@/components/tabla-auditoria";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  if (!esAdmin(sesion)) {
    return <AccesoDenegado seccion="auditoria" />;
  }

  return (
    <>
      <PageHeader titulo="Auditoria" descripcion="Registro de cambios realizados sobre el asistente" />
      <TablaAuditoria />
    </>
  );
}
