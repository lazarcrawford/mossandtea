# Moss & Tea Customer Portal Product Roadmap

## Product Thesis

The Moss & Tea customer portal should become a private, image-led home for each client relationship. In the near term, it lets a client view their projects, review images, make selections, and understand what happens next. Over time, it should turn each client photo library into a living archive that keeps creating emotional value and commercial value.

The core opportunity is that every client gallery is not only a delivery artifact. It is a reservoir of memory, identity, family history, brand material, and future gifting potential. The portal should keep applying useful energy to that archive: resurfacing the right images at the right time, making beautiful options visible, and letting clients buy or request value without friction.

The product should grow in this order:

1. **MVP:** secure private viewing and project navigation.
2. **Polished MVP:** image-level paid services and clean ordering.
3. **V1:** full client operations portal for delivery, proofing, payments, documents, and service fulfillment.
4. **V2:** archive intelligence and lifecycle relationship value.
5. **V3:** commerce bridge with curated products and lightweight mockups.
6. **V4:** agentic Shopify merchandising, seasonal product generation, and automated commercial campaigns.

The trap to avoid is building the V4 dream before the portal has earned client trust. The first product has to be calm, secure, beautiful, and useful.

## Strategic Principles

- **The portal is not a file folder.** It is a private room where the client returns to see, decide, order, and remember.
- **Images are the primary object.** Projects, services, products, notes, orders, and campaigns should all connect back to specific images or image sets.
- **Commerce should feel like care.** Product suggestions should appear as tasteful, client-specific possibilities, not generic upsells.
- **Every client-facing feature needs an admin path.** If a client can request it, the studio must be able to price, accept, reject, fulfill, deliver, and support it.
- **Supabase remains the relationship and archive system of record.** Shopify can own cart, checkout, tax, shipping, order receipts, and fulfillment integrations later.
- **Start manual before automating.** Mockups, service offers, and product ideas should be proven by human-assisted workflows before being agentically scaled.
- **Protect private images by default.** Client files should use RLS and signed URLs. The browser should never receive privileged credentials.

## Current Technical Base

The repo already has enough foundation for the first portal:

- Public site: `index.html`, `css/`, `js/`, and `worker.js`.
- Admin app: `admin/index.html`, `admin/css/admin.css`, `admin/js/admin.js`.
- Data model: `customers`, `projects`, `project_files`, `contracts`, `payments`, and `messages`.
- Storage/security work: private `project-files` storage, RLS policies, and signed-URL direction.
- Tooling: Cloudflare Worker deployment, Supabase migrations, and smoke test scripts.

Recommended near-term shape:

- Add a static `/portal/` Alpine + Supabase app parallel to `/admin/`.
- Add a dedicated client portal migration for selections, visibility flags, invoices, service catalog, service requests, and order items.
- Keep privileged operations in the Worker or future server-side routes.
- Extend the admin app only where the portal creates new operational needs.

## Version Roadmap

### V0 / MVP: Private Gallery And Project Room

Goal: a client can securely enter one private project space, view images, understand status, and navigate without help.

Client experience:

- Invite-only login.
- Project dashboard with active and archived projects.
- Project detail with status, shoot date, delivery date, next action, and balance summary.
- Private gallery with signed thumbnails and lightbox.
- Basic image navigation: previous, next, download when allowed, image info.
- Favorites and final picks.
- Selection submission with optional note.
- Documents panel for contracts and deliverables.
- Invoice/payment panel with external payment link.
- Simple notes/messages panel.

Admin requirements:

- Invite a client.
- Mark files client-visible or internal-only.
- See portal login/access state.
- Review favorites and submitted final picks.
- Attach payment links and visible documents.
- Verify a test client cannot see another client's files.

Data additions:

