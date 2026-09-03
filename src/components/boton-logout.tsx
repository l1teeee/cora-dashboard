"use client";

import { signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonLogout() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Cerrar sesion"
      title="Cerrar sesion"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOutIcon className="size-4" strokeWidth={1.75} />
      <span className="sr-only">Cerrar sesion</span>
    </Button>
  );
}
