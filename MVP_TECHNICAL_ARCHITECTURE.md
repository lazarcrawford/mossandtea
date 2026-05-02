# Moss & Tea Client Portal MVP Technical Architecture

## Purpose

This document turns the customer portal roadmap into an executable technical plan for the MVP. It is scoped to the first shippable portal: secure private project access, client-visible galleries, selections, documents, payment links, and basic notes.

The architecture should stay simple enough to build inside the current repo, but it must not create dead ends for the later roadmap: paid image services, product requests, archive intelligence, Shopify checkout, and agent-assisted merchandising.

## Current Technical Discovery

### Existing Stack

- Public site: static HTML, CSS, and JavaScript.
- Admin app: static Alpine app under `admin/`.
- Runtime edge layer: Cloudflare Worker in `worker.js`.
- Static deployment: Cloudflare Worker assets from generated `public/`.
- Database and auth: Supabase.
- Storage: Supabase Storage bucket `project-files`, now intended to be private.
- Tests and operations: Python validation scripts plus Playwright smoke scripts.

### Existing Data Model

The current schema already covers the studio operating core:

- `customers`
- `projects`
- `project_files`
- `contracts`
- `payments`
- `messages`
- `admins`
- `inquiries`

This is enough to support a first client portal if the access model is tightened and a few portal-specific tables and columns are added.

### Current Architecture Constraints

1. The public and admin apps are frameworkless static apps. The MVP should use the same style unless there is a clear reason to introduce a framework.
2. Admin and future portal browsers use the Supabase anon key directly, so RLS is the primary security boundary.
3. The Worker can hold service-role secrets, but should only be used for operations that genuinely need privileged execution.
4. Private files must not depend on public Supabase Storage URLs or unauthenticated proxy routes.
5. Existing RLS assumes `customers.id = auth.uid()`. That is brittle for real client relationships because one customer/account may later need multiple users, assistants, parents, brand team members, or archived invitees.

## MVP Architecture Summary

Build the portal as a static app parallel to admin:

```text
/portal/index.html
/portal/css/portal.css
/portal/js/portal.js
```

The browser authenticates with Supabase Auth and reads portal data directly through Supabase RLS. It requests signed Storage URLs only for project files the authenticated user is allowed to read.

The Worker remains the privileged edge layer for:

- Health checks.
- Public inquiry capture.
- Future invite creation.
- Future payment and Shopify webhooks.
- Future background/agent operations.

The Worker should not serve private files through unauthenticated routes. Existing `/api/files/*` and `/api/contracts/*` remain disabled unless explicitly configured for a controlled internal test.

## Recommended MVP Access Model

Use a `customer_users` mapping table instead of binding `customers.id` directly to `auth.uid()`.

```sql
customer_users
- id uuid primary key
- customer_id uuid references customers(id) on delete cascade
- user_id uuid references auth.users(id) on delete cascade
- email text not null
- role text check in ('owner', 'viewer') default 'owner'
- invited_at timestamptz
- accepted_at timestamptz
- revoked_at timestamptz
- created_at timestamptz
```

Why this should be the MVP path:

- It works with existing customer records that were created before auth users existed.
- It supports one client with multiple logins later.
- It supports parent/partner/team access without duplicating projects.
- It lets the studio revoke a portal user without deleting the customer record.
- It keeps later Shopify and archive features tied to the customer relationship, not just one auth account.

### Helper Functions

Add helper functions for RLS policy readability:

```sql
is_admin()
is_customer_user(customer_uuid uuid)
can_access_project(project_uuid uuid)
```

`is_admin()` already exists. MVP should add the customer/project helpers and migrate portal-facing policies to use them.

## MVP Data Model

### Project File Portal Fields

Add portal visibility and gallery sorting to `project_files`:

```sql
alter table project_files
  add column is_client_visible boolean not null default true,
  add column sort_order integer not null default 0,
  add column gallery_group text,
  add column download_allowed boolean not null default false,
  add column caption text;
```

Notes:

- `is_client_visible` is the key portal privacy control.
- `download_allowed` is separate from visibility so the studio can allow review without delivery.
- `gallery_group` supports future grouping such as proofs, finals, retouched, selects, and products.

### Client File Selections

