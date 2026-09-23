# Project Development Instructions

## 1. Project Overview

This repository contains the codebase for Global Enterprises Real Estate CRM, a multi-platform real estate management platform for managing leads, deals, tasks, dialer campaigns/calls, property inventory, team members, property/lead CSV imports, and reports.

The project is structured as a monorepo managed with Turborepo (`turbo`) and `pnpm` workspaces (`pnpm-workspace.yaml`). It consists of two client applications (`apps/web` for Next.js web application and `apps/mobile` for Expo/React Native mobile application), three internal shared packages (`packages/database`, `packages/dialer`, `packages/domain`), and database migration scripts (`supabase/migrations`).

## 2. Technology Stack

* **Turborepo**
  * Version: `^2.5.6`
  * Purpose: Workspace task orchestration and build pipeline management.
* **pnpm**
  * Version: `10.15.0`
  * Purpose: Package manager and workspace dependency management.
* **TypeScript**
  * Version: `^5.9.2` (root), `^5.9.0` (apps/web, apps/mobile)
  * Purpose: Static type checking across all applications and shared packages.
* **Next.js**
  * Version: `^16.0.0`
  * Purpose: Web application framework utilizing App Router, Server Components, and Server Actions in `apps/web`.
* **React**
  * Version: `^19.0.0` (`apps/web`), `latest` (`apps/mobile`)
  * Purpose: UI component rendering library.
* **React DOM**
  * Version: `^19.0.0`
  * Purpose: DOM rendering engine for the web application (`apps/web`).
* **Expo**
  * Version: `latest`
  * Purpose: React Native framework and runtime environment for `apps/mobile`.
* **Expo Router**
  * Version: `latest`
  * Purpose: File-based routing for `apps/mobile`.
* **React Native**
  * Version: `latest`
  * Purpose: Cross-platform mobile UI framework for `apps/mobile`.
* **Supabase JS SDK (`@supabase/supabase-js`)**
  * Version: `^2.57.4`
  * Purpose: Database client and authentication interface for Web, Mobile, and Database packages.
* **Supabase SSR (`@supabase/ssr`)**
  * Version: `^0.7.0`
  * Purpose: Server-side rendering authentication and cookie management for Next.js in `apps/web`.
* **Tailwind CSS**
  * Version: `^4.3.3` (with `@tailwindcss/postcss` `^4.3.3`)
  * Purpose: Utility-first CSS styling for `apps/web`.
* **Base UI (`@base-ui/react`)**
  * Version: `^1.8.0`
  * Purpose: Unstyled UI primitives for component building in `apps/web`.
* **Lucide React (`lucide-react`)**
  * Version: `^1.47.0`
  * Purpose: Icon set for `apps/web`.
* **Motion (`motion`)**
  * Version: `^13.4.0`
  * Purpose: Animation library for web UI transitions in `apps/web`.
* **Class Variance Authority (`class-variance-authority`)**
  * Version: `^0.7.1`
  * Purpose: Utility for variant-driven component class composition in `apps/web`.
* **Prettier**
  * Version: `^3.6.2`
  * Purpose: Code formatting tool configured at the workspace root.

## 3. Repository Structure

* `apps/` — Application workspace folder containing executable applications:
  * `apps/web/` — Next.js 16 web application containing App Router pages (`app/`), UI components (`components/`), auth/domain utilities (`lib/`), and static assets (`public/`).
  * `apps/mobile/` — Expo mobile application containing file routes (`app/`), configuration (`app.json`), and Supabase initialization (`lib/`).
* `packages/` — Shared workspace libraries:
  * `packages/database/` — Supabase database types and client exports (`src/types.ts`, `src/crm-types.ts`, `src/index.ts`).
  * `packages/dialer/` — Dialer domain types and logic (`src/index.ts`).
  * `packages/domain/` — Common domain model type definitions (`src/index.ts`).
* `supabase/` — Supabase backend configurations and SQL migrations:
  * `supabase/migrations/` — Versioned SQL migration scripts for database tables, functions, and RLS policies.
* `pnpm-workspace.yaml` — Defines workspace root and package locations (`apps/*`, `packages/*`).
* `turbo.json` — Configuration for Turborepo pipeline tasks (`build`, `dev`, `lint`, `typecheck`, `test`).
* `package.json` — Workspace root manifest containing root scripts and shared devDependencies.
* `tsconfig.json` — Base TypeScript configuration extended by workspace packages and applications.

