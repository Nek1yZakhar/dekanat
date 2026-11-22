# User Interface & Frontend Invariants

## 1. Mobile-First & Desktop Ergonomics (Single-Scrollbar Policy)
- **Mobile-First Standard (360px Viewport)**:
  - All layouts, modals, tables, and cards MUST render without horizontal scroll or truncated text at a viewport width of 360px (`@media (min-width: 360px)`).
  - Touch targets for interactive elements (buttons, tab items, dropdown triggers) must have a minimum tap area of 44x44px.
- **Desktop Ergonomics (No Parasitic Vertical Scrollbars)**:
  - On desktop and laptop viewports (1366px – 1920px), pages MUST NOT spawn unnecessary right vertical scrollbars when content naturally fits in the viewport. Vertically constrain padding (`py-`, `my-`, `min-h-screen`, `pb-safe`) to prevent 1-5px overflow scrollbars.
  - Dual nested vertical scrollbars (`overflow-y: auto` inside a scrolling page container) are strictly prohibited.
  - Horizontal scrollbars on pill-filters, tags, and quick-prompt chips are banned. Use `scrollbar-none` or hidden native scroll.

## 2. Zero-Emoji Invariant (Strict Vector SVG Only)
- **Absolute Ban on Unicode Emojis**: Unicode emojis (📱, 👨‍🎓, 🏛️, 🏆, ⚠️, 🚀, 💬, etc.) are strictly forbidden in production HTML, JSX, status badges, headers, labels, and action buttons.
- **Semantic Vector Icons**: Every visual indicator, badge, and button icon must use pure inline SVG icons from `lucide-react` with explicit sizing and semantic coloring.

## 3. WCAG AA Color Contrast & Anti-Low-Contrast Badges
- **Minimum Contrast Ratio**: Text-to-background contrast must strictly meet or exceed 4.5:1.
- **Anti-Low-Contrast Policy**: Light text on light pastel backgrounds (e.g., green text `#22c55e` on light green `#dcfce7`, pale yellow on pale yellow) is strictly prohibited.
- **Status Badge Contract**:
  - *Success / Ready*: Deep dark emerald text (`text-emerald-800 dark:text-emerald-300`) on pastel background (`bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800`).
  - *Warning / In Progress / Caution*: Dark amber text (`text-amber-900 dark:text-amber-200`) on pastel amber background (`bg-amber-100 dark:bg-amber-950/60 border border-amber-300`).
  - *Danger / Debt / Rejected*: Dark crimson text (`text-rose-900 dark:text-rose-200`) on pastel red (`bg-rose-100 dark:bg-rose-950/60 border border-rose-300`).
  - *Informational / Secondary*: High-contrast neutral or slate tokens.
- **Semantic Tooltips (Living Semantic Triptych)**:
  - Status badges and warning icons (e.g., schedule room changes, academic risk) must provide an informative hover tooltip: (1) what occurred, (2) the underlying rule/source, (3) actionable next step for the student.

## 4. Active State SSoT & Synchronous Highlighting
- Every active navigation item in `mobile-nav.tsx`, day of the week selector in `/schedule`, semester filter in `/grades`, and moderation queue tab in `/staff` MUST have an unambiguous, high-contrast active state (`bg-primary text-primary-foreground` or prominent contrasting border/fill).
- Inactive items must maintain subtle muted styling and clearly differentiate from the active selection.

## 5. Staff Role Isolation (Zero Student Bleed)
- Staff users (`role === 'staff'`) must NEVER see student dashboards, student GPA metrics, diploma progress cards, or student schedules.
- Any attempt by an authenticated staff member to access `/dashboard`, `/grades`, `/schedule`, or `/ai` must trigger an automatic server-side or layout-level redirect to `/staff`.
- The staff header must display staff identity: *«Соколова Елена Павловна • Деканат (Модератор)»*, completely omitting student faculty/group identifiers and student navigation.

## 6. Zero Internal Jargon in UI (Sasha Standard)
- All UI copy must be written in pure, natural Russian without internal developer jargon, ticket IDs, or machine-translated buzzwords.
- Strictly forbidden in user-facing UI: `TICKET-04`, `Dual-Mode`, `Deep-Link`, `SSoT`, `Dashboard`, `Realtime`, `RAG` (use «Главная», «Синхронная очередь», «Ссылка для приложения», «Регуляторный ассистент»).
- Acronyms such as `БРС` (Балльно-рейтинговая система) and `GPA` must be accompanied by explanatory Russian tooltips.

