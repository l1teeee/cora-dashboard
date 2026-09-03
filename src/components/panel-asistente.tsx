"use client";

import { useState } from "react";
import { FormAsistente } from "@/components/form-asistente";
import { PanelConocimiento } from "@/components/panel-conocimiento";
import { HistorialAsistente } from "@/components/historial-asistente";

// El formulario solo se remonta cuando se revierte a una version anterior, y para eso hace falta
// un contador vivo entre hermanos. Con key={Date.now()} en la pagina se remontaba en CADA render
// del servidor: un router.refresh() cualquiera borraba lo que el admin llevara escrito en un
// system prompt de 32.000 caracteres.
export function PanelAsistente() {
  const [version, setVersion] = useState(0);

  return (
    <>
      <FormAsistente key={version} />
      <PanelConocimiento />
      <HistorialAsistente onRevertido={() => setVersion((v) => v + 1)} />
    </>
  );
}
