"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronRightIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { dividirPrompt, unirPrompt, type SeccionPrompt } from "@/lib/prompt-secciones";
import {
  CATEGORIAS,
  CATEGORIA_OTRAS,
  categoriaDe,
  normalizar,
  type Categoria,
} from "@/lib/prompt-categorias";

gsap.registerPlugin(useGSAP);

const TITULO_NUEVA = "NUEVA SECCION";

// El indice es la posicion real en el array de dividirPrompt: reemplazar,
// eliminar y agregar operan sobre el, asi que viaja junto a la seccion por todo
// el agrupamiento en lugar de recalcularse.
type SeccionIndexada = { seccion: SeccionPrompt; indice: number };

type GrupoCategoria = { categoria: Categoria; entradas: SeccionIndexada[] };

function agruparPorCategoria(entradas: SeccionIndexada[]): GrupoCategoria[] {
  const porCategoria = new Map<string, SeccionIndexada[]>();

  for (const entrada of entradas) {
    const id = categoriaDe(entrada.seccion.titulo);
    const grupo = porCategoria.get(id);

    if (grupo === undefined) {
      porCategoria.set(id, [entrada]);
    } else {
      grupo.push(entrada);
    }
  }

  const grupos: GrupoCategoria[] = [];

  for (const categoria of [...CATEGORIAS, CATEGORIA_OTRAS]) {
    const encontradas = porCategoria.get(categoria.id);
    if (encontradas !== undefined) {
      grupos.push({ categoria, entradas: encontradas });
    }
  }

  return grupos;
}

function estaModificada(seccion: SeccionPrompt, original: SeccionPrompt | undefined) {
  return (
    original === undefined ||
    original.titulo !== seccion.titulo ||
    original.cuerpo !== seccion.cuerpo
  );
}