```sql
client_file_selections
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- file_id uuid references project_files(id) on delete cascade
- customer_id uuid references customers(id) on delete cascade
- user_id uuid references auth.users(id) on delete set null
- selection_type text check in ('favorite', 'final_pick') not null
- note text
- submitted_at timestamptz
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Recommended uniqueness:

```sql
unique (file_id, user_id, selection_type)
```

This lets favorites behave like toggles while final-pick submission can be tracked through `submitted_at`.

### Invoices

```sql
invoices
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- customer_id uuid references customers(id) on delete cascade
- amount_cents integer not null
- status text check in ('draft', 'open', 'paid', 'void', 'overdue') not null default 'draft'
- due_at timestamptz
- payment_url text
- provider text
- provider_invoice_id text
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

For MVP, `payment_url` can be an external payment link. The portal does not need to process payments directly yet.

### Portal Documents

Existing `contracts` can serve MVP document access, but the name is too narrow for the roadmap. Add either a new `project_documents` table now or add portal fields to `contracts`.

Recommended MVP table:

```sql
project_documents
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- customer_id uuid references customers(id) on delete cascade
- title text not null
- document_type text check in ('contract', 'invoice', 'release', 'deliverable', 'other') not null
- r2_key text
- external_url text
- is_client_visible boolean not null default true
- requires_signature boolean not null default false
- signed_at timestamptz
- created_at timestamptz default now()
```

This avoids overloading `contracts` and leaves room for deliverables, releases, and future generated documents.

### Portal Notes

Existing `messages` can serve MVP notes if policies are tightened. Add a project-level display convention:

- Client can insert only into their own projects.
- Admin can insert into any project.
- Portal shows messages ordered oldest to newest.
- Admin app can later expose the same thread.

## RLS Policy Shape

The MVP security rule should be easy to state:

An authenticated portal user can see only customers and projects linked through `customer_users`, and only files/documents/invoices/messages for those projects when the row is marked client-visible where applicable.

### Policy Examples

Projects:

```sql
create policy "projects_portal_read"
on projects for select
using (is_admin() or can_access_project(id));
```

Project files:

```sql
create policy "project_files_portal_read"
on project_files for select
using (
  is_admin()
  or (
    is_client_visible
    and can_access_project(project_id)
  )
);
```

Storage objects:

```sql
create policy "customer_storage_read_visible_project_files"
on storage.objects for select
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from project_files pf
    where pf.r2_key = storage.objects.name
      and pf.is_client_visible = true
      and can_access_project(pf.project_id)
  )
);
```

Selections:

```sql
create policy "client_selection_read_write_own_project"
on client_file_selections for all
using (is_admin() or can_access_project(project_id))
with check (can_access_project(project_id));
```

The implementation should also ensure the inserted `customer_id` matches the project and the `user_id` matches `auth.uid()`, preferably through a trigger or constrained insert function.

## Client Portal App Architecture

### Frontend Modules

Keep the first version small:

```text
portal/index.html
portal/css/portal.css
portal/js/portal.js
```

`portal.js` can expose one Alpine root store with submodules:

- `auth`: session, login, logout.
- `projects`: list and selected project.
- `gallery`: visible files, signed URLs, lightbox state.
- `selections`: favorites, final picks, submit note.
- `documents`: visible documents/contracts.
- `billing`: invoices and payment links.
- `messages`: notes thread.

If the file grows beyond a maintainable size, split into static ES modules:

```text
portal/js/api.js
portal/js/auth.js
portal/js/gallery.js
portal/js/selections.js
portal/js/portal.js
```

No bundler is required for MVP if browser-native modules are used.

### Portal Routes

Use static hash or query-state routing to avoid adding an app router:

- `/portal/`
- `/portal/#projects`
- `/portal/#project/:id/overview`
- `/portal/#project/:id/gallery`
- `/portal/#project/:id/selections`
- `/portal/#project/:id/documents`
- `/portal/#project/:id/billing`
- `/portal/#project/:id/notes`

For a client with one active project, the app should load directly into that project overview after login.

### Data Access Pattern

The browser should:

1. Initialize Supabase with anon key.
2. Read the current auth session.
3. Query accessible projects through RLS.
4. Query project detail, visible files, selections, documents, invoices, and messages through RLS.
5. Request signed URLs for visible Storage keys using the authenticated session.

The browser should not:

- Receive service-role keys.
- Fetch private files through public URLs.
- Depend on unauthenticated Worker file proxy routes.
- Trust client-side filtering for privacy.

## MVP User Flows

### Invite And Login

MVP-friendly options:

1. Manual invite: create Supabase Auth user manually, add `customer_users` row, send password reset or magic link manually.
2. Admin-assisted invite: admin clicks "Invite" and the Worker uses service role to create or invite the auth user.

Recommended execution path:

