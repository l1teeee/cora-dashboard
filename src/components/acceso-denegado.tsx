import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function AccesoDenegado({ seccion }: { seccion: string }) {
  return (
    <div className="rounded-[1.125rem] bg-card shadow-[0_1px_2px_rgb(18_20_22_/_0.04)] ring-1 ring-border">
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
