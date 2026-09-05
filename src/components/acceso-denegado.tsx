import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function AccesoDenegado({ seccion }: { seccion: string }) {
  return (
    <div className="superficie">
      <EmptyState
        icon={ShieldAlertIcon}
        titulo="403 - Solo administradores"
        descripcion={`La seccion de ${seccion} es exclusiva para usuarios con rol de administrador.`}
      >
        <Button nativeButton={false} render={<Link href="/dashboard" />}>
          Volver al panel
        </Button>
      </EmptyState>
    </div>
  );
}