## 7. Contest Disclaimer Banner Ergonomics
- The contest disclaimer (*«Концепт для конкурса. Не является официальным сервисом ИГУ»*) must feature high-contrast, easily readable styling.
- Provide a dismiss/collapse button (SVG `X`) allowing evaluators to temporarily hide the banner and inspect the clean viewport.
- The «Оболочка MAX» trigger must feature a prominent, contrasting accent color (blue/indigo), never pale orange on yellow.

## 8. Modal Dialogs, Document Cards & High-Contrast Footers
- **Modal Dialog Footers**: Modal dialogs displaying documents or external embeds (e.g., `CertificateModal`) MUST feature a solid, high-contrast footer background (`bg-card border-t border-border`), completely preventing transparency or dark overlay bleed-through from the backdrop. Action buttons inside modal footers must have distinct visual hierarchies: primary action (e.g., «Скачать PDF») MUST have a vibrant solid fill with high-contrast text (`bg-emerald-600 text-white font-semibold`), while secondary actions («В новой вкладке», «Печать») must use distinct contrasting borders and readable foreground text (`text-foreground`).
- **Document & Status Cards**: Notification cards (e.g., ready certificates on `/requests`) must use clean solid cards (`bg-card border border-emerald-500/30`) with high-contrast primary text (`text-foreground`). Murky, low-contrast solid blocks are strictly prohibited.
- **Natural Administrative Copy**: UI copy must avoid archaic or overly bureaucratic jargon. Use «забрать оригинал с печатью в кабинете 201» instead of «с мокрой печатью».

## 9. Zero Native Selects in Modals & Forms (B2B UI Standard)
- Native `<select>` elements and browser-default form controls are strictly prohibited in application forms and modal dialogs.
- All dropdowns must use accessible custom select primitives (`CustomSelect`) with semantic SVG chevrons, checkmark indicators, keyboard accessibility (Escape to dismiss), click-outside handlers, and state synchronization.

## 10. Anti-Flex-Squishing Invariant
- Side-by-side flex layouts (`flex-row justify-between` or `sm:flex-row`) containing descriptive explanatory text alongside action buttons are strictly forbidden when the text can be compressed into an unreadable column.
- Long text blocks and status explanations must occupy the full card width, with action buttons placed directly below as a full-width or naturally sized vertical stack (`flex flex-col gap-3`).

## 11. Fluid Container Responsive Policy (max-w-2xl..4xl)
- Clamping the entire viewport to an arbitrary narrow phone width (`max-w-md mx-auto` = 448px) at document root level is strictly prohibited.
- The platform uses a fluid container architecture: `max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-3 sm:px-4`, allowing the interface to scale gracefully from mobile devices (360px–430px) through tablets (768px) to desktop monitors (1366px–1920px) without distortion or excessive line length.

## 12. Viewport Height Dynamic Safe Area (100dvh & min-h-0)
- Hardcoded viewport height subtractions (such as `h-[calc(100vh-135px)]`) are prohibited for interactive multi-component screens containing floating banners, headers, and bottom tab bars.
- Screens with chat inputs or scrollable message histories must use dynamic viewport units (`100dvh`), `flex-1 min-h-0 flex flex-col`, and pin bottom inputs above fixed navigation bars without overlap or clipping.

## 13. Solid Surfaces & Zero-Transparency Floating Layers Invariant
- **Opaque Floating Layers**: Popovers, dropdown menus, custom select overlays (`CustomSelect`), tooltip boxes, floating sheets, and modals MUST have a 100% solid, opaque background (`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl`) and an explicit high z-index (`z-50`).
- **Zero Unmapped/Transparent Utility Fallback**: Floating overlays must never rely on unmapped or semi-transparent background utility classes where background color defaults to `transparent`, causing underlying text, form fields, and buttons to bleed through.
- **Tailwind v4 Variable Integrity**: In Tailwind CSS v4, all theme color variables (`--card`, `--popover`, `--background`, etc.) defined in `@layer base` must be explicitly declared inside `@theme { --color-card: var(--card); ... }` in `globals.css` to guarantee valid utility class generation.

## 14. User-Scoped Client Storage Isolation Invariant
- **Strict Account Isolation in Client Storage**: Any client-side state persistence (`localStorage`, `sessionStorage`, `IndexedDB`) holding user messages, form drafts, or session-specific dialog histories MUST namespace keys by user identity (e.g., `prefix_${userId}`).
- **Zero Cross-Account Bleed**: A single shared static storage key (such as `dekanat_ai_chat_history`) is strictly prohibited. When multiple user accounts (or test personas) sign in on the same browser, their chat histories, unread badges, and form states must remain strictly isolated and never leak across sessions.

