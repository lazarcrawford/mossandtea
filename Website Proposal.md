# Website Proposal — Final Draft

## Executive Summary

Moss & Tea has the foundation of a strong photography business platform: a visually credible consumer site, a working admin prototype, Supabase-backed studio data, and Cloudflare edge hosting. The site is reachable and current smoke tests pass, but the project should not yet be treated as production-ready.

The main issue is not visual polish. The main issue is that the publishing and data boundaries are too loose for a business that will handle client inquiries, private galleries, contracts, and payments. The admin also needs a full redesign, but that redesign should be driven by the real studio workflow rather than applied as a cosmetic pass.

The recommended path is to stabilize the deployment surface, secure private data, ship a fast inquiry-capture improvement, and then rebuild the admin around the actual work of running a photography studio.

## Current State

### Site Architecture

The site is a lightweight static and edge application:

- Public website: `index.html`, `css/`, `js/`, `images/`
- Admin panel: `admin/index.html`, `admin/css/admin.css`, `admin/js/admin.js`
- Cloudflare Worker: `worker.js`
- Cloudflare config: `wrangler.toml`
- Legacy Cloudflare Pages Function: `functions/api/[[catchall]].js`
- Supabase schema and policies: `supabase/migrations/`
- Local scripts: `scripts/`

There is no frontend framework, build system, or package-managed dependency graph. That keeps the project simple, but it also means security, bundling, dependency control, and deployment discipline must be handled explicitly.

### GitHub And Publishing

The GitHub remote is:

`https://github.com/lazarcrawford/mossandtea.git`

The active branch is `main`. There are no GitHub Actions workflows in the repo. Deployment is currently local/manual through `scripts/deploy.sh`.

Current deployment flow:

1. Run the Python validation suite.
2. Push `main` to GitHub.
3. Deploy with `wrangler deploy --assets`.
4. Smoke test deployed URLs.

This is acceptable for early iteration, but not for a production workflow. The script pushes to GitHub before confirming Cloudflare deployment success, relies on `$WORKER_URL` without defining it, and does not provide pull request previews or CI validation.

Current validation at assessment time:

- `npm test`: 31 checks passed.
- `scripts/smoke.py`: 9 deployed endpoint checks passed against the worker URL.

These checks show that the current deployment responds, not that the architecture is safe or complete.

### Cloudflare

Cloudflare Workers appear to be the active deployment model. `wrangler.toml` uses `main = "worker.js"` and `[assets]`, so the Pages Function under `functions/api/[[catchall]].js` should be treated as a leftover artifact unless there is an external reason to keep it.

The current Worker handles:

- `/api/health`
- `/api/files/*`
- `/api/contracts/*`
- static asset fallback

The most important Cloudflare issue is that `[assets] directory = "."` serves from the project root. Unless explicitly excluded during upload, this can expose repo internals such as `supabase/`, `scripts/`, `worker.js`, and `wrangler.toml`. The asset root should be narrowed to a public build/static directory.

## Consumer Website Assessment

The consumer-facing site is the strongest part of the product. It has a coherent cinematic direction, real photography assets, a focused one-page structure, and a gallery/lightbox experience. The tone fits a photographer: earthy, editorial, intimate, and image-led.

The site currently feels like a good portfolio, but not yet like a complete client acquisition system.

### Strengths

- Strong visual direction.
- Real portfolio imagery.
- Clear sections: hero, portfolio, about, services, contact, footer.
- Gallery/lightbox interaction.
- Good base typography and atmosphere.
- Responsive structure is already present.

### Gaps

- The contact form only opens `mailto:` and does not reliably capture inquiries.
- Social links are placeholders.
- Lightbox high-resolution images still point to external Squarespace CDN URLs.
- Runtime motion dependencies are loaded from external CDNs.
- The visible hero headline depends on canvas/Pretext while the actual H1 is screen-reader-only.
- `css/motion.css` contains stray shell text at the end of the file.
- There is no strong booking funnel.
- There are no testimonials, FAQ, package anchors, or clear process explanation.
- Portfolio categories are broad and not yet optimized for client decision-making.

### Consumer Site Direction

Keep the cinematic brand direction, but make the site more reliable and more useful to prospective clients.

Near-term improvements should focus on:

- Real inquiry capture.
- Real social links.
- Local or managed high-resolution gallery assets.
- SEO and Open Graph metadata.
- Reduced-motion support.
- A visible fallback for the hero headline.
- Clear service/package paths.
- Testimonials or proof.
- FAQ and booking-process content.

