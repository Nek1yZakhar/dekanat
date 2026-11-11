# User Interface & Frontend Invariants

## 1. Mobile-First Standard (360px Viewport)
- All layouts, modals, tables, and cards MUST render without horizontal scroll or truncated text at a viewport width of 360px (`@media (min-width: 360px)`).
- Touch targets for interactive elements (buttons, tab items, dropdown triggers) must have a minimum tap area of 44x44px.
- Use the bottom navigation bar pattern for student mobile flows (`app/(student)/layout.tsx`).

## 2. Russian UI Copy & Tone (Sasha Skill Standard)
- All visible text, buttons, modals, badges, toast alerts, and empty states MUST be written in natural, grammatically correct Russian.
- Use action verbs for buttons: "Подать заявку", "Войти", "Обновить", "Перейти".
- Anti-AI-slop copy: No unnatural corporate cliches or machine-translated phrasing.

## 3. Design System & Tokens
- Use Tailwind CSS v4 with OKLCH theme tokens and shadcn/ui primitives.
- Never use ad-hoc arbitrary hex colors (`#1a2b3c`). Rely on semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, `bg-muted`).
- Zero Unicode emojis in buttons or status indicators — use semantic inline SVG icons (`lucide-react`).

## 4. Mandatory States
- Every list and data-fetching component must handle 4 states:
  1. `Loading` (skeleton or pulse loader)
  2. `Empty` (friendly Russian explanation with an action button)
  3. `Error` (actionable recovery message)
  4. `Success / Content`

## 5. Contest Disclaimer Banner
- The disclaimer banner: `Концепт для конкурса. Не является официальным сервисом ИГУ` MUST remain visible on every page in `RootLayout`.
