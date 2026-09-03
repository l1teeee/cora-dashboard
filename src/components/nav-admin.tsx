"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/dashboard", etiqueta: "Llamadas" },
  { href: "/dashboard/asistente", etiqueta: "Asistente" },
  { href: "/dashboard/auditoria", etiqueta: "Auditoria" },
];

export function NavAdmin() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap items-center gap-1 border-b pb-3">
      {ENLACES.map((enlace) => {
        const activo = pathname === enlace.href;

        return (
          <Link
            key={enlace.href}
            href={enlace.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              activo
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {enlace.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
