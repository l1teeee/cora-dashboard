import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function AccesoDenegado({ seccion }: { seccion: string }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-border">
      <EmptyState
        icon={ShieldAlertIcon}
        titulo="403 - Solo administradores"
        descripcion={`La seccion de ${seccion} es exclusiva para usuarios con rol de administrador.`}
      >
        <Button render={<Link href="/dashboard" />}>Volver al panel</Button>
      </EmptyState>
    </div>
  );
}