```sql
project_files
- is_client_visible boolean default true
- sort_order integer
- gallery_group text

client_file_selections
- id uuid primary key
- project_id uuid references projects(id)
- file_id uuid references project_files(id)
- customer_id uuid references customers(id)
- selection_type text check in ('favorite', 'final_pick', 'downloaded')
- note text
- submitted_at timestamptz
- created_at timestamptz

invoices
- id uuid primary key
- project_id uuid references projects(id)
- amount_cents integer not null
- status text check in ('draft', 'open', 'paid', 'void', 'overdue')
- due_at timestamptz
- payment_url text
- provider text
- provider_invoice_id text
- created_at timestamptz
```

MVP acceptance criteria:

- A real client can log in and see only their own project.
- Private files load only through authorized signed URLs.
- Gallery review works well on mobile.
- Client can submit picks.
- Admin can see the submitted selections.
- Client can reach payment and document actions without a manual message thread.

### Polished MVP: Image-Level Paid Services

Goal: clients can order work on any image while browsing the body of work.

This is the first major monetization layer because it is natural to the client moment. The client is already looking at an image and thinking, "Could this be better, printed, resized, retouched, or turned into something?"

Client experience:

- Each image exposes an **Actions** menu.
- Available actions are generated from a service catalog.
- Examples:
  - Retouch this image.
  - Add extra edit.
  - Rush export.
  - Create print-ready file.
  - Make social/profile crop.
  - Prepare announcement card image.
  - Request custom note or art direction.
- Each action shows price, turnaround, what is included, and what input is required.
- Client enters required notes or choices.
- Client adds one or more image actions to a cart.
- Client pays or submits for quote.
- Client sees order status and delivered revisions.

Admin requirements:

- Manage service catalog.
- Configure which services appear globally, per project, or per image type.
- Define price, turnaround, required fields, and fulfillment instructions.
- Review orders.
- Accept, reject, clarify, or quote custom work.
- Upload revised versions back onto the original image record.
- Track status from request to delivered.

Data additions:

```sql
service_catalog
- id uuid primary key
- name text
- description text
- base_price_cents integer
- turnaround_days integer
- requires_quote boolean default false
- required_fields jsonb
- active boolean default true

service_requests
- id uuid primary key
- project_id uuid references projects(id)
- file_id uuid references project_files(id)
- customer_id uuid references customers(id)
- service_id uuid references service_catalog(id)
- status text check in ('cart', 'submitted', 'quoted', 'paid', 'in_progress', 'delivered', 'canceled')
- client_notes text
- required_field_values jsonb
- quoted_price_cents integer
- created_at timestamptz
- updated_at timestamptz

orders
- id uuid primary key
- customer_id uuid references customers(id)
- project_id uuid references projects(id)
- status text
- subtotal_cents integer
- payment_url text
- provider text
- provider_order_id text
- created_at timestamptz

order_items
- id uuid primary key
- order_id uuid references orders(id)
- service_request_id uuid references service_requests(id)
- price_cents integer

file_versions
- id uuid primary key
- source_file_id uuid references project_files(id)
- project_id uuid references projects(id)
- version_type text
- r2_key text
- notes text
- created_at timestamptz
```

Polished MVP acceptance criteria:

- Client can pick any image, choose an available service, provide required details, and add it to cart.
- Client can pay or submit a quote request.
- Admin has a clear fulfillment queue.
- Revised work can be delivered back to the client in context.

### V1: Complete Client Operations Portal

Goal: the portal can support a complete paid client project from invite through delivery and post-delivery service work.

Client experience:

- Project lifecycle dashboard: booked, shoot complete, editing, delivered, archived.
- Payment status and delivery rules.
- Contract/document access.
- Gallery, selections, proofing, revisions, downloads.
- Service orders, order history, and delivery status.
- Client profile with contact info and address.
- Polished responsive UI that feels like the studio, not a generic SaaS dashboard.

Admin requirements:

- Portal invitation and access management.
- Project status management.
- File visibility controls.
- Selection and proofing review.
- Payment and document publishing.
- Service catalog and fulfillment queue.
- Client support notes.
- Basic reporting: portal opens, gallery views, selections, service conversion.

V1 decision gates:

