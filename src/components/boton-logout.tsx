"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function BotonLogout() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Cerrar sesion
    </Button>
  );
}
