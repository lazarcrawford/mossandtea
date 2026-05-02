# Sprint 1 Binding Decisions

These decisions close the planning loop for the first Moss & Tea customer portal sprint.

Source inputs:

- [PR #11 execution review packet](https://github.com/lazarcrawford/mossandtea/pull/11)
- [CloudCode review comment](https://github.com/lazarcrawford/mossandtea/pull/11#issuecomment-4362730998)
- Ollama-backed CloudCode decision sanity check on 2026-05-02

## Route

Decision: use `/hermitage/` as the primary client portal route.

Compatibility: `/portal/` should remain a redirect or alias to `/hermitage/`.

Implementation notes:

- Source directory should be `hermitage/`.
- `scripts/build_public.py` should copy `hermitage/` into `public/hermitage/`.
- Worker should redirect `/portal/` to `/hermitage/`, or static routing should provide an equivalent alias.
- Hash routes should work under `/hermitage/#project/:id/...`.

Rationale: "Hermitage" fits the client-facing private archive concept better than the generic "portal" label while preserving compatibility for any prior references.

## Auth

Decision: manual Supabase invite or magic-link style access for MVP.

No password management UI in Sprint 1.

Issue: [#3](https://github.com/lazarcrawford/mossandtea/issues/3)

## Access Model

Decision: use `customer_users` as the binding table between `auth.users` and `customers`.

Minimum fields:

- `customer_id`
- `user_id`
- `role` with `owner` and `viewer`
- `invited_at`
- `accepted_at`
- `revoked_at`

Issue: [#4](https://github.com/lazarcrawford/mossandtea/issues/4)

## RLS Strategy

Decision: Sprint 1 migration must replace existing customer-facing RLS policies, not layer new policies beside old assumptions.

Migration `00006_client_portal.sql` must:

- drop existing policies that rely on `customers.id = auth.uid()`
- create helper functions such as `is_admin()`, `is_customer_user()`, and `can_access_project()`
- recreate policies using `customer_users`
- preserve admin access
- include idempotent `DROP POLICY IF EXISTS` statements

This is a security requirement, not a cleanup preference.

## Private Storage

Decision: remove broad authenticated read access for `project-files`.

Migration `00006_client_portal.sql` must explicitly drop broad `authenticated_read` storage policies and replace them with project-file-record-gated access.

Issue: [#15](https://github.com/lazarcrawford/mossandtea/issues/15)

## Private File Delivery

Decision: remove, block, or hard-gate unauthenticated private file proxy routes.

Scope includes both deployment surfaces:

- `worker.js`
- `functions/api/[[catchall]].js`

The portal should use RLS-gated signed URLs for client-visible files. Any remaining proxy route must require authenticated project access and must not set public cache headers for private content.

Issue: [#13](https://github.com/lazarcrawford/mossandtea/issues/13)
Blocker: [#16](https://github.com/lazarcrawford/mossandtea/issues/16)

## Downloads

Decision: Sprint 1 uses `download_allowed` as the admin release gate.

No `balance_paid` download gate in Sprint 1.

Issue: [#5](https://github.com/lazarcrawford/mossandtea/issues/5)

## Project Documents

Decision: include `project_documents` in the Sprint 1 migration.

UI can remain minimal or deferred, but the table and RLS should be part of `00006_client_portal.sql`.

Issue: [#12](https://github.com/lazarcrawford/mossandtea/issues/12)

## Messages

Decision: no client write messaging in Sprint 1 unless identity is explicit.

If client messaging is implemented later, messages must identify the actual sender through `user_id`, `customer_id`, or both, and RLS must verify the user's customer relationship.

Issue: [#14](https://github.com/lazarcrawford/mossandtea/issues/14)

## Payments

Decision: use external `payment_url` only for MVP.

No provider integration or webhook automation in Sprint 1.

Issue: [#6](https://github.com/lazarcrawford/mossandtea/issues/6)

## Accepted Test Plan

Sprint 1 accepts the four-persona RLS test plan:

- anonymous
- owner
- other-client
- admin

Minimum test coverage:

- anonymous cannot read project, file, document, invoice, or selection data
- owner can read only their own customer/project data
- other-client cannot read another client's data or files
- admin can read/manage all portal data
- broad `project-files` authenticated reads are denied
- unauthenticated private file proxy routes return 401, 403, or 404
- signed URL issuance is allowed only for authorized, client-visible files

## Minimum Admin Scope

Sprint 1 admin work is limited to controls needed to operate the MVP:

- see whether a customer has portal access
- create or confirm `customer_users` mapping
- toggle `is_client_visible`
- toggle `download_allowed`
- set file `sort_order`
- review submitted selections

Full admin redesign is deferred.

## Sprint 1 Start Condition

Sprint 1 can start once this decision file is merged into `main`.

Open implementation blockers [#15](https://github.com/lazarcrawford/mossandtea/issues/15) and [#16](https://github.com/lazarcrawford/mossandtea/issues/16) should be resolved in Sprint 1 before any real client portal data is exposed.
