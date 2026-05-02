---
version: beta
name: Lantern House
description: Lantern House is the Hermitage design language for Moss & Tea: a private client room imagined as a lantern-lit wooden pavilion between archive, sea, forest, and ritual table. It is dark but not corporate, warm but not rustic, magical but still functional. Its world is made of driftwood, brass, rope, smoky glass, red canopy cloth, old clocks, sea air, candlelight, and the feeling of finding a prepared room at the edge of the tide.
colors:
  night: "#090807"
  tar: "#11100d"
  char: "#1d1813"
  plank: "#3a2519"
  varnish: "#6f3d21"
  canopy: "#6d1712"
  ember: "#c45b27"
  lantern: "#f2bf6c"
  brass: "#b58143"
  old-gold: "#8e622d"
  rope: "#c2a06c"
  salt: "#f4efe4"
  bone: "#d7c8ab"
  smoke: "#9b9c96"
  sea-glass: "#9bc7bd"
  horizon: "#7fa7aa"
  moss-shadow: "#283426"
  ink-line: "rgba(244, 239, 228, 0.16)"
  brass-line: "rgba(242, 191, 108, 0.34)"
typography:
  display:
    fontFamily: "Cormorant Garamond"
    fontSize: "76px"
    fontWeight: 300
    lineHeight: 0.88
    letterSpacing: 0
  room-title:
    fontFamily: "Cormorant Garamond"
    fontSize: "44px"
    fontWeight: 300
    lineHeight: 0.96
    letterSpacing: 0
  instrument-label:
    fontFamily: "Inter"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.18em"
    textTransform: uppercase
  body:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: 0
rounded:
  cut: "2px"
  plank: "6px"
  porthole: "999px"
spacing:
  hairline: "1px"
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "36px"
  room: "64px"
components:
  shell:
    background: "layered night, char, smoky red, and sea-glass horizon light"
    texture: "thin plank lines, candle bloom, low film grain, aged wall seams"
  masthead:
    shape: "photographic wooden room wall with real-looking sconces, furniture, tabletop objects, and visible brass instrument card"
    rule: "must reveal client-room function in first viewport"
  room-dressing:
    objects: "photographic or AI-generated room assets: wall sconces, settee, cabinet shelves, tabletop trinkets, rope, clock, candle, porthole, and sea light"
    rule: "decorative room assets must feel editorial, physically placed, and integrated with the scene; CSS-only props are for wireframes, not the final visual language"
  instrument-card:
    background: "smoky black glass over dark wood"
    border: "thin brass line"
    lighting: "subtle lantern glow from lower edge"
  button-primary:
    background: "linear brass-to-lantern"
    textColor: "{colors.night}"
    shape: "small plaque, not SaaS pill"
  button-secondary:
    background: "transparent smoky glass"
    border: "brass-line"
    textColor: "{colors.salt}"
  navigation:
    style: "thin brass labels like cabinet drawer plates"
  proof-card:
    style: "image as artifact mounted on dark plank with brass pick control"
---

# Lantern House Design System

## Essence

Lantern House is a private room built from salvaged beauty. It should feel like a wooden structure on the boundary between forest and sea: antique objects gathered under candlelight, a clock that knows time is elastic, a porthole opening to horizon, red canopy cloth overhead, ropes and brass instruments close at hand.

The mood is not pirate, circus, steampunk, fantasy UI, or dark SaaS. It is intimate, hand-built, theatrical in the old-world sense, and useful. The room holds memory carefully.

## Visual Vocabulary

- **Lantern light:** warm pools of amber used for active states, calls to action, and selected proofing moments.
- **Driftwood architecture:** dark plank surfaces, thin seams, uneven warmth, no flat corporate panels.
- **Brass instruments:** counters, status cards, navigation plates, and proofing controls should feel like mounted gauges or drawer labels.
- **Sea threshold:** cool sea-glass and horizon tones appear sparingly to open the room and keep it from becoming brown/orange.
- **Red canopy:** deep oxblood accents suggest fabric, shelter, ceremony, and interior warmth.
- **Rope and handwork:** thin borders, braided lines, and tactile separators can imply craft without cartoon illustration.
- **Time objects:** clocks, sequence, review stages, and delivery timelines should feel like instruments, not progress bars.
- **Furniture and thresholds:** settees, cabinets, shelves, trinket tables, and door-like panels create the feeling of entering a prepared room.
- **Sconces and lamps:** light must appear to come from placed objects, not just gradients. Use warm pools, flares, and local highlights.

## Layout Laws

- The first viewport is a room entrance, not a marketing hero.
- The current project card must always be visible above the fold on mobile and desktop.
- Status, proof count, final-pick count, and next action belong in the first screen.
- The image gallery should feel like artifacts laid on a table, not tiles in a SaaS dashboard.
- Use asymmetry and layered depth, but never hide the action.
- Mobile must collapse into a single lantern column with no horizontal pressure.
- Decorative objects must sit behind or beside function. They should make the room believable, not become interface obstacles.

## Component Rules

### Masthead

Use a dark photographic field, but let it behave like an interior wall. Add wall sconces, lower tabletop glow, cabinet/furniture silhouettes, and a cool horizon leak. Keep copy short. Place the instrument card as an object in the room.

### Room Dressing

Room dressing is part of the system, but it must be treated as image direction rather than clip-art decoration. Use photographic or AI-generated environment assets: real-looking candle bulbs, brass stems, shelves, clocks, shells, cups, books, rope lines, table edges, portholes, and upholstered furniture. They should feel aged, hand-arranged, and lit by believable lamps. CSS-only objects are acceptable for layout sketching, but they are not production visual language.

### Instrument Card

Use for project summary, selection tray, and important status surfaces. It has smoky glass, brass borders, tiny uppercase labels, and one candle edge.

### Buttons

Primary buttons are brass plaques. Secondary buttons are smoky outlined plates. Avoid rounded SaaS pills, bright blue, generic gradients, or large blocky cards.

### Tabs

Tabs are cabinet labels. They should be compact, legible, and tactile. Active state uses lantern/brass, not a filled software chip.

### Proof Cards

Images stay primary. Captions attach like small table labels. The selection control should feel like marking a print, not clicking a checkbox.

## Motion

Use slow warmth: glow, fade, and tiny lift. Avoid bounce, spinning, cursor tricks, or theatrical UI movement that competes with the photographs.

## Do

- Use warm amber light against deep char and wood.
- Balance warmth with cool sea-glass air.
- Let objects feel gathered and intentional.
- Make every surface feel touched by hand.
- Keep the workflow obvious.
- Use placed light sources: sconces, lamps, candles, and reflected brass.
- Give empty areas a room role: wall, shelf, table, cabinet, porthole, or threshold.

## Do Not

- Do not make the system look like generic dark mode.
- Do not make it look like a pirate theme.
- Do not overuse orange or brown without sea-glass relief.
- Do not use heavy cards inside cards.
- Do not let atmosphere consume functional space.
- Do not make decoration look like clip art or a literal theme park.
- Do not put decorative furniture over readable text or interactive controls.
