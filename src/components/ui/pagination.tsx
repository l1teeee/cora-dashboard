import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Item =
  | { tipo: "pagina"; numero: number }
  | { tipo: "separador"; key: string }

function construirItems(paginaActual: number, totalPaginas: number): Item[] {
  const vecinos = new Set([1, totalPaginas, paginaActual - 1, paginaActual, paginaActual + 1])
  const numeros = [...vecinos]
    .filter((numero) => numero >= 1 && numero <= totalPaginas)
    .sort((a, b) => a - b)

  const items: Item[] = []
  numeros.forEach((numero, indice) => {
    const anterior = numeros[indice - 1]
    if (anterior !== undefined && numero - anterior > 1) {
      items.push({ tipo: "separador", key: `sep-${numero}` })
    }
    items.push({ tipo: "pagina", numero })
  })
  return items
}

function Paginacion({
  paginaActual,
  totalPaginas,
  onCambiar,
  className,
}: {
  paginaActual: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
  className?: string
}) {
  if (totalPaginas <= 1) return null

  const items = construirItems(paginaActual, totalPaginas)

  return (
    <nav
      data-slot="paginacion"
      aria-label="Paginacion"
      className={cn("flex items-center gap-1", className)}
    >
      <Button
        variant="ghost"
        size="sm"
        aria-label="Anterior"
        disabled={paginaActual === 1}
        onClick={() => onCambiar(paginaActual - 1)}
      >
        <ChevronLeftIcon />
      </Button>

      {items.map((item) =>
        item.tipo === "separador" ? (
          <span
            key={item.key}
            className="px-1 text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <Button
            key={item.numero}
            variant={item.numero === paginaActual ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={`Pagina ${item.numero}`}
            aria-current={item.numero === paginaActual ? "page" : undefined}
            onClick={() => onCambiar(item.numero)}
          >
            {item.numero}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="sm"
        aria-label="Siguiente"
        disabled={paginaActual === totalPaginas}
        onClick={() => onCambiar(paginaActual + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </nav>
  )
}

export { Paginacion }
