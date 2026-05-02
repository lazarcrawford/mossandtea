# Production Rollback Retrospective

Date: 2026-05-02

## Summary

Production briefly served the older V1 Moss & Tea website because V2 had been deployed directly from a Codex feature branch before that branch was merged to `main`. Later, `main` advanced through a docs/planning PR that did not contain the V2 implementation. Cloudflare then deployed the `main` state and restored the older public site.

V2 was restored by merge commit `5b5e8d5 Restore V2 website production state`, which made the V2 branch reachable from `origin/main`.

## Timeline

- 2026-04-30 01:44 PDT: V2 proposal work began on `codex/website-proposal-execution`.
- 2026-05-01 19:41 PDT: The proposal branch reached `99f86fb docs: serialize session memory and review gaps`.
- 2026-05-01 19:42 PDT: PR #2 Cloudflare Git build failed.
- 2026-05-01 19:43 PDT: A direct Wrangler deploy succeeded from the PR #2 branch. Production had V2, but `main` did not.
- 2026-05-01 21:59 PDT: PR #11 merged docs/planning into `main` as `6fa293c`, based on old `main`.
- 2026-05-01 21:59 PDT: Cloudflare deployed that `main` state. This was the rollback window.
- 2026-05-02 14:07 PDT: `5b5e8d5` merged the V2 branch chain into `main` and restored production V2.

## Root Causes

- Direct production deploys were possible from non-`main` branches.
- The team treated "deployed once" as close to "merged and production-owned."
- PR #2 had a failed automated build but was manually deployed, creating split-brain confidence.
- PR #11 advanced `main` without the V2 implementation.
- Stacked PRs made it unclear which branch actually had to land on `main`.

## Contributing Factors

- The proposal branch was broad: public website, admin, deploy config, portal, docs, and Telegram console work moved together.
- Open PRs were stacked on feature branches rather than consistently targeting `main`.
- Agent handoffs did not always include branch, SHA, PR base, merge state, production URL, and live verification.
- Local branch state was confusing: the active worktree was dirty and not on `main`, while production recovery required a clean temporary worktree.

## A-To-A Retrospective

Two subagents participated:

- Sartre reconstructed the timeline and root causes from git, GitHub, Cloudflare deployment history, deploy scripts, and docs.
- Herschel performed a skillful-discussion peer review of the operating model and proposed a focused production-parity protocol.

Message count:

- Parent to Sartre: 1 task message.
- Sartre to parent: 1 final report.
- Parent to Herschel: 1 task message.
- Herschel to parent: 1 final report.
- Direct subagent-to-subagent messages: 0. Coordination was hub-and-spoke through Prometheus.

Communication quality:

- Fidelity was high. Both agents independently identified the same central failure: branch/deploy split-brain.
- Collaboration was complementary rather than redundant. Sartre supplied evidence and timeline; Herschel supplied protocol framing and review disposition.
- Listening quality was indirect. The agents did not converse with each other, but their findings converged cleanly through the parent agent.
- Supportiveness was good: both reports challenged the process without blame and produced concrete next moves.

Process limitation:

- The A-to-A loop was not a true dialogue. It was parallel independent review with synthesis. For future high-stakes retrospectives, use a second round where one agent reviews the other's findings before final protocol changes are committed.

## Protocol Changes Instantiated

- Added a Production Parity Protocol to `AGENTS.md`.
- Added a deploy guard to `scripts/deploy.sh`: production deploys must run from a checkout whose `HEAD` equals `origin/main`.
- Added a break-glass override: `ALLOW_NON_MAIN_PROD_DEPLOY=1`, with immediate reconciliation required.
- Expanded the session self-assessment checklist to include production parity, PR base hygiene, and handoff completeness.

## Cleanup Recommendations

- Close superseded stacked PRs #17, #18, and #19 because their commits are now reachable from `main`.
- Review old Cloudflare PR #1 and close it if superseded by the current `wrangler.toml`.
- Delete merged remote branches after confirming no active work depends on them.
- Consolidate build ownership around `scripts/build_public.js`; keep `scripts/build_public.py` only if a current caller still requires it.

## Prevention Rule

For user-facing work, the final question is not "does my branch work?" It is:

> Is the intended state reachable from `origin/main`, deployed to production, and verified live?

