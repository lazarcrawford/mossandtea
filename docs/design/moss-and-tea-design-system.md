---
version: beta
name: Moss and Tea Design System
description: A clean, bright, photography-first design language for Moss & Tea digital products. It extends Irina Crawford's public website into operational client tools: calm, crisp, lightly textured, emotionally warm, and easy to use.
colors:
  cream: "#f5f0eb"
  paper: "#fbf8f4"
  mist: "#eef4f1"
  white: "#ffffff"
  charcoal: "#2c2c2c"
  text: "#3a3a3a"
  muted: "#747a76"
  clay: "#8b6f5e"
  clay-light: "#a88978"
  sage: "#8a9a7a"
  sage-dark: "#6b7d5c"
  moss: "#315d54"
  moss-light: "#4f7f73"
  sea: "#6faaa4"
  sea-light: "#b7d5d0"
  border: "#d8d0c8"
typography:
  display:
    fontFamily: "Cormorant Garamond"
    fontSize: "72px"
    fontWeight: 300
    lineHeight: 0.96
    letterSpacing: 0
  title:
    fontFamily: "Cormorant Garamond"
    fontSize: "44px"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: 0
  label:
    fontFamily: "Inter"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.16em"
    textTransform: uppercase
  body:
    fontFamily: "Inter"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0
rounded:
  control: "999px"
  card: "14px"
  panel: "18px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "36px"
  section: "64px"
components:
  app-shell:
    background: "cream paper with pale mist and subtle handmade grain"
    rule: "bright by default, never generic white SaaS"
  panel:
    background: "warm white or mist glass"
    border: "thin moss-tinted line"
    shadow: "soft, shallow, editorial"
  button-primary:
    background: "moss to moss-light"
    textColor: "white"
    shape: "rounded capsule"
  button-secondary:
    background: "transparent white"
    border: "moss-tinted line"
    textColor: "moss"
  proof-card:
    style: "photograph-first card with quiet metadata and compact actions"
---

# Moss and Tea Design System

## Essence

Moss and Tea is clean, quiet, and sensory. The digital product should feel like an extension of Irina's photographic world: bright paper, natural texture, soft air, careful spacing, and controls that stay out of the way until they are needed.

The system should not feel like a dark dashboard, a fantasy room, or generic productivity software. It should be crisp, warm, editorial, and calm.

## Voice

Use plain, client-facing language. Prefer words like review, proofs, edits, selections, documents, delivery, and project. Avoid naming internal concepts unless the client needs them.

The tone is intimate but direct:

- "Your photographs are ready for review."
- "Three edits are included in this project."
- "Request edits and leave notes for Irina."
- "Submit final picks."

## Visual Vocabulary

- **Paper:** warm cream and soft white backgrounds with subtle grain.
- **Moss:** primary action color, confirmation, selected state.
- **Sea glass:** secondary cool accent for edit requests and active status.
- **Clay:** supporting warmth, never dominant.
- **Charcoal:** primary text and serious labels.
- **Photography first:** images carry emotion; UI frames them quietly.

## Layout Rules

- Keep the first viewport functional. The user should know the project, status, next action, proof count, and edit allowance quickly.
- Use generous spacing, but do not spend the whole screen on mood.
- Panels should feel light and layered, not heavy.
- Buttons should be clear, rounded, and calm.
- Mobile must feel native: no horizontal pressure, no clipped controls, no bulky hero.

## Component Rules

### Project Summary

Use a light panel with project title, next action, status, proof count, and final pick count. Keep it compact and scannable.

### Proofing

Proof cards are image-led. Actions should be compact: pick, request edit, add edit note. Submission should create a visible completion state without locking the user out of corrections.

### Edit Ledger

Show included edits, requested edits, overage, and submission state together. The edit allowance must be obvious before the user submits.

### Documents and Billing

Keep these surfaces quiet and list-like. They should feel like support material, not the main emotional surface.

## Do

- Use cream, paper, mist, moss, sea glass, and charcoal.
- Keep photographic content visually dominant.
- Use moss/blue-green for primary action.
- Make selection and submission states obvious.
- Keep client language direct and reassuring.

## Do Not

- Do not use dark, moody room theming for the client portal.
- Do not use gold/brass/lantern colors as the primary product palette.
- Do not over-decorate operational controls.
- Do not call the portal "Hermitage" in client-facing UI unless the brand decision changes.
- Do not hide fees or edit limits.
