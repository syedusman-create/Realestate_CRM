# Supabase workflow

The production Supabase project is the source of truth for the CRM database.

Project ref: `dtceclzagmolyykvmhdh`

Before local database work:

```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref dtceclzagmolyykvmhdh
pnpm dlx supabase db pull
```

Generate database types from the remote schema:

```bash
pnpm dlx supabase gen types typescript --project-id dtceclzagmolyykvmhdh --schema public > packages/database/src/database.generated.ts
```

Application code should use the publishable Supabase key only. Service-role credentials belong exclusively in trusted server/Edge Function environments.
