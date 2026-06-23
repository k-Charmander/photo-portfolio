---
version: alpha
name: Figma-design-analysis
description: "A confident black-and-white editorial frame interrupted by oversized, hand-cut pastel color blocks. The marketing canvas is rigorously monochrome — figmaSans variable type, pure white surfaces, pure black ink, pill-shaped CTAs — while each story section drops the page into a saturated lime, lavender, cream, mint, or pink panel that reads like a sticky note placed on a clean desk. The result is a design system that feels both technical and joyful — a tool for serious work, made by people who like color."

colors:
  primary: "#000000"
  on-primary: "#ffffff"
  ink: "#000000"
  canvas: "#ffffff"
  inverse-canvas: "#000000"
  inverse-ink: "#ffffff"
  on-inverse-soft: "#ffffff"
  hairline: "#e6e6e6"
  hairline-soft: "#f1f1f1"
  surface-soft: "#f7f7f5"
  block-lime: "#dceeb1"
  block-lilac: "#c5b0f4"
  block-cream: "#f4ecd6"
  block-pink: "#efd4d4"
  block-mint: "#c8e6cd"
  block-coral: "#f3c9b6"
  block-navy: "#1f1d3d"
  accent-magenta: "#ff3d8b"
  semantic-success: "#1ea64a"
  overlay-scrim: "#000000"

typography:
  display-xl:
    fontFamily: figmaSans
    fontSize: 86px
    fontWeight: 340
    lineHeight: 1.00
    letterSpacing: -1.72px
    fontFeature: kern
  display-lg:
    fontFamily: figmaSans
    fontSize: 64px
    fontWeight: 340
    lineHeight: 1.10
    letterSpacing: -0.96px
    fontFeature: kern
  headline:
    fontFamily: figmaSans
    fontSize: 26px
    fontWeight: 540
    lineHeight: 1.35
    letterSpacing: -0.26px
    fontFeature: kern
  subhead:
    fontFamily: figmaSans
    fontSize: 26px
    fontWeight: 340
    lineHeight: 1.35
    letterSpacing: -0.26px
    fontFeature: kern
  card-title:
    fontFamily: figmaSans
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: 0
    fontFeature: kern
  body-lg:
    fontFamily: figmaSans
    fontSize: 20px
    fontWeight: 330
    lineHeight: 1.40
    letterSpacing: -0.14px
    fontFeature: kern
  body:
    fontFamily: figmaSans
    fontSize: 18px
    fontWeight: 320
    lineHeight: 1.45
    letterSpacing: -0.26px
    fontFeature: kern
  body-sm:
    fontFamily: figmaSans
    fontSize: 16px
    fontWeight: 330
    lineHeight: 1.45
    letterSpacing: -0.14px
    fontFeature: kern
  link:
    fontFamily: figmaSans
    fontSize: 20px
    fontWeight: 480
    lineHeight: 1.40
    letterSpacing: -0.10px
    fontFeature: kern
  button:
    fontFamily: figmaSans
    fontSize: 20px
    fontWeight: 480
    lineHeight: 1.40
    letterSpacing: -0.10px
    fontFeature: kern
  eyebrow:
    fontFamily: figmaMono
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.30
    letterSpacing: 0.54px
    fontFeature: kern
  caption:
    fontFamily: figmaMono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.00
    letterSpacing: 0.60px
    fontFeature: kern

rounded:
  xs: 2px
  sm: 6px
  md: 8px
  lg: 24px
  xl: 32px
  pill: 50px
  full: 9999px

spacing:
  hair: 1px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px
---

## Overview

Figma's marketing canvas is, at the system level, an editor-clean black-and-white frame.
The chrome — top nav, body type, footer, primary CTA — is monochrome. Headlines are oversized
`figmaSans` display type with aggressive negative tracking; body copy hovers around weight
320–340 of the same variable family; small mono eyebrows and captions (figmaMono, all-caps,
positive tracking) act as section markers. Every CTA is a pill.

What makes the design unique is what happens **between** those monochrome bookends: the page
repeatedly drops into oversized pastel **color-block sections** — lime, lavender, cream, mint,
pink, coral, and a deep navy — that span the full content width with 24px corners and 48px
interior padding. These blocks are where the storytelling lives. The page returns to white
canvas between every two blocks so each reads as deliberate.

**Key Characteristics:**

- Monochrome system core: black + white carry every CTA, body line, footer link.
- Oversized pastel color-block sections define the narrative rhythm of long-form pages.
- Pill is the only button shape; circular for icon buttons. No square buttons.
- `figmaSans` variable type at fine weight increments (320–540, 700) — a single voice that flexes.
- Tight negative letter-spacing on display sizes creates a confident editorial cadence.
- `figmaMono` reserved for eyebrows and captions — uppercase, positive tracking.
- No shadows/gradients: color blocks substitute for elevation.

### Note on Font Substitutes

If implementing without figmaSans / figmaMono, suitable open-source substitutes are **Inter**
(or **Pretendard** for Korean + Latin) for the sans, and **JetBrains Mono** for the mono.

## Do's and Don'ts

### Do

- Reserve black for genuine primary CTAs and selected states.
- Give each story section ONE color block, full content width, 24px corners, 48px padding.
- Hierarchy on body copy comes from weight, not size or opacity.
- Use mono only for eyebrows and captions, always uppercase.
- Compose every CTA as a pill, every icon button as a circle.
- Return to white canvas between every two color blocks.

### Don't

- Don't introduce mid-gray text — weight carries hierarchy.
- Don't add drop shadows to color-block sections — color is the depth device.
- Don't show more than one color block inside a single viewport.
- Don't square off CTAs. Don't set body copy in mono.
