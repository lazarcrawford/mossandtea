#!/bin/bash
# ============================================
# Moss & Tea — Deploy Script
# Runs validation, then deploys to Cloudflare
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$SCRIPT_DIR/.."
WORKER_URL="${WORKER_URL:-https://mossandtea.lazar-99d.workers.dev}"

echo "═══════════════════════════════════════"
echo "  🚀 Deploy Pipeline"
echo "═══════════════════════════════════════"
echo ""

# Step 1: Run tests
echo "📋 Step 1: Running validation suite..."
python3 "$SCRIPT_DIR/test.py" || {
  echo -e "\n❌ Validation failed. Deploy aborted."
  echo "   Fix the issues above and try again."
  exit 1
}

echo ""

# Step 2: Optional Git push
if [ "${DEPLOY_PUSH:-0}" = "1" ]; then
  echo "📤 Step 2: Pushing to GitHub..."
  git push origin main 2>&1 | tail -3
else
  echo "📤 Step 2: Skipping git push (set DEPLOY_PUSH=1 to push first)."
fi

echo ""

# Step 3: Deploy Worker
echo "⚡ Step 3: Deploying Cloudflare Worker..."
wrangler deploy 2>&1 | tail -8

echo ""

# Step 4: Verify deployment
echo "🔍 Step 4: Smoke testing deployment..."
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
