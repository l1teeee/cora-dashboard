import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">CORA</h1>
        <p className="text-sm text-muted-foreground">Panel de llamadas</p>
      </div>
      <LoginForm />
    </main>
  )
}
