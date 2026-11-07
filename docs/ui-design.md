# Ceramics UI Design

This document is the source of truth for the application's identity and visual language. Use it when implementing or reviewing any user interface.

## Application identity

| Role | Value |
| --- | --- |
| Technical slug | `ceramics-ledger` |
| Russian UI name | Керамика |
| Russian subtitle | Учёт продаж и остатков |

The standard sidebar lockup is the logo mark followed by the Russian name and subtitle:

```text
[mark] Керамика
       Учёт продаж и остатков
```

The Russian interface uses the Russian name. English documentation may use **Ceramics**. The technical slug is for package and artifact identifiers, not visible UI copy.

## Logo

- The selected logo direction is the **pendant vessel**: a small rounded ceramic vessel silhouette with one circular negative-space hanging hole near the top.
- The production logo source is `artefacts/ceramics-logo.svg`; reuse this asset instead of redrawing the mark.
- The production browser favicon source is `artefacts/ceramics-favicon.svg`; reuse it for favicon and browser metadata generation.
- Standardize on one silhouette across the sidebar, startup screen, favicon, and application metadata.
- Render the mark as a solid, single-color terracotta shape without an outline or internal illustration.
- The hanging hole is the mark's only internal detail and must remain visibly open at 16 × 16 px.
- Preserve a simple silhouette that reads as both handmade pottery and ceramic jewelry at small sizes.
- Use the mark alone for the favicon and beside the name at 28–32 px in the application shell.
- Keep charts, currency symbols, checkmarks, letters, and inventory imagery outside the logo.
- Treat the logo as a brand asset; ordinary interface icons come from the icon system below.
- The SVG assets use a flat `#B15A3B` fill with no gradient, lighting, shadow, texture, or raster edge artifacts.

## Color system

### Core tokens

| Token | Value | Use |
| --- | --- | --- |
| Primary clay | `#B15A3B` | Primary actions, active navigation, selected controls, links |
| Primary hover | `#98462F` | Hover and pressed emphasis |
| Primary soft | `#F3DED5` | Active navigation and selected-control backgrounds |
| Focus clay | `#D58A70` | Focus rings and non-text focus emphasis |
| Application background | `#FBF8F5` | Page background |
| Surface | `#FFFDFC` | Cards, sidebar, dialogs, and forms |
| Border | `#DED7D1` | Dividers, table rules, and control borders |
| Text | `#1C1917` | Primary text |
| Muted text | `#6B625D` | Secondary labels and supporting copy |
| Success olive | `#6A7652` | Confirmed mappings, active states, successful imports |
| Success soft | `#E8EDDF` | Success badges and status surfaces |
| Warning amber | `#B7791F` | Unmapped listings and warnings |
| Warning soft | `#FFF0CF` | Warning badges and status surfaces |

Primary clay with white text has sufficient contrast for ordinary button text. Use a distinct destructive red for errors and destructive actions so terracotta retains its brand and selection meaning.

### Semantic use

- Warm neutral surfaces dominate each screen; color highlights state and action.
- Terracotta identifies the primary action or current selection.
- Olive communicates successful, active, mapped, or confirmed state.
- Amber communicates an Unmapped listing or another state requiring attention.
- Destructive red communicates failure, invalid data, or destructive intent.
- A status keeps the same semantic color throughout navigation, forms, tables, and badges.

## Icon system

- Use `lucide-react` inline SVG components for ordinary interface icons.
- Use 18 px icons in sidebar navigation, 16 px icons in controls and tables, and 20–24 px icons in metric cards and empty states.
- Use a consistent 1.75 stroke width, rounded line caps, and `currentColor`.
- Keep navigation icons outlined in every state; active state is communicated through foreground and background color.
- Place metric icons inside the softly tinted circular containers established by the approved mockups.
- Keep visible text labels beside navigation icons.
- Give every icon-only action an accessible name and a tooltip.
- Prefer accessible role-and-name locators in tests; add a stable test identifier only when a meaningful accessible locator is unavailable.
- Use a custom SVG only for the application logo or a genuinely domain-specific ceramic illustration.

## Visual character

- The application should feel warm, handmade, calm, and practical rather than like generic accounting software.
- Use white or warm-white cards over the warm application background, fine neutral borders, restrained shadows, and moderately rounded corners.
- Preserve the mockups' strong black headings, compact tabular data, generous whitespace, and restrained use of decorative color.
- Use shadcn/ui components with minimal structural customization; express the identity primarily through tokens, spacing, the logo, and semantic icon treatment.

## Approved mockups

The local `artefacts` directory contains the approved analytics, Product-mapping, and Report-flow mockups. Use `app-showcase-report-flow.png` as the current Report-flow reference; the file with the `-original` suffix records the earlier version.

The mockups establish composition and visual character. This document governs the normalized application name, logo treatment, color tokens, semantic color use, and icon conventions when mockup details differ.