## Admin Assessment

The admin panel is useful as a prototype, but not yet good enough as a daily operations tool.

Current admin features:

- Supabase email/password login.
- Dashboard metrics.
- Customer listing and create/edit modal.
- Project listing and create/edit modal.
- File uploads and gallery.
- Contract upload/list/view.
- Payment recording and listing.

The data model is directionally right for a small photography studio CRM, but the admin should be redesigned around studio workflow before more features are layered onto it.

### Architecture Gaps

- The admin reads and writes directly from the browser using the Supabase anon key.
- This pattern is viable only if RLS and storage policies are correct and tested.
- Supabase migrations have drifted through multiple policy strategies.
- Existing policies include known-broken admin role checks in earlier migrations.
- The final migration disables RLS on the `admins` table; depending on grants, this could expose the admin email list through PostgREST. Treat this as high-risk until verified and corrected.
- Storage privacy is too permissive for client files and contracts.
- File and contract access uses public Supabase URLs and unauthenticated Worker proxy routes.
- There is no client portal yet.
- There is no project detail workspace.
- There is no audit trail.
- There is no real delivery workflow, contract workflow, or payment workflow.
- Error handling is basic.
- The Alpine single-file state model is becoming difficult to evolve.

### Design Gaps

The admin looks like a themed prototype rather than a professional work tool.

Specific issues:

- Emoji icons make navigation feel unpolished.
- The beige-heavy palette is soft and muddy for operational use.
- Serif headings reduce dashboard clarity.
- Tables are not dense or structured enough.
- Cards feel generic and disconnected from workflow.
- Controls are inconsistent and sometimes inline-styled.
- The sidebar and active states feel dated.
- There is no strong "what needs attention" hierarchy.

### Admin Direction

The admin should become a quiet studio command center: compact, clear, task-oriented, and built for repeated use.

Design and workflow should be handled together. The admin information architecture should be based on the real studio lifecycle:

1. Inquiry received.
2. Client created.
3. Project scoped and booked.
4. Contract sent/signed.
5. Deposit and balance tracked.
6. Shoot scheduled.
7. Files uploaded and grouped.
8. Gallery delivered.
9. Project archived.

The redesigned admin should prioritize:

- Upcoming shoots.
- Projects needing action.
- Unsigned contracts.
- Unpaid balances.
- Recent uploads.
- Delivery status.
- Customer/project history.

## Security And Data Assessment

The highest-risk area is private client data and file access.

Current concerns:

- Cloudflare assets are served from the repo root.
- Generated/runtime files have been tracked in git.
- Private files and contracts can be accessed through public URLs or unauthenticated proxy routes.
- Storage policies allow broad authenticated reads.
- RLS migrations are inconsistent and need a clean, verified forward path.
- The `admins` table RLS state should be treated as a potential data exposure until grants and API visibility are verified.

Recommended direction:

- Serve only a dedicated public asset directory.
- Remove generated/runtime files from git tracking.
- Make project files and contracts private.
- Generate signed URLs only for authorized users.
- Require authenticated authorization for file and contract delivery routes.
- Consolidate Supabase policies into a clean migration.
- Verify access as anonymous, customer, and admin users.
- Avoid storing secrets or deployment cache artifacts in git.

## Recommended Roadmap

### Phase 1: Stabilize The Public Surface

Estimated effort: 1-2 days.

Goal: remove immediate deployment and public-surface risks while shipping one client-facing improvement.

Tasks:

- Keep Cloudflare Workers as the active deployment target.
- Remove or archive the legacy Pages Function artifact.
- Change Cloudflare static assets away from `directory = "."` to a dedicated public/static directory.
- Ensure `supabase/`, `scripts/`, `worker.js`, `wrangler.toml`, and other internals are not publicly served.
- Remove tracked `.wrangler` and Python cache files from git.
- Fix `scripts/deploy.sh` so `WORKER_URL` is defined or required.
- Clean stray shell text from `css/motion.css`.
- Add a lightweight, reliable inquiry capture path.
- Decide the hero approach using clear criteria:
  - Keep the canvas hero only if it has a visible no-CDN fallback, respects reduced motion, and does not harm performance.
  - Otherwise restore a normal visible HTML heading.

### Phase 2: Lock Down Data And Storage

Estimated effort: 3-5 days.

Goal: protect private business and client data before expanding admin or portal features.

Tasks:

