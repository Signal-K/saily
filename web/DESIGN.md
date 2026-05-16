---
# Glacier Tactical Design System
# Structured design tokens for The Daily Sail (Saily)

colors:
  background:
    light: "#f7f9fb"
    dark: "#001016"
  surface:
    light: "#f7f9fb"
    dark: "#00141b"
    bright:
      light: "#f7f9fb"
      dark: "#00252e"
    dim:
      light: "#d8dadc"
      dark: "#001016"
  container:
    lowest:
      light: "#ffffff"
      dark: "#000c11"
    low:
      light: "#f2f4f6"
      dark: "#001c24"
    medium:
      light: "#eceef0"
      dark: "#00252e"
    high:
      light: "#e6e8ea"
      dark: "#002f3a"
    highest:
      light: "#e0e3e5"
      dark: "#003946"
  primary:
    base:
      light: "#006686"
      dark: "#52f2f5"
    container:
      light: "#7dd3fc"
      dark: "#00d0d3"
    fixed-dim:
      light: "#7bd1fa"
      dark: "#008284"
  secondary:
    base: "#006591"
    container: "#39b8fd"
  tertiary:
    base: "#835500"
    container: "#febc60"
  status:
    error: "#ba1a1a"
    stable: "#006686"
    ready: "#0ea5e9"
    standby: "#64748b"
  content:
    on-surface:
      light: "#191c1e"
      dark: "#d9eff8"
    on-surface-variant:
      light: "#3f484e"
      dark: "#a0b6bf"
    outline: "#6f787e"
    outline-variant:
      light: "#bec8ce"
      dark: "rgba(217, 239, 248, 0.15)"

typography:
  fonts:
    brand: "Playfair Display, serif"
    headlines: "Inter, sans-serif"
    body: "Inter, sans-serif"
    data: "Space Grotesk, monospace"
  scales:
    display:
      size: "3rem"
      weight: "900"
      letter-spacing: "-0.04em"
      case: "uppercase"
    headline:
      size: "1.5rem"
      weight: "700"
      letter-spacing: "-0.02em"
    technical:
      size: "0.75rem"
      weight: "700"
      letter-spacing: "0.08em"
      case: "uppercase"
    body:
      size: "1rem"
      line-height: "1.5"
    data-label:
      size: "0.65rem"
      weight: "700"
      letter-spacing: "0.15em"
      case: "uppercase"

spacing:
  base: "4px"
  gutter: "16px"
  margin: "32px"
  container-max: "1040px"

radii:
  none: "0px"
  small: "2px" # Reserved for specific interactive elements

shadows:
  header: "0 16px 32px rgba(0, 0, 0, 0.04)"
  card: "0 14px 32px rgba(2, 132, 199, 0.06)"
  glow: "0 0 12px color-mix(in oklab, var(--primary) 30%, transparent)"

motion:
  standard: "0.15s ease"
  quick: "0.1s ease"

---

# Glacier Tactical

Glacier Tactical is a high-precision design system built for **The Daily Sail**, a citizen science platform for space exploration and astronomical analysis. It balances the cold, professional efficiency of a research laboratory with the high-stakes clarity of a mission control center.

## Design Philosophy

### The "No-Line" Rule
Instead of heavy borders, Glacier Tactical uses **tonal layering** to define hierarchy. Surfaces are nested within each other using subtle shifts in background color (Container Low to Container High). Borders, when used, are often "Ghost Borders"—highly transparent or mix-color lines that provide structure without visual noise.

### Technical Precision
The interface is intentionally sharp. A `0px` border radius is applied globally to evoke the feeling of specialized hardware and rigid data panels. Every element is designed to look like a "readout," using the **Space Grotesk** typeface for labels, IDs, and metrics.

### Tactical Decorations
- **Corner Brackets:** Panels and headers often feature "bracket corners," decorative L-shaped marks that simulate a camera viewfinder or a sensor lock-on.
- **Coordinate Grids:** The global background utilizes a fixed 20px radial-dot grid, reinforcing the sense of an active workspace or drafting table.
- **Scanlines:** Interactive data visualizations (like Lightcurves) may employ a subtle horizontal scanline overlay to suggest real-time satellite transmission.

## Component Archetypes

### The Command Shell
The site header is a frosted, translucent bar (`backdrop-filter: blur(12px)`) that floats at the top of the interface. It contains the italicized **Playfair Display** brand mark, contrasting scientific utility with editorial elegance.

### Action Panels (Buttons)
Buttons are sharp, uppercase, and highly tracked. A "Primary Action" uses the high-contrast Glacier Blue (`--primary`), while "Technical Actions" often use the Ghost Border style, only revealing their full presence on hover through tonal shifts or subtle glows.

### Mission Briefing Mode
Content-heavy narrative updates switch to a more focused layout. Large, 900-weight headers dominate the space, while personnel IDs and mission arcs provide context in a sidebar-style vertical layout.

## Accessibility & Theming
Glacier Tactical supports a native **Dark Tactical** mode. In this mode, the palette shifts from "Glacier Blue" to a luminous "Signal Cyan," optimizing legibility for low-light environments typical of observatory control rooms. High contrast is maintained for all data readouts to ensure critical information is never lost.
