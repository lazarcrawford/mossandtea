# AGENTS.md — Operating Model for AI Agents

This file defines how AI agents (Codex, Claude, Hermes, or any future agent) work in this repository. It is a living document — update it when the workflow changes, not when the mood strikes.

## Core Principle: Git Is the Source of Truth

Everything that matters must be in git. The filesystem is a workspace, not a second brain.

| Artifact | Wrong place | Right place |
|---|---|---|
| Design documents | Untracked `.md` file | Committed to `docs/` on a branch |
| Open decisions | Inline HTML comments or TODOs | GitHub Issues with `decision` label |
| Design reviews | Self-annotated markup | Pull Requests against the document |
| Code patches | `.patch` files in root | Feature branches with commits |
| Separate tools/apps | Untracked subdirectory | Own branch or own repo |
| Build artifacts | `__pycache__/`, `.next/`, `dist/` | `.gitignore` |

## Dyad Harness

### Identity

Moss & Tea is a photography studio and client experience system. The work blends trust, craft, gallery delivery, brand presence, and operational calm.

### North Star

Turn studio intent into client-facing confidence: beautiful presentation, clear workflow, reliable delivery, and a brand that feels human and premium.

### Telemetry

At session boot, inspect:

- `AGENTS.md`
- `CLIENT_PORTAL_ROADMAP.md`
- `MVP_TECHNICAL_ARCHITECTURE.md`
- `OPERATIONS.md`
- current branch, dirty files, open docs, and portal status

### Kinetic Moves

Progress usually means converting a design or operating decision into committed docs, issue-routed decisions, reviewed PRs, or working portal behavior.

### Serialization

Keep the rule: anything that matters goes to git. Use issues for open decisions and PRs for reviewable design or implementation changes.

## File Management Rules

1. **Commit early, commit often.** A document that exists only on disk is a document that can vanish. If you wrote something worth keeping, commit it. If you're not sure, commit it to a branch — you can always squash later.

2. **Never leave planning documents untracked.** Roadmaps, architectures, operating models, and decision logs belong in `docs/`. Commit them. If they're drafts, commit them on a `draft/` branch with a `[DRAFT]` prefix in the first line.

3. **Use GitHub Issues for open decisions.** The roadmap has open decisions. The TDD has open decisions. These should be GitHub Issues with a `decision` label. Don't embed them as inline comments — issues are trackable, searchable, and closeable.

4. **Use PRs for design reviews.** Want feedback on an architecture document? Open a PR with the document change. Reviewers can comment on specific lines. This is how you "discuss the TDD" — not by adding `<!-- question: should we -->` inline.

5. **Patches are branches, not files.** Never write a `.patch` file to the repo root. If you have a change to `bridge.py`, make a branch, commit the change, and open a PR. If you're working on something experimental, use a `feat/` or `scratch/` prefix.

6. **Separate concerns into separate branches.** The branch `codex/website-proposal-execution` should carry the portal proposal and its implementation — not homepage polish, not telegram bridge patches, not an entire console app. If you're working on multiple things, create multiple branches.

7. **Gitignore build artifacts.** `__pycache__/`, `node_modules/`, `.DS_Store`, and similar should be in `.gitignore`. Never leave them untracked.

8. **Don't mix speculative and committed work.** If a document is a plan that hasn't been approved, it goes on a `plan/` branch. Once approved, merge to the working branch. Don't accumulate uncommitted changes across unrelated concerns.

## Branch Naming

```
main                    — production
codex/<scope>           — Codex agent work on a specific scope
feat/<feature>          — new feature work
fix/<issue>             — bug fixes
plan/<scope>            — planning and design documents
draft/<scope>           — work-in-progress that isn't ready for review
scratch/<experiment>    — throwaway experiments
```

Examples:
- `codex/portal-sprint-1` — agent work on portal sprint 1
- `plan/client-portal-tdd` — TDD review and updates
- `feat/gallery-selections` — selection submission feature
- `fix/rls-policy-drift` — fix for RLS policy issues

## Commit Messages

Write commit messages that explain the "why," not the "what." The diff shows the what.

Good:
```
Add customer_users mapping to decouple auth from customer records

The existing RLS assumes customers.id = auth.uid(), which breaks for
real client relationships where one customer may need multiple logins.
customer_users supports owner/viewer roles and lets the studio revoke
access without deleting the customer record.
```

Bad:
```
Update schema
```

## How to Handle Design Decisions

1. **Identify the decision.** Read the roadmap, TDD, or code. Find the open questions.
2. **Create a GitHub Issue.** Title: "Decision: <question>". Body: context, options, recommendation. Label: `decision`.
3. **Link the issue.** Reference it in the relevant document with `(see #<issue>)`.
4. **Resolve it.** Close the issue with the decision and rationale. Update the document.

Example: The TDD asks "Should full-resolution downloads require balance paid?" → GitHub Issue titled "Decision: download gating rules" with the options and tradeoffs.

## How to Review a Design Document

1. **Create a branch.** `plan/<scope>` or `draft/<scope>`.
2. **Make your changes.** Edit the document, commit.
3. **Open a PR.** Write the PR description to explain what changed and why.
4. **Discuss in the PR.** Line-level comments for specific concerns. General feedback in the conversation.
5. **Merge when approved.** The document is now version-controlled with a review trail.

This is better than inline markup because:
- Comments are threaded, searchable, and closeable.
- The document evolves through commits, not through accumulating `<!-- TODO -->` notes.
- You can see the full history of what was proposed and what changed.
- The document stays clean for readers.

## Self-Assessment Checklist

Before ending a session, check:

- [ ] Are all documents I created or edited committed to git?
- [ ] Are there any untracked files that should be committed or gitignored?
- [ ] Am I on the right branch for the work I'm doing?
- [ ] Have I opened issues for open decisions I identified?
- [ ] Have I opened PRs for documents that need review?
- [ ] Is my commit history clean, or does it mix unrelated concerns?

If you can't check all of these, take the time to clean up before moving on.

## Moss & Tea Project Specifics

This is a photography studio client portal. Key files:

- `CLIENT_PORTAL_ROADMAP.md` — product roadmap (V0 through V4)
- `MVP_TECHNICAL_ARCHITECTURE.md` — technical design document for MVP
- `OPERATIONS.md` — deployment and ops procedures
- `AGENTS.md` — this file

Current sprint: **Sprint 1 — Portal Foundation**
- Database migration: `supabase/migrations/00006_client_portal.sql`
- Portal app: `portal/` (currently empty, needs: index.html, css/portal.css, js/portal.js)
- Build integration: update `scripts/build_public.py` to copy `portal/`

Branch for portal work: `feat/portal-sprint-1` or `codex/portal-sprint-1`
