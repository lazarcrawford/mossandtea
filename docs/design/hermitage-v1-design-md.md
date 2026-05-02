---
version: alpha
name: Hermitage V1
description: Hermitage is the Moss & Tea private client room: photography-first, quietly operational, and built around trust. The experience should feel like entering a small studio archive prepared by Irina, not logging into generic client software. It uses dark ink and handmade-paper warmth, thin glass lines, bronze and moss as low-voltage signals, Cormorant Garamond for atmosphere, and Inter for useful controls.
colors:
  ink: "#15120f"
  ink-2: "#211b17"
  ink-3: "#302720"
  paper: "#f5efe6"
  paper-2: "#e7dac9"
  porcelain: "#fbf7f0"
  moss: "#66755f"
  olive: "#9aa17a"
  bronze: "#b08a59"
  clay: "#a86451"
  wine: "#743743"
  line: "rgba(245, 239, 230, 0.18)"
  line-strong: "rgba(245, 239, 230, 0.34)"
  muted: "rgba(245, 239, 230, 0.68)"
  muted-dark: "rgba(21, 18, 15, 0.62)"
typography:
  display:
    fontFamily: "Cormorant Garamond"
    fontSize: "64px"
    fontWeight: 300
    lineHeight: 0.92
    letterSpacing: 0
  title:
    fontFamily: "Cormorant Garamond"
    fontSize: "36px"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: 0
  body:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  label:
    fontFamily: "Inter"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0.16em"
    textTransform: uppercase
rounded:
  sm: "4px"
  md: "8px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "36px"
  section: "72px"
components:
  room-masthead:
    background: "photographic image with ink scrim"
    layout: "compact split between studio copy and live project controls"
    minHeight: "300px desktop, auto mobile"
  room-card:
    background: "translucent ink glass"
    border: "1px solid {colors.line}"
    rounded: "{rounded.md}"
    role: "status, next action, proof count, final-pick count"
  segmented-tabs:
    background: "transparent"
    activeBorder: "{colors.bronze}"
    activeBackground: "rgba(176, 138, 89, 0.16)"
  image-card:
    background: "{colors.ink-2}"
    border: "1px solid {colors.line}"
    rounded: "{rounded.md}"
    caption: "serif, restrained, attached to image"
---

# Hermitage V1 Design MD Study

## Sources Studied

- `VoltAgent/awesome-design-md` collection structure and format discipline.
- Notion for workspace clarity: status, next action, and navigation are surfaced as product structure, not decorative copy.
- Apple for photography-first restraint: chrome recedes, image and spacing carry the feeling.
- Airbnb for human warmth: controls can be friendly without becoming childish or sales-driven.

## Translation For Hermitage

Hermitage should not look like Notion, Apple, or Airbnb. The lesson is structural:

- Design tokens are explicit so agents stop improvising.
- The first viewport must answer what room the client is in, what is ready, and what action matters.
- Photography remains the emotional object.
- Utility appears as thin, quiet instruments over the photographic atmosphere.
- Mobile gets the same content hierarchy with fewer surfaces and no horizontal pressure.

## Do

- Keep the masthead compact enough that the project room begins near the first fold.
- Put next action, proof count, and final picks in the first viewport.
- Use bronze as a signal for active or ready states.
- Use moss/olive as calm support, never as a full theme wash.
- Keep controls at 44px minimum touch height.
- Treat every project artifact as part of a private studio room.

## Do Not

- Do not rebuild a full-screen hero that hides the workflow.
- Do not add decorative gradients, blobs, or generic SaaS cards.
- Do not make billing or documents feel like an accounting app.
- Do not let image captions and controls fight the photography.
- Do not create mobile horizontal overflow.

## V1 Use Case

For a real client opening Hermitage:

1. They immediately see the project name, current phase, next action, number of proofs, and final-pick count.
2. They can enter the proofing room without scrolling through mood copy.
3. The project room below the masthead feels like a prepared table: overview, proofing, documents, and billing are visible, calm, and reachable.
4. Every image interaction keeps the photograph primary and makes selection feel deliberate.
