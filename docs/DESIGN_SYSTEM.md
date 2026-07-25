# Midnight Agent Control System

## Palette

| Token | Dark | Light |
|---|---|---|
| Background | `#080B12` | `#F6F8FC` |
| Surface | `#0C111B` | `#FFFFFF` |
| Cyan signal | `#3DE1FF` | `#007C99` |
| Violet support | `#8B5CF6` | `#6D3BE8` |
| Green status | `#80FFB2` | `#16834B` |
| Primary text | `#E7EDF7` | `#101828` |
| Muted text | `#8491A5` | `#526071` |

## Typography and spacing

SVG uses the system UI stack and a monospace fallback. No remote font is
required. Major labels use 14–42 px type; small operational labels never carry
essential meaning alone. Spacing follows an 8 px base with larger 28–40 px
content gutters.

## SVG components

- Every asset has explicit `width`, `height`, `viewBox`, `title` and `desc`.
- Corners use 13–22 px radii.
- Grid lines are low contrast and decorative.
- Cyan represents data flow; violet represents secondary coordination; green
  is reserved for verified or online state.

## Animation

Only two README regions may animate continuously: the Hero and Agent Swarm
map. Motion is slow, small and nonessential. Static positions remain meaningful
if GitHub strips animation, and `prefers-reduced-motion` disables it.

## Responsive behavior

SVGs scale through `width="100%"` and retain their `viewBox`. The Markdown
content does not depend on multi-column HTML or hover interactions, so it
remains usable at 320–390 px.
