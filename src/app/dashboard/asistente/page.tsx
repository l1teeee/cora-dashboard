import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/solo-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotonLogout } from "@/components/boton-logout";
import { NavAdmin } from "@/components/nav-admin";
import { PanelAsistente } from "@/components/panel-asistente";

export default async function Page() {
  const sesion = await auth();

  if (!sesion?.user) {
    redirect("/login");
  }

  if (!esAdmin(sesion)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-lg">403 · Solo administradores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta seccion es exclusiva para usuarios con rol de administrador.
            </p>
            <Button render={<Link href="/dashboard" />}>Volver al panel</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rolEtiqueta = sesion.user.rol === "admin" ? "Administrador" : "Agente";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CORA</h1>
            <p className="text-sm text-muted-foreground">Asistente</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{sesion.user.name}</span>
            <Badge variant="secondary">{rolEtiqueta}</Badge>
            <BotonLogout />
          </div>
        </header>

        <NavAdmin />

        <main className="mt-8 space-y-6">
          <PanelAsistente />
        </main>
      </div>
    </div>
  );
}
