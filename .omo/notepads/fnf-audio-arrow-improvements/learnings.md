# FNF Audio & Arrow Improvements - Learnings

## Completed Changes

### A. AudioManager SFX Map
- Removed `lane0`-`lane3` and `miss` entries (old per-lane sound effects)
- Added `hit` → `gunshot.mp3` and `fah` → `fah.mp3`
- All SFX paths now use `${import.meta.env.BASE_URL}` prefix to match Vite's `base: "/matteo/"` config
- Kept: `death`, `intro3`, `intro2`, `intro1`, `introgo`

### B. AudioManager Methods
- Removed `lane(l: Lane)` and `miss()` methods
- Added `hit()` (volume 0.6) and `fah()` (volume 0.8) methods

### C/D/E. handleEngineEvent Calls
- `note_hit`: changed to `audio.hit()`
- `note_miss`: changed to `audio.fah()`
- `hold_dropped`: changed to `audio.fah()`

### F. WhatsApp "me teste" Button
- Added MyInstants WhatsApp soundboard embed iframe to the `song_select` screen
- Positioned after the song list, before the flex-1 container close

### G. Arrow Glow Effect
- In `drawArrow()`: when `alpha > 0.8`, sets `ctx.shadowColor = color` and `ctx.shadowBlur = 15`
- Gives active arrows a colored glow matching their lane

### H. Receptor Bounce Animation
- Replaced static `receptorScale = active ? 1.15 : 1` with time-based bounce:
  `bounceScale = active ? 1 + 0.15 * Math.abs(Math.sin(now * 0.008)) : 1`
- Active lanes oscillate between 1.0x and 1.15x with smooth easing

### I. Extra Hit Sparkle Particles
- Increased circle particles from 6 to 10 in `addSplash()`
- Added 3 white star-shaped particles per hit with `star: true` flag
- Star particles rendered as 4 crossing lines (radiating at 45° offsets) instead of circles
- `splashRef` type updated with optional `star?: boolean` field

## Verification
- `npx tsc --noEmit`: PASS (0 errors)
- `npx vitest run`: PASS (198/198 tests across 7 test files)
- `engine.ts` and `engine.test.ts`: NOT modified
