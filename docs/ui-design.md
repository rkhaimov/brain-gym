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
- The production logo source is `src/client/assets/ceramics-logo.png`; reuse this application asset instead of redrawing the mark.
- The production browser favicon source is `src/client/assets/ceramics-favicon.png`; reuse it for favicon and browser metadata.
- Standardize on one silhouette across the sidebar, startup screen, favicon, and application metadata.
- Render the mark as a terracotta ceramic shape with the source artwork's subtle modeled shading, without an outline or added illustration.
- The hanging hole is the mark's only internal detail and must remain visibly open at 16 × 16 px.
- Preserve a simple silhouette that reads as both handmade pottery and ceramic jewelry at small sizes.
- Use the mark alone for the favicon and beside the name at 28–32 px in the application shell.
- Keep charts, currency symbols, checkmarks, letters, and inventory imagery outside the logo.
- Treat the logo as a brand asset; ordinary interface icons come from the icon system below.
- Preserve the raster assets' approved terracotta color, lighting, ceramic texture, clean edges, and transparent background without applying filters or recoloring them.

## Color system

### Core tokens

Exact color values live in the semantic theme variables in `src/client/styles.css`. Documentation owns their meaning; component variants own interaction-state treatment such as hover and pressed emphasis.

| Role | Theme variable | Use |
| --- | --- | --- |
| Primary clay | `--primary` | Primary actions, active navigation, selected controls, links |
| Primary foreground | `--primary-foreground` | Text and icons on primary clay |
| Primary soft | `--secondary`, `--accent` | Active navigation and selected-control backgrounds |
| Focus clay | `--ring` | Focus rings and non-text focus emphasis |
| Application background | `--background` | Page background |
| Surface | `--card` | Cards, sidebar, dialogs, and forms |
| Border | `--border` | Dividers, table rules, and control borders |
| Text | `--foreground` | Primary text |
| Muted text | `--muted-foreground` | Secondary labels and supporting copy |
| Success olive | `--success` | Confirmed mappings, active states, successful imports |
| Warning amber | `--warning` | Unmapped listings and warnings |
| Destructive red | `--destructive` | Errors and destructive actions |

Keep destructive red distinct from terracotta so the primary color retains its brand and selection meaning.

### Semantic use

- Warm neutral surfaces dominate each screen; color highlights state and action.
- Terracotta identifies the primary action or current selection.
- Olive communicates successful, active, mapped, or confirmed state.
- Amber communicates an Unmapped listing or another state requiring attention.
- Destructive red communicates failure, invalid data, or destructive intent.
- A status keeps the same semantic color throughout navigation, forms, tables, and badges.

## Icon system

- Use the Lucide icons supplied by shadcn/ui for ordinary interface icons.
- Keep shadcn/ui's default icon sizes and stroke treatment. Select a documented component size or variant instead of applying one-off icon dimensions; direct decorative icons use their default size unless a requirement establishes another treatment.
- Keep navigation icons outlined in every state; active state is communicated through foreground and background color.
- Keep visible text labels beside navigation icons.
- Give every application-owned icon-only action an accessible name and a tooltip. Preserve the accessible upstream behavior of standard generated primitive controls, such as a dialog's close action, without wrapping or restyling them solely to add a tooltip.
- Prefer accessible role-and-name locators in tests; add a stable test identifier only when a meaningful accessible locator is unavailable.
- Use a custom SVG only for the application logo or a genuinely domain-specific ceramic illustration.

## Typography and density

- Use the locally bundled **PT Sans** family for the Russian interface. Load its Cyrillic and Latin glyphs at the native 400 and 700 weights; do not synthesize intermediate weights.
- Start with shadcn/ui's default typography, spacing, control heights, and density. Use the documented component variants before adding local classes.
- Use 700 for the application lockup and page-level emphasis where shadcn/ui does not provide a semantic primitive.
- Keep secondary copy dark enough to read comfortably. Do not reduce disabled or secondary navigation opacity on top of the muted-text color.
- Follow the official shadcn dashboard example for the shell, navigation, page header, cards, and tabular content.

## Forms and dialogs

- Open create and edit entity forms in a centered modal dialog. Keep search, filters, and lightweight controls inline.
- Compose forms from the shadcn/ui `Dialog`, `Field`, `Input`, `Button`, and `Alert` primitives without changing their default style or behavior.
- Give every dialog a visible title, concise explanation, accessible close action, labelled controls, and explicit primary and secondary actions.
- Autofocus the first meaningful field and return focus to the invoking control after dismissal.
- Keep a dialog open for validation and unexpected errors. Close it only after a confirmed successful mutation or when the person deliberately cancels; value retention and clearing follow the shared Form draft contract once the consuming ticket adopts it.
- Disable dismissal while a mutation is pending so a committed result cannot outlive an abandoned form.

## Visual character

- The application should feel warm, handmade, calm, and practical rather than like generic accounting software.
- Use white or warm-white cards over the warm application background, with shadcn/ui's default borders, shadows, and radii.
- Preserve the mockups' strong black headings, compact tabular data, generous whitespace, and restrained use of decorative color.
- Use the official shadcn dashboard example as the baseline composition and generated shadcn/ui components as the default building blocks.
- Keep generated primitives under `src/client/components/ui`; application components consume them through the `@/client/components/ui/*` alias. Use `@/*` for source imports and `@artefacts/*` for tracked assets.
- Express the Ceramics identity through semantic theme variables in `src/client/styles.css`, the approved logo, Russian copy, and domain content. Do not change a generated component's default styles or behavior without explicit approval.

## Dashboard source and adoption policy

- Use shadcn/ui `dashboard-01` at commit [`6261bd89f72d794aea491482cc2acfd8dc3d63e2`](https://github.com/shadcn-ui/ui/tree/6261bd89f72d794aea491482cc2acfd8dc3d63e2/apps/v4/registry/new-york-v4/blocks/dashboard-01) as the pinned source for the desktop shell, navigation, header, content spacing, tables, and button placement.
- Copy only the markup and classes required by a working application flow. Do not install the complete block or retain its demo data, placeholder controls, charts, drag-and-drop, sorting, pagination, user menu, or other unused behavior.
- Keep generated shadcn/ui primitives behaviorally and visually upstream-shaped. Limit local changes to repository formatting and lint compatibility, Russian accessible labels, semantic theme variables, and approved application identity.
- Application-owned layout targets the fixed desktop presentation. Do not add responsive variants until a product requirement needs them; responsive behavior internal to a generated primitive may remain.
- Add a navigation destination only when its route works. Add a primitive only when the same ticket consumes it.
- Compose a screen directly from generated primitives until a second real use case demonstrates that a shared application module would provide leverage.

## Approved mockups

The local `artefacts` directory contains the approved analytics, Product-mapping, and Report-flow mockups. Use `app-showcase-report-flow.png` as the current Report-flow reference; the file with the `-original` suffix records the earlier version.

The mockups establish composition and visual character. This document governs the normalized application name, logo treatment, color tokens, semantic color use, and icon conventions when mockup details differ.

The Report-flow mockup's manual file-selection and editable import-review screens are superseded by ticket 09. The current flow is the explicit Yandex Mail action above the Outlets catalog, followed by an inline success, no-new-files, or destructive failure summary.
