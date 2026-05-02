# TDD Gap Register

This register converts the architecture and CloudCode review concerns into executable test work. It is tracked by [GitHub issue #10](https://github.com/lazarcrawford/mossandtea/issues/10).

## Status Key

- `Open`: not yet implemented
- `Ready`: test target is clear and can be picked up
- `Blocked`: requires a decision issue first
- `Done`: covered by automated tests

## Pre-Sprint Gaps

| ID | Gap | Risk | Target | Status |
| --- | --- | --- | --- | --- |
| TDD-01 | Portal auth flow has no automated coverage. | Clients may fail to enter the portal or land in the wrong state. | Browser smoke for login, invite/magic-link state, and sign-out. | Blocked by [#3](https://github.com/lazarcrawford/mossandtea/issues/3) |
| TDD-02 | `customer_users` access model is not proven by tests. | A brittle `customers.id = auth.uid()` assumption could return. | SQL/RLS tests for owner, invited user, unrelated user, and admin. | Blocked by [#4](https://github.com/lazarcrawford/mossandtea/issues/4) |
| TDD-03 | Portal RLS boundaries are not tested across anonymous, client, other-client, and admin personas. | Private project metadata or files could leak. | Supabase policy test script seeded with multiple personas. | Ready |
| TDD-04 | Private storage signed URL behavior is not covered. | Browser may receive public or over-broad access to original images. | Worker/Supabase test for short-lived signed URLs and denied cross-project objects. | Ready |
| TDD-05 | Gallery selection/favorite behavior has no regression tests. | Client picks may be lost, duplicated, or submitted with wrong project context. | Portal UI smoke plus database uniqueness tests for selections. | Ready |
| TDD-06 | Download gating is not testable until the rule is explicit. | Final files may be released too early or unnecessarily blocked. | RLS/app tests for `download_allowed` and/or `balance_paid` rules. | Blocked by [#5](https://github.com/lazarcrawford/mossandtea/issues/5) |
| TDD-07 | Admin portal controls are not covered end-to-end. | Admin may mark files visible, see selections, or update project state incorrectly. | Admin smoke covering portal visibility, selection review, and document/payment link fields. | Ready |
| TDD-08 | Telegram console/bridge behavior is not covered as deployed source. | Mini App UI can look functional while Telegram handoff, workspace, or mode state fails. | Browser smoke for `/telegram-console/`, plus bridge integration tests in the bridge runtime repo. | Ready |

## Next Test Build Order

1. Add SQL/RLS tests for TDD-02 and TDD-03 with a seeded two-client scenario.
2. Add signed URL tests for TDD-04 before any client gallery launch.
3. Add portal browser smoke for TDD-01 and TDD-05 once the auth decision is resolved.
4. Extend admin smoke for TDD-07 during Sprint 1.
5. Add Telegram console UI smoke here and move bridge daemon tests to the bridge runtime repository.
