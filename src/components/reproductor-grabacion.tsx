"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";

// La url_grabacion de la base ya no sirve: Vapi movio las grabaciones a un bucket privado.
// Se pide siempre a nuestro endpoint, que resuelve una URL firmada nueva en cada reproduccion.
export function ReproductorGrabacion({ callId }: { callId: string }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [callId]);

  if (fallo) {
    return <Alert variant="info">Grabacion no disponible</Alert>;
  }

  return (
    <div className="rounded-lg bg-muted p-2">
      <audio
        controls
        className="w-full"
        preload="none"
        src={`/api/llamadas/${encodeURIComponent(callId)}/audio`}
        onError={() => setFallo(true)}
      />
    </div>
  );
}