- Sprint 1 can use manual invites to avoid blocking portal foundation.
- Sprint 2 should add an admin invite action through the Worker.

### Project Dashboard

Query accessible projects and display:

- Project title.
- Status.
- Shoot date.
- Delivery date.
- Next action.
- Balance status.
- Count of client-visible files.

### Gallery

Query `project_files` where RLS allows access, sorted by `sort_order`, `created_at`, and `filename`.

For each file:

- Display signed thumbnail/full image URL.
- Show favorite control.
- Show final-pick control.
- Open lightbox with previous/next.
- Show download only if `download_allowed = true`.

### Selections

Favorites are immediate toggles. Final picks can be toggles until submission.

Submission:

- Client reviews final picks.
- Client adds an optional note.
- App marks matching `client_file_selections.submitted_at = now()`.
- Admin can review final picks in the admin app.

### Documents

Show `project_documents` and/or existing `contracts` that are visible to the client.

For stored files, request signed URLs. For `external_url`, open the provider link.

### Billing

Show the latest open invoice and project payment state:

- Amount due.
- Due date.
- Status.
- External payment link.

The payment provider remains outside the MVP portal.

### Notes

Use `messages` as a lightweight project thread.

MVP should support:

- Read messages.
- Client add note.
- Admin see notes in project context.

## Admin Changes Required For MVP

The portal creates new admin responsibilities. Add only the admin surface needed for the MVP:

1. Customer project access
   - See whether a customer has portal access.
   - Add or confirm `customer_users` mapping.
   - Later: send invite.

2. File visibility
   - Toggle `is_client_visible`.
   - Toggle `download_allowed`.
   - Set `sort_order`.
   - Optionally assign `gallery_group`.

3. Selection review
   - See favorites.
   - See submitted final picks.
   - See note and submission time.

4. Documents and billing
   - Attach visible document records.
   - Add invoice/payment link metadata.

These changes can live in the existing admin app for MVP. A deeper admin redesign can follow after the portal data paths are real.

## Cloudflare Worker Responsibilities

### MVP Worker Routes

Keep existing routes:

- `GET /api/health`
- `POST /api/inquiries`

Add later in MVP if needed:

- `POST /api/admin/invites`

This route would require an authenticated admin session and should verify admin status before using the Supabase service-role key to create or invite portal users.

### Future Worker Routes

The same Worker boundary can later support:

- Payment webhooks.
- Shopify webhooks.
- Order status sync.
- Signed server operations that should not run from the browser.
- Agent job creation and review queues.

This keeps the static portal viable while preserving a secure backend lane for privileged workflows.

## Forward Compatibility

### Polished MVP: Paid Image Services

The MVP model intentionally keeps images as the core object. Later paid services can attach directly to `project_files`:

- `service_catalog`
- `service_requests`
- `orders`
- `order_items`
- `file_versions`

The gallery action menu can be added without changing the gallery ownership model.

### V1: Complete Operations Portal

The MVP introduces the key primitives V1 needs:

- Client access mapping.
- Project-scoped portal data.
- File visibility and downloads.
- Documents.
- Invoices.
- Messages.
- Admin review of client actions.

V1 mostly expands workflows, rather than replacing the foundation.

### V2: Archive Intelligence

Because selections and favorites are stored at the image level, future archive intelligence can use real client preference signals:

- Favorite frequency.
- Final picks.
- Downloaded files.
- Project milestones.
- Seasonal reactivation events.

### V3: Commerce Bridge

Product requests can attach to:

- `customer_id`
- `project_id`
- `file_id`

This matches the MVP model. No migration away from project files is needed.

### V4: Shopify And Agents

Shopify should own cart, checkout, tax, shipping, and receipts. Supabase should remain the client relationship and image permission source of truth.

The MVP supports this by keeping:

- Client identity in Supabase.
- Image permissions in Supabase.
- Project context in Supabase.
- Privileged external API work in the Worker.

Agents should later write recommendations and prepared outputs to review tables before anything becomes client-facing.

## Execution Plan Against MVP

### Sprint 1: Portal Foundation

Files:

- `supabase/migrations/00006_client_portal.sql`
- `portal/index.html`
- `portal/css/portal.css`
- `portal/js/portal.js`
- `scripts/client-portal-smoke.js`
- update `scripts/build_public.py` to copy `portal/`
- update `scripts/test.py` to validate portal assets

Build:

- Add `customer_users`.
- Add portal fields to `project_files`.
- Add helper RLS functions.
- Add project/file/storage read policies using `customer_users`.
- Create portal login shell.
- Load project list.
- Load visible gallery files.
- Generate signed URLs.
- Add mobile gallery and lightbox.

