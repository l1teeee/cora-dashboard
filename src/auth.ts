import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { buscarUsuario } from '@/lib/usuarios'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        usuario: {},
        password: {},
      },
      async authorize(credentials) {
        const { usuario, password } = credentials

        if (typeof usuario !== 'string' || typeof password !== 'string') {
          return null
        }

        const usuarioEncontrado = buscarUsuario(usuario, password)
        if (!usuarioEncontrado) return null

        return {
          id: usuarioEncontrado.id,
          name: usuarioEncontrado.nombre,
          rol: usuarioEncontrado.rol,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  // Auth.js v5 busca AUTH_SECRET por defecto; el usuario definio NEXTAUTH_SECRET, por eso se pasa explicito.
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  pages: { signIn: '/login' },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = user.rol
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.rol = token.rol
      return session
    },
  },
})
