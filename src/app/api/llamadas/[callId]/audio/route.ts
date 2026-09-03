import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { obtenerLlamada } from "@/lib/cora-api";
import { obtenerUrlGrabacion } from "@/lib/vapi";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params;
  const sesion = await auth();

  if (!sesion?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const llamada = await obtenerLlamada(callId);

    if (!llamada) {
      return NextResponse.json({ error: "Llamada no encontrada" }, { status: 404 });
    }

    // Mismo control que en el detalle: sin esto un agente escucharia grabaciones ajenas
    // pidiendo el audio directamente, saltandose la comprobacion de la pantalla.
    if (sesion.user.rol === "agente" && llamada.usuario_asignado !== sesion.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const urlFirmada = await obtenerUrlGrabacion(callId);

    if (!urlFirmada) {
      return NextResponse.json({ error: "Grabacion no disponible" }, { status: 404 });
    }

    // Se redirige en vez de hacer proxy: el elemento <audio> necesita peticiones Range para que
    // funcione la barra de busqueda, y reenviarlas a traves de una funcion serverless las rompe.
    // La URL firmada caduca en minutos y solo cubre esta grabacion.
    return NextResponse.redirect(urlFirmada, 302);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Grabacion no disponible" }, { status: 502 });
  }
}