export function SeccionesPrompt({
  prompt,
  promptOriginal,
  onChange,
}: {
  prompt: string;
  promptOriginal: string;
  onChange: (prompt: string) => void;
}) {
  // El prompt es la unica fuente de verdad: las secciones se derivan en cada
  // render, asi no hay estado duplicado que pueda desincronizarse del textarea.
  const { preambulo, secciones } = dividirPrompt(prompt);
  const originales = dividirPrompt(promptOriginal).secciones;

  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [categoriasAlternadas, setCategoriasAlternadas] = useState<
    Record<string, boolean>
  >({});
  const [busqueda, setBusqueda] = useState("");

  const listaRef = useRef<HTMLDivElement>(null);

  const termino = normalizar(busqueda.trim());
  const hayBusqueda = termino !== "";

  const visibles = secciones
    .map((seccion, indice) => ({ seccion, indice }))
    .filter(({ seccion }) =>
      termino === ""
        ? true
        : normalizar(seccion.titulo).includes(termino) ||
          normalizar(seccion.cuerpo).includes(termino)
    );

  const grupos = agruparPorCategoria(visibles);

  useGSAP(
    () => {
      // La regla CSS de prefers-reduced-motion no alcanza a GSAP, que anima por JS:
      // matchMedia es lo que deja el contenido quieto para quien lo pidio.
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-slot=categoria-prompt]", {
          opacity: 0,
          y: 6,
          duration: 0.25,
          ease: "power2.out",
          stagger: 0.04,
        });
      });

      return () => media.revert();
    },
    { scope: listaRef, dependencies: [termino], revertOnUpdate: true }
  );

  // Sin busqueda las categorias arrancan cerradas: abrir 29 secciones de golpe
  // es justo el problema que resuelve el agrupamiento. Con busqueda activa el
  // default se invierte, si no el usuario busca y no ve ningun resultado.
  function categoriaAbierta(id: string) {
    return categoriasAlternadas[id] ?? hayBusqueda;
  }

  function alternarCategoria(id: string) {
    const abierta = categoriaAbierta(id);
    setCategoriasAlternadas((previas) => ({ ...previas, [id]: !abierta }));
  }

  function buscar(texto: string) {
    setBusqueda(texto);
    // Entrar o salir de la busqueda devuelve las categorias a su default.
    setCategoriasAlternadas({});
  }

  function alternar(indice: number) {
    setAbiertas((previas) =>
      previas.includes(indice)
        ? previas.filter((i) => i !== indice)
        : [...previas, indice]
    );
  }

  function reemplazar(indice: number, seccion: SeccionPrompt) {
    const nuevas = secciones.map((actual, i) => (i === indice ? seccion : actual));
    onChange(unirPrompt(preambulo, nuevas));
  }

  function agregar() {
    const nuevas = [...secciones, { titulo: TITULO_NUEVA, cuerpo: "" }];
    onChange(unirPrompt(preambulo, nuevas));
    setBusqueda("");
    setAbiertas((previas) => [...previas, secciones.length]);
    // El titulo nuevo no esta en ninguna categoria, cae en "otras": hay que
    // abrirla para que la seccion recien creada quede a la vista.
    setCategoriasAlternadas({ [CATEGORIA_OTRAS.id]: true });
  }

  function eliminar(indice: number) {
    const nuevas = secciones.filter((_, i) => i !== indice);
    onChange(unirPrompt(preambulo, nuevas));
    setAbiertas([]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="prompt-introduccion" className="text-[13px] font-medium">
          Introduccion
        </label>
        <Textarea
          id="prompt-introduccion"
          rows={3}
          value={preambulo ?? ""}
          onChange={(evento) => onChange(unirPrompt(evento.target.value, secciones))}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] font-medium">
            Secciones del system prompt
            <span className="ml-2 font-normal text-muted-foreground">
              {termino === ""
                ? secciones.length
                : `${visibles.length} de ${secciones.length}`}
            </span>
          </p>
          <Button variant="outline" size="sm" onClick={agregar}>
            <PlusIcon strokeWidth={1.75} />
            Agregar seccion
          </Button>
        </div>

        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            className="pl-9"
            placeholder="Buscar por titulo o contenido"
            aria-label="Buscar secciones"
            value={busqueda}
            onChange={(evento) => buscar(evento.target.value)}
          />
        </div>

        <div ref={listaRef} className="space-y-2">
          {grupos.length === 0 ? (
            <div className="overflow-hidden rounded-xl ring-1 ring-border">
              <EmptyState
                icon={SearchIcon}
                titulo="Ninguna seccion coincide"
                descripcion={`No hay resultados para "${busqueda}".`}
              />
            </div>
          ) : (
            grupos.map(({ categoria, entradas }) => (
              <BloqueCategoria
                key={categoria.id}
                nombre={categoria.nombre}
                cantidad={entradas.length}
                modificada={entradas.some(({ seccion, indice }) =>
                  estaModificada(seccion, originales[indice])
                )}
                abierta={categoriaAbierta(categoria.id)}
                onAlternar={() => alternarCategoria(categoria.id)}
              >
                {entradas.map(({ seccion, indice }) => (
                  <Seccion
                    key={indice}
                    seccion={seccion}
                    original={originales[indice]}
                    abierta={abiertas.includes(indice)}
                    onAlternar={() => alternar(indice)}
                    onChange={(actualizada) => reemplazar(indice, actualizada)}
                    onEliminar={() => eliminar(indice)}
                  />
                ))}
              </BloqueCategoria>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BloqueCategoria({
  nombre,
  cantidad,
  modificada,
  abierta,
  onAlternar,
  children,
}: {
  nombre: string;
  cantidad: number;
  modificada: boolean;
  abierta: boolean;
  onAlternar: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={abierta} onOpenChange={onAlternar}>
      <div
        data-slot="categoria-prompt"
        className="overflow-hidden rounded-xl bg-card ring-1 ring-border"
      >
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/25">
          <ChevronRightIcon
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-90"
            strokeWidth={1.75}
          />
          <span className="truncate text-[13px] font-medium">{nombre}</span>
          {modificada && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-primary"
              title="Tiene secciones modificadas sin guardar"
            />
          )}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {cantidad === 1 ? "1 seccion" : `${cantidad} secciones`}
          </span>
        </CollapsibleTrigger>

        <CollapsiblePanel>
          <div className="divide-y divide-border border-t border-border">
            {children}
          </div>
        </CollapsiblePanel>
      </div>
    </Collapsible>
  );
}

function Seccion({
  seccion,
  original,
  abierta,
  onAlternar,
  onChange,
  onEliminar,
}: {
  seccion: SeccionPrompt;
  original: SeccionPrompt | undefined;
  abierta: boolean;
  onAlternar: () => void;
  onChange: (seccion: SeccionPrompt) => void;
  onEliminar: () => void;
}) {
  const modificada = estaModificada(seccion, original);

  const lineas = seccion.cuerpo === "" ? 0 : seccion.cuerpo.trim().split("\n").length;

  return (
    <Collapsible open={abierta} onOpenChange={onAlternar}>
      <div data-slot="seccion-prompt" className="flex items-center gap-1 bg-card px-2 py-1.5">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/25">
          <ChevronRightIcon
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-90"
            strokeWidth={1.75}
          />
          <span className="truncate text-[13px] font-medium">{seccion.titulo}</span>
          {modificada && (
            <span
              className="size-1.5 shrink-0 rounded-full bg-primary"
              title="Modificada sin guardar"
            />
          )}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {lineas} lineas
          </span>
        </CollapsibleTrigger>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Eliminar seccion ${seccion.titulo}`}
          onClick={onEliminar}
        >
          <Trash2Icon className="text-muted-foreground" strokeWidth={1.75} />
        </Button>
      </div>

      <CollapsiblePanel>
        <div className="space-y-2 border-t border-border bg-muted/30 px-3 py-3">
          <Input
            aria-label="Titulo de la seccion"
            value={seccion.titulo}
            onChange={(evento) =>
              onChange({ ...seccion, titulo: evento.target.value })
            }
          />
          <Textarea
            aria-label={`Contenido de ${seccion.titulo}`}
            rows={9}
            className="max-h-72 overflow-y-auto"
            value={seccion.cuerpo}
            onChange={(evento) =>
              onChange({ ...seccion, cuerpo: evento.target.value })
            }
          />
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
