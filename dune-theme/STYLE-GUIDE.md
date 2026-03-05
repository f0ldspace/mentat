# Dune Theme - Style Guide

A dark, sci-fi dashboard aesthetic inspired by Dune. Desert warmth meets high-tech minimalism.

---

## Color Palette

### Backgrounds

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Deep Charcoal | `#0d0c0a` | `13, 12, 10` | Page background, deepest surface |
| Card Dark | `#13120f` | `19, 18, 15` | Card backgrounds, input fields, table rows |
| Card Hover | `#1e1b16` | `30, 27, 22` | Hover states, elevated surfaces |
| Secondary | `#151310` | `21, 19, 16` | Slightly lifted panels (schedule widget) |

### Borders

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Border | `#2a2520` | `42, 37, 32` | Standard borders, grid gaps, dividers |
| Border Strong | `#3d352a` | `61, 53, 42` | Emphasis borders, `//` prefix color, timestamps |
| Border Accent | `#4a3d28` | `74, 61, 40` | Decorative borders (header accents) |

### Text

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Sand (Primary) | `#e8dcc8` | `232, 220, 200` | Headings, stat values, primary body text |
| Warm Stone (Secondary) | `#a0916f` | `160, 145, 111` | Body text, card content, links (non-accent) |
| Desert Brown (Muted) | `#6b5d45` | `107, 93, 69` | Labels, placeholders, section headers, captions |

### Accents

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Sand Gold | `#c8a44e` | `200, 164, 78` | Primary accent: links, highlights, active states |
| Gold Dim | `#a07e2e` | `160, 126, 46` | Decorative accents, subtle gold elements |
| Gold Bright | `#e0be5a` | `224, 190, 90` | Emphasis, success states, bright highlights |
| Spice Orange | `#d4763a` | `212, 118, 58` | Secondary accent: warnings, tags, special markers |
| Spice Dim | `#a85a2a` | `168, 90, 42` | Subtle spice, deep orange tones |
| Error Red | `#a83a2a` | `168, 58, 42` | Error states, destructive actions |

### Selection

| Name | Value | Usage |
|------|-------|-------|
| Selection BG | `rgba(200, 164, 78, 0.2)` | Text selection background |
| Selection Text | `#e8dcc8` | Text selection foreground |

---

## Typography

### Font Stack

| Role | Font | Fallbacks | Weight |
|------|------|-----------|--------|
| Body | Inter | -apple-system, BlinkMacSystemFont, sans-serif | 300, 400, 500, 600 |
| Mono | JetBrains Mono | monospace | 400, 500 |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap
```

### Type Scale

| Element | Font | Size | Weight | Transform | Spacing | Color |
|---------|------|------|--------|-----------|---------|-------|
| Site title | Inter | 0.85rem | 300 | uppercase | 0.15em | `#e8dcc8` |
| Section header | JetBrains Mono | 0.6rem | 500 | uppercase | 0.15em | `#6b5d45` |
| Card header | JetBrains Mono | 0.6rem | 500 | uppercase | 0.15em | `#6b5d45` |
| Stat value | JetBrains Mono | 0.95rem | 500 | none | normal | `#e8dcc8` |
| Stat label | JetBrains Mono | 0.55rem | 400 | uppercase | 0.1em | `#6b5d45` |
| Body text | Inter | 0.8rem | 400 | none | normal | `#a0916f` |
| Timestamp | JetBrains Mono | 0.6rem | 400 | none | normal | `#3d352a` |
| Page title (h1) | Inter | 1.5rem | 300 | uppercase | 0.2em | `#e8dcc8` |

---

## Component Patterns

### Section Headers

All section headers use the `//` prefix pattern:

```
// SECTION NAME
```

- Font: JetBrains Mono, 0.6rem, weight 500
- Color: `#6b5d45` (muted)
- `//` prefix color: `#3d352a` (border strong)
- Transform: uppercase, letter-spacing 0.15em

CSS:
```css
.section-header {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #6b5d45;
}
.section-header::before {
  content: '//';
  color: #3d352a;
  margin-right: 0.5rem;
}
```

### Dashboard Grid

