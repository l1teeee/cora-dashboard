import type { Session } from 'next-auth'

// Punto unico de verdad para el chequeo de rol admin: si se copiara este `=== 'admin'`
// en cada ruta, bastaria con que una lo escribiera distinto para abrir un agujero.
export function esAdmin(sesion: Session | null): boolean {
  return sesion?.user?.rol === 'admin'
}
