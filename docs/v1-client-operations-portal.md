# Moss & Tea V1 Client Operations Portal

## Shared Aim

V1 turns the portal from a private proofing room into the operating path for a paid photography project: invite, contract, shoot, proofing, edit requests, paid services, studio fulfillment, final delivery, and client acceptance.

The product should still feel like Moss & Tea: quiet, clean, image-led, and human. The portal is not a generic SaaS dashboard; it is the client-facing surface of Irina's studio care.

## End-To-End Journey

1. **Inquiry / Onboarding**
   - Admin creates customer and project.
   - Client receives a private portal invite.
   - Portal shows the project, next action, contact/profile basics, and project expectations.

2. **Contract And Booking**
   - Admin publishes agreement and payment terms.
   - Client signs or reviews the contract.
   - Admin countersigns and marks project booked.
   - Payment/deposit status becomes visible in the portal.

3. **Shoot And Studio Intake**
   - Admin advances status from booked to shoot complete.
   - Studio uploads internal files, then marks proof candidates client-visible.
   - Portal shows proofing instructions, included edit count, and delivery timing.

4. **Proof Review**
   - Client reviews images, selects final picks, and requests edits per image.
   - Each edit can carry a note.
   - Included edits are counted against the project package.
   - Overage edits are priced inline.

5. **Additional Services**
   - Client can add services such as rush gallery, digital card design, or print-ready master files.
   - Service requests become an order.
   - Paid services create a payment/billing item before fulfillment proceeds.

6. **Admin Fulfillment**
   - Admin sees a studio operations queue: contract actions, proof submissions, edit requests, service orders, delivery packages, and acceptance state.
   - Irina owns visual decisions.
   - Lazar/Prometheus can support work order synthesis, checklisting, export naming, package manifests, and delivery notes.

7. **Agentic Editing Harness**
   - The agent should not silently edit or publish final images.
   - The agent may summarize selections, create edit work orders, prepare file manifests, draft delivery copy, check naming, and verify that files are visible only to the right client.
   - Irina remains the approval gate for final visual work.

8. **Final Delivery And Acceptance**
   - Admin publishes final files.
   - Client reviews the delivery package.
   - Client accepts delivery or leaves a closing note.
   - Project moves to delivered/archived and remains available for future archive value.

## V1 Demo Slice Implemented In This PR

- Client portal lifecycle expanded from proofing-only to operations:
  - contract status
  - six-step studio path
  - additional services
  - service order approval
  - billing item creation for approved services
  - delivery package preview
  - delivery acceptance
- Admin panel now includes a client operations queue:
  - contract follow-up
  - submitted proof queue
  - paid-service follow-up
  - delivery package status
  - agentic editing harness steps

## Data Model Gaps Before Production V1

The demo uses in-browser state and existing invoice/document tables where possible. Production V1 needs durable records for:

- `portal_events`: audit trail for client actions and admin actions.
- `contract_signatures`: signer, timestamp, IP/user agent, document version.
- `service_catalog`: admin-managed service definitions.
- `service_requests`: per-project and per-image service requests.
- `orders` and `order_items`: checkout-ready grouping of service requests and edit overages.
- `delivery_packages`: final file group, visibility, release date, acceptance state.
- `delivery_acceptances`: client acceptance timestamp and note.
- `studio_work_orders`: generated work packet for Irina's edit/fulfillment pass.
- `file_versions`: final versions linked back to proof/source files.

## CloudCode Review Notes

Claude/CloudCode's V1 review agreed with the product direction but challenged the execution boundary:

- **Runtime auth/RLS is the first gate.** The portal has an RLS/access contract, but V1 should prove it at runtime with real client/admin sessions before expanding commerce.
- **Proofing needs server-side guardrails.** The current browser flow is good for UX, but production must prevent invalid file/project/customer combinations server-side.
- **Edit overage payment cannot remain local state.** The current demo proves the interaction. Production needs orders/order items and provider-backed payment state.
- **Service ordering needs real tables.** `service_catalog`, `service_requests`, `orders`, `order_items`, and `file_versions` should be the next durable slice.
- **Admin operations must become data-fed.** The demo queue is intentionally illustrative. Production V1 should derive queue items from portal events, service requests, proof submissions, contracts, and delivery packages.

Recommended build order from the review:

1. Runtime auth/RLS verification.
2. Proofing persistence and server-side validation.
3. Contracts, documents, and invoices.
4. Service ordering and payment handoff.
5. Delivery packages, acceptance, and archive transition.

## Sprint Slices

### V1.1 Operations Spine

- Add production tables for service requests, delivery packages, and portal events.
- Persist client service requests and delivery acceptance.
- Add admin operations queue fed by real Supabase data.

### V1.2 Contract And Payment Closure

- Decide contract provider or lightweight signed-PDF path.
- Add Stripe/Shopify payment decision gate.
- Route edit overages and service requests into a real payment provider.

### V1.3 Studio Fulfillment Harness

- Generate studio work orders from selections and service requests.
- Add admin review/approval states.
- Add delivery package creation, final file upload/versioning, and release controls.

### V1.4 Client Acceptance And Archive Transition

- Add delivery acceptance and revision/issue handling.
- Move delivered work into archive mode.
- Prepare V2 archive intelligence and seasonal product generation.

## Open Decisions

- Payment provider for V1: Stripe-first, Shopify checkout, or manual invoice links until commerce is ready.
- Contract signing path: embedded e-sign provider, uploaded signed PDF, or lightweight internal signature record.
- Image edit automation boundary: which agentic tasks are allowed before Irina's explicit approval.
- Final file download gating: whether balance must be paid before full-resolution downloads.
