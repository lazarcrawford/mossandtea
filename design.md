---
name: Moss & Tea Editorial
colors:
  clay: "#8b6f5e"
  clay-light: "#a88978"
  sage: "#8a9a7a"
  sage-dark: "#6b7d5c"
  cream: "#f5f0eb"
  cream-dark: "#e8e0d8"
  charcoal: "#2c2c2c"
  text: "#3a3a3a"
  text-light: "#7a7a7a"
  white: "#ffffff"
  border: "#d4cbc4"
  overlay-dark: "rgba(0, 0, 0, 0.42)"
  overlay-soft: "rgba(0, 0, 0, 0.20)"
typography:
  display-xl:
    fontFamily: "Cormorant Garamond"
    fallback: "Georgia, serif"
    fontSize: "72px"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  display-lg:
    fontFamily: "Cormorant Garamond"
    fallback: "Georgia, serif"
    fontSize: "40px"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title-md:
    fontFamily: "Cormorant Garamond"
    fallback: "Georgia, serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.3
  body-md:
    fontFamily: "Inter"
    fallback: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 300
    lineHeight: 1.7
  body-sm:
    fontFamily: "Inter"
    fallback: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: 1.7
  label:
    fontFamily: "Inter"
    fallback: "-apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.20em"
    textTransform: "uppercase"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "112px"
  container-x: "32px"
layout:
  max-width: "1280px"
  grid-gap: "32px"
  section-header-width: "640px"
rounded:
  none: "0px"
  sm: "2px"
  md: "8px"
elevation:
  none: "none"
  soft: "0 2px 20px rgba(0, 0, 0, 0.06)"
motion:
  default: "0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
  image-hover: "0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
components:
  button-primary:
    background: "{colors.charcoal}"
    color: "{colors.white}"
    hoverBackground: "{colors.clay}"
    borderRadius: "{rounded.none}"
    textTransform: "uppercase"
  button-outline-hero:
    background: "transparent"
    color: "{colors.white}"
    border: "1px solid rgba(255, 255, 255, 0.4)"
    hoverBackground: "{colors.white}"
    hoverColor: "{colors.charcoal}"
  card-editorial:
    background: "{colors.cream}"
    color: "{colors.text}"
    elevation: "{elevation.none}"
    borderRadius: "{rounded.none}"
  admin-card:
    background: "{colors.white}"
    border: "1px solid {colors.border}"
    elevation: "{elevation.soft}"
    borderRadius: "{rounded.md}"
---

# Design System

## Overview

Moss & Tea should feel cinematic, quiet, earthy, and editorial. The public site is image-led, with typography and color supporting the photography rather than competing with it. The interface should feel like a photographer's portfolio and studio practice: intimate, warm, restrained, and deliberate.

The dominant visual impression is soft natural light over warm cream surfaces, charcoal type, clay accents, sage support tones, and large photography. Avoid generic SaaS styling, saturated gradients, playful decoration, and overly card-heavy layouts.

## Design Principles

1. **Photography leads**
   Let images carry the emotional weight. UI should frame, pace, and clarify the work.

2. **Editorial restraint**
   Use generous whitespace, elegant type, thin borders, and quiet hierarchy. Avoid clutter and ornamental UI.

3. **Earth and light**
   Favor warm neutrals, clay browns, muted greens, charcoal, cream, and soft overlays.

4. **Cinematic pacing**
   Use large first impressions, slow transitions, full-bleed imagery, and clear section breaks.

5. **Operational calm for admin**
   Admin screens may share brand tokens, but should be denser, clearer, and more utilitarian than the public site.

## Colors

- **Cream** (`#f5f0eb`): Primary public-site background. Use for warm, quiet page surfaces.
- **Cream Dark** (`#e8e0d8`): Subtle bands, input backgrounds, dividers, and low-contrast surfaces.
- **Charcoal** (`#2c2c2c`): Primary dark text, primary filled buttons, dark contact/footer sections.
- **Text** (`#3a3a3a`): Default body text on cream or white.
- **Text Light** (`#7a7a7a`): Supporting copy, metadata, captions, table labels.
- **Clay** (`#8b6f5e`): Primary brand accent for labels, hover states, service-card emphasis, and warm calls to action.
- **Clay Light** (`#a88978`): Accent on dark sections, small labels, and soft links.
- **Sage** (`#8a9a7a`): Secondary accent, especially admin active states and success-adjacent UI.
- **Sage Dark** (`#6b7d5c`): Hover or pressed states for sage controls.
- **Border** (`#d4cbc4`): Thin dividers and quiet structure.

