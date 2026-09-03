import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { buscarUsuario } from '@/lib/usuarios'

// Auth.js v5 busca AUTH_SECRET por defecto; el proyecto define NEXTAUTH_SECRET, por eso se lee
// explicito. Se valida al cargar el modulo: sin secreto las sesiones no se pueden firmar, y un
// arranque que falla es preferible a un despliegue que acepta cookies de sesion sin verificar.
const secreto = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET

if (!secreto) {
  throw new Error('Falta NEXTAUTH_SECRET (o AUTH_SECRET): genera uno con "openssl rand -base64 32"')
}

// Ocho horas: el panel expone telefonos y transcripciones de estudiantes, asi que una sesion
// olvidada en un equipo compartido no deberia seguir viva al dia siguiente. El default de
// Auth.js son 30 dias.
const DURACION_SESION_SEGUNDOS = 8 * 60 * 60

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

        // Un backend caido y una password equivocada le muestran lo mismo al usuario (el mensaje
        // no debe filtrar si la cuenta existe), asi que la causa real solo queda aqui, en el log
        // del servidor: sin esto un incidente de red se reporta como "no puedo entrar".
        let usuarioEncontrado
        try {
          usuarioEncontrado = await buscarUsuario(usuario, password)
        } catch (error) {
          console.error('Fallo verificando credenciales contra el backend de CORA', error)
          return null
        }

        if (!usuarioEncontrado) return null

        return {
          id: usuarioEncontrado.id,
          name: usuarioEncontrado.nombre,
          rol: usuarioEncontrado.rol,
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: DURACION_SESION_SEGUNDOS },
  secret: secreto,
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