## 4. Architecture Rules

* **Database Access**: Occurs directly through the Supabase JS client (`@supabase/ssr` on web server/client, `@supabase/supabase-js` on mobile). There is no ORM (such as Prisma or Drizzle) layer in the repository.
* **Business Logic**: Lives in feature-specific Server Actions (e.g. `lib/crm/leads/create-actions.ts`, `lib/crm/imports/actions.ts`, `app/dashboard/leads/[id]/actions.ts`) or shared domain packages (`packages/dialer`, `packages/domain`).
* **Validation**: Performed imperatively using custom TypeScript functions (e.g., string sanitization, lookup array verification, regex matching) within server actions or feature modules. Third-party schema validation libraries (such as Zod) are not used.
* **Authentication**: Managed via Supabase Auth. Checked on server layouts via `supabase.auth.getUser()`, and updated in Next.js middleware/proxy (`apps/web/proxy.ts` calling `updateSession()` from `apps/web/lib/supabase/proxy.ts`).
* **Authorization**: Handled via custom Role-Based Access Control (RBAC) in `lib/auth/roles.ts` (`admin`, `manager`, `agent`, `broker`) and `lib/auth/permissions.ts` (`hasPermission(role, permission)`).
* **Server/Client Boundaries**: Next.js App Router RSCs (`layout.tsx`, `page.tsx`) handle server layout rendering and initial data fetching. Client components (`'use client'`) handle interactive UI forms and client state.
* **API/Server Actions**: Mutation and form handling rely on Next.js Server Actions (`'use server'`). No Next.js API route handlers (`app/api/*/route.ts`) exist in the repository.

## 5. Coding Conventions

* **File Naming**: Kebab-case for utility and component files (e.g., `create-actions.ts`, `login-form.tsx`, `user-menu.tsx`). Next.js system files follow Next.js naming conventions (`page.tsx`, `layout.tsx`, `proxy.ts`).
* **Component Naming**: PascalCase for React components (e.g., `LoginForm`, `DashboardLayout`, `AppShell`).
* **Function Naming**: camelCase for functions and helper methods (e.g., `normalizeCrmRole`, `hasPermission`, `createClient`).
* **Import Conventions**: Next.js web app uses path alias `@/*` mapping to `apps/web/*`. Internal monorepo packages are imported via workspace names: `@realestate-crm/database`, `@realestate-crm/dialer`, `@realestate-crm/domain`.
* **Type Conventions**: Explicit TypeScript types and interfaces exported using `export type` or `export interface`.
* **Error Handling**: Functions return explicit result state objects (e.g., `{ ok: boolean, message: string }`) or store user-facing messages in React state (`setError(message)`).
* **Async Patterns**: `async/await` is used exclusively for asynchronous operations.

## 6. Authentication and Authorization

* **Authentication Mechanism**: Supabase Auth (email and password authentication).
* **Where Authentication is Checked**: On web server layouts (`apps/web/app/dashboard/layout.tsx`) via `supabase.auth.getUser()`, unauthenticated requests redirect to `/login`. Session cookies are refreshed in `apps/web/proxy.ts`.
* **How the Current User is Accessed**: On the server using `createClient()` from `@/lib/supabase/server` followed by `supabase.auth.getUser()`. User profile role details are fetched from the `users` database table.
* **How Authorization is Handled**: Role-based access control configured in `apps/web/lib/auth/roles.ts` and `apps/web/lib/auth/permissions.ts`. Four roles exist: `admin`, `manager`, `agent`, `broker`. Permissions are validated using `hasPermission(role, permission)`.
* **Security Boundaries**: Unauthenticated users are redirected to `/login`. Authenticated users without a valid CRM role are redirected to `/unauthorized`.

## 7. Database and Data Access

* **Database Technology**: PostgreSQL hosted on Supabase.
* **ORM/Query Layer**: Direct Supabase SDK queries (`supabase.from(...)`). No ORM is present.
* **Schema Location**: Database table definitions and policies are stored as SQL scripts in `supabase/migrations/`.
* **Database Client Location**:
  * `apps/web/lib/supabase/server.ts` — Server client using `@supabase/ssr`.
  * `apps/web/lib/supabase/client.ts` — Browser client using `@supabase/ssr`.
  * `apps/web/lib/supabase/proxy.ts` — Middleware proxy client for session updates.
  * `apps/mobile/lib/supabase.ts` — Mobile client using `@supabase/supabase-js`.
