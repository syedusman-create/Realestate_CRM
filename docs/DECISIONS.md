# Architecture Decisions

## How to use this file

Important architectural decisions should be recorded here when they affect how future features should be implemented. When introducing new patterns, technology stack changes, or core structural boundaries, record the decision, rationale, implications, and repository evidence in this document.

## Existing Decisions

### DEC-001 — Monorepo Architecture with Turborepo & pnpm Workspaces

**Status:** Existing

**Decision:**
The repository is structured as a monorepo managed with `pnpm` workspaces (`pnpm-workspace.yaml`) and Turborepo (`turbo.json`). Applications live in `apps/` (`web`, `mobile`) and reusable code lives in internal packages (`packages/database`, `packages/dialer`, `packages/domain`).

**Reason:** Not documented.

**Implications:**
Shared domain types, database definitions, and dialer utilities must be maintained inside `packages/*` and referenced by applications using `workspace:*` dependencies. Pipeline tasks across apps and packages must be declared in `turbo.json`.

**Evidence:**
- `pnpm-workspace.yaml`
- `turbo.json`
- `package.json`
- `apps/web/package.json`
- `apps/mobile/package.json`

---

### DEC-002 — Direct Supabase Client Data Access without ORM

**Status:** Existing

**Decision:**
Data access is performed directly using Supabase JS SDK clients (`@supabase/ssr` for Next.js web application and `@supabase/supabase-js` for mobile application and database package) instead of an Object-Relational Mapping (ORM) library like Prisma, Drizzle, or TypeORM.

**Reason:** Not documented.

**Implications:**
Database schema migrations must be written manually as SQL scripts in `supabase/migrations/`. TypeScript types representing database tables and views must be updated in `packages/database/src/types.ts`.

**Evidence:**
- `apps/web/lib/supabase/server.ts`
- `apps/web/lib/supabase/client.ts`
- `packages/database/package.json`
- `packages/database/src/types.ts`
- `supabase/migrations/`

---

### DEC-003 — Server Actions for Backend Operations over API Routes

**Status:** Existing

**Decision:**
Data mutations and server-side processing are handled exclusively using Next.js Server Actions (`'use server'`). Next.js API Route Handlers (`app/api/*/route.ts`) are not used in the project.

**Reason:** Not documented.

**Implications:**
New server-side endpoints or mutation procedures should be implemented as async functions marked with `'use server'` inside `apps/web/lib/crm/<feature>/` or next to page routes.

**Evidence:**
- `apps/web/lib/auth/actions.ts`
- `apps/web/lib/crm/leads/create-actions.ts`
- `apps/web/lib/crm/imports/actions.ts`
- `apps/web/app/dashboard/leads/[id]/actions.ts`
- Absence of `app/api/` route handlers.

---

### DEC-004 — Imperative Custom Validation over External Schema Libraries

**Status:** Existing

**Decision:**
Form input and CSV data validation is implemented using custom imperative TypeScript functions, regular expressions, and lookup arrays rather than third-party schema validation libraries (such as Zod, Valibot, or Yup).

**Reason:** Not documented.

**Implications:**
Validation logic should follow existing patterns by creating explicit sanitizer functions (`clean()`, `normalizeEmail()`, `normalizePhone()`) and returning structured result objects containing boolean statuses and error message arrays.

**Evidence:**
- `apps/web/lib/crm/imports/validation.ts`
- `apps/web/lib/crm/leads/create-actions.ts`
- Absence of `zod` or similar libraries in `package.json`.

---

### DEC-005 — Role-Based Access Control (RBAC) Matrix

**Status:** Existing

**Decision:**
Authorization relies on a centralized Role-Based Access Control matrix. Roles are normalized to one of four CRM roles (`admin`, `manager`, `agent`, `broker`), and permissions are checked against a constant mapping (`ROLE_PERMISSIONS`) using the `hasPermission(role, permission)` utility.

**Reason:** Not documented.

**Implications:**
Any new protected feature or action must add a permission string to `CRM_PERMISSIONS` in `apps/web/lib/auth/permissions.ts` and update `ROLE_PERMISSIONS` for appropriate roles before enforcing checks in layouts or Server Actions.

**Evidence:**
- `apps/web/lib/auth/roles.ts`
- `apps/web/lib/auth/permissions.ts`
- `apps/web/app/dashboard/layout.tsx`

---

### DEC-006 — Middleware Proxy Pattern for Supabase Session Management

**Status:** Existing

**Decision:**
Next.js middleware entry point is defined in `apps/web/proxy.ts`, which invokes `updateSession(request)` in `apps/web/lib/supabase/proxy.ts` to refresh Supabase authentication tokens on matched requests.

**Reason:** Not documented.

**Implications:**
Global session refreshing and cookie synchronization logic must be maintained within `apps/web/lib/supabase/proxy.ts` and configured in `apps/web/proxy.ts`.

**Evidence:**
- `apps/web/proxy.ts`
- `apps/web/lib/supabase/proxy.ts`
