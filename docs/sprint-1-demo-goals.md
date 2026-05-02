# Sprint 1 Demo Goals

## Hermitage Client Room

Sprint 1 should demonstrate the shape of a premium private client room, not just prove that Supabase access works.

## Demo Goals

1. **Cinematic entrance**
   The first screen should feel like Moss & Tea: photographic, quiet, editorial, and private. It should not look like a generic SaaS dashboard.

2. **Project command center**
   A client should immediately understand the active project, current status, shoot date, delivery target, number of visible proofs, and the studio's note.

3. **Proofing workflow**
   The gallery should support the real client action: reviewing images, opening them larger, filtering the set, and marking final picks.

4. **Persistent selection tray**
   Final picks should remain visible while the client moves through the edit, making the workflow feel intentional rather than transactional.

5. **Operational readiness**
   Documents and billing surfaces should exist in the same room so future contracts, releases, invoices, and payment links have an obvious home.

6. **Mobile confidence**
   The portal must load without horizontal overflow on phone and desktop, with proofing controls reachable and image cards sized for touch.

## Current Demo Scope

- Route: `/hermitage/`
- Compatibility redirect: `/portal/` to `/hermitage/`
- Demo URL: `/hermitage/?demo=1`
- Auth model: Supabase magic link
- Storage model: authenticated signed URLs
- Admin source of truth: project files marked client-visible

## Out Of Scope For This Demo

- Applying the Supabase migration to production
- Real client invite issuance
- Real payment checkout
- Client messaging threads
- Fulfillment or Shopify integration