* **Data Access Patterns**: Server components and Server Actions call Supabase client directly (`supabase.from('table').select(...)`, `.insert(...)`, `.update(...)`, `.rpc(...)`).
* **Transaction Patterns**: Database operations execute as standard Supabase client calls or database RPC functions defined in migrations.

## 8. Validation

* **Validation Library**: None (No Zod, Valibot, or Yup dependency).
* **Where Schemas Live**: Imperative validation rules and lookups defined as constant arrays and functions in feature modules (e.g., `apps/web/lib/crm/imports/validation.ts`).
* **Where Validation Occurs**: Inside Server Actions (e.g., `apps/web/lib/crm/leads/create-actions.ts`) and feature validation utilities before database operations.
* **How Validation Errors are Handled**: Validation issues are formatted into error arrays or result objects (`{ ok: false, message: string }`) and displayed to the user in UI alerts.

## 9. Business Logic

Business logic is located in feature-specific Server Actions and domain helper modules.

* **Example 1 — Lead Creation**: In `apps/web/lib/crm/leads/create-actions.ts`, input form data is extracted, sanitized using helper functions (`clean()`, `normalizeEmail()`, `normalizePhone()`), checked against permissions using `hasPermission()`, and inserted into Supabase `leads` table.
* **Example 2 — CSV Import Processing**: In `apps/web/lib/crm/imports/validation.ts` and `actions.ts`, raw CSV rows are validated line-by-line against database field definitions and enum arrays before bulk database execution.

## 10. UI Architecture

* **Server Components**: Used for page layouts and route wrappers (e.g., `DashboardLayout`, `HomePage`, `DashboardPage`).
* **Client Components**: Interactive forms and components explicitly designated with `'use client'` (e.g., `LoginForm`, navigation components, action buttons).
* **Shared Components**: UI components under `apps/web/components/ui/` built following `shadcn` patterns and `@base-ui/react`.
* **Forms**: Handled via standard HTML `<form>` elements and Client Component state or Server Actions.
* **UI Library**: Custom `shadcn` style components using `@base-ui/react` primitives and `lucide-react` icons.
* **Styling**: Tailwind CSS v4 configured in `apps/web/app/globals.css` with CSS variables and `tw-animate-css`.
* **State Management**: React local component state (`useState`, `useTransition`), Next.js router, and URL search parameters. No global state framework (Redux, Zustand, Context API) is present.

## 11. API / Server Communication

* **Route Handlers**: None present in `apps/web/app`.
* **Server Actions**: Used as the primary mechanism for client-to-server mutations and server execution (`'use server'`).
* **API Conventions**: Direct invocation of Server Actions from forms or event handlers.
* **Request/Response Patterns**: Form data or argument objects passed to async functions returning structured response objects (`{ ok: boolean, message: string }`).
* **Error Handling**: Server actions catch execution errors and return error state objects instead of unhandled rejections.

## 12. Testing

* **Testing Framework(s)**: `Unknown / Not present` (No Jest, Vitest, Playwright, or Cypress dependencies/configs present).
* **Test Locations**: `Unknown / Not present`.
* **Existing Testing Patterns**: `Unknown / Not present`.
* **Commands Used to Run Tests**: Root `package.json` contains `"test": "turbo run test"`, but no package defines test scripts or test files.

## 13. Important Rules for AI

* **Inspect existing code before creating new code.**
* **Reuse existing patterns where appropriate** (e.g., direct Supabase queries, custom validation functions, server action error state structure).
* **Do not invent files, functions, APIs, database fields, packages, or components.**
* **Do not modify unrelated code.**
* **Do not introduce new dependencies** without explaining why.
* **Preserve existing architecture** (Turborepo monorepo, Next.js App Router, Supabase JS SDK, Tailwind CSS v4) unless an architectural change is explicitly approved.
* **When uncertain, state the uncertainty instead of guessing.**
* **Before implementing a feature, inspect relevant existing implementations.**
