# Revert public spot add/edit (authenticated members)

This documents how to undo the temporary change that lets **any signed-in user** create and update spots (and spot map images), with **delete** still admin-only.

## 1. Database: remove RLS and storage policies

Apply in the Supabase SQL editor (or a new migration that only contains these statements).

**Drop the policies created in `supabase/migrations/0010_authenticated_spot_insert_update.sql`:**

```sql
DROP POLICY IF EXISTS "Authenticated can insert spots" ON public.spots;
DROP POLICY IF EXISTS "Authenticated can update spots" ON public.spots;

DROP POLICY IF EXISTS "spot-maps authenticated insert" ON storage.objects;
DROP POLICY IF EXISTS "spot-maps authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "spot-maps authenticated delete" ON storage.objects;
```

**Optional:** Delete or rename migration file `0010_authenticated_spot_insert_update.sql` in your repo if you use migration history strictly (remote may already have applied it; dropping policies is what matters for production).

After this, only admins can insert/update spots and manage `spot-maps` files again (via existing policies from `0002` and `0006`).

## 2. App: remove UI and routes

Remove or revert changes in these areas:

| Area | What to remove / revert |
|------|-------------------------|
| Spot guide | On `src/app/spots/page.tsx`, remove `getCurrentUser`, the **Legg til ny spot** button, and related imports; restore the simple header block without the top-right CTA. |
| New route | Delete the folder `src/app/spots/ny/` (the “Legg til ny spot” page). |
| Spot detail | On `src/app/spots/[id]/page.tsx`, remove `getSpots`, `getCurrentUser`, `SpotDetailPublicEdit`, and restore the single **Tilbake til Spot guide** link layout (no top row with edit). |
| Public edit UI | Delete `src/components/spots/spot-detail-public-edit.tsx` and `src/components/spots/add-spot-page-client.tsx`. |
| Shared form | Either keep `src/components/spots/spot-form.tsx` and continue importing it from the admin tab, or inline the form back into `src/components/admin/tabs/spots-tab.tsx` only. |

## 3. Login `next` parameter (optional)

If nothing else needs post-login redirects, you can revert `src/app/login/page.tsx` to always use `redirectTo: \`${origin}/auth/callback\`` without a `next` query param.

Keeping `next` support is harmless and useful for other flows; `src/app/auth/callback/route.ts` already reads `next`.

## 4. Verify

- As a **non-admin** user: creating or updating a spot should **fail** (RLS / storage).
- As **admin**: admin console spot CRUD and map uploads still work.
- Spot guide and spot pages still **load for everyone** (read policies unchanged).
