# Stock Apple USADOS

Dashboard interno para administrar stock de iPhones y MacBooks usados.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS 4
- Prisma (SQLite local; listo para PostgreSQL/Supabase)
- Supabase Storage (opcional; fallback a `/public/uploads`)

## Arranque

```bash
npm install
cp .env.example .env   # ya incluye DATABASE_URL=file:./dev.db
npx prisma db push
npm run db:seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run db:seed` | Carga los 8 iPhones de referencia + ventas demo |
| `npm run db:reset` | Reinicia DB y vuelve a seedear |
| `npm run build` | Build de producción |

## Moneda

Todo el sistema trabaja en **USD**. Formato: `$1.250 USD`.

## Generador de listas

La vista previa replica el formato WhatsApp:

```
LISTA IPHONE USADOS 📱

(30 días de Garantía)

• *iPhone 16 Pro Max 256GB Natural* 🔋 92% 900 USD
```

## Supabase (producción)

En `.env`:

```
DATABASE_URL=postgresql://...   # cambiar provider a postgresql en prisma/schema.prisma
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=product-images
```