- Can this replace most manual project handoff messages?
- Do clients understand what to do next without explanation?
- Does the portal create measurable service revenue?
- Does admin fulfillment stay manageable?

### V2: Archive Intelligence And Lifecycle Value

Goal: make the portal valuable after the original project is complete.

This is where the long emotional arc starts to compound. The archive should occasionally return to the client with relevance: a memory, a seasonal idea, a gift possibility, or a beautiful new use of an image they already love.

Client experience:

- Archived projects remain accessible.
- "On this date" and anniversary resurfacing.
- Seasonal galleries: holidays, Mother's Day, Father's Day, birthdays, graduation, brand launches, family milestones.
- Curated mini-collections from past sessions.
- Saved favorites across projects.
- Gentle reminders of unused images with high potential.
- Permission and preference controls for campaigns and product suggestions.

Business value:

- Reactivation of past clients.
- Higher lifetime value from the same archive.
- More repeat bookings.
- More meaningful relationship touchpoints.
- Richer first-party data about what clients love.

Data additions:

```sql
archive_events
- id uuid primary key
- customer_id uuid references customers(id)
- project_id uuid references projects(id)
- event_type text
- event_date date
- metadata jsonb

campaigns
- id uuid primary key
- name text
- campaign_type text
- starts_at timestamptz
- ends_at timestamptz
- status text

campaign_recommendations
- id uuid primary key
- campaign_id uuid references campaigns(id)
- customer_id uuid references customers(id)
- project_id uuid references projects(id)
- file_id uuid references project_files(id)
- recommendation_type text
- preview_state text
- created_at timestamptz
```

### V3: Commerce Bridge

Goal: prove which personalized products clients want before wiring full Shopify automation.

Client experience:

- Select image.
- Preview or request product options.
- Save product intent.
- Submit for quote or pay through a simple payment link.
- Track fulfillment status.

Good V3 products:

- Fine art prints.
- Framed prints.
- Holiday cards.
- Thank-you cards.
- Announcement cards.
- Social media kits.
- Digital wallpaper packs.
- Small curated gift products.
- Albums, but only as premium human-led workflow at first.

Admin requirements:

- Curate product offerings per project or campaign.
- Create or approve mockups.
- Quote products manually if needed.
- Track margin and fulfillment effort.
- Decide which products deserve automation.

Data additions:

```sql
product_catalog_items
- id uuid primary key
- name text
- description text
- base_price_cents integer
- fulfillment_type text
- active boolean

product_requests
- id uuid primary key
- customer_id uuid references customers(id)
- project_id uuid references projects(id)
- product_id uuid references product_catalog_items(id)
- status text
- options jsonb
- quoted_price_cents integer
- created_at timestamptz

product_request_images
- id uuid primary key
- product_request_id uuid references product_requests(id)
- file_id uuid references project_files(id)
- crop jsonb
- preview_url text

fulfillment_jobs
- id uuid primary key
- order_id uuid
- status text
- provider text
- provider_job_id text
- cost_cents integer
- created_at timestamptz
```

V3 decision gates:

- Which product has clear demand?
- Which product has acceptable margin?
- Which product does not damage the studio quality bar?
- Which fulfillment path is reliable enough to expose directly to clients?

### V4: Agentic Shopify Merchandising

Goal: use agents, Shopify, and the client archive to generate beautiful personalized commerce with low operational lift.

This is the version hinted by the Hermes agent idea. Agents can use skills to manage Shopify, and Shopify exposes store operations by API. The portal can become the place where clients see dynamic commercial options made from their own images: seasonal cards, framed prints, wall sets, announcement products, gifts, and other merchandise.

V4 client experience:

- Client opens portal and sees tasteful, project-specific product previews.
- Products are generated from approved images and saved preferences.
- Seasonal campaigns feel personal: holiday cards from last year's family session, anniversary print options, Mother's Day gift sets, brand asset refreshes, graduation cards.
- Client can adjust crop, size, material, quantity, and delivery options.
- Checkout is handled by Shopify.
- Order and fulfillment status return to the portal.

