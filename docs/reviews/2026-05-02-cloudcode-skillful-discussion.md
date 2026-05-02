# Skillful Discussion Review: CloudCode Architecture And TDD Feedback

## Shared Aim

The shared aim is to make Moss & Tea ready for the next sprint by moving project memory into GitHub, closing obvious process gaps, and turning the client portal roadmap into work that can be tested and reviewed.

## What Is Strong

CloudCode's strongest contribution is `AGENTS.md`. It names the core failure mode directly: the local filesystem must not become the project's second brain. That rule is practical and enforceable.

The portal architecture is also directionally strong. The recommendation to use `customer_users`, helper RLS functions, private storage, and signed URLs is the right security foundation for a real client portal.

The operations work is useful because it makes deploy readiness explicit. A deployment script that stops after Wrangler failure is better than a script that continues into misleading smoke tests.

## Clarifying Questions

- Where are CloudCode's eight TDD findings recorded? They were not present as GitHub PR review comments or GitHub Issues when checked on 2026-05-02.
- Is `telegram-console/` intended to remain part of the Moss & Tea website deployment, or should it move to a dedicated Telegram Bridge repository after v3 stabilizes?
- Should the client portal docs keep their current root-level filenames, or should the project normalize long-lived planning docs under `docs/` despite the current `AGENTS.md` project-specific list?

## Tensions / Concerns

- I see a tension between the operating model's "docs belong in `docs/`" rule and the current root-level planning docs. The root docs are committed and named in `AGENTS.md`, so moving them immediately may cause churn, but the inconsistency should be resolved before more planning docs accumulate.
- I see a tension between PR #2's broad scope and the new branch discipline. The PR includes public site work, admin work, social preview metadata, ops scripts, planning docs, and generated asset cleanup. It is coherent as a stabilization PR, but future work should be narrower.
- I see a tension between a deployed `telegram-console/` app and its prior untracked state. Because the build script copies it into `public/`, it must be source-controlled if it remains part of this site.
- I see a tension between strong RLS language in the architecture doc and the absence of concrete portal RLS tests. The security argument is correct, but it is not yet proven.
- I see a tension between the Cloudflare Git deployment comment and local confidence. The branch may pass local tests while Git integration still fails, so deployment status must remain visible in the PR.

## Recommended Changes

- Add retroactive daily session logs from actual Git history for 2026-04-27 through 2026-05-02.
- Create GitHub Issues for every open product/architecture decision in the roadmap.
- Add a TDD gap register before Sprint 1 so the "eight issues" become executable test work rather than ambient critique.
- Source-control `telegram-console/` because it is included in deployable assets.
- Ignore loose `*.patch` files and remove root patch artifacts from active project memory.
- Update PR #2 after this cleanup so GitHub, not chat, becomes the review surface.

## Disposition

**Revise**

The direction is right, but the work needed repository hygiene, issue-backed decisions, and a concrete test gap register before the next sprint. This pass converts the critique into durable project artifacts and makes the remaining risks reviewable.