Cards sit in a grid with 1px gaps that expose the border color as visual separators:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #2a2520;        /* gap color = border */
  border: 1px solid #2a2520;
  border-radius: 2px;
  overflow: hidden;
}
.card {
  background: #13120f;
}
.card:hover {
  background: #1e1b16;
}
```

### Stat Cards

Small data display cells inside a grid:

```css
.stat {
  background: #0d0c0a;
  padding: 0.5rem;
  text-align: center;
}
.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  font-weight: 500;
  color: #e8dcc8;
}
.stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  color: #6b5d45;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### Borders & Radius

- All borders: `1px solid #2a2520`
- Border radius: `2px` (sharp, minimal)
- No dashed borders
- No rounded corners beyond 2px
- No box shadows or glow effects

### Links

```css
a {
  color: #c8a44e;
  text-decoration: none;
  border-bottom: 1px solid #c8a44e;
}
a:hover {
  border-bottom-color: transparent;
  background-color: rgba(200, 164, 78, 0.08);
  border-radius: 2px;
}
```

### Tags / Chips

```css
.tag {
  background: #0d0c0a;
  color: #6b5d45;
  padding: 0.15rem 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid #2a2520;
  border-radius: 2px;
}
```

### Tables

```css
table { border-collapse: collapse; border: 1px solid #2a2520; border-radius: 2px; }
thead tr { background: #13120f; }
th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b5d45;
}
tbody tr { background: #0d0c0a; }
tbody tr:hover { background: #13120f; }
td { color: #a0916f; font-size: 0.8rem; }
```

---

## Chart.js Theming

Apply these defaults before creating any Chart.js charts:

```js
Chart.defaults.color = '#6b5d45';
Chart.defaults.borderColor = '#2a2520';
Chart.defaults.elements.arc.borderColor = '#6b5d45';
Chart.defaults.elements.arc.borderWidth = 2;
Chart.defaults.scale.grid.color = '#2a2520';
Chart.defaults.scale.grid.drawBorder = false;
Chart.defaults.scale.ticks.color = '#6b5d45';
Chart.defaults.plugins.legend.labels.color = '#6b5d45';
```

Chart color palette (8 colors):
```js
['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7']
```

---

## Background Effects

### Grain Texture

SVG noise overlay at very low opacity, applied to `body::before`:

```css
body::before {
  content: "";
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.035;
  pointer-events: none;
  z-index: 1000;
}
```

### Dithered Background Image

- Process source image with Floyd-Steinberg dithering (monochrome)
- Apply contrast stretch + S-curve preprocessing
- Render at 0.5 scale
- Apply warm gold tint: `rgba(180, 150, 80, opacity)`
- Display at 12% opacity
- Fixed position, covers full viewport

### Sand Particles

- 40 particles drifting slowly across the viewport
- Color: `rgba(200, 164, 78, opacity)` with varying opacity (0.15-0.5)
- Size: 0.5-1.5px radius
- Movement: gentle horizontal drift with slight vertical oscillation

### Scanline Overlay

Subtle CRT-style scanlines:

```css
.scanline {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.03) 1px,
    rgba(0, 0, 0, 0.03) 2px
  );
  pointer-events: none;
  z-index: 999;
}
```

---

## CSS Custom Properties Reference

For use in CSS-variable-based systems. These map to the palette above:

```css
:root {
  --background-color: #0d0c0a;
  --text-color: #e8dcc8;
  --link-color: #c8a44e;
  --placeholder-color: #6b5d45;
  --border: solid 1px #2a2520;
  --selection-background: rgba(200, 164, 78, 0.2);
  --selection-text: #e8dcc8;
}
```

---

## Do / Don't

**Do:**
- Use monospace (JetBrains Mono) for labels, headers, data values, timestamps
- Use Inter for body text and longer content
- Use `//` prefix on section headers
- Use 1px gap grids for dashboard layouts
- Keep border-radius at 2px
- Use solid 1px borders
- Use subtle hover states (background shift, not color change)

**Don't:**
- Use serif fonts
- Use dashed or dotted borders
- Use rounded corners (>2px)
- Use box shadows or glow effects
- Use bright white anywhere
- Use Roman numerals for section numbering
- Use large font sizes for headers (keep them small, uppercase, monospace)
