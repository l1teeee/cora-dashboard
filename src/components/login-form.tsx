'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { SignInPage } from '@/components/ui/sign-in'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError(false)
    setCargando(true)

    const datos = new FormData(evento.currentTarget)
    const usuario = String(datos.get('usuario') ?? '')
    const password = String(datos.get('password') ?? '')

    const resultado = await signIn('credentials', {
      usuario,
      password,
      redirect: false,
    })

    if (resultado?.error) {
      setError(true)
      setCargando(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <SignInPage
      title="Bienvenido a CORA"
      description="Ingresa tus credenciales para gestionar las llamadas del equipo."
      heroVideoSrc="/auth-login.mp4"
      onSignIn={manejarEnvio}
      error={error ? 'Usuario o contrasena incorrectos' : undefined}
      loading={cargando}
    />
  )
}
