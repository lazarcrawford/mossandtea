# Phase 1 Kinetic Execution Plan

## Aim

Phase 1 turns Hermitage from a promising prototype into a working private client room that can support one real client project end to end. The operating rhythm is intentionally kinetic: plan, build, test, review, tighten, and ship in small PRs rather than waiting for one large sprint handoff.

## Operating Loop

Each sprint runs as a set of short cycles:

1. **Frame**
   State the user workflow, data boundary, and acceptance tests before implementation.

2. **Build**
   Ship the smallest complete vertical slice across portal, admin, database, and worker where needed.

3. **Verify**
   Run static validation, browser smoke, and any RLS/storage tests tied to the slice.

4. **Peer Review**
   Ask CloudCode/Claude to review the delta against the sprint goal, security boundary, and product workflow.

5. **Correct**
   Address actionable feedback immediately or open a GitHub issue when a decision is needed.

6. **Demo**
   Record the demo path, test evidence, and remaining risks in the PR.

## CloudCode Review Delta

Claude/CloudCode agreed with the sequence but sharpened the dependency: Sprint 2 cannot be only access control, because the current shell still hides useful workflow behind atmosphere. The corrected Sprint 2 is **Access And Shell**: prove the security boundary while redesigning Hermitage so functional project context appears immediately. It also flagged billing/webhooks as a later Worker concern, not a client-only static-site feature.

## Sprint 2: Access And Shell

### User Outcome

The studio can invite a real client, see access state, and trust that the client only sees their own private project room.

### Product Scope

- Admin customer/project access panel.
- Admin invite action for a customer/project.
- Visible access state: invited, accepted, revoked.
- Client magic-link entry path verified against `customer_users`.
- Compact Hermitage entrance so the active project room is visible above the fold.
- Depth shell: status, proof count, final-pick count, and next action surface inside the masthead instead of below it.

### Technical Scope

- Worker route for admin-only invite/upsert operations.
- Admin UI for invite/revoke/access state.
- Supabase Auth user creation or invite handoff.
- `customer_users` read/write path from admin operations.
- RLS tests for anonymous, invited client, other client, revoked client, and admin.

### Test Gates

- `npm test`
- `npm run test:admin-ui`
- `npm run test:hermitage-ui`
- New RLS/access script covering two seeded clients.
- Worker route tests for non-admin denial and admin success.
- Desktop/mobile screenshot check proving the room controls appear without a full-screen atmospheric header.

### PR Shape

- PR 1: compact Hermitage room entrance and UX smoke.
- PR 2: RLS/access route tests against seeded two-client data.
- PR 3: invite/access Worker route with tests.
- PR 4: admin invite/access panel and browser smoke.

## Sprint 3: Proofing Operations And Studio Review

### User Outcome

The client can complete proofing with confidence, and the studio can review selections without digging through raw database rows.

### Product Scope

- Favorite and final-pick states.
- Submission note.
- Submitted timestamp and locked/reopen state.
- Admin selection review surface.
- Admin ability to mark reviewed, request clarification, or reopen selections.

### Technical Scope

- Extend `client_file_selections` behavior for submission state.
- Add project-level proofing status where needed.
- Admin selection viewer grouped by project and file.
- Selection data shown with filenames, thumbnails, caption, note, and timestamp.

### Test Gates

- Portal smoke: pick, unpick, submit, reload, submitted state persists.
- Admin smoke: see submitted picks and note.
- RLS test: client cannot view another client's selections.
- Regression test: unsubmitted local/demo selection still works.

### PR Shape

- PR 1: portal proofing state model and submission UX.
- PR 2: admin selection review.
- PR 3: proofing persistence and RLS test coverage.

## Sprint 4: Documents, Billing, And Print-Service Intent

### User Outcome

Hermitage becomes useful beyond proofing: the client can find documents, understand billing, and request print/service work from an image without the experience feeling like a storefront.

### Product Scope

- Documents panel with signed document links.
- Billing panel with external payment links and clear payment state.
- Print/service request entry point from an image.
- Lightweight service request queue for admin review.
- Human-led quote/fulfillment language.

### Technical Scope

- Harden `project_documents` and `invoices` visibility.
- Add service request tables if not already present.
- Add image-level action menu in Hermitage.
- Add admin service request queue.
- Keep payment provider secrets outside the portal.

### Test Gates

- Client sees only visible documents.
- Private document URLs are signed and scoped.
- Payment link renders without exposing provider secret.
- Any payment webhook or secret-bearing operation runs through Worker/server code, never client-only static JS.
- Client can request print/service work from one image.
- Admin can see and change request status.

### PR Shape

- PR 1: document/billing hardening and smoke tests.
- PR 2: image service request schema and portal UI.
- PR 3: admin request queue and fulfillment status.

## Design Correction From Sprint 1 Review

The Hermitage hero should create atmosphere without consuming the whole laptop viewport. The next iteration uses depth design: a compact photographic masthead plus a functional room card showing project status, proof count, final picks, and the next action immediately. The guiding rule is that mood supports workflow; it does not hide it.

## QA Discipline

Every PR should include:

- Exact local demo URL.
- Commands run and results.
- Screenshots for desktop and mobile when the UI changes.
- Security note when data access changes.
- Cloudflare build status after push.

## Current First Move

Start with the Sprint 2 PR 1 slice: compact Hermitage room entrance and prove that the active project room is reachable above the fold on desktop and mobile. This is low-risk, responds directly to UAT feedback, and improves the demo while the invite/access implementation begins behind it.
