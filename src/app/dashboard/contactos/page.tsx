import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/solo-admin";
import { listarContactos, type Contacto } from "@/lib/contactos";
import { AccesoDenegado } from "@/components/acceso-denegado";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { TablaContactos } from "@/components/tabla-contactos";

const POR_PAGINA = 50;

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  if (!esAdmin(sesion)) {
    return <AccesoDenegado seccion="contactos" />;
  }

  let contactos: Contacto[] = [];
  let error: string | null = null;

  try {
    const { data } = await listarContactos({ limit: POR_PAGINA });
    contactos = data;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        titulo="Contactos"
        descripcion="Personas que han llamado y su historial"
      />

      {error ? (
        <div className="superficie p-4 sm:p-6">
          <Alert variant="destructive" titulo="No se pudo conectar con el backend de CORA">
            {error}
          </Alert>
        </div>
      ) : (
        <TablaContactos contactos={contactos} />
      )}
    </div>
  );
}
