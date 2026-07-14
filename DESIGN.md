# CapyZen Design System

## Design Tokens

### Spacing
- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Touch Targets
- Minimum: 44px x 44px (WCAG 2.2)
- Button padding: 12px horizontal, 8px vertical minimum
- Input height: 44px minimum

### Breakpoints
- Mobile: 360px
- Tablet: 768px
- Desktop: 1440px
- Tailwind: sm=640px, md=768px, lg=1024px, xl=1280px

### Container
- Max content width: 1280px (max-w-7xl)
- Page padding: 16px (p-4)

## Layout Rules

### Page Structure
- Outer wrapper: `min-height: 100dvh; display: flex; flex-direction: column; overflow-x: hidden`
- Content centered via `max-w-7xl mx-auto`

### Responsive Grid
- **Mobile (default)**: Single column, stacked vertically
- **Desktop (lg+)**: Multi-column grid (`grid-cols-1 lg:grid-cols-4`)
  - Canvas: 3 columns
  - Stats panel: 1 column (sidebar on desktop)

### Canvas
- Aspect ratio: 7:5 (560/400)
- Max-width: 100% of container
- Constrained via `aspect-[560/400]` wrapper

### Controls
- Game actions: 2-col mobile, 3-col sm, 6-col desktop grid
- Nav buttons: horizontal flex, wraps on overflow

### Modals & Dialogs
- Centered overlay: `fixed inset-0 flex items-center justify-center p-4`
- Content max-height: 85dvh with scroll
- Dismissible via Escape key
- z-index: 50 (modals), 40 (toast/notifications)

## Color Palette

### Background
- Page: gray-900 (#111827)
- Cards: gray-800 (#1F2937)
- Input: gray-700 (#374151)
- Overlay: black at 50-70% opacity

### Brand
- Primary: purple-500 (#A855F7)
- Secondary: pink-500 (#EC4899)
- Accent: blue-500 (#3B82F6)

### Status
- Success: green-500 (#22C55E)
- Warning: yellow-400 (#FACC15)
- Danger: red-500 (#EF4444)

### Borders
- Interactive: purple-400 (#C084FC)
- Default: gray-600 (#4B5563)

## Typography

### Font Family
- System UI: Inter, system-ui, sans-serif (inherited from Tailwind)

### Scale
| Token | Size | Usage |
|-------|------|-------|
| xs | 12px | Stats labels, secondary text |
| sm | 14px | Body text, descriptions |
| base | 16px | Default paragraph text |
| lg | 18px | Section headings |
| xl | 20px | Subsection headings |
| 2xl | 24px | Dialog titles |
| 3xl | 30px | Page title |

### Weights
- Normal: 400
- Bold: 700

## Focus & Accessibility

### Focus Indicators
- All interactive elements show visible focus ring
- Buttons: built-in `focus-visible:ring-[3px]`
- Inputs: `focus-visible:ring-2 focus-visible:ring-purple-400`
- Focus ring offset: 2px from element

### Keyboard Navigation
- Modals dismissible with Escape key
- All interactive elements reachable via Tab
- Visible focus outlines on all controls
