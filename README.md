# Compifi

Compifi is a compensation intelligence portal built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Turbopack
- Supabase Auth
- Supabase Row Level Security (multi-tenancy)

## Routes

- /overview
- /explorer
- /flight-risk
- /equity
- /insights

## Local setup

1. Copy .env.example to .env.local and add your Supabase project credentials.
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Supabase notes

The app includes a Supabase client ready for browser/server use and a tenant-scoped helper pattern for access control. For multi-tenancy, use a tenant_id column in your tables and enforce RLS policies such as:

```sql
create policy "tenant_isolation"
on public.employees
for all
using (tenant_id = auth.jwt() ->> 'tenant_id');
```

This shell is designed to be extended with real compensation data, auth flows, and tenant-aware analytics.
