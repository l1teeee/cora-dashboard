"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function EntradaEscalonada({
  children,
  className,
  selector = ":scope > *",
  retraso = 0,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  retraso?: number;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // La regla CSS de prefers-reduced-motion no alcanza a GSAP, que anima por JS:
      // matchMedia es lo que deja el contenido quieto para quien lo pidio.
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(selector, {
          opacity: 0,
          y: 12,
          duration: 0.4,
          delay: retraso,
          ease: "power2.out",
          stagger: 0.06,
        });
      });

      return () => media.revert();
    },
    { scope: contenedor }
  );

  return (
    <div ref={contenedor} className={cn(className)}>
      {children}
    </div>
  );
}
