---
name: Kalfahane
description: Türkiye'nin Yazılım Çarşısı. A quiet signal room in deep space, where light marks what is alive.
colors:
  gece: "#000000"
  gece2: "#06060A"
  cam: "#0D0D13"
  panel: "#181818"
  mor: "#8B5CF6"
  mor-acik: "#A78BFA"
  mor-soluk: "#C4B5FD"
  beyaz: "#FDFDFD"
  gri: "#A1A1AA"
  gri-koyu: "#8A8A94"
  yesil: "#4ADE80"
  yesil-soluk: "#86EFAC"
  kirmizi-soluk: "#FCA5A5"
typography:
  display:
    fontFamily: "Plus Jakarta Sans Variable, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "calc(89 * var(--u))"
    fontWeight: 500
    lineHeight: 1.01
    letterSpacing: "-0.011em"
  headline:
    fontFamily: "Plus Jakarta Sans Variable, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Plus Jakarta Sans Variable, -apple-system, sans-serif"
    fontSize: "15px to 19px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Plus Jakarta Sans Variable, -apple-system, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Plus Jakarta Sans Variable, -apple-system, sans-serif"
    fontSize: "12.5px to 13.5px"
    fontWeight: 400
    lineHeight: 1.55
  code:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  chip: "12px"
  input: "12px to 16px"
  card: "20px"
  bubble: "20px"
  panel: "28px"
  pill: "9999px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  section: "96px"
  container: "1280px"
  chat-column: "760px"
components:
  button-primary:
    backgroundColor: "{colors.beyaz}"
    textColor: "#050505"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-glass:
    backgroundColor: "rgba(0, 0, 0, .78)"
    textColor: "#D9D9D9"
    border: "1px solid rgba(255, 255, 255, .09)"
    rounded: "{rounded.pill}"
  isik-mor:
    backgroundColor: "rgba(139, 92, 246, .2)"
    textColor: "#FFFFFF"
    border: "1px solid rgba(167, 139, 250, .45)"
    rounded: "{rounded.pill}"
  isik-kutu:
    backgroundColor: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.02))"
    border: "1px solid rgba(255, 255, 255, .09)"
    rounded: "{rounded.card}"
  bubble-own:
    backgroundColor: "linear-gradient(165deg, rgba(139,92,246,.5), rgba(109,40,217,.34))"
    textColor: "#FFFFFF"
    rounded: "{rounded.bubble}"
  bubble-other:
    backgroundColor: "rgba(255, 255, 255, .055)"
    textColor: "#F4F4F5"
    rounded: "{rounded.bubble}"
---

# Design System: Kalfahane

## Overview

**Creative North Star: "The Signal Room in Deep Space"**

Kalfahane is set at night, in space. The ground is true black, the type is Plus Jakarta Sans, and violet light is the only color that moves. The language comes from the home page's video hero: a dotted violet globe turning slowly in a starfield, a white pill as the main action, and a dark glass pill beside it. Every other page continues that world rather than starting a new one.

Light means something here. Violet glow sits on what is alive: the primary action under the cursor, your own message, the typing signal, an unread count, an accepted deal. Everything else stays quiet, made of hairlines at 7 to 12% white and glass that is barely there. Interfaces inside the product (panel, offers, messages) are calm operating surfaces; the drama is spent on the home page's 3D workshop and the hero.

The world rejects the generic SaaS dashboard (pastel cards, gradient text, icon-plus-heading grids) and the "hacker" costume (green monospace, matrix rain). Code appears only where it is code: the 3D robot's screens and technology names.

**Key Characteristics:**
- True black ground (`gece`), with depth made by violet light falloff, not by grey boxes.
- One accent family: violet (`mor`, `mor-acik`, `mor-soluk`). Green is reserved for "online" and "accepted"; red only for destructive actions and errors.
- White pill for the main action, dark glass pill for the secondary one, exactly as in the hero.
- Cursor-tracked light (`.isik`) on buttons and cards inside the product.
- Motion on one curve (`cubic-bezier(.16, 1, .3, 1)`), entrances from an already-visible state, a reduced-motion path for everything.

## Colors

### Primary
- **Mor, Signal Violet** (`#8B5CF6`): The accent. Glows under primary actions, fills your own chat bubble, marks unread badges and selected states.
- **Mor Açık** (`#A78BFA`): Focus rings, links, icons in active state, the caret.
- **Mor Soluk** (`#C4B5FD`): Violet text on black: prices, "yazıyor…", inline links, small emphasis. Passes contrast on black for body sizes.

### Neutral
- **Gece** (`#000000`): Page ground everywhere. `body` is black.
- **Gece 2** (`#06060A`) and **Cam** (`#0D0D13`): Raised panels, dropdowns, side columns in the messages page (`#050507`).
- **Panel** (`#181818`): Small chips and nav pills in the hero.
- **Beyaz** (`#FDFDFD`): Primary button fill and primary text (`#FFFFFF`).
- **Gri** (`#A1A1AA`): Secondary text. **Gri Koyu** (`#8A8A94` to `#8E8E99`): timestamps and hints; never lighter-weight text below 11px.

### Status
- **Yeşil** (`#4ADE80` / `#86EFAC`): Online dot, "Kabul edildi", the deal card, safety shield icon.
- **Kırmızı soluk** (`#FCA5A5`): Errors and delete confirmation only.