Verification:

- Anonymous user cannot read projects.
- Test client can read only mapped projects.
- Test client cannot read another client's project files.
- Signed URLs are generated only for visible files.
- Static build includes `/portal/`.

### Sprint 2: Selections And Admin Review

Files:

- Extend `portal/js/portal.js`.
- Extend `admin/js/admin.js`.
- Extend `admin/index.html`.
- Extend `admin/css/admin.css`.
- Extend smoke scripts.

Build:

- Add favorites.
- Add final picks.
- Add submission note.
- Add admin selection review.

Verification:

- Client can favorite and un-favorite.
- Client can submit final picks on mobile.
- Admin sees selected file IDs, names, note, and timestamp.

### Sprint 3: Documents, Billing, And Notes

Files:

- Migration additions if not included in Sprint 1.
- Portal tabs for documents, billing, notes.
- Admin fields for document and invoice metadata.

Build:

- Add `project_documents`.
- Add `invoices`.
- Show payment links.
- Show visible documents.
- Use signed URLs for stored document files.
- Show and insert project messages.

Verification:

- Client can access visible documents only.
- Client can see payment link but no provider secret.
- Client notes appear in admin context.

### Sprint 4: Invite Automation

Files:

- `worker.js`
- `admin/js/admin.js`
- admin invite UI.
- Worker/admin smoke coverage.

Build:

- Add admin invite route.
- Verify admin session before privileged invite.
- Create or invite Supabase Auth user.
- Upsert `customer_users`.
- Show invite status.

Verification:

- Non-admin cannot call invite route.
- Admin can invite a test client.
- Revoked user loses access.

## MVP Acceptance Criteria

The MVP is ready when:

- A real client can log in and see only their own project.
- A client-visible private gallery loads through authorized signed URLs.
- A client cannot access another client's project, file metadata, or Storage object.
- Gallery review works well on mobile.
- Client can favorite images and submit final picks with a note.
- Admin can see submitted selections.
- Client can find visible documents and payment links without a manual message thread.
- Public deployment serves only intended static assets.
- Focused smoke tests cover anonymous, client, and admin access boundaries.

## Risks And Mitigations

### RLS Drift

Risk: prior migrations used more than one admin/access strategy.

Mitigation: add a clean portal migration with helper functions and explicit policies. Write test cases for anonymous, client, other-client, and admin access.

### Auth Mapping Confusion

Risk: current schema comments imply `customers` can serve as auth users, but existing admin-created customers are not guaranteed to match `auth.users`.

Mitigation: use `customer_users` for MVP. Avoid requiring `customers.id = auth.uid()`.

### Storage Exposure

Risk: private images are the core trust boundary.

Mitigation: keep the bucket private, remove broad authenticated reads, require visible project file records for Storage reads, and use short-lived signed URLs.

### Admin Complexity

Risk: adding portal operations to the existing single-file admin app may become hard to maintain.

Mitigation: only add the admin controls required for MVP. Defer full admin redesign until portal data paths are proven.

### Payment Scope Creep

Risk: trying to implement checkout too early.

Mitigation: use external payment links in MVP. Add provider webhooks only after the client portal is stable.

## Open Technical Decisions

1. [#3](https://github.com/lazarcrawford/mossandtea/issues/3): Auth method for first clients: email/password, magic link, or Supabase invite link.
2. Whether Sprint 1 includes `project_documents` and `invoices`, or whether they wait until Sprint 3.
3. How image derivatives should be handled for thumbnails versus full-size review files.
4. [#5](https://github.com/lazarcrawford/mossandtea/issues/5): Whether downloads require `balance_paid`, `download_allowed`, or both.
5. Whether project notes should remain in `messages` or become a richer support thread later.
6. [#6](https://github.com/lazarcrawford/mossandtea/issues/6): Which payment provider owns MVP payment links.

## TDD Gap Register

Pre-sprint coverage gaps are tracked in [docs/tdd-gap-register.md](docs/tdd-gap-register.md) and [GitHub issue #10](https://github.com/lazarcrawford/mossandtea/issues/10). The security-critical items are portal auth, `customer_users` mapping, cross-client RLS denial, and private Storage signed URL behavior.

## Recommended Next Action

Start Sprint 1 with the database migration and portal shell. The access model is the foundation. Once `customer_users`, portal RLS, and signed gallery access are verified, the rest of the MVP becomes incremental UI and workflow work rather than a security rewrite.