Use clay and sage sparingly. The site should read as warm neutral and photographic, not as a green/brown themed interface.

## Typography

### Public Website

- Use **Cormorant Garamond** for hero type, section titles, editorial captions, and brand moments.
- Use **Inter** for navigation, labels, forms, service body copy, metadata, and functional UI.
- Keep headings light: 300 or 400 weight. Do not make the site feel corporate or heavy.
- Use uppercase labels with wide letter spacing for section markers such as Portfolio, About, Services, and Connect.
- Keep body copy airy with generous line-height around 1.7 to 1.9.

### Admin

- Prefer Inter for most admin UI.
- Use Cormorant sparingly, if at all, in admin. Operational screens need clarity over editorial atmosphere.
- Use compact headings, dense labels, clear tables, and status chips.

## Layout

- Public pages should use a max-width around `1280px` with `32px` desktop side padding.
- Section rhythm should be generous: about `112px` vertical padding on desktop, reduced on mobile.
- The hero should be full-viewport or near full-viewport and image-dominant.
- Portfolio grids should be edge-to-edge or wide, with images arranged as masonry/editorial tiles.
- About sections may use two-column image/text compositions.
- Contact and footer sections may invert to charcoal backgrounds.

Avoid nesting cards inside cards. Public sections should feel like full-width editorial bands, not dashboard panels.

## Imagery

- Use real photography wherever possible.
- Favor warm natural light, tactile texture, skin tones, landscape detail, and candid editorial composition.
- Avoid generic stock imagery, heavy blur, artificial gradients, decorative blobs, and abstract placeholders.
- Image overlays should be dark and subtle enough to preserve photo detail while supporting legible text.
- Gallery hover states may gently zoom or reveal captions, but should not feel flashy.

## Components

### Buttons

- Public primary buttons: charcoal fill, white text, uppercase Inter, generous horizontal padding.
- Public hero outline buttons: transparent with a soft white border; invert to white on hover.
- Admin primary buttons: may use sage or charcoal, but should be compact and practical.
- Keep button corners mostly square or lightly rounded. Do not over-round public-site buttons.

### Navigation

- Fixed top navigation is acceptable.
- Transparent over hero, cream/blurred background after scroll.
- Keep nav links small, uppercase, and letter-spaced.
- Logo should feel like a wordmark, not a badge.

### Cards

- Public cards should be used sparingly.
- Service cards may use cream backgrounds on white sections, with clay hover states.
- Admin cards can use white backgrounds, 8px radius, thin borders, and soft shadows, but should remain dense.

### Forms

- Public forms should be quiet: low-contrast fields on dark or cream surfaces, clear focus states, and minimal decoration.
- Labels may be visually subtle, but form purpose must remain obvious.
- Contact forms should feel like an invitation, not an enterprise lead form.

### Tables And Admin Lists

- Admin tables should be denser than the current public design language.
- Use Inter, clear row separators, compact status chips, and direct actions.
- Avoid emoji icons. Use a consistent icon set or text labels.

## Motion

- Motion should be slow, subtle, and cinematic.
- Acceptable motion: gentle image zooms, soft fades, scroll progress, restrained reveal animations.
- Avoid excessive parallax, cursor gimmicks, bouncing, or animation that distracts from images.
- Respect `prefers-reduced-motion`.
- Any canvas or remote-script-powered visual effect must have an accessible visible fallback.

## Accessibility

- Maintain at least 4:1 contrast for body text and key controls.
- Do not rely on canvas-only text for visible primary messaging.
- Preserve real semantic headings.
- Ensure keyboard access for navigation, gallery/lightbox controls, forms, and admin actions.
- Use focus states that are visible but brand-appropriate.

## Do's And Don'ts

- Do make photography the first visual signal.
- Do use cream, charcoal, clay, and sage in a restrained editorial system.
- Do use Cormorant Garamond for atmosphere and Inter for utility.
- Do use large whitespace on the consumer site.
- Do make the admin quieter, denser, and more operational than the public site.
- Do keep borders and dividers thin.
- Don't use generic blue SaaS styling.
- Don't use gradient blobs, decorative orbs, or bokeh backgrounds.
- Don't use emoji as production UI icons.
- Don't overuse cards on the public site.
- Don't let animation compromise readability, accessibility, or performance.
