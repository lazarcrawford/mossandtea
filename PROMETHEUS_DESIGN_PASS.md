# Prometheus Design Pass — 2026-05-18

**Built by:** Prometheus (Cowork runtime) at Lazar's commission
**Session:** 2026-05-18, single Cowork pass
**Time on target:** ~one design session

---

## What was delivered

### In this repo

| File | Purpose | Lines |
|---|---|---|
| `index.html` (modified in place) | Baseline UX fixes layered on top of Codex's chapter-restructure + masonry rebuild | 308 |
| `css/style.css` (modified) | Nav text-shadow; -webkit-backdrop-filter; chapter tabs 6→4 cols + bigger type; merged dup mobile blocks; hero added to reduced-motion; honeypot styling | — |
| `js/main.js` (modified) | Logo scroll-to-top handler; honeypot guard on submit | — |
| `js/motion.js` (modified) | Lightbox neighbor preload (prev + next preloaded async) | — |
| `index-wild-folio.html` | **Wild 1 — Sacred Folio.** Brâncuși rhythm × Romanian icon framing × Apple deference. Single-column with pilasters, arched chapter headers, paired-column gallery rhythm, gold hairlines, Romanian red accent. | 969 |
| `index-wild-playa.html` | **Wild 2 — Temple Under Sky.** Burning Man scale × Pinterest image-first × Irina's painterly surface. Ambient dust motes, station-counter side nav, massive Cormorant display type, alternating procession (1/2/3-up rows), ember + dusk + sand palette. | 1127 |
| `index-wild-spiral.html` | **Wild 3 — Atlas of Orbits.** Pinterest density × Apple depth × Brâncuși spiral × her "Spiral Dance" chapter. Phyllotaxis galaxies — each chapter is a spiraling field of circular thumbnails you can drag to rotate. Mobile falls back to a 3-column grid. | 994 |

### In second brain

| File | Purpose |
|---|---|
| `~/second-brain/Reference/irina-visual-voice.md` | Voice model built from a 10-photo cross-chapter sample. Palette anchors, composition language, what she avoids, design implications. |
| `~/second-brain/Reference/romanian-heritage-for-design.md` | A working vocabulary — Brâncuși / Orthodox icons / ia embroidery / Maramureș wood / Țuculescu — translated into design grammar with Romanian color tokens. |
| `~/second-brain/Reference/skills/world-class-web-design/SKILL.md` | The skill: five-layer model (Soul / Structure / Rhythm / Surface / Instrument), what to extract from Apple / Meta / Pinterest / Burning Man / Irina / Romania, a six-phase operating procedure, hard rules and anti-patterns. |

---

## How to preview

Each wild HTML uses the same gallery-config.json data and same image assets, so you can preview without any setup. From the repo root, in your existing local dev environment:

```bash
# If you usually run wrangler dev:
npx wrangler dev
# Then visit:
#   http://localhost:8787/                        ← baseline (with my fixes)
#   http://localhost:8787/index-wild-folio.html   ← Wild 1
#   http://localhost:8787/index-wild-playa.html   ← Wild 2
#   http://localhost:8787/index-wild-spiral.html  ← Wild 3

# Or simpler, just any static server:
python3 -m http.server 8000
# Then visit:
#   http://localhost:8000/
#   http://localhost:8000/index-wild-folio.html
#   http://localhost:8000/index-wild-playa.html
#   http://localhost:8000/index-wild-spiral.html
```

---

## What each wild is trying to be

**wild-folio:** *the site as a sacred manuscript*. Slow, single-column, vertical pilasters, an opening cartouche, four chapters paced like icon panels in an iconostasis. Picks you up by the eye and walks you through. Quietest of the three. Strongest grammar borrowed from Romanian heritage. Best if you want the site to feel like a *book worth keeping*.

**wild-playa:** *the site as a pilgrimage*. Massive type, ambient dust, four chapter "stations" you walk through. Photos arranged in alternating procession rows (one full-bleed, then two-up, then three-up — the rhythm a body would naturally walk). Loudest, most cinematic, most "this is a destination." Best if you want the site to feel like *visiting a place*.

**wild-spiral:** *the site as a star map*. Each chapter is a phyllotaxis galaxy — thumbnails arranged on the golden-angle spiral, drifting slowly, draggable to rotate, clickable to enter the lightbox. The most adventurous; the riskiest. Hover-state circles enlarge in 3D space. Mobile falls back to a 3-column grid for usability. Best if you want the site to feel like *play, with stars*.

---

## Git script — paste at your terminal

The sandbox blocks file deletion inside `.git/`, so I couldn't commit from here. The work is all in your working tree. **Before running, clear the stale lock once more if it's still there:** `rm /Users/nova/sites/mossandtea/.git/index.lock`.

Then this one paste handles all the branching:

