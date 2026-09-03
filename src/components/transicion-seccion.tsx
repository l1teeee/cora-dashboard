"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function TransicionSeccion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // El HTML de la primera carga llega ya pintado desde el servidor: animarlo ahi
  // haria que la seccion parpadeara de visible a invisible antes del fundido.
  const yaMontado = useRef(false);

  useGSAP(
    () => {
      if (!yaMontado.current) {
        yaMontado.current = true;
        return;
      }

      // El contenedor de scroll es <main>, no la ventana, asi que Next no lo
      // reposiciona al navegar: sin esto la seccion nueva entraria a media altura.
      contenedor.current?.closest("main")?.scrollTo({ top: 0 });

      // La regla CSS de prefers-reduced-motion no alcanza a GSAP, que anima por JS:
      // matchMedia es lo que deja la seccion quieta para quien lo pidio.
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(contenedor.current, {
          opacity: 0,
          y: 12,
          duration: 0.5,
          ease: "power2.out",
          // Sin esto el contenedor se queda con un transform inline al terminar, y un
          // transform crea bloque contenedor: cualquier sticky o fixed que se anada
          // dentro de una seccion dejaria de posicionarse contra el viewport.
          clearProps: "all",
        });
      });

      return () => media.revert();
    },
    { dependencies: [pathname] }
  );

  return (
    <div ref={contenedor} className={cn(className)}>
      {children}
    </div>
  );
}