Agent responsibilities:

- Analyze approved image libraries for product potential.
- Generate seasonal product recommendations.
- Create or refresh product mockups.
- Sync product templates and variants to Shopify.
- Create carts or checkout links.
- Monitor Shopify order webhooks.
- Update Supabase order and fulfillment state.
- Draft campaign copy and product descriptions for admin approval.
- Suggest reactivation campaigns from archive dates and client milestones.

Shopify role:

- Cart and checkout.
- Tax, shipping, discounts, receipts.
- Products, variants, and order records.
- Fulfillment partner integrations where quality allows.

Supabase role:

- Clients, projects, images, permissions, selections, preferences.
- Personalization records.
- Campaign recommendations.
- Portal-visible status.
- Source of truth for which images may be used.

Worker/server role:

- Secure Shopify Admin API calls.
- Webhook verification.
- Background jobs.
- Product/mockup generation queue.
- Agent tool execution boundaries.

V4 data additions:

```sql
commerce_product_templates
- id uuid primary key
- name text
- shopify_product_id text
- template_type text
- options_schema jsonb
- active boolean

commerce_personalizations
- id uuid primary key
- customer_id uuid references customers(id)
- project_id uuid references projects(id)
- file_id uuid references project_files(id)
- product_template_id uuid references commerce_product_templates(id)
- crop jsonb
- options jsonb
- preview_state text
- shopify_cart_url text
- created_at timestamptz

shopify_orders
- id uuid primary key
- customer_id uuid references customers(id)
- shopify_order_id text
- status text
- total_cents integer
- created_at timestamptz

agent_runs
- id uuid primary key
- agent_name text
- run_type text
- status text
- input jsonb
- output jsonb
- reviewed_by_admin boolean default false
- created_at timestamptz
```

V4 guardrails:

- Agents should suggest and prepare commercial options before they publish client-facing campaigns.
- Client images should never be sent to external services without clear permission and business justification.
- Admin approval should remain in place until quality and brand fit are proven.
- Shopify should not become the image archive system of record.

## Monetization Model

Near-term revenue:

- Retouching.
- Extra edits.
- Rush delivery.
- Print-ready export packs.
- Social/profile crop packs.
- Additional proofing rounds.

Mid-term revenue:

- Prints and framed prints.
- Cards and announcement products.
- Albums and books.
- Digital packs.
- Gift products.
- Seasonal archive campaigns.

Long-term revenue:

- Automated personalized storefronts per client.
- Lifecycle campaigns from archived libraries.
- Archive concierge memberships for high-value clients.
- Premium album/art direction services.
- Agent-assisted merchandising operations.
- Potential white-label or studio SaaS only if Moss & Tea proves the workflow first.

Important monetization discipline:

- Do not sell generic products from a generic catalog.
- Sell beautiful, specific possibilities made from the client's own images.
- The product preview should create desire before checkout appears.

## MVP User Experience

### Information Architecture

Top-level portal:

- Projects.
- Project detail.
- Profile.

Project detail tabs:

- Overview.
- Gallery.
- Selections.
- Documents.
- Invoice.
- Notes.

Polished MVP adds:

- Image actions.
- Cart.
- Orders.
- Delivered revisions.

V3/V4 adds:

- Product previews.
- Seasonal offers.
- Archive moments.
- Shopify checkout handoff.

### First Screen

If the client has one active project, send them directly into that project. If they have multiple projects, show a project dashboard.

The first screen should answer:

- What project is this?
- What is the current status?
- What should I do next?
- Are there images to review?
- Is there a balance or document action?

### Gallery

Gallery requirements:

- Mobile-first two-column layout.
- Clean desktop grid.
- Fast thumbnails.
- Full-screen lightbox.
- Favorite and final-pick controls.
- Sticky mobile selection bar.
- Image actions visible without overwhelming the photo.
- Clear unavailable states for downloads or paid services.

