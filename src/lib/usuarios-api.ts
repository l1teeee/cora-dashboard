import 'server-only'
// Protege la admin key del backend de CORA: si un Client Component importara este
// modulo por error, el build fallaria antes de exponer la clave al navegador.

import type { Rol } from './usuarios'

export type UsuarioRemoto = {
  id: number
  login: string
  nombre: string
  rol: Rol
  activo: number
  created_at: string
}

// El backend rechaza operaciones por reglas de negocio (login duplicado, ultimo
// admin activo, destinatario inexistente). Se separan del fallo tecnico para que
// la ruta reenvie el codigo y el texto al usuario en vez de un 500 generico.
export class ErrorDeUsuarios extends Error {
  constructor(
    readonly estado: number,
    mensaje: string
  ) {
    super(mensaje)
    this.name = 'ErrorDeUsuarios'
  }
}

async function pedir(ruta: string, init?: RequestInit): Promise<Response> {
  const base = process.env.RAILWAY_BACKEND_URL
  const adminKey = process.env.RAILWAY_ADMIN_KEY

  if (!base) throw new Error('Falta la variable de entorno RAILWAY_BACKEND_URL')
  if (!adminKey) throw new Error('Falta la variable de entorno RAILWAY_ADMIN_KEY')

  const baseSinBarra = base.replace(/\/+$/, '')
  const headers = new Headers(init?.headers)
  headers.set('x-admin-key', adminKey)
  if (init?.body !== undefined) headers.set('Content-Type', 'application/json')

  return fetch(`${baseSinBarra}${ruta}`, {
    ...init,
    headers,
    cache: 'no-store', // los datos deben ser en vivo, nunca cacheados
  })
}

async function errorDelBackend(res: Response, porDefecto: string): Promise<ErrorDeUsuarios> {
  const cuerpo: { error?: string } = await res.json().catch(() => ({}))
  return new ErrorDeUsuarios(res.status, cuerpo.error ?? porDefecto)
}

// El backend promete no devolver el hash, pero esta copia lo garantiza en el unico
// punto por el que un usuario entra al dashboard.
function soloCamposPublicos(usuario: UsuarioRemoto): UsuarioRemoto {
  return {
    id: usuario.id,
    login: usuario.login,
    nombre: usuario.nombre,
    rol: usuario.rol,
    activo: usuario.activo,
    created_at: usuario.created_at,
  }
}

export async function listarUsuarios(): Promise<UsuarioRemoto[]> {
  const res = await pedir('/usuarios')
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const { usuarios }: { usuarios: UsuarioRemoto[] } = await res.json()
  return usuarios.map(soloCamposPublicos)
}

export async function crearUsuario(
  datos: { login: string; nombre: string; rol: Rol; password: string },
  actor: string
): Promise<UsuarioRemoto> {
  const res = await pedir('/usuarios', {
    method: 'POST',
    body: JSON.stringify({ ...datos, usuario: actor }),
  })

  if (res.status === 409) {
    throw await errorDelBackend(res, 'Ya existe un usuario con ese login.')
  }
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const { usuario }: { ok: boolean; usuario: UsuarioRemoto } = await res.json()
  return soloCamposPublicos(usuario)
}

export async function actualizarUsuario(
  login: string,
  cambios: { nombre?: string; rol?: Rol; activo?: number; password?: string },
  actor: string
): Promise<void> {
  const res = await pedir(`/usuarios/${encodeURIComponent(login)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...cambios, usuario: actor }),
  })

  if (res.status === 404 || res.status === 409) {
    throw await errorDelBackend(res, 'No se pudo actualizar el usuario.')
  }
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)
}

export async function desactivarUsuario(login: string, actor: string): Promise<void> {
  const res = await pedir(`/usuarios/${encodeURIComponent(login)}`, {
    method: 'DELETE',
    body: JSON.stringify({ usuario: actor }),
  })

  if (res.status === 404 || res.status === 409) {
    throw await errorDelBackend(res, 'No se puede desactivar al ultimo administrador activo.')
  }
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)
}

// Un 401 aqui es el caso normal de "password equivocada", no un fallo: devolver
// null deja que el login responda con su propio mensaje en vez de romperse.
export async function verificarCredenciales(login: string, password: string): Promise<UsuarioRemoto | null> {
  const res = await pedir('/usuarios/verificar', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  })

  if (res.status === 401) return null
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const { usuario }: { usuario: UsuarioRemoto } = await res.json()
  return soloCamposPublicos(usuario)
}

export async function asignarLlamada(
  callId: string,
  asignadoA: string | null,
  actor: string
): Promise<{ auditoriaRegistrada: boolean }> {
  const res = await pedir(`/llamadas/${encodeURIComponent(callId)}/asignacion`, {
    method: 'PATCH',
    body: JSON.stringify({ asignadoA, usuario: actor }),
  })

  if (res.status === 400 || res.status === 404) {
    throw await errorDelBackend(res, 'No se pudo asignar la llamada.')
  }
  if (!res.ok) throw new Error(`Backend CORA ${res.status}`)

  const respuesta: { ok: boolean; auditoriaRegistrada: boolean } = await res.json()
  return { auditoriaRegistrada: respuesta.auditoriaRegistrada }
}
