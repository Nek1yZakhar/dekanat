# Spec-Driven Development & Workflow Rules

## 1. Single Source of Active State
- `docs/STATE.md` always points to exactly **ONE** active ticket. It is the authoritative single source of truth for "what to work on next".
- No parallel active tickets are permitted. All agent work must be focused on the currently active ticket.

## 2. Specification Authority & Scope Boundaries
- The full specification for the active ticket lives in `specs/TICKET-<NN>-<slug>.md`.
- Agents and developers **MUST** read the active ticket specification completely before touching any production code.
- Work strictly inside the specified `Scope`. Anything outside the scope must never be added to the codebase during that ticket; record it as an item under the `Deferred ideas` section at the bottom of the active ticket spec.
- Unsolicited refactoring or opportunistic feature additions outside the active ticket scope are strictly prohibited.

## 3. Ticket Lifecycle & Closure Procedure
When a ticket is completed:
1. **Archive Spec**: Move the active ticket file from `specs/` to `specs/archive/TICKET-<NN>-<slug>.md`.
2. **Document Results**: Append a `## Result` section to the archived spec describing what was actually built, verification evidence (commands/test results/screenshots), and any justified deviations from the initial scope.
3. **Advance State**: Update `docs/STATE.md` with the next ticket in the sequence, copying its canonical `Done-When` criteria.
4. **Log Changes**: Add an entry into `docs/CHANGELOG.md` following the Keep a Changelog standard.

## 4. Execution Sequence & Skip Rules
- Ticket execution sequence is strictly fixed:
  $$\text{TICKET-02} \longrightarrow \text{TICKET-03} \longrightarrow \text{TICKET-04} \longrightarrow \text{TICKET-05 (Optional)} \longrightarrow \text{TICKET-06} \longrightarrow \text{TICKET-07} \longrightarrow \text{TICKET-08}$$
- **TICKET-05 (Telegram Mini App)** is optional: If time is constrained or platform approvals drag by 2026-11-17, close TICKET-05 as `SKIPPED` with a concise explanation in its `Result` section.
- **TICKET-02 (Cloud & VPS Deployment)** and **TICKET-08 (Submission Package)** are mandatory and must **NEVER** be skipped under any circumstances.
- **Code Freeze**: No new functional features or core refactoring may be introduced after closing TICKET-07. TICKET-08 is dedicated entirely to process documentation, compliance audits, demo assets, and submission packaging.

## 5. Target Pacing & Timeline (Contest Window: Nov 11 – Nov 22, 2026)
- **TICKET-02 (Cloud & Deployment)**: Target close by 2026-11-13.
- **TICKET-03 (Realtime Notifications)**: Target close by 2026-11-14.
- **TICKET-04 (MAX Mini App)**: Target close by 2026-11-16.
- **TICKET-05 (Telegram Mini App)**: Target close by 2026-11-17 (or mark `SKIPPED`).
- **TICKET-06 (Certificates & Staff Polish)**: Target close by 2026-11-18.
- **TICKET-07 (UX & PWA Final Polish)**: Target close by 2026-11-19 (Code Freeze).
- **TICKET-08 (Submission Package)**: Target close by 2026-11-20/21.
- **Contest Deadline**: 2026-11-22 23:59 MSK (Prototype online window through 2026-11-28).

## 6. Definition of Done Verifiability
Every `Done-When` criterion must be deterministically verifiable by:
- An automated CLI command or test (`pnpm test`, `curl`, `pnpm typecheck`),
- A reproducible click-path with expected UI state, or
- A verified screenshot/report saved to `docs/`.
Vague or qualitative acceptance criteria ("UI looks nice", "works smoothly") are strictly forbidden.
