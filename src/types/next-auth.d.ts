import type { DefaultSession } from 'next-auth'
import type { Rol } from '@/lib/usuarios'

declare module 'next-auth' {
  interface User {
    id: string
    rol: Rol
  }

  interface Session {
    user: {
      id: string
      rol: Rol
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    rol: Rol
  }
}

// @auth/core/index.d.ts importa JWT directamente de "@auth/core/jwt" (no de "next-auth/jwt"),
// por eso la ampliacion tambien debe declararse aqui para que los callbacks la vean tipada.
declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    rol: Rol
  }
}
