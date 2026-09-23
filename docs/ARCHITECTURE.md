# Architecture

## 1. Overview

Global Enterprises Real Estate CRM is built as a TypeScript monorepo using Turborepo and pnpm workspaces. It contains a Next.js 16 web application (`apps/web`), an Expo mobile application (`apps/mobile`), shared internal packages (`packages/database`, `packages/dialer`, `packages/domain`), and PostgreSQL database migrations managed via Supabase (`supabase/migrations`).

The application uses Next.js App Router with Server Components for server-side rendering and Server Actions (`'use server'`) for mutation logic. All data access occurs directly through Supabase clients (`@supabase/ssr` on web and `@supabase/supabase-js` on mobile) without an intermediate ORM.

## 2. Application Layers

The application follows the layers defined in the codebase:

```
UI Components (Server & Client Components)
   ↓
Server Actions / Feature Modules (`lib/crm/*`)
   ↓
Imperative Custom Validation & Auth Checks (`lib/auth/*`, `lib/crm/*`)
   ↓
Supabase Client (`@supabase/ssr` / `@supabase/supabase-js`)
   ↓
PostgreSQL Database (Supabase)
```

## 3. Request / Data Flow

A typical data operation (e.g. creating a lead) flows through the following path:

```
User submits Form in Client Component (`LoginForm` or Lead Form)
 → Triggers Server Action (`apps/web/lib/crm/leads/create-actions.ts`)
 → Obtains authenticated Supabase client (`createClient()` from `@/lib/supabase/server`)
 → Checks permissions (`hasPermission(role, 'leads.create')`)
 → Sanitizes & validates inputs imperatively (`clean()`, `normalizeEmail()`, `normalizePhone()`)
 → Executes database insert via Supabase client (`supabase.from('leads').insert(...)`)
 → Revalidates cache or performs navigation (`revalidatePath()`, `redirect()`)
 → Returns result state (`{ ok: true, message: '...' }`) to UI component
```

## 4. Frontend Architecture

* **Routing**: Next.js 16 App Router file-based routing (`apps/web/app/`) for web and Expo Router (`apps/mobile/app/`) for mobile.
* **Pages**: Next.js routes include `/` (landing page), `/login` (login screen), `/unauthorized` (access denied), and `/dashboard/*` (protected CRM routes: leads, deals, tasks, dialer, imports, inventory, reports, settings, team).
* **Layouts**: Root layout (`app/layout.tsx`) sets global fonts and metadata. Protected layout (`app/dashboard/layout.tsx`) handles authentication check, role fetching, sidebar navigation rendering, and app shell layout.
* **Components**: Structured into feature components (`components/auth`, `components/dashboard`, `components/leads`, `components/navigation`) and UI primitives (`components/ui/*`) following `shadcn` design patterns.
* **Client/Server Boundaries**: Pages and layouts are Server Components by default. Interactive forms and widgets use `'use client'`.
* **Forms**: Client components manage form input state (`useState`) and handle submit actions via async handlers calling Supabase or Server Actions.
* **State**: Component-level React state (`useState`, `useTransition`), Next.js router state, and URL search parameters. No global state stores (Redux, Zustand) are used.

## 5. Backend Architecture

* **API Routes / Route Handlers**: No Next.js API route handlers (`app/api/*/route.ts`) are implemented.
* **Server Actions**: Direct server execution using Next.js `'use server'` directives located in `lib/crm/*/actions.ts` or page folders.
* **Services / Business Logic**: Feature logic is co-located inside domain modules (`apps/web/lib/crm/leads/`, `apps/web/lib/crm/imports/`, `packages/dialer`).
* **Validation**: Custom validation utilities (e.g. `apps/web/lib/crm/imports/validation.ts`) inspect data fields line-by-line using regular expressions, string cleaning methods, and TypeScript constant enums.
* **Authentication**: Executed by Supabase Auth service. Handled on server via `@supabase/ssr` cookies and verified in middleware/proxy (`apps/web/proxy.ts`).
* **Authorization**: Granular RBAC permissions evaluated using `hasPermission(role, permission)` against `CRM_ROLES` and `CRM_PERMISSIONS` in `apps/web/lib/auth/permissions.ts`.

## 6. Data Architecture

* **Database**: PostgreSQL hosted on Supabase platform.
* **ORM/Query Layer**: Direct Supabase JS client queries (`supabase.from('table_name').select(...)`, `.insert(...)`, `.update(...)`, `.delete(...)`, `.rpc(...)`). No ORM layer is used.
* **Models / Schema**: Database tables defined in SQL migration files under `supabase/migrations/` (e.g., `20260906000100_dialer_campaigns_and_call_events.sql`, `20260906000200_lead_management_activity_and_reassignment.sql`).
* **TypeScript Types**: Auto-generated/manually maintained TypeScript interfaces in `@realestate-crm/database` (`packages/database/src/types.ts` and `crm-types.ts`).
* **Data Access**: Performed inline in Server Actions and server layout functions.

## 7. Shared Infrastructure

* **Authentication Utilities**: `apps/web/lib/auth/roles.ts`, `apps/web/lib/auth/permissions.ts`, `apps/web/lib/auth/actions.ts`.
* **Database Client**: `apps/web/lib/supabase/server.ts`, `apps/web/lib/supabase/client.ts`, `apps/web/lib/supabase/proxy.ts`, `apps/mobile/lib/supabase.ts`.
* **Validation Utilities**: `apps/web/lib/crm/imports/validation.ts`.
* **UI Utilities**: `apps/web/lib/utils.ts` (Tailwind class merging helper).
* **Logging**: `Unknown / Not present` (No dedicated logging service detected; standard `console` or unhandled execution errors).
* **Configuration**: `turbo.json`, `pnpm-workspace.yaml`, `components.json`, `.env.local` environment variable declarations (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

## 8. Feature Organization

Features are organized by domain under application directories and shared packages:

* Web feature modules: `apps/web/lib/crm/<feature>/` (e.g., `leads`, `deals`, `tasks`, `dialer`, `imports`, `inventory`, `team`).
* Web UI feature components: `apps/web/components/<feature>/` (e.g., `auth`, `dashboard`, `deals`, `dialer`, `imports`, `inventory`, `leads`, `tasks`, `team`).
* Web route pages: `apps/web/app/dashboard/<feature>/` (e.g., `app/dashboard/leads/page.tsx`, `app/dashboard/leads/new/page.tsx`, `app/dashboard/leads/[id]/page.tsx`).
* Shared package modules: `packages/dialer/src/index.ts`, `packages/database/src/index.ts`, `packages/domain/src/index.ts`.

## 9. Important Architectural Boundaries

* **Client vs Server Boundary**: Server components perform auth checks and initial data loading; Client components handle interactivity (`'use client'`). Server Actions bridge mutations between client forms and backend execution.
* **UI vs Business Logic Boundary**: UI components in `components/` handle rendering and user interactions; domain logic, data transformation, and permission enforcement live in `lib/crm/` and `lib/auth/`.
* **Authentication vs Authorization Boundary**: Authentication (`supabase.auth.getUser()`) verifies user identity; Authorization (`hasPermission()`) inspects the user's assigned role against `CRM_PERMISSIONS`.

## 10. Known Architectural Limitations

* **Lack of Automated Testing**: No unit, integration, or end-to-end test framework is configured in the repository.
* **Manual Data Validation**: Form input validation is handled imperatively without a schema-driven validation engine (such as Zod), requiring custom parsing logic per action.
* **Missing API Layer**: Lack of standard API route handlers (`app/api/*/route.ts`) restricts external API integrations to Server Actions or direct Supabase client calls.
* **Duplicate Supabase Client Instances**: Web and Mobile applications instantiate separate Supabase client setup files rather than sharing a unified client creator package.
