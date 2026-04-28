#!/bin/bash
# ============================================
# Moss & Tea — Deploy Script
# Runs validation, then deploys to Cloudflare
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$SCRIPT_DIR/.."

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

# Step 2: Git push
echo "📤 Step 2: Pushing to GitHub (auto-deploys Cloudflare Pages)..."
git push origin main 2>&1 | tail -3

echo ""

# Step 3: Deploy Worker
echo "⚡ Step 3: Deploying Cloudflare Worker..."
wrangler deploy --assets "$SITE_DIR" 2>&1 | tail -5

echo ""

# Step 4: Verify deployment
echo "🔍 Step 4: Smoke testing deployment..."
sleep 2

smoke_test() {
  local url="$1"
  local name="$2"
  local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo -e "  \033[0;32m✓\033[0m $name ($status)"
  else
    echo -e "  \033[0;31m✗\033[0m $name — got $status"
    FAILED=1
  fi
}

FAILED=0
smoke_test "$WORKER_URL/" "Main page"
smoke_test "$WORKER_URL/admin/" "Admin panel"
smoke_test "$WORKER_URL/api/health" "Health API"
smoke_test "$WORKER_URL/css/style.css" "CSS"
smoke_test "$WORKER_URL/admin/js/admin.js" "Admin JS"

echo ""
if [ "$FAILED" = "1" ]; then
  echo -e "\033[0;31m❌ Smoke tests failed! Site may be broken.\033[0m"
  exit 1
else
  echo -e "\033[0;32m✅ All smoke tests passed. Deploy complete!\033[0m"
fi
