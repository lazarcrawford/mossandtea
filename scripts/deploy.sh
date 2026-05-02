#!/bin/bash
# ============================================
# Moss & Tea — Deploy Script
# Runs validation, then deploys to Cloudflare
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$SCRIPT_DIR/.."
OPS_ENV="${MOSSANDTEA_OPS_ENV:-$HOME/.hermes/workspaces/mossandtea.env}"

if [[ -f "$OPS_ENV" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$OPS_ENV"
  set +a
fi

WORKER_URL="${WORKER_URL:-https://mossandtea.lazar-99d.workers.dev}"

echo "═══════════════════════════════════════"
echo "  🚀 Deploy Pipeline"
echo "═══════════════════════════════════════"
echo ""

echo "🧭 Step 0: Checking production source parity..."
cd "$SITE_DIR"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  CURRENT_SHA="$(git rev-parse HEAD)"
  git fetch origin main --quiet
  ORIGIN_MAIN_SHA="$(git rev-parse origin/main)"

  if [ "${ALLOW_NON_MAIN_PROD_DEPLOY:-0}" != "1" ]; then
    if [ "$CURRENT_BRANCH" != "main" ] || [ "$CURRENT_SHA" != "$ORIGIN_MAIN_SHA" ]; then
      echo -e "\n❌ Production deploy blocked."
      echo "   Production deploys must run from a checkout whose HEAD equals origin/main."
      echo "   Current branch: $CURRENT_BRANCH"
      echo "   Current HEAD:   $CURRENT_SHA"
      echo "   origin/main:    $ORIGIN_MAIN_SHA"
      echo ""
      echo "   Merge the intended release to main first, then deploy."
      echo "   Emergency override: ALLOW_NON_MAIN_PROD_DEPLOY=1 npm run deploy"
      exit 1
    fi
  else
    echo "  ⚠ Break-glass deploy enabled from $CURRENT_BRANCH@$CURRENT_SHA"
    echo "  ⚠ Follow up by merging or reverting origin/main immediately."
  fi
else
  echo -e "\n❌ Production deploy blocked: not inside a git work tree."
  exit 1
fi

echo ""

# Step 1: Run tests
echo "📋 Step 1: Running validation suite..."
python3 "$SCRIPT_DIR/test.py" || {
  echo -e "\n❌ Validation failed. Deploy aborted."
  echo "   Fix the issues above and try again."
  exit 1
}

echo ""

# Step 2: Deploy readiness
echo "🧭 Step 2: Checking deploy readiness..."
python3 "$SCRIPT_DIR/ops_preflight.py" || {
  echo -e "\n❌ Deploy readiness failed. Deploy aborted."
  echo "   Fix the blocked checks above or update $OPS_ENV."
  exit 1
}

echo ""

# Step 3: Optional Git push
if [ "${DEPLOY_PUSH:-0}" = "1" ]; then
  echo "📤 Step 3: Pushing to GitHub..."
  if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    echo -e "\n❌ DEPLOY_PUSH=1 requires local branch main."
    exit 1
  fi
  git push origin main 2>&1 | tail -3
else
  echo "📤 Step 3: Skipping git push (set DEPLOY_PUSH=1 to push first)."
fi

echo ""

# Step 4: Deploy Worker
echo "⚡ Step 4: Deploying Cloudflare Worker..."
wrangler deploy

echo ""

# Step 5: Verify deployment
echo "🔍 Step 5: Smoke testing deployment..."
sleep 2

smoke_test() {
  local url="$1"
  local name="$2"
  local expected="${3:-200}"
  local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
  if [ "$status" = "$expected" ]; then
    echo -e "  \033[0;32m✓\033[0m $name ($status)"
  else
    echo -e "  \033[0;31m✗\033[0m $name — got $status, expected $expected"
    FAILED=1
  fi
}

FAILED=0
smoke_test "$WORKER_URL/" "Main page"
smoke_test "$WORKER_URL/admin/" "Admin panel"
smoke_test "$WORKER_URL/api/health" "Health API"
smoke_test "$WORKER_URL/css/style.css" "CSS"
smoke_test "$WORKER_URL/admin/js/admin.js" "Admin JS"
smoke_test "$WORKER_URL/supabase/config.toml" "Supabase config blocked" "404"
smoke_test "$WORKER_URL/scripts/deploy.sh" "Deploy script blocked" "404"

echo ""
if [ "$FAILED" = "1" ]; then
  echo -e "\033[0;31m❌ Smoke tests failed! Site may be broken.\033[0m"
  exit 1
else
  echo -e "\033[0;32m✅ All smoke tests passed. Deploy complete!\033[0m"
fi
