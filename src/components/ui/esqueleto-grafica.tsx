// Vive aparte de grafica.tsx a proposito: ese modulo importa Recharts, y los
// dynamic() que usan este esqueleto como placeholder lo cargarian de golpe,
// anulando el code splitting que justifica la carga diferida.
export function EsqueletoGrafica() {
  return (
    <div
      className="h-full min-h-40 w-full animate-pulse rounded-xl bg-muted/60"
      aria-hidden="true"
    />
  )
}
