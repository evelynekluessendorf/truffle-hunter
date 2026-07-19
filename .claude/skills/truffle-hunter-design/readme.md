# Truffle Hunter Design System

## Context

Truffle Hunter is a campus proximity app: students toggle their availability, see open peers nearby on a live map, and walk over to say hi in person. Deliberately **no chat, no feed, no matching algorithm** — the app is a light utility meant to be checked and closed quickly, not a place to linger. Built as a React Native mobile app. Tone: playful and warm, but calm — never noisy or gamified.

## Sources provided

- One reference image: `uploads/image-3-2.png` — a banana-themed onboarding/sign-up flow, supplied **only as an illustration-technique reference**: thick ink outlines, offset color fills (a duplicate shape shifted behind the flat fill), flat backgrounds, outlined pill buttons. Its banana motif and yellow/pink palette were intentionally **not** reused.
- No codebase, Figma file, or existing product screenshots were attached. Every screen, component, color, and type choice below is originated for this brief rather than copied from an existing Truffle Hunter product. If a codebase or Figma library exists, attach it and this system should be reconciled against it as the source of truth.
- No logo was supplied — the wordmark "Truffle Hunter" is rendered in type (Fredoka) everywhere a mark would go. Do not invent a logo mark; ask the user for one.

## Index

- `styles.css` — root stylesheet, import-only. Pulls in `tokens/*.css`.
- `tokens/` — colors, typography, spacing, radius, shadows, motion, icon font, fonts, base resets.
- `components/` — 17 React primitives across 8 directories: `buttons/` (Button, IconButton), `inputs/` (Input, Select), `toggles/` (Checkbox, Radio, Switch), `feedback/` (Badge, Tag, Tooltip, Toast), `dialog/` (Dialog), `navigation/` (Tabs), `social/` (Avatar, StatusPill, MapMarker), `card/` (Card).
- `guidelines/` — foundation specimen cards (colors, type, spacing, radius, shadow, illustration technique).
- `ui_kits/mobile-app/` — click-through recreation of the core app flow (onboarding → map → peer detail → profile).
- `thumbnail.html` — homepage tile.
- `SKILL.md` — portable skill file for Claude Code.

### Components
Button, IconButton, Input, Select, Checkbox, Radio, Switch, Badge, Tag, Tooltip, Toast, Dialog, Tabs, Avatar, StatusPill, MapMarker, Card.

**Intentional additions** (no source library existed, so a standard set was authored, plus two product-specific primitives): `StatusPill` (compact available/not-around readout for list rows) and `MapMarker` (peer pin for the live map) — both central to a proximity app and without an equivalent in a generic UI kit.

## Content fundamentals

- **Voice**: second-person, direct, short sentences. "Toggle on when you have a free 20 minutes." Never third-person marketing voice.
- **Casing**: sentence case everywhere — buttons, headings, labels. No ALL CAPS except tiny uppercase micro-labels (timestamps, section eyebrows) at reduced size/opacity, and never full sentences.
- **No emoji.** The product is calm, not cute-performative; emoji would undercut that.
- **Brevity as a feature**: copy should read like a text from a friend, not app marketing. "You're visible on the map." not "You have successfully enabled your availability status."
- **Avoid social-app language** that implies chat/feeds/matching (no "match", "like", "connect", "friend request"). Use "say hi", "walk over", "around", "nearby".
- **Numbers stay concrete and small**: "120m away", "visible for 30 min" — proximity and time, not stats/streaks/counts that gamify.

## Visual foundations

