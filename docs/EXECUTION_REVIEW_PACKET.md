# Execution Review Packet

This PR packages the planning and execution documents that should drive the next Moss & Tea sprint. It exists so Codex, Claude, CloudCode, and the user can review the same source of truth through GitHub instead of relying on local notes or chat memory.

## Review Goal

Validate whether the proposed client portal sprint is coherent, testable, and appropriately scoped before implementation begins.

The review should answer:

- Is the MVP scope small enough to ship without weakening security?
- Are the RLS, private storage, and signed URL assumptions sound?
- Are the TDD gaps complete enough to start implementation safely?
- Are any decisions blocking Sprint 1 that have not been turned into GitHub Issues?
- Are the operating rules in `AGENTS.md` strong enough to prevent local-only planning drift?

## Documents In Scope

- `AGENTS.md` - project operating model for GitHub, branches, docs, decisions, and review discipline.
- `CLIENT_PORTAL_ROADMAP.md` - product roadmap, MVP scope, future service/product phases, and linked decision issues.
- `MVP_TECHNICAL_ARCHITECTURE.md` - technical plan for portal auth, RLS, storage, signed URLs, portal UI, admin integration, rollout, and risks.
- `OPERATIONS.md` - deploy readiness, environment expectations, and operational checks.
- `docs/tdd-gap-register.md` - pre-sprint coverage gaps and test build order.
- `docs/reviews/2026-05-02-cloudcode-skillful-discussion.md` - Codex's structured response to CloudCode's architecture/process feedback.
- `docs/reviews/2026-05-02-cloudcode-pr11-review.md` - CloudCode's follow-up review of this execution packet and the resulting blocker issues.
- `docs/CLOUDCODE_REVIEW_PROMPT.md` - reproducible prompt for running the next CloudCode review through the local Ollama-backed Claude path.
- `docs/session-logs/` - retroactive durable session memory reconstructed from Git history and PR state.

## Current GitHub Trail

- Website implementation PR: https://github.com/lazarcrawford/mossandtea/pull/2
- Decision issues:
  - https://github.com/lazarcrawford/mossandtea/issues/3
  - https://github.com/lazarcrawford/mossandtea/issues/4
  - https://github.com/lazarcrawford/mossandtea/issues/5
  - https://github.com/lazarcrawford/mossandtea/issues/6
  - https://github.com/lazarcrawford/mossandtea/issues/7
  - https://github.com/lazarcrawford/mossandtea/issues/8
  - https://github.com/lazarcrawford/mossandtea/issues/9
  - https://github.com/lazarcrawford/mossandtea/issues/10

## Proposed Sprint 1 Gate

Sprint 1 should not start until these are resolved or explicitly accepted:

1. Auth method selected or bounded for MVP.
2. `customer_users` mapping accepted as the access model.
3. Download gating rule selected for MVP.
4. Payment link provider selected or deferred with placeholder field only.
5. RLS test plan accepted for anonymous, owner, other-client, and admin personas.
6. Private Storage signed URL behavior accepted and testable.
7. Admin portal controls scoped to the minimum needed for MVP.

## Requested Reviewer Output

Please review with a bias toward concrete changes. Use this structure:

```markdown
## Accept

[What is ready as written.]

## Revise Before Sprint

[Required changes before implementation starts.]

## Defer

[Good ideas that should not block Sprint 1.]

## Missing Tests

[Specific test cases or fixtures to add.]

## Blocking Decisions

[Decision issue links or new decisions needed.]

## Disposition

Accept / Revise / Defer / Reject
```

## Codex Self-Assessment

The strongest part of the current plan is the security direction: `customer_users`, helper RLS functions, private buckets, and signed URLs. The weakest part is that several security and workflow claims are still documents rather than tests. The TDD register is therefore the most important artifact to challenge before implementation begins.
