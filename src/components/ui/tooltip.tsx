"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({
  className,
  children,
  side = "top",
  sideOffset = 8,
  align = "center",
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset" | "align">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="isolate z-50 outline-none"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "origin-(--transform-origin) rounded-[0.6rem] bg-popover px-2.5 py-1.5 text-[12px] leading-none font-medium whitespace-nowrap text-popover-foreground outline-none",
            "shadow-[0_1px_2px_rgb(18_20_22_/_0.08),0_8px_20px_-8px_rgb(18_20_22_/_0.22)] ring-1 ring-border",
            // La curva de salida suave y los 180ms evitan que aparezca de golpe;
            // el origen en el gatillo hace que crezca desde el icono.
            "transition-[transform,opacity,translate] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            "data-starting-style:scale-[0.96] data-starting-style:opacity-0",
            "data-ending-style:scale-[0.96] data-ending-style:opacity-0",
            "data-[side=right]:data-starting-style:-translate-x-1",
            "data-[side=left]:data-starting-style:translate-x-1",
            "data-[side=top]:data-starting-style:translate-y-1",
            "data-[side=bottom]:data-starting-style:-translate-y-1",
            "data-instant:transition-none",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent }
