#!/usr/bin/env bash
# ============================================
# Moss & Tea — Prometheus design pass shipping script
# Generated 2026-05-18 for Lazar's review.
#
# What this does:
#   1. Clears any stale .git/index.lock left by Cowork sandbox
#   2. Stages baseline UX fixes + Codex's chapter rebuild + three previews + the design memo
#   3. Commits as TWO commits on baseline-ux-fixes (preserves authorship)
#   4. Fast-forwards main to baseline-ux-fixes
#   5. Pushes main to origin
#   6. Runs the existing deploy pipeline (npm run deploy → wrangler deploy)
#   7. Verifies preview URLs respond 200
#
# Usage:
#   cd /Users/nova/sites/mossandtea
#   bash scripts/prometheus_ship.sh
# ============================================

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
echo "═══════════════════════════════════════"
echo "  🔥 Prometheus Ship Pipeline"
echo "  📁 $ROOT"
echo "═══════════════════════════════════════"
echo ""

# ===== 0. Clear stale lock =====
if [[ -f .git/index.lock ]]; then
  echo "🧹 Clearing stale .git/index.lock"
  rm -f .git/index.lock
fi

# ===== 1. Confirm we're on the right branch =====
CURRENT="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT" != "baseline-ux-fixes" ]]; then
  echo "⚠ Expected branch: baseline-ux-fixes, got: $CURRENT"
  echo "   Switching..."
  git checkout baseline-ux-fixes
fi

echo "🌿 On branch: $(git rev-parse --abbrev-ref HEAD)"
echo ""

# ===== 2. Drop folio direction (Lazar's decision after preview) =====
echo "🗑  Removing folio direction per Lazar's review"
rm -f preview/folio.html index-wild-folio.html

# ===== 3. Stage and commit =====
echo ""
echo "📦 Committing chapter rebuild + UX baseline + three preview proposals"
git add -A
git status --short

git commit -m "Tighten chapters to 4 + true-ratio masonry + UX baseline + three preview proposals

Codex's chapter rebuild (Held Gaze 56, Body 31, Earth & Dream 26, Spiral
Dance 11 — 124 images) brought to true aspect-ratio masonry gallery with
tight gaps, dark backplate, three/two-column responsive. Lightbox tuned
to warmer cream, longer chapter caption fade, removed scale transform.

Baseline UX fixes (Prometheus Cowork):
  - Contact form: visible-hidden labels for screen readers; honeypot
  - Hero: prefers-reduced-motion now silences heroZoom + scrollLine
  - Chapter tabs: grid 6→4 cols; font 0.66rem → 0.85rem
  - Nav: text-shadow for transparent state; -webkit-backdrop-filter
  - Nav logo: smooth scroll-to-top instead of href='#'
  - Lightbox: preload prev+next for instant navigation feel
  - JSON-LD Photograph schema for discovery
  - Merged duplicate @media (max-width:480px) blocks
  - All asset paths absolute (work from any URL depth, incl. /preview/)

Three preview proposals (under /preview/):
  - /preview/baseline.html — the current theme, refined (production candidate)
  - /preview/playa.html    — temple under sky (Burning Man × Pinterest × Irina)
  - /preview/spiral.html   — atlas of orbits (phyllotaxis galaxies, draggable)
  - /preview/index.html    — landing page listing all three

The folio direction (Romanian sacred manuscript) was cut after review —
it read as appliqué/twee rather than structural grammar. Lessons logged
in ~/second-brain/Reference/ for future runs.

Design memo: PROMETHEUS_DESIGN_PASS.md in repo root.
Skill + voice + heritage model persisted to ~/second-brain/Reference/.

Co-authored-by: Codex <codex@lp.dyad.local>
Co-authored-by: Prometheus (Cowork) <prometheus@lp.dyad.local>"

echo ""
echo "✅ Commit landed: $(git rev-parse --short HEAD)"
echo ""

# ===== 3. Fast-forward main =====
echo "🔀 Fast-forwarding main to baseline-ux-fixes"
git checkout main
git merge --ff-only baseline-ux-fixes
echo "✅ main now at $(git rev-parse --short HEAD)"
echo ""

# ===== 4. Push to origin =====
echo "📤 Pushing main to origin"
git push origin main
echo "✅ origin/main updated"
echo ""

# ===== 5. Run deploy =====
echo "🚀 Running deploy pipeline"
echo "   (this runs npm test, ops_preflight, wrangler deploy, and smoke tests)"
echo ""
npm run deploy

echo ""
echo "═══════════════════════════════════════"
echo "  🔍 Preview URL Verification"
echo "═══════════════════════════════════════"

WORKER_URL="${WORKER_URL:-https://mossandtea.com}"

verify() {
  local path="$1"
  local label="$2"
  local code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "${WORKER_URL}${path}")
  if [[ "$code" == "200" ]]; then
    echo -e "  \033[0;32m✓\033[0m ${label}: ${WORKER_URL}${path}"
  else
    echo -e "  \033[0;31m✗\033[0m ${label}: ${WORKER_URL}${path} (got $code)"
  fi
}

verify "/" "Main page (production)"
verify "/preview/" "Preview landing"
verify "/preview/baseline.html" "Refined Baseline (preview)"
verify "/preview/playa.html" "Temple Under Sky"
verify "/preview/spiral.html" "Atlas of Orbits"
verify "/data/gallery-config.json" "Gallery manifest"

echo ""
echo "═══════════════════════════════════════"
echo "  📬 Share these with Irina:"
echo "═══════════════════════════════════════"
echo ""
echo "  Landing (lets her pick):"
echo "    ${WORKER_URL}/preview/"
echo ""
echo "  Direct links:"
echo "    1. The Site, Refined:  ${WORKER_URL}/preview/baseline.html"
echo "    2. Temple Under Sky:   ${WORKER_URL}/preview/playa.html"
echo "    3. Atlas of Orbits:    ${WORKER_URL}/preview/spiral.html"
echo ""
