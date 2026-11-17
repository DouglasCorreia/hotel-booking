---
name: Lumina Hospitality
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2f1500'
  on-tertiary-container: '#c76c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Montserrat
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Montserrat
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Montserrat
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  numeric-stat:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the warmth of luxury hospitality paired with the effortless precision of a modern booking engine. It fuses contemporary editorial minimalism with understated tactile warmth, drawing inspiration from high-end travel journals, boutique hotel lobbies, and refined digital booking interfaces.

### Core Attributes
- **Sophisticated & Cultivated:** Clean structural layouts, generous negative space, and disciplined typographic hierarchy convey confidence and discretion.
- **Warm & Welcoming:** Golden amber accents and warm neutral surfaces balance technical clarity with inviting hospitality.
- **Trustworthy & Transparent:** Clear price breakdowns, unambiguous availability indicators, and legible typography ensure low-friction, high-confidence decision making.

### Target Audience
Discerning leisure and business travelers seeking curated boutique stays, luxury apartments, and premium hotel experiences who expect seamless navigation, transparent pricing, and instant peace of mind.

## Colors

The color architecture is built around deep maritime tones, vivid structural blues, and rich amber accents. 

### Role Allocations
- **Primary (`#0F172A` - Midnight Slate):** Used for primary headings, high-contrast actions, key navigation anchors, and dominant interactive states. It grounds the UI in a feeling of permanence and authority.
- **Secondary (`#2563EB` - Sapphire Accent):** Drives high-intent interactive states, links, map pin selections, progress indicators, and active search filters.
- **Tertiary (`#D97706` - Warm Amber):** Reserved strictly for ratings, verification seals, scarcity warnings, and loyalty status markers.
- **Neutrals & Surfaces:**
  - Base Canvas: `#F8FAFC`
  - Elevated Container / Card Fill: `#FFFFFF`
  - Subtle Borders & Separators: `#E2E8F0`
  - Secondary Text / Metadata: `#64748B`
  - Tertiary / Placeholder Text: `#94A3B8`
- **Feedback & Semantics:**
  - Success: `#059669` (Emerald) for instant booking confirmation and free cancellation highlights.
  - Warning / Scarcity: `#D97706` (Amber) for remaining room counters.
  - Error: `#DC2626` (Crimson) for validation failures and non-refundable alerts.

## Typography

Montserrat governs the entire typographic system, offering rhythmic geometric clarity, open counters for enhanced mobile legibility, and humanist nuances that soften utility pages into editorial content.

### Hierarchy & Style Rules
- **Display & Main Titles:** Display levels employ tight negative tracking (`-0.025em`) to impart editorial weight and gravitas in search headers and landing heroes.
- **Numbers and Ratings:** Currency, nightly rates, and score badges make use of numeric tabular spacing where available to maintain linear alignment across grid views.
- **Micro-Copy & Utility Labels:** Badges, tags, and scarcity tickers use `label-sm` with slight uppercase letter-spacing to ensure crisp scanability without visual clutter.

## Layout & Spacing

The system follows an 8-point geometric scale, combined with a 12-column responsive fluid grid designed to frame photography and pricing units with editorial discipline.

### Grid & Breakpoints
- **Desktop (1200px+):** 12 columns, 24px (`1.5rem`) gutters, dynamic outer margin maxing out content at 1280px or 1440px wide. Accommodates search filters alongside room inventory listings.
- **Tablet (768px – 1199px):** 8 columns, 20px gutters, 32px canvas margins. Modals switch to slide-overs or stacked bottom sheets.
- **Mobile (320px – 767px):** 4 columns, 16px (`1rem`) gutters, 20px (`1.25rem`) side margins. Hotel listings, photo galleries, and booking summaries reflow to full-width horizontal cards or swipeable carousels.

### Layout Principles
- Use `space-md` for standard component interior padding (card bodies, list tiles).
- Apply `space-lg` to separate discrete functional clusters (pricing tier from amenity lists).
- Apply `space-xl` strictly between major page blocks (gallery breakdown, room types section, guest review sections).

