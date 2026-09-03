"use client";

import { useEffect, useState } from "react";

// La url_grabacion de la base ya no sirve: Vapi movio las grabaciones a un bucket privado.
// Se pide siempre a nuestro endpoint, que resuelve una URL firmada nueva en cada reproduccion.
export function ReproductorGrabacion({ callId }: { callId: string }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [callId]);

  if (fallo) {
    return <p className="text-sm text-muted-foreground">Grabacion no disponible</p>;
  }

  return (
    <audio
      controls
      className="w-full"
      src={`/api/llamadas/${encodeURIComponent(callId)}/audio`}
      onError={() => setFallo(true)}
    />
  );
}
