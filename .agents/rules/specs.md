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
  $$\text{TICKET-01 [DONE]} \longrightarrow \text{TICKET-02 [DONE]} \longrightarrow \text{TICKET-03 [ACTIVE]} \longrightarrow \text{TICKET-04 [OPEN, MAX]} \longrightarrow \text{TICKET-06} \longrightarrow \text{TICKET-07} \longrightarrow \text{TICKET-08} \longrightarrow \text{TICKET-09 [29.11]}$$
- **TICKET-04 (MAX Mini App)**: Active high-priority integration implementing the **Dual-Mode** strategy (native `MAX Bridge SDK` + browser simulator `/max-preview`).
- **TICKET-05 (Telegram Mini App)**: Marked as `SKIPPED (Deferred)` — national super-app MAX and web PWA fully cover the mobile deanery experience.
- **TICKET-06 (PDF Certificates & Staff Polish)**: High-priority document generator and staff workflow.
- **TICKET-07 (UX & PWA Final Polish)**: Final accessibility, performance audit, and code freeze.
- **TICKET-08 (Submission Package)**: Mandatory packaging of `PROCESS.md`, jury walkthrough, and video demonstration.
- **TICKET-09 (Post-Contest Decommissioning)**: Scheduled infrastructure teardown on 29.11.2026 at 12:00 MSK to protect against cloud billing.
- **Code Freeze**: No new functional features or core refactoring may be introduced after closing TICKET-07. TICKET-08 is dedicated entirely to process documentation, compliance audits, demo assets, and submission packaging.

## 5. Target Pacing & Timeline (Contest Window: Nov 11 – Nov 22, 2026)
- **TICKET-01 (Core Scaffolding)**: Closed 11.11.2026 (`specs/archive/TICKET-01-core-scaffolding.md`).
- **TICKET-02 (Cloud & Yandex Deployment)**: Closed 22.11.2026 (`specs/archive/TICKET-02-cloud-and-deployment.md`).
- **TICKET-03 (Realtime Notifications)**: Target close by 22.11.2026 (Active).
- **TICKET-04 (MAX Mini App Dual-Mode)**: Target close by 22.11.2026.
- **TICKET-05 (Telegram Mini App)**: `SKIPPED (Deferred)`.
- **TICKET-06 (Certificates & Staff Polish)**: Target close by 22.11.2026.
- **TICKET-07 (UX & PWA Final Polish)**: Target close by 22.11.2026 (Code Freeze).
- **TICKET-08 (Submission Package)**: Target close by 22.11.2026 23:59 MSK.
- **Contest Evaluation Window**: 23.11.2026 – 28.11.2026 (Prototype 100% online).
- **TICKET-09 (Decommissioning)**: 29.11.2026 12:00 MSK.

## 6. Definition of Done Verifiability
Every `Done-When` criterion must be deterministically verifiable by:
- An automated CLI command or test (`pnpm test`, `curl`, `pnpm typecheck`),
- A reproducible click-path with expected UI state, or
- A verified screenshot/report saved to `docs/`.
Vague or qualitative acceptance criteria ("UI looks nice", "works smoothly") are strictly forbidden.
