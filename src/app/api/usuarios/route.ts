import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { esAdmin } from '@/lib/solo-admin'
import { crearUsuario, listarUsuarios, ErrorDeUsuarios } from '@/lib/usuarios-api'

export const dynamic = 'force-dynamic'

const LARGO_MINIMO_PASSWORD = 8

export async function GET() {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  try {
    const usuarios = await listarUsuarios()
    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error consultando el backend de CORA' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const sesion = await auth()

  if (!sesion?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!esAdmin(sesion)) {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 })
  }

  const cuerpo: {
    login?: unknown
    nombre?: unknown
    rol?: unknown
    password?: unknown
  } | null = await request.json().catch(() => null)

  if (!cuerpo) {
    return NextResponse.json({ error: 'El cuerpo de la peticion no es JSON valido.' }, { status: 400 })
  }

  const login = typeof cuerpo.login === 'string' ? cuerpo.login.trim() : ''
  const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim() : ''
  const rol = cuerpo.rol
  const password = typeof cuerpo.password === 'string' ? cuerpo.password : ''

  if (login === '') {
    return NextResponse.json({ error: 'El login no puede estar vacio.' }, { status: 400 })
  }
  if (nombre === '') {
    return NextResponse.json({ error: 'El nombre no puede estar vacio.' }, { status: 400 })
  }
  if (rol !== 'admin' && rol !== 'agente') {
    return NextResponse.json({ error: 'El rol tiene que ser admin o agente.' }, { status: 400 })
  }
  if (password.length < LARGO_MINIMO_PASSWORD) {
    return NextResponse.json(
      { error: `La contrasena tiene que tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.` },
      { status: 400 }
    )
  }

  try {
    const usuario = await crearUsuario(
      { login, nombre, rol, password },
      sesion.user.name ?? sesion.user.id
    )

    return NextResponse.json({ ok: true, usuario }, { status: 201 })
  } catch (error) {
    if (error instanceof ErrorDeUsuarios) {
      return NextResponse.json({ error: error.message }, { status: error.estado })
    }

    console.error(error)
    return NextResponse.json({ error: 'Error creando el usuario en el backend de CORA' }, { status: 500 })
  }
}
