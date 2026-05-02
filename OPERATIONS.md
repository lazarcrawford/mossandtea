# Moss & Tea Operations

This workspace can be reached from desktop Codex, Telegram Bridge, and other
local shells. Use the same preflight everywhere before deciding whether a
session can deploy.

## Deploy Readiness

```bash
npm run deploy:doctor
```

The doctor checks:

- `node`, `npm`, and `wrangler`
- Cloudflare authentication
- Worker DNS and HTTP
- custom domain DNS and HTTP
- `npm test`

It reports whether deploy is ready without printing secret values.

## Shared Local Ops Env

Optional deploy-only values can live outside the repo:

```bash
/Users/nova/.hermes/workspaces/mossandtea.env
```

Supported values:

```bash
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
WORKER_URL=https://mossandtea.lazar-99d.workers.dev
PUBLIC_UI_URL=https://mossandtea.com
```

This file is not committed. Telegram Bridge and local shells can both use it.
If it is absent, the doctor falls back to inherited environment variables and
Wrangler's local login state.

## Deploy

```bash
npm run deploy
```

The deploy script:

1. builds and validates public assets
2. runs deploy readiness
3. optionally pushes to GitHub when `DEPLOY_PUSH=1`
4. deploys with Wrangler
5. smoke-tests the deployed site

If Wrangler fails, the script stops immediately.

## Telegram Bridge

Use `/capabilities` or the `Capabilities` menu button in Telegram to check
whether the active workspace can deploy. The bridge calls this workspace's
preflight and redacts secrets from the report.
