'use client'

import * as React from 'react'
import { CircleAlertIcon, EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type SignInPageProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  heroVideoSrc?: string
  onSignIn?: (evento: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  onResetPassword?: () => void
  error?: string
  loading?: boolean
  className?: string
}

function InputWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-input bg-card transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
      {children}
    </div>
  )
}

export function SignInPage({
  title = 'Bienvenido',
  description = 'Accede a tu cuenta para continuar',
  heroVideoSrc,
  onSignIn,
  onResetPassword,
  error,
  loading = false,
  className,
}: SignInPageProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    // h-dvh y no 100dvh en el ancho: 100dvw incluye el ancho de la barra de scroll vertical,
    // asi que dejaba la pagina unos pixeles mas ancha que el area visible y aparecia scroll
    // horizontal, y con el la barra de abajo empujaba el alto y aparecia tambien el vertical.
    <main className={cn('flex h-dvh w-full flex-col overflow-hidden md:flex-row', className)}>
      <section className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-8">
        <div className="w-full max-w-md">
          <h1 className="animate-element animate-delay-100 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          <p className="animate-element animate-delay-200 mt-4 text-muted-foreground">
            {description}
          </p>

          <form className="mt-8 space-y-5" onSubmit={onSignIn} noValidate>
            <div className="animate-element animate-delay-300 space-y-1.5">
              <label htmlFor="usuario" className="text-sm font-medium text-foreground">
                Usuario
              </label>
              <InputWrapper>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={loading}
                  placeholder="tu.usuario"
                  className="w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
                />
              </InputWrapper>
            </div>

            <div className="animate-element animate-delay-400 space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contrasena
              </label>
              <InputWrapper>
                <div className="flex items-center">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    placeholder="********"
                    className="w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((valor) => !valor)}
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    aria-pressed={showPassword}
                    disabled={loading}
                    className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" strokeWidth={1.75} />
                    ) : (
                      <EyeIcon className="size-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </InputWrapper>
            </div>

            {onResetPassword && (
              <div className="animate-element animate-delay-500 flex items-center justify-end text-sm">
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="text-primary hover:underline"
                >
                  Olvidaste tu contrasena?
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
                <CircleAlertIcon className="size-4 shrink-0" strokeWidth={1.75} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="animate-element animate-delay-600 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading && <Loader2Icon className="size-4 animate-spin" strokeWidth={1.75} />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>

      {heroVideoSrc && (
        <section className="relative hidden flex-1 p-4 md:block">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 overflow-hidden rounded-3xl">
            {/* Decorativo: sin audio, sin controles y fuera del arbol de accesibilidad. */}
            <video
              src={heroVideoSrc}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              className="size-full object-cover"
            />
          </div>
        </section>
      )}
    </main>
  )
}
