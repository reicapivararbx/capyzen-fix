# Learnings

## 2026-07-14 Execution start
- Canonical save shape is flat `GameState`; legacy consumers still use nested `player`/`capybara`.
- Preserve pre-existing local edits in `client/src/main.tsx`, `client/src/const.ts`, and `client/src/pages/Home.tsx`.
- Plan dependency: T1 save contract blocks T4, T5, and T7.
