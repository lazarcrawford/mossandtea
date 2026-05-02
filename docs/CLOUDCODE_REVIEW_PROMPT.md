# CloudCode Review Prompt

Use this prompt to run a read-only Claude/CloudCode review against the execution planning PR.

## Command

From the repository root on branch `codex/portal-execution-review`:

```bash
claude -p --permission-mode plan "$(cat docs/CLOUDCODE_REVIEW_PROMPT.md)"
```

If Claude is already attached to the PR through Claude Code, this may also work:

```bash
claude --from-pr 11
```

## Prompt

You are CloudCode performing a peer review of this Moss & Tea execution planning PR.

Do not edit files.

Read these files first:

- `docs/EXECUTION_REVIEW_PACKET.md`
- `AGENTS.md`
- `CLIENT_PORTAL_ROADMAP.md`
- `MVP_TECHNICAL_ARCHITECTURE.md`
- `OPERATIONS.md`
- `docs/tdd-gap-register.md`
- `docs/reviews/2026-05-02-cloudcode-skillful-discussion.md`
- `docs/session-logs/README.md`

Review for:

- architecture coherence
- TDD completeness before Sprint 1
- MVP scope discipline
- RLS, private storage, and signed URL risks
- GitHub-as-second-brain workflow quality
- missing decision issues
- risks that should block implementation

Return markdown only using exactly this structure:

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

Bias toward concrete, reviewable changes. If a concern is not blocking Sprint 1, put it under `Defer`.