- Audit current Supabase table grants and RLS behavior.
- Rewrite policies into a clean forward migration.
- Fix the admin lookup strategy without exposing the admin list.
- Make project file and contract storage private.
- Replace public file URLs with signed URLs.
- Add authenticated authorization checks to file and contract delivery routes.
- Add access verification scripts for anonymous, customer, and admin users.
- Document the expected access model.

### Phase 3: Professionalize Publishing

Estimated effort: 1-3 days.

Goal: make deployment repeatable and safer.

Tasks:

- Add GitHub Actions for validation.
- Run HTML/CSS/JS checks on pull requests.
- Run smoke tests in CI.
- Add link checks for key routes and external URLs.
- Deploy from CI or define a clear manual production gate.
- Document local development, test, staging, and production deploy steps.

### Phase 4: Improve The Consumer Website

Estimated effort: 3-7 days for the first meaningful pass.

Goal: turn the site from a portfolio into a client acquisition website.

Tasks:

- Complete the inquiry flow started in Phase 1.
- Add real social links.
- Replace external high-resolution gallery URLs.
- Add SEO, Open Graph, and structured metadata.
- Add reduced-motion support.
- Add service detail sections or package cards.
- Add testimonials or proof.
- Add FAQ and booking-process content.
- Improve portfolio categorization.
- Optimize image sizes and loading behavior.

### Phase 5: Rebuild Admin Around Studio Workflow

Estimated effort: 1-2 weeks for a focused first version.

Goal: redesign and rebuild the admin as a real operations tool.

Tasks:

- Define the project lifecycle and required admin actions.
- Redesign navigation around Dashboard, Projects, Clients, Files, Contracts, Payments, and Settings.
- Replace emoji icons with a consistent icon set.
- Create a small admin design system for buttons, fields, tables, badges, cards, drawers, and alerts.
- Add project detail pages or drawers.
- Add upcoming shoots, overdue items, unpaid balances, unsigned contracts, and delivery states.
- Add upload batches and delivery gallery grouping.
- Add internal notes and project history.
- Add audit logging for sensitive actions.
- Improve loading, empty, error, and success states.
- Improve mobile/tablet behavior enough for practical use.

### Phase 6: Stack-Fit Checkpoint

Estimated effort: 0.5-1 day.

Goal: decide whether the current static/edge architecture still fits before building heavier portal and workflow features.

Evaluate:

- Can Workers plus Supabase safely handle the needed admin operations?
- Are signed URLs and RLS enough, or is a small server-side app layer warranted?
- Will the admin remain maintainable in Alpine, or should it move to a framework?
- What are the expected monthly costs for Supabase, Cloudflare, storage, and email/form handling?
- What operational burden is acceptable?

This checkpoint should happen before investing in a customer portal.

### Phase 7: Customer Portal

Estimated effort: depends on Phase 6 decision.

Goal: give clients secure access to their projects.

Tasks:

- Customer login.
- Project status view.
- Contract viewing/signing.
- Payment status.
- Delivered gallery access.
- Secure downloads.
- Message or inquiry history if needed.

This phase should only begin after storage privacy, RLS, and admin workflows are solid.

## Recommended First Sprint

The first sprint should balance correctness with immediate business value.

Recommended scope:

1. Restrict Cloudflare static asset exposure.
2. Remove tracked generated/runtime artifacts.
3. Fix deploy script assumptions.
4. Clean obvious CSS/file artifacts.
5. Add a reliable inquiry-capture path.
6. Start the Supabase/RLS/security audit.

This gives the business a concrete improvement immediately while reducing the highest-risk technical issues.

## Acceptance Criteria For The First Sprint

The first sprint is complete when:

- The deployed static asset root no longer exposes repo internals.
- Generated files are no longer tracked by git.
- The deployment script has a clear target URL and predictable failure behavior.
- The inquiry form creates a durable record or sends to a reliable destination.
- File/contract privacy risks are documented with exact policy and route changes needed.
- The next security migration is specified and ready to implement.

## Final Recommendation

Proceed with the roadmap, but revise the original priority order:

- Do not defer all consumer-site value until after infrastructure work.
- Do not treat Cloudflare Workers vs. Pages as an open decision unless new evidence appears; Workers is already the active path.
- Treat public root asset serving and Supabase admin/RLS behavior as present risks.
- Redesign the admin around the studio workflow, not as a separate visual layer.
- Add a stack-fit checkpoint before building the customer portal.

The proposal is directionally sound. The final plan should now move from broad assessment into a focused first sprint: secure the public surface, capture inquiries reliably, and prepare the data/privacy cleanup that the rest of the product depends on.
