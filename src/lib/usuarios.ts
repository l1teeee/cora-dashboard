import { listarUsuarios, verificarCredenciales } from './usuarios-api'

export type Rol = 'admin' | 'agente'

export type UsuarioDeSesion = {
  id: string
  nombre: string
  rol: Rol
}

export type Asignable = {
  id: string
  nombre: string
}

// El id de la sesion es el login: es el valor que llamadas.usuario_asignado guarda
// y contra el que se compara para decidir que llamadas ve cada agente.
export async function buscarUsuario(usuario: string, password: string): Promise<UsuarioDeSesion | null> {
  const encontrado = await verificarCredenciales(usuario, password)
  if (!encontrado) return null

  return { id: encontrado.login, nombre: encontrado.nombre, rol: encontrado.rol }
}

export async function listarAsignables(): Promise<Asignable[]> {
  try {
    const usuarios = await listarUsuarios()

    return usuarios
      .filter((usuario) => usuario.rol === 'agente' && usuario.activo === 1)
      .map((usuario) => ({ id: usuario.login, nombre: usuario.nombre }))
  } catch (error) {
    // El selector de asignacion es un accesorio de pantallas que tienen que seguir
    // sirviendo llamadas: si el backend falla se muestra vacio, no se cae la pagina.
    console.error(error)
    return []
  }
}