- **Palette**: sourced from the Figma "Meex designs" token file (see Color update log below). Piggy pink (`--color-primary`) is the primary action color; keyline purple (`--color-secondary`, also the ink/outline/text color) anchors borders and dark surfaces; coral (`--p-accent-coral`) is available for accent use; sunny yellow (`--color-accent`, `--status-available-tint`/`--status-available`) is reserved specifically for "available" status — don't reuse it elsewhere, so the map/status meaning stays unambiguous. Background is warm cream (`--color-cream`), never pure white or gray.
- **Type**: Fredoka (rounded, friendly, geometric) for display/headings/buttons/labels; Plus Jakarta Sans for body copy and form fields. Both are Google Fonts substitutions — see Fonts note below.
- **Spacing**: 4px base scale (`--space-1`…`--space-10`, 4→72px). Generous padding inside pills/cards; nothing feels cramped.
- **Corner radii**: buttons and pills are fully rounded (`--radius-pill`); cards use a generous `--radius-lg` (24px); small controls use `--radius-sm`/`--radius-md`. Nothing is sharp-cornered — softness signals "calm/friendly".
- **Outlines over shadows-for-elevation**: every interactive surface (button, input, card, avatar, map marker) carries a thick 2.5px keyline-purple outline (`--border-thick`), matching the illustration reference's line weight. This is the system's signature move — depth comes from outline + a **hard, unblurred offset shadow** (`--shadow-flat-*`: e.g. `3px 3px 0 rgba(32,22,66,0.18)`), never a soft blurred drop shadow. Buttons flatten their offset shadow to 0/0 on press, simulating physical push.
- **Backgrounds**: flat color only. No gradients, no photography-heavy hero treatment, no repeating texture/pattern. The map view is the one exception (a real map surface).
- **Animation**: standard eases (`--ease-standard`) for most transitions (fades, focus rings); a bouncy overshoot ease (`--ease-bounce`) is reserved for the availability Switch thumb and map marker pulse — small, delightful confirmations, used sparingly, never on navigation or content transitions (keeps the calm feel).
- **Hover state**: subtle `brightness(1.06)` filter lift, no color swap.
- **Press state**: offset shadow collapses to 0 and the element translates into its own shadow (physical "push down" feel), not a scale/shrink.
- **Borders/dividers**: thin 1.5px ink-faint lines for internal list dividers; thick 2.5px ink for component outlines.
- **Transparency/blur**: only on modal scrims (45% ink overlay behind Dialog). No frosted-glass/backdrop-blur elsewhere.
- **Imagery**: warm-toned when present; no imagery assets were supplied (see Iconography/Assets below) — placeholders should be used, not generated photography.
- **Cards**: flat cream/white surface, thick ink border, hard offset shadow, generous radius — no colored left-border accent (explicitly avoided).

## Iconography

- No icon set or codebase was provided. Icons are sourced from **Phosphor Icons** (Bold + Fill weights) via CDN, chosen because its consistent stroke weight and available filled variant match the illustration reference's thick-outline/flat-fill technique. This is a **substitution** — flagging for the user in case a different icon set or custom icon font exists in the real product.
- Usage: Bold weight (`ph-bold`) for most UI glyphs (chevrons, close, bell, gear); Fill weight (`ph-fill`) for the MapMarker pin, where a solid glyph reads better at small size.
- No emoji, no unicode-character icons, no custom SVG icon set.

## Fonts

No brand font files were supplied. Substituted with Google Fonts:
- **Fredoka** (display/headings/buttons) — rounded geometric sans matching the "playful but calm" brief.
- **Plus Jakarta Sans** (body/UI text) — humanist, warm, highly legible at small sizes.

Flagging this substitution — if Truffle Hunter has brand typefaces, please share the font files (or names) and this system will be updated.

## Color update log

Colors were replaced per an attached Figma "Meex designs" token file: `tokens/color-primitives.css` holds the raw primitives (cream, white, piggy pink + bright, keyline purple, grays, accent coral + tint, sunny yellow + bright, black); `tokens/colors.css` aliases the system's semantic roles onto them — `--color-primary` → piggy pink, `--color-secondary` → keyline purple, `--color-accent`/status-available → sunny yellow (fill `#FFF1C6`, dot `#E8A33D`, per explicit instruction — never converted to pink). Terracotta, moss green, and gold from the original palette are fully retired. A few semantic tokens had no counterpart in the source file (tint/light variants of primary and secondary, danger/error color, a separate accent-dark) — these keep their prior values until real values are supplied.

## Assets

No logo, product screenshots, illustration art, or imagery were supplied. `assets/` is intentionally empty. Do not draw a logo or illustration from scratch on this brand's behalf — ask the user for real files. The `guidelines/illustration-technique.card.html` card documents the *technique* (outline + offset fill) referenced from the uploaded image, without reusing its banana motif or palette, for future illustration work.

## UI kit: mobile app

`ui_kits/mobile-app/` recreates the core flow described in the brief: sign-up/onboarding → live map (peers as MapMarkers, toggle availability) → tap a peer for a detail sheet → profile/settings. This is an **original interpretation** of the brief (no existing app screens were provided to copy structure from) — treat it as a starting proposal, not a recreation of ground truth.