### Image Action Menu

Each image can expose actions from the service catalog:

```text
Retouch this image
$45 - 3 business days
Required: describe what you want changed

Create social crop pack
$35 - 2 business days
Required: choose Instagram, LinkedIn, or both

Prepare fine-art print file
$30 - 2 business days
Required: choose target print size
```

The key design constraint: the service offer should sit close to the image, but the gallery should still feel like a gallery, not a marketplace.

## Development Structure

### Sprint 1: Portal Foundation

Build:

- `/portal/index.html`
- `/portal/css/portal.css`
- `/portal/js/portal.js`
- `supabase/migrations/00006_client_portal.sql`
- `scripts/client-portal-smoke.js`

Scope:

- Auth shell.
- Client project load through RLS.
- Project overview.
- Signed gallery thumbnails.
- Lightbox.
- Client-visible file flag.

Verification:

- Test client sees only their project.
- Anonymous user sees no private project data.
- Private files are not public URLs.
- Mobile gallery smoke test passes.

### Sprint 2: Selections And Admin Review

Build:

- Favorites and final picks.
- Selection submit flow.
- Admin selection viewer.
- Selection timestamps and notes.

Verification:

- Client can complete final picks on phone.
- Admin can see selected file IDs, filenames, notes, and submission time.

### Sprint 3: Documents, Payments, And Delivery Rules

Build:

- Invoice/payment panel.
- Document panel.
- Delivery gating rules.
- Basic notes thread.

Verification:

- Client can find payment and documents without instructions.
- Full-res downloads respect release/payment rules.

### Sprint 4: Paid Image Services

Build:

- Service catalog.
- Image action menu.
- Required fields per service.
- Cart/order records.
- External payment link flow.
- Admin fulfillment queue.
- File versions for delivered revisions.

Verification:

- Client can order work on any eligible image.
- Admin can fulfill and deliver a revised version.
- Pricing, timing, and required notes are visible before order submission.

### Sprint 5: Product Requests

Build:

- Product catalog.
- Product request flow from selected images.
- Manual preview/mockup field.
- Fulfillment job tracking.

Verification:

- At least one product can be offered end-to-end without Shopify.
- Manual process exposes margin and effort clearly.

### Sprint 6: Shopify Pilot

Build:

- Product template mapping.
- Shopify cart/checkout handoff.
- Shopify order webhook ingest.
- Supabase order status sync.
- Admin approval for generated products.

Verification:

- One product category can move from image to checkout to fulfillment tracking.
- Shopify order state appears back in the portal.

## Open Decisions

- [#3](https://github.com/lazarcrawford/mossandtea/issues/3): Should client auth use password login, magic links, or invite-only one-time links?
- [#4](https://github.com/lazarcrawford/mossandtea/issues/4): Should `customers.id` map directly to `auth.uid()`, or should there be a `customer_users` mapping table?
- [#7](https://github.com/lazarcrawford/mossandtea/issues/7): Which image services should be available first, and should service orders require payment up front or admin quote?
- [#5](https://github.com/lazarcrawford/mossandtea/issues/5): Should full-resolution downloads require balance paid, admin release, or both?
- [#6](https://github.com/lazarcrawford/mossandtea/issues/6): Which payment provider should own early payment links?
- [#8](https://github.com/lazarcrawford/mossandtea/issues/8): Which product category and fulfillment path should be the first Shopify or manual-commerce candidate?
- [#9](https://github.com/lazarcrawford/mossandtea/issues/9): What client permission language is needed before using archive images for generated previews?

## Immediate Next Build Recommendation

Start with the MVP and make it real:

1. Add `00006_client_portal.sql` with client-visible files, selections, and invoice metadata.
2. Create `/portal/` with auth, project dashboard, project detail, and signed gallery.
3. Add final-pick submission.
4. Extend admin with file visibility and selection review.
5. Add a mobile smoke test.

Then move directly into polished MVP image services. That is the first place the portal becomes a revenue product rather than only a delivery experience.
