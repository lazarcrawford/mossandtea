# CloudCode Review: PR #11 Portal Execution Plan

Source: Ollama-backed Claude command run from branch `codex/portal-execution-review`.

Review command:

```bash
ollama launch claude --model glm-5.1:cloud -- -p "$(sed -n '/^## Prompt/,$p' docs/CLOUDCODE_REVIEW_PROMPT.md)"
```

PR comment: https://github.com/lazarcrawford/mossandtea/pull/11#issuecomment-4362730998

## Summary

CloudCode disposition: **Revise**.

The plan direction and MVP scope were accepted, but the review found security and schema blockers that should be addressed before Sprint 1 implementation.

## Accepted

- `customer_users` is the right access model.
- MVP scope is coherent and disciplined.
- `AGENTS.md` is a practical operating model.
- TDD gap register prioritizes the right security surfaces.
- Roadmap sequencing is commercially sound.
- Codex's skillful-discussion self-review named the right process risks.

## Required Revisions Before Sprint

1. Replace broad authenticated read storage policies for `project-files`.
2. Gate, remove, or disable unauthenticated Worker file proxy routes.
3. Resolve auth method and access model decisions before migration `00006`.
4. Treat portal RLS as a full policy replacement, not additive patches.
5. Add real user/customer identity to portal messages before portal messaging.
6. Decide `project_documents` scope before Sprint 1 migration.

## Follow-Up Issues Created

- [#12 Decision: include project_documents in Sprint 1 migration](https://github.com/lazarcrawford/mossandtea/issues/12)
- [#13 Decision: private file delivery route strategy](https://github.com/lazarcrawford/mossandtea/issues/13)
- [#14 Decision: portal message identity model](https://github.com/lazarcrawford/mossandtea/issues/14)
- [#15 Blocker: replace broad project-files authenticated_read storage policy](https://github.com/lazarcrawford/mossandtea/issues/15)
- [#16 Blocker: gate or remove unauthenticated Worker private file routes](https://github.com/lazarcrawford/mossandtea/issues/16)

## Meta-Observation

The external review was valuable because it inspected the current implementation against the proposed architecture. Codex's prior pass mostly converted planning concerns into docs and issues; CloudCode compared those docs to existing migrations and Worker routes, then found two concrete security contradictions. That is the core value of the ping-pong loop.
