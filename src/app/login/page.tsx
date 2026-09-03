import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-base font-semibold">C</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">CORA</h1>
        <p className="text-sm text-muted-foreground">Panel de llamadas</p>
      </div>
      <LoginForm />
      <p className="text-xs text-muted-foreground">Acceso restringido al equipo de CORA</p>
    </main>
  )
}
