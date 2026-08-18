# CLAUDE.md

## Proyecto
Plataforma B2B/B2C de gestión de servicios automotrices con dos portales: conductor y taller.

## Stack
- Frontend: Next.js 15 App Router, TypeScript strict, Tailwind CSS
- Backend: Next.js API routes (server actions)
- DB: Supabase (PostgreSQL) con Row Level Security
- Auth: Supabase Auth
- Deploy: Vercel (branch main = producción, branch staging = staging)
- Pagos: [Stripe / pendiente de confirmar]

## Entornos
- Local: `.env.local`
- Staging: variables en Vercel, branch `staging`
- Producción: variables en Vercel, branch `main`

## Convenciones
- Server components por defecto, `'use client'` solo cuando sea estrictamente necesario
- API routes en `app/api/` con patrón `route.ts`
- Variables de entorno nunca en el código, siempre en `.env.local` o Vercel
- Todo precio en centavos (Stripe standard)
- Siempre manejar estados de loading y error en UI

## Arquitectura de portales
- `/app/(conductor)/` — portal del conductor
- `/app/(taller)/` — portal del taller automotriz
- `/app/api/` — endpoints del backend

## Lo que está hecho
- Frontend completo de ambos portales (estático, sin backend conectado)

## Lo que falta construir
- Schema de Supabase (tablas, RLS, migrations)
- API routes para cada flujo
- Autenticación real con Supabase Auth
- Conexión frontend → API
- Webhooks para eventos entre portales
