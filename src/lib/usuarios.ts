import { timingSafeEqual } from 'crypto'

export type Rol = 'admin' | 'agente'

export type UsuarioDemo = {
  id: string
  nombre: string
  rol: Rol
  password: string
}

// Comparacion en tiempo constante para evitar timing attacks.
// timingSafeEqual lanza si los buffers tienen longitudes distintas, por eso se corta antes de llamarla.
function comparaSeguro(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

function listaUsuarios(): UsuarioDemo[] {
  const usuarios: UsuarioDemo[] = []

  const adminUsuario = process.env.ADMIN_USUARIO
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminUsuario && adminPassword) {
    usuarios.push({ id: adminUsuario, nombre: adminUsuario, rol: 'admin', password: adminPassword })
  }

  const agenteUsuario = process.env.AGENTE_USUARIO
  const agentePassword = process.env.AGENTE_PASSWORD
  if (agenteUsuario && agentePassword) {
    usuarios.push({ id: agenteUsuario, nombre: agenteUsuario, rol: 'agente', password: agentePassword })
  }

  return usuarios
}

export function buscarUsuario(usuario: string, password: string): Omit<UsuarioDemo, 'password'> | null {
  const encontrado = listaUsuarios().find(
    (u) => comparaSeguro(usuario, u.id) && comparaSeguro(password, u.password)
  )

  if (!encontrado) return null

  return { id: encontrado.id, nombre: encontrado.nombre, rol: encontrado.rol }
}
