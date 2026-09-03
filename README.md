# CORA · Panel de llamadas

Dashboard de demo para CORA, el call center con IA de la universidad. Muestra las llamadas
atendidas por el agente de voz (Vapi + ElevenLabs): metricas, tabla, transcripcion y grabacion.

No tiene base de datos propia. Consulta en vivo al backend de CORA en Railway.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Auth.js v5 (NextAuth)

## Roles

| | Admin | Agente |
| --- | --- | --- |
| Llamadas que ve | todas | solo aquellas con `usuario_asignado` igual a su usuario |
| Metricas | sobre todas | sobre las suyas |
| Detalle y transcripcion | cualquiera | solo las suyas (403 en las demas) |
| Columna "Asignado a" | si | no |

Los dos usuarios se definen por variables de entorno. No hay registro ni tabla de usuarios:
la sesion es un JWT firmado en cookie.

El usuario del agente **es** el valor guardado en la columna `usuario_asignado` del backend.
Si `AGENTE_USUARIO=maria.gomez`, ese agente vera las llamadas cuyo `usuario_asignado` sea
exactamente `maria.gomez`.

## Como se protege la admin key

`RAILWAY_ADMIN_KEY` da acceso total al backend, asi que **nunca puede llegar al navegador**.

- Solo la lee `src/lib/cora-api.ts`, cuya primera linea es `import 'server-only'`. Si algun
  Client Component importara ese modulo por accidente, **el build falla**. Es una garantia del
  compilador, no una convencion que haya que recordar.
- La tabla se renderiza en un Server Component: los datos llegan ya filtrados al cliente.
- Ninguna variable lleva el prefijo `NEXT_PUBLIC_`. Ese prefijo es lo unico que expone una
  variable al bundle del navegador.

## Estructura

```
middleware.ts                      protege /dashboard, redirige a /login
src/
  auth.ts                          Auth.js v5: Credentials + rol en el JWT
  types/next-auth.d.ts             session.user.rol y .id tipados
  lib/
    cora-api.ts                    server-only. UNICO sitio con la admin key
    metricas.ts                    filtrarPorRol, filtrarPorFecha, calculos y formato
    tipos.ts
  app/
    login/page.tsx
    dashboard/page.tsx             Server Component: sesion -> fetch -> filtra -> render
    api/
      auth/[...nextauth]/route.ts
      llamadas/route.ts            lista filtrada por rol
      llamadas/[callId]/route.ts   detalle + transcripcion, con control de acceso
  components/
    login-form.tsx  tabla-llamadas.tsx  detalle-llamada.tsx
    tarjetas-resumen.tsx  filtro-fecha.tsx  boton-logout.tsx
    ui/                            shadcn
```

`filtrarPorRol` vive en un solo sitio y la usan tanto la pagina como la API: asi el filtro de
seguridad no puede divergir entre las dos rutas de acceso a los datos.

## Variables de entorno

| Variable | Que es |
| --- | --- |
| `RAILWAY_BACKEND_URL` | URL del backend de CORA, sin barra final |
| `RAILWAY_ADMIN_KEY` | Admin key del backend. **Solo servidor** |
| `NEXTAUTH_SECRET` | Firma la sesion. Genera uno con `openssl rand -base64 32` |
| `ADMIN_USUARIO` / `ADMIN_PASSWORD` | Credenciales del admin |
| `AGENTE_USUARIO` / `AGENTE_PASSWORD` | Credenciales del agente. El usuario debe coincidir con `usuario_asignado` |

Ninguna lleva `NEXT_PUBLIC_`.

## Correr en local

```
npm install
cp .env.example .env.local        # PowerShell: copy .env.example .env.local
```

Rellena `.env.local` con los valores reales y arranca:

```
npm run dev
```

Abre http://localhost:3000 . Te redirige a `/login`. Entra con el admin para ver todas las
llamadas, o con el agente para ver solo las asignadas.

`.env.local` esta en `.gitignore`: no se sube nunca.

## Desplegar en Vercel

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) -> `Add New...` -> `Project` -> `Import Git Repository`
   y elige este repo. Si no aparece, pulsa `Adjust GitHub App Permissions` y dale acceso.
3. Vercel detecta Next.js solo. **No cambies** Framework Preset, Build Command ni Output Directory.
4. Antes de pulsar Deploy, abre **Environment Variables** y añade una por una las de la tabla
   de arriba. Deja marcados los tres entornos (Production, Preview, Development).
5. `Deploy`. Tarda un par de minutos.
6. Cuando termine, la URL es `https://<proyecto>.vercel.app`.

Para cambiar una variable despues: `Settings` -> `Environment Variables` -> editar ->
`Deployments` -> `Redeploy`. Las variables se leen en build y arranque, no en caliente.

## Notas de la demo

- El dashboard **no cachea**: cada carga pega al backend (`cache: 'no-store'`). Lo que se ve es
  el estado real de la base.
- El backend pagina de 100 en 100 y no filtra por agente, asi que `obtenerLlamadas` trae hasta
  5 paginas (500 llamadas) y filtra en memoria. Suficiente para la demo; con volumen real habria
  que mover el filtro al backend.
- El `resumen` puede aparecer como `Pendiente`: Vapi lo genera de forma asincrona despues de que
  termina la llamada, y el backend lo rellena cuando lo consigue.
- El filtro por fecha compara los primeros 10 caracteres de `fecha` como texto, sin construir un
  `Date`. Evita que el navegador reinterprete la fecha en otra zona horaria.
