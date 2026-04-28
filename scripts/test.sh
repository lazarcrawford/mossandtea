#!/bin/bash
# ============================================
# Moss & Tea — Pre-Deploy Validation Suite
# Run before every deploy to catch bugs early
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$(dirname "$SCRIPT_DIR)"
DEPLOY_URL="https://mossandtea.lazar-99d.workers.dev"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'
PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local status="$2"
  if [ "$status" = "0" ]; then
    echo -e "  ${GREEN}✓${NC} $name"
    PASS=$((PASS + 1))
  elif [ "$status" = "warn" ]; then
    echo -e "  ${YELLOW}⚠${NC} $name"
    WARN=$((WARN + 1))
  else
    echo -e "  ${RED}✗${NC} $name"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "═══════════════════════════════════════"
echo "  Moss & Tea — Pre-Deploy Validation"
echo "═══════════════════════════════════════"
echo ""

# === 1. Static Files Check ===
echo "📁 Static Files"
for f in "index.html" "css/style.css" "css/motion.css" "js/main.js" \
         "admin/index.html" "admin/css/admin.css" "admin/js/admin.js"; do
  if [ -f "$SITE_DIR/$f" ]; then
    check "$f exists" "0"
  else
    check "$f exists" "1"
  fi
done

echo ""

# === 2. HTML Validation ===
echo "📝 HTML Checks"
for html_file in "index.html" "admin/index.html"; do
  f="$SITE_DIR/$html_file"
  # Check for basic structure
  grep -q '<!DOCTYPE html>' "$f" && check "$html_file has DOCTYPE" "0" || check "$html_file has DOCTYPE" "1"
  grep -q '</html>' "$f" && check "$html_file has closing html" "0" || check "$html_file has closing html" "1"
  # Check for unclosed script tags (common bug)
  if grep -c '<script' "$f" | xargs -I{} test {} -eq $(grep -c '</script>' "$f"); then
    check "$html_file script tags balanced" "0"
  else
    check "$html_file script tags balanced" "1"
  fi
  # Check for hardcoded CDN URLs that might 302
  grep -q 'unpkg.com/@supabase' "$f" && check "$html_file unpkg CDN (may 302)" "warn" || check "$html_file CDN source ok" "0"
done

echo ""

# === 3. JavaScript Syntax Check ===
echo "🔍 JavaScript"
for js_file in "js/main.js" "admin/js/admin.js" "api-worker.js"; do
  if [ -f "$SITE_DIR/$js_file" ]; then
    # Basic syntax check with node
    node --check "$SITE_DIR/$js_file" 2>/dev/null && \
      check "$js_file syntax ok" "0" || \
      check "$js_file syntax ok" "1"
  fi
done

echo ""

# === 4. Supabase Config Check ===
echo "🔌 Backend Config"
if [ -f "$SITE_DIR/admin/js/admin.js" ]; then
  grep -q 'SUPABASE_URL' "$SITE_DIR/admin/js/admin.js" && \
    check "Supabase URL configured" "0" || \
    check "Supabase URL configured" "1"
  grep -q 'SUPABASE_ANON_KEY' "$SITE_DIR/admin/js/admin.js" && \
    check "Supabase anon key configured" "0" || \
    check "Supabase anon key configured" "1"
  # Check key isn't placeholder
  grep -q 'YOUR-PROJECT' "$SITE_DIR/admin/js/admin.js" && \
    check "No placeholder keys" "1" || \
    check "No placeholder keys" "0"
fi

echo ""

# === 5. Worker Config Check ===
echo "⚙️ Worker Config"
if [ -f "$SITE_DIR/wrangler.toml" ]; then
  grep -q 'name = "' "$SITE_DIR/wrangler.toml" && \
    check "wrangler.toml has name" "0" || \
    check "wrangler.toml has name" "1"
fi
# Check .wranglerignore doesn't exclude the worker itself
grep -q '^api-worker.js$' "$SITE_DIR/.wranglerignore" 2>/dev/null && \
  check "api-worker.js NOT in .wranglerignore" "1" || \
  check "api-worker.js NOT in .wranglerignore" "0"

echo ""

# === Summary ===
echo "═══════════════════════════════════════"
echo -e "  ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$WARN warnings${NC}"
echo "═══════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo -e "\n${RED}❌ Some checks failed. Fix before deploying.${NC}"
  exit 1
elif [ $WARN -gt 0 ]; then
  echo -e "\n${YELLOW}⚠ Warnings exist — deploy ok but check them.${NC}"
  exit 0
else
  echo -e "\n${GREEN}✅ All checks passed. Ready to deploy!${NC}"
  exit 0
fi
