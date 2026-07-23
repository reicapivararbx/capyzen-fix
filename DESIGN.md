# CapyZen Design System

## 0. Research Log

- **Task context**: Redesign main Home page shell for CapyZen — a capybara pet game + FNF mini-game. No external brand reference supplied; project uses existing design language (dark theme, emerald/green palette from current code).
- **Existing design**: Dark (`bg-gray-950`), emerald/green gradient accents, emoji icons (🐹💬⚙️🚪). Current shell has small nav buttons in header.
- **Design direction**: Playful capybara aesthetic — warm browns, emerald greens, large touch-friendly buttons. Not minimal/editorial. Distinct from generic AI slop by using brand-original emoji characters + bold gradient buttons + capybara-themed shadows.
- **Decision**: Brand-consistent redesign using existing color language; no external reference search needed.

---

## 1. Concept & Vision

CapyZen is a cozy capybara pet simulator with an embedded Friday Night Funkin' mini-game. The shell should feel **warm, playful, and alive** — like a digital habitat for a capybara. The UI prioritizes large, tactile buttons that feel satisfying to press on both mobile and desktop.

---

## 2. Design Language

### Aesthetic Direction
Cozy dark mode with earthy greens and warm accents. Not sterile — texture through gradient meshes, glowing shadows, and rounded forms. The capybara emoji as a mascot creates personality without requiring custom illustrations.

### Color Palette
```
Background:       #030712 (gray-950 / carbon)
Surface:          #0f172a (slate-900), #1e293b (slate-800)
Primary accent:   #4ade80 (green-400), #22c55e (green-500), #16a34a (green-600)
Text primary:     #f0fdf4 (green-50), #ffffff
Text muted:       #6b7280 (gray-500), #9ca3af (gray-400)
FNF button:       from-orange-500 (#f97316) to-red-500 (#ef4444)
Admin button:     from-indigo-500 (#6366f1) to-purple-500 (#a855f7)
Chat button:      from-teal-500 (#14b8a6) to-green-500 (#22c55e)
Sair button:      border-red-500/40, text-red-300, bg-red-500/5
```

### Typography
- **Title font**: System font stack, `font-extrabold`, gradient text (green-300 → emerald-300 → teal-300)
- **Button label**: `font-bold`, white/90, tracking-tight
- **Subtitle**: `font-semibold`, muted gray
- Scale: Title 2xl-3xl, Button labels sm-base, touch targets min 56px height

### Spatial System
- Base unit: 4px grid
- Header padding: `py-4 sm:py-5 px-4 sm:px-6`
- Button gap: 3 (12px), column gap: 4 (16px) in grid
- Border radius: `rounded-2xl` (16px) for buttons
- Container max-width: `max-w-7xl`

### Motion Philosophy
- **Hover**: `scale-[1.04]` + deeper gradient + larger shadow — button "lifts" toward user
- **Active**: `scale-[0.96]` + reduced shadow — button "presses" down
- **Timing**: `transition-all duration-200 ease-out`
- **Focus**: `ring-2 ring-white/50` offset ring for accessibility
- All animations use `transform` + `opacity` — GPU-composited only

### Visual Assets
- Icons: Emoji (🐹 FNF, ⚙️ ADMIN, 💬 CHAT, 🚪 SAIR) — project-original characters
- Background: Subtle gradient meshes (`bg-green-500/10`, `bg-emerald-500/10`) in blurred blobs
- Shadows: Colored shadows matching button gradient (e.g., `shadow-green-500/25`)

---

## 3. Layout & Structure

### Shell Layout
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: sticky, backdrop-blur                           │
│  ┌──────────────┬──────────────────────────────────────┐ │
│  │ 🐹 CAPYZEN  │  [🐹 FNF] [⚙️ ADMIN] [💬 CHAT] [🚪 SAIR] │ │
│  │  (title)    │       (2x2 grid on mobile, row on sm+) │ │
│  └──────────────┴──────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  MAIN CONTENT: scrollable game area (unchanged)          │
└─────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Mobile (<640px)**: Title + button grid stack vertically in header; buttons in 2x2 grid
- **Tablet (640px+)**: Title + button row side by side; buttons in 4-column row
- **Desktop**: Full layout, same as tablet row

---

## 4. Features & Interactions

### Navigation Buttons
| Button | Action | Visual |
|--------|--------|--------|
| 🐹 FNF | Navigate to `/fnf` | Orange→red gradient, orange shadow |
| ⚙️ ADMIN | Navigate to `/admin` | Indigo→purple gradient, indigo shadow |
| 💬 CHAT | Navigate to `/chat` | Teal→green gradient, teal shadow |
| 🚪 SAIR | Call `logout()` → redirect to login | Red border, transparent bg, spinner when loading |

### Button States
- **Default**: Gradient background, colored shadow
- **Hover**: Darker gradient, larger shadow, `scale-[1.04]`
- **Active/Pressed**: `scale-[0.96]`, reduced shadow
- **Focus**: White ring offset 2px
- **Disabled (SAIR only)**: `opacity-50`, `cursor-not-allowed`

### Edge Cases
- Logout not authenticated: `handleLogout` still clears local state, no error shown
- Logout loading: show spinner + "Saindo..." text in SAIR button
- Auth redirect: `useAuth` handles redirect to login via `getLoginUrl()`

---

## 5. Component Inventory

### ShellHeader (inline in Home.tsx)
- `backdrop-blur-sm`, `bg-gray-900/50`, `border-b border-green-500/10`
- Contains title group + nav grid
- Sticky positioning

### NavButton (inline, mapped from NAV_BUTTONS array)
- Min height: `56px` mobile, `64px` sm+
- Gradient bg + colored shadow
- Flex column: emoji icon + label text
- Full hover/active/focus state handling

### SairButton (inline)
- Border variant instead of gradient
- Red color scheme
- Loading spinner state

---

## 6. Technical Approach

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 (CSS-first config in `index.css`)
- **Animation**: CSS transitions (scale, shadow, gradient) — no Framer Motion overhead
- **Routing**: `wouter` with `useLocation` hook
- **Auth**: `useAuth` hook from `@/_core/hooks/useAuth.ts` (already in codebase)
- **No backend changes** — reuse existing `auth.logout` tRPC mutation