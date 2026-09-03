import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const haySesion = !!req.auth
  const esRutaProtegida = req.nextUrl.pathname.startsWith('/dashboard')
  const esLogin = req.nextUrl.pathname === '/login'

  if (esRutaProtegida && !haySesion) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (esLogin && haySesion) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
