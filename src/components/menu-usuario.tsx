"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import type { Rol } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MenuUsuario({
  usuario,
  rol,
  colapsada,
}: {
  usuario: string;
  rol: Rol;
  colapsada: boolean;
}) {
  const etiquetaRol = rol === "admin" ? "Administrador" : "Agente";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Cuenta de ${usuario}`}
        title={colapsada ? usuario : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors duration-150 ease-out",
          "hover:bg-white/8 data-popup-open:bg-white/10",
          "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          colapsada && "justify-center"
        )}
      >
        <Avatar nombre={usuario} size="sm" />
        {!colapsada && (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium text-sidebar-foreground">
                {usuario}
              </span>
              <span className="text-[11px] text-sidebar-foreground/50">{etiquetaRol}</span>
            </span>
            <ChevronsUpDownIcon
              className="size-4 shrink-0 text-sidebar-foreground/45"
              strokeWidth={1.75}
            />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={10} className="min-w-60">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar nombre={usuario} size="default" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium">{usuario}</span>
            <span className="text-[11px] text-muted-foreground">{etiquetaRol}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLinkItem render={<Link href="/dashboard/configuracion" />}>
          <SettingsIcon strokeWidth={1.75} />
          Configuracion
        </DropdownMenuLinkItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOutIcon strokeWidth={1.75} />
          Cerrar sesion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