## Elevation & Depth

Visual hierarchy uses a refined hybrid approach: clean structural borders paired with ultra-diffused, ambient drop shadows. Glassmorphism is utilized conservatively for floating filters and sticky booking summaries.

### Depth Levels
- **Level 0 (Flat / Canvas):** Neutral `#F8FAFC` base surface, relying on thin 1px `#E2E8F0` hairline dividers for clean section separation.
- **Level 1 (Card / Resting Surface):** `#FFFFFF` surfaces with a 1px border (`#E2E8F0`) and an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hover / Active Listing):** Dynamic card lift on hover: `0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` with a subtle border darkening to `#CBD5E1`.
- **Level 3 (Sticky Booking Bars & Floating Modals):** Semi-transparent `#FFFFFF` (92% opacity) with `backdrop-filter: blur(12px)`, bordered by `#E2E8F0`, elevated by `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)`.

## Shapes

The roundedness language is calibrated to Level 2 (standard base radius of `0.5rem` / 8px). This creates an architectural, contemporary look that is neither overly aggressive nor toy-like.

### Radius Assignments
- **Base Components (`0.5rem` / 8px):** Input fields, room thumbnail previews, buttons, dropdown panels, and checkout breakdown boxes.
- **Large Surfaces (`1rem` / 16px):** Primary hotel listing cards, confirmation vouchers, photo gallery grids, and modal dialogs.
- **Pill Contours (`9999px`):** Rating badges (`9.4 Fantástico`), amenity tags, scarcity badges, and circular slider arrows.

## Components

### Buttons
- **Primary:** Background `#0F172A`, text `#FFFFFF`, radius 8px, hover background `#1E293B`, subtle tap transition.
- **Secondary / Action:** Background `#2563EB`, text `#FFFFFF`, radius 8px, used for conversion steps ("Reservar Agora").
- **Tertiary / Outlined:** Background transparent, 1px border `#E2E8F0`, text `#0F172A`, hover background `#F8FAFC`.

### Rating Pills & Badges
- **Rating Score Pill:** Pill shape with `#0F172A` background, white bold score (`9.4`), paired alongside descriptive sentiment ("Fantástico", "Excepcional") in `#0F172A` with review count in `#64748B`.
- **Scarcity Badges:** Pill shape with `#FEF3C7` fill and `#D97706` text/border icon ("Apenas 1 quarto disponível neste valor").
- **Loyalty & Gold Seals:** `#FFFBEB` fill, `#B45309` text, framed with a 1px border in `#FDE68A`.

### Amenity Tags & Chips
- Compact pill or 6px-rounded badge, background `#F1F5F9`, text `#334155`, font `label-md`. Accompanied by monochrome micro-icons (e.g., Wi-Fi, Café da manhã, Piscina, Estacionamento).

### Input Fields & Search Bars
- Single line heights of 48px to 56px, background `#FFFFFF`, border 1px `#E2E8F0`. Focused state uses 1px solid `#2563EB` with an ambient glow (`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`).

### Room Cards with Price Breakdown
- Horizontal layout on desktop, stacked on mobile. Fixed image aspect ratio (`16:10` or `4:3`).
- Clear visual hierarchy separating room name (`headline-sm`), cancellation policy in `#059669` (Emerald), and a right-aligned price summary container highlighting the nightly rate, subtotal, and tax inclusions in muted text.

### Checkout Steppers
- Linear minimal sequence: step markers with numbers or checkmarks. Inactive steps in `#94A3B8`, active steps in `#2563EB` with bold label, completed steps in `#0F172A` with an emerald completion tick.

### Confirmation Cards & Digital Vouchers
- Styled like an understated luxury boarding pass or itinerary document: `#FFFFFF` card with Level 2 elevation, dashed tear-off divider line, booking reference ID displayed in monospaced or tabular numbers, integrated QR code module, and calendar export triggers.