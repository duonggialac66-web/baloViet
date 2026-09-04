# Project Context

This file contains the structural and architectural overview of the project. Feed this file to AI assistants in the future to help them quickly understand the context and start working efficiently.

## Tech Stack Overview
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (`.ts`, `.tsx`)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Database & ORM**: Drizzle ORM + Neon Database (Serverless PostgreSQL)
- **Icons**: `lucide-react`
- **Image Processing/Storage**: Cloudinary (`@cloudinary/url-gen`), IMGLY Background Removal (`@imgly/background-removal`)
- **Authentication/Security**: `bcryptjs` (password hashing), `nanoid` (ID generation)
- **Formatting**: `oxfmt`

## Project Structure

### Root Directory
- `src/`: Main source code directory.
- `drizzle/`: Database schema, migrations, and Drizzle configurations.
- `scripts/`: Helper scripts (e.g., database seeding with `seed.ts` and `seed-admin.ts`).
- `public/`: Static assets.
- `drizzle.config.ts`: Configuration for Drizzle Kit.
- `next.config.ts`: Configuration for Next.js.
- `package.json`: Dependencies and scripts.

### Source Directory (`src/`)
- `app/`: Next.js App Router root. Contains all pages, layouts, and API routes.
  - Client-facing routes: `san-pham`, `gio-hang`, `thanh-toan`, `dat-hang-thanh-cong`, `tai-khoan`, `dang-nhap`, `dang-ky`, `danh-muc`, `bo-suu-tap`, `blog`, `lien-he`, `ve-chung-toi`.
  - Admin dashboard: `admin/`
  - API Routes: `api/` (e.g., `api/seed-admin`)
  - Global styles: `globals.css`
- `components/`: Reusable React components.
  - Core UI: `Header.tsx`, `Footer.tsx`, `Breadcrumb.tsx`, `ProductCard.tsx`, `CartDrawer.tsx`, `Toast.tsx`, `Rating.tsx`.
  - Specialized folders: `admin/` (for admin panel UI), `auth/`, `home/`.
- `lib/`: Utility functions and shared library configurations (e.g., db connection, utilities).
- `data/`: Static data or data fetching utilities.
- `store/`: Global state management (Zustand, Context, etc.).
- `types/`: Global TypeScript type definitions.
- `middleware.ts`: Next.js middleware (likely for auth routing and protection).

## Key Scripts (`package.json`)
- `npm run dev`: Start Next.js dev server.
- `npm run format`: Format code with `oxfmt`.
- `npm run db:generate`: Generate Drizzle migrations.
- `npm run db:migrate`: Run Drizzle migrations.
- `npm run db:seed`: Seed database with sample data.
- `npm run db:seed-admin`: Seed database with admin user.

## Note for AI
- This is a Next.js App Router project; use Server Components by default and add `"use client"` only when necessary (e.g., hooks, interactivity).
- Drizzle is the ORM. Ensure to use Drizzle-specific syntax for DB interactions.
- Styling uses Tailwind CSS classes.
- Project uses Vietnamese for route names (e.g., `gio-hang` for cart) but English for component and variable names.
