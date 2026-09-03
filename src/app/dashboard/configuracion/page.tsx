import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TemaToggle } from "@/components/tema-toggle";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-7">
      <PageHeader
        titulo="Configuracion"
        descripcion="Preferencias de la cuenta y del panel"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
            <CardDescription>Datos de la sesion activa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Usuario</span>
              <span className="font-medium">{sesion.user.name ?? "Usuario"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Rol</span>
              <Badge variant="secondary">
                {sesion.user.rol === "admin" ? "Administrador" : "Agente"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>Alterna entre modo claro y oscuro</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Tema</span>
            <TemaToggle />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