```bash
cd /Users/nova/sites/mossandtea

# ===== 1. Baseline branch: Codex's chapter work + my UX fixes =====
# Currently sitting on baseline-ux-fixes branch with everything staged + my unstaged changes
git stash push -u -m "prometheus-fixes-temp"     # set aside my fixes
git restore --staged .                            # un-stage Codex's chapter work
git stash pop                                     # restore both back to working tree
git add data/gallery-config.json css/motion.css scripts/public-gallery-smoke.js scripts/public-responsive-smoke.js
# Use git add -p for the files I touched, separating Codex's masonry edits from my fixes:
git add -p css/style.css   # accept hunks ABOVE my baseline fix sections (Codex's masonry)
git add -p index.html      # accept ONLY the chapter button hunk (lines 92-95 area)
git add -p js/main.js      # accept ONLY Codex's row-span logic in renderArchiveGallery
git add -p js/motion.js    # accept ONLY Codex's lightbox refactor (the getItems + openLightbox signature change)
git commit -m "Tighten chapters to 4 + true-ratio masonry gallery

Co-authored-by: Codex <codex@lp.dyad.local>"

# Now my UX fixes
git add -A
git commit -m "Baseline UX fixes — labels, reduced-motion, JSON-LD, lightbox preload, etc.

- Contact form: visible-hidden labels (accessibility); honeypot
- Hero: reduced-motion respected on heroZoom + scrollLine
- Chapter tabs: grid 6→4 cols; font 0.66rem → 0.85rem (less tiny)
- Nav: text-shadow for transparent state; -webkit-backdrop-filter
- Nav logo: smooth scroll to top instead of href='#'
- Lightbox: preload prev+next for instant feel
- JSON-LD Photograph schema for SEO/discovery
- Merged duplicate @media (max-width:480px) blocks

Co-authored-by: Prometheus (Cowork) <prometheus@lp.dyad.local>"

# ===== 2. Wild branches (each carries the baseline + a wild index file) =====
# Each wild file is already in your working tree but unrelated to baseline branch.
# Easiest move: leave the wild files on baseline-ux-fixes (they don't conflict), then branch off.

git checkout -b wild-folio
# index-wild-folio.html is already here — make it active:
cp index.html index-baseline-backup.html  # safety
mv index-wild-folio.html index.html
git add -A
git commit -m "Wild proposal: sacred folio (Brâncuși × Romanian icon × Apple deference)

Single-column folio with pilaster framing, arched chapter headers,
paired-column gallery rhythm, gold hairlines, Romanian red accent.
Original index.html stashed as index-baseline-backup.html."

git checkout baseline-ux-fixes
git checkout -b wild-playa
mv index.html index-baseline-backup.html
mv index-wild-playa.html index.html
git add -A
git commit -m "Wild proposal: temple under sky (Burning Man × Pinterest × Irina)

Pilgrimage through 4 chapter stations, ambient dust, station-counter
side nav, massive Cormorant display, alternating procession rows.
Original index.html stashed as index-baseline-backup.html."

git checkout baseline-ux-fixes
git checkout -b wild-spiral
mv index.html index-baseline-backup.html
mv index-wild-spiral.html index.html
git add -A
git commit -m "Wild proposal: atlas of orbits (phyllotaxis galaxies, draggable)

Each chapter is a golden-angle spiral of circular thumbnails.
Slow idle drift; drag to rotate; click any star to enter lightbox.
Mobile falls back to 3-column grid for usability.
Original index.html stashed as index-baseline-backup.html."

# ===== 3. Back to baseline for any further iteration =====
git checkout baseline-ux-fixes

# Now you have four branches:
#   main                — production state (5 chapters)
#   baseline-ux-fixes   — chapter rebuild + Codex masonry + my UX fixes (the conservative ship)
#   wild-folio          — sacred folio proposal
#   wild-playa          — temple under sky proposal
#   wild-spiral         — atlas of orbits proposal

git branch -a
```

If `git add -p` is too fiddly for you, **simpler alternative**: just commit everything together on `baseline-ux-fixes` as one big commit, then make the wild branches off that. The two-commit split was about respecting Codex's authorship — but a single commit with `Co-authored-by: Codex` and `Co-authored-by: Prometheus (Cowork)` would also work.

---

## Honest constraints from this session

1. **Couldn't `git commit` from inside the Cowork sandbox** — virtio-fs mount blocks `unlink` on `.git/index.lock`. You ran `rm` once; new locks appear with each git command, so the script above is the cleanest path. Future Cowork git work probably needs that delete permission elevated.
2. **`npm run build` failed in sandbox** for the same reason (it `rimraf`s `public/` before rebuilding). On your machine, `npm run build` works — Codex confirmed 3 hours before this session.
3. **Lane 1 of the original punch list (social URLs) skipped** — you don't have Instagram/Pinterest URLs to wire in yet. The links remain `href="#"`. Either fill them in or remove the icons.
4. **Lane 8 (service icons) untouched in baseline.** All three wild branches reimagine the services section without icons (Roman numerals / lowercase letters / pure type). If the baseline ships, decide separately whether to remove icons or commission custom-drawn ones from Irina.
5. **Live render of the three wilds wasn't verified from this session** — the Cowork sandbox can't host a server and the live site is the old chapter version. The HTML/CSS/JS parse cleanly, but you should hit them locally to confirm visual rendering matches intent.
6. **Photo voice model is from an 11-image sample** out of 124. The patterns are strong but a deeper pass (every chapter cover + 5 representative each) would refine the model. Worth doing if you want to tune wilds further.

---

## What I recommend for next move

1. Run `npx wrangler dev` or `python3 -m http.server 8000` locally.
2. Open all four URLs in side-by-side tabs.
3. Pick the direction that feels truest to Irina's work — not the prettiest in isolation.
4. Tell me your call. I'll harden that branch — accessibility audit, real device testing, performance budget, then prod push.

If you want to pull elements ACROSS proposals (the folio's pilasters into the spiral; the playa's procession rhythm into the folio; etc.), say so — those crossings are real moves.

---

*Built with care for Irina's work. — Prometheus*