### Named Rules
**The One Light Rule.** Violet is the only accent hue. Copper, amber, teal and the old "stüdyo" orange (`kor`) are legacy tokens still present in `src/index.css`; they are not used on new surfaces.

**The Green Means Agreed Rule.** Green appears only for presence and agreement. It is never decoration.

## Typography

**Font:** Plus Jakarta Sans Variable everywhere (`--font-sans`, `--font-pjs`). JetBrains Mono only for literal code and technology tags.

**Character:** Medium-weight, slightly tight display type (the hero sets 89/90 at weight 500 on a 1280px reference), with bold, tightly tracked headings inside the product. Body copy is plain and readable in Turkish.

### Hierarchy
- **Display:** Hero headline only; scales with the hero's `--u` unit.
- **Headline:** Section and page headings, 600 to 800 weight, tracking around -0.03em. Lines reveal through a mask (`SatirBaslik`, `.uz-ln`).
- **Title:** Card and list titles, names in chat (15 to 19px, bold).
- **Body:** 14.5px for messages and form text, line-height 1.5.
- **Small:** 11 to 13.5px for meta, hints, timestamps. Counts use `tabular-nums`.

### Named Rules
**The Heading Stands Alone Rule.** No eyebrow or kicker above a heading.

**The Real Number Rule.** Counts come live from Supabase and use tabular numerals; if unreachable they show "—".

## Layout

Content pages sit in a 1280px container with 16px gutters (24px from `sm`). The home page uses full-bleed sections; text above full-screen 3D gets `z-index: 6`, the shared canvas sits at 5. Product pages (panel, offers, listings) use a 2xl to 3xl column of glass cards.

The messages page is an app shell that fills the viewport under the navbar: a 340 to 360px conversation list, a chat column whose content is capped at 760px, and a 340px details panel from 1280px up (a slide-in drawer below). Below `lg`, list and chat are separate screens with a back button.

## Elevation & Depth

Depth is light, not shadow stacks. Panels get a 1px white hairline at 7 to 12%, an inner top highlight (`inset 0 1px 0 rgba(255,255,255,.06 to .18)`), and, when they matter, a soft violet glow below (`0 10px 30px -12px rgba(139,92,246,.7)`). Glass (`backdrop-filter: blur(12 to 20px)`) is used where content actually passes underneath: sticky headers, the chat composer, popovers, incoming bubbles over the violet sky.

## Components

### Buttons
- **Primary (`.isik.isik-birincil` / `.uz-hap-birincil`):** white pill, near-black text. On hover a violet light follows the cursor and a diagonal sheen passes once.
- **Glass (`.isik-cam` / `.uz-hap-cam`):** dark translucent pill with a hairline; brightens on hover.
- **Violet (`.isik-mor`):** violet-tinted glass for strong secondary actions ("Mesaj gönder", "Mesajlaş").
- **Danger (`.isik-tehlike`):** red-tinted glass, only for reject/delete.
- Cursor position (`--x`, `--y`) is written by one global listener in `src/isikTakip.js`. `.isik` sets `position: relative`; wrap it if it must be absolutely positioned.

### Cards
- **`.isik-kutu`:** glass card with a hairline and a violet light that follows the cursor on hover. Links and buttons with this class lift 2px.
- **`.uz-panel`:** large 28px-radius panel with a violet glow from the top, used on the home page.

### Messages (`src/components/mesaj/`)
- **Own bubble:** violet gradient with a soft violet glow; **incoming bubble:** white 5.5% glass. 20px radius, the corner toward the sender tightens to 7px inside a group of consecutive messages.
- **Meta:** time and ticks float inside the bubble's bottom right (one tick delivered, two ticks seen).
- **Deal card ("Teklif kabul edildi"):** the one signature moment: green-to-violet light border, one light sweep on appearance, explicit copy that payment happens outside the site.
- **Contact card:** glass card with call, WhatsApp, e-mail and copy actions; only http(s) links are rendered.
- **Typing signal:** three violet dots in an incoming bubble.

### Navigation
The sticky navbar is near-black with a hairline; on the home page it hides until the hero is passed. The messages icon carries a violet unread badge.

## Motion

- One curve: `cubic-bezier(.16, 1, .3, 1)` (`--ease-cekic`). Controls 180 to 300ms, reveals 500 to 1050ms.
- Home page reveals: masked line rise (`.uz-ln`), blur lift (`.uz-sub`), settle (`.uz-otur`), quiet rise (`.uz-kalk`), triggered by `Sahne` when in view.
- Product pages keep motion small: a single entrance for new messages (rise, scale, de-blur), hover light on `.isik`.
- Every animation has a `prefers-reduced-motion` path that shows the finished state.

## Do's and Don'ts

### Do:
- **Do** build new surfaces on black with violet light, Plus Jakarta Sans, and the `.isik` / `uz-*` vocabulary.
- **Do** theme browser surfaces: selection, caret, scrollbars and focus rings use violet.
- **Do** keep payment honest: escrow does not exist; say "ödeme siteden yapılmaz" where deals happen.
- **Do** use authored SVG icons in one stroke weight (1.6px, round caps).

### Don't:
- **Don't** use the legacy copper, teal or "stüdyo" tokens on new work.
- **Don't** use gradient text, eyebrow labels, colored side borders thicker than 1px, or emoji as icons (emoji are fine as message reactions).
- **Don't** invent numbers, testimonials or logos.
- **Don't** open a second WebGL canvas on the home page; use drei `<View>` on the shared canvas.
