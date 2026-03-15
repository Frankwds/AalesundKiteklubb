---
name: wind-compass-nextjs
description: Build interactive and display-only wind compass components in Next.js following the WindAlert design system. Use when adding wind direction selection, wind compass display, click-to-select wind directions, or when the user mentions wind compass, wind directions, or cardinal directions in a Next.js project.
---

# Wind Compass in Next.js (WindAlert Design)

Build wind compass components that display or capture wind directions using the WindAlert SVG pie-chart design. Three variants: **Standard** (display with labels), **Tiny** (compact display), **Interactive** (click-to-select with AND/OR logic).

---

## 1. Directions and Convention

```typescript
const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
```

- Always lowercase strings (e.g. `'n'`, `'ne'`).
- North (N) is at the top of the compass.
- Store and pass as `string[]`.

---

## 2. Shared Geometry

Use this `getPath` function for all variants. The values of `radius` and `center` depend on the variant (see tables below).

```typescript
const numSegments = directions.length;  // 8
const angleStep = 360 / numSegments;    // 45

const getPath = (index: number) => {
  const startAngle = -angleStep / 2 + index * angleStep - 90;
  const endAngle = angleStep / 2 + index * angleStep - 90;
  const start = {
    x: center + radius * Math.cos((startAngle * Math.PI) / 180),
    y: center + radius * Math.sin((startAngle * Math.PI) / 180),
  };
  const end = {
    x: center + radius * Math.cos((endAngle * Math.PI) / 180),
    y: center + radius * Math.sin((endAngle * Math.PI) / 180),
  };
  return `M ${center},${center} L ${start.x},${start.y} A ${radius},${radius} 0 0,1 ${end.x},${end.y} Z`;
};
```

---

## 3. WindAlert UI Design Tokens

Use these Tailwind classes. They rely on CSS variables that support light/dark themes.

| Token        | Use                         | Example                          |
|-------------|-----------------------------|----------------------------------|
| `--border`   | Default wedge fill          | `fill-[var(--border)]`           |
| `--background` | Wedge stroke             | `stroke-[var(--background)]`     |
| `--success`  | Selected/allowed wedge      | `fill-[var(--success)]`          |
| `--foreground` | Label text                | `fill-[var(--foreground)]`       |
| `--shadow-md` | Panels, overlays          | `shadow-[var(--shadow-md)]`      |
| `--accent`   | Hover states                | `hover:bg-[var(--accent)]/10`    |

**Wedge styling:**
- Default segment: `fill-[var(--border)] stroke-[var(--background)] stroke-[1px]`
- Selected/allowed: same, plus `fill-[var(--success)]` (this overrides the default fill).

**Label text (display-only):**
- `fill-[var(--foreground)] text-base font-sans`
- `textAnchor='middle'` and `alignmentBaseline='middle'`

---

## 4. Display-Only Compass

Shows which directions are allowed/active. No interaction.

**Props:** `allowedDirections: string[]`

### Standard (with labels)

| Setting   | Value    |
|----------|----------|
| viewBox  | `0 0 210 210` |
| radius   | 100      |
| center   | 105      |
| size     | Parent-controlled (e.g. `w-32 h-32 md:w-48 md:h-48`) |

Label position (place labels on each wedge):

```typescript
const getTextPosition = (index: number) => {
  const angle = index * angleStep - 90;
  return {
    x: center + (radius - 20) * Math.cos((angle * Math.PI) / 180),
    y: center + (radius - 20) * Math.sin((angle * Math.PI) / 180),
  };
};
```

Render: `path` + `text` with `{dir.toUpperCase()}` at `textPos.x`, `textPos.y`.

### Tiny (no labels)

| Setting   | Value        |
|----------|--------------|
| viewBox  | `0 0 44 44`  |
| radius   | 20           |
| center   | 22           |
| size     | `w-11 h-11`  |

Render only the `path` elements; no text.

---

## 5. Interactive Compass (WindFilterCompass)

Click wedges to select/deselect. Collapsed (small icon) → expanded (full compass). When expanded, show an AND/OR logic toggle.

### Props

| Prop                   | Type                        | Required |
|------------------------|-----------------------------|----------|
| `onWindDirectionChange`| `(directions: string[]) => void` | Yes |
| `selectedDirections`   | `string[]`                  | Yes      |
| `isExpanded`          | `boolean`                   | Yes      |
| `setIsExpanded`       | `(expanded: boolean) => void` | Yes   |
| `windFilterAndOperator` | `boolean`                 | Yes      |
| `onFilterLogicChange`  | `() => void`                | Yes      |
| `closeOverlays`       | `(options?: { keep?: string }) => void` | Yes |
| `variant`             | `'main' \| 'all'`           | Yes      |

### Variant → Layout

`variant` controls horizontal position:
- `variant === 'all'` → `right-3`
- `variant === 'main'` → `right-16`

Use in the root container:
`absolute top-3 ${variant === 'all' ? 'right-3' : 'right-16'} z-10 cursor-pointer`

### Dimensions

| State     | viewBox       | radius | center | className  |
|----------|---------------|--------|--------|------------|
| Collapsed| `0 0 44 44`   | 20     | 22     | `w-11 h-11` |
| Expanded | `0 0 130 130` | 60     | 65     | `w-48 h-48` |

### Click Behavior

1. **Container click (when collapsed):**  
   - Call `closeOverlays({ keep: 'windfilter' })`  
   - Call `setIsExpanded(true)`

2. **Wedge click (when expanded):**  
   - Toggle direction in the selection: add if not in array, remove if in array.  
   - Call `onWindDirectionChange(newSelected)` with the updated array.

```typescript
const handleDirectionClick = (dir: string) => {
  if (!isExpanded) return;
  const newSelected = selectedDirections.includes(dir)
    ? selectedDirections.filter(d => d !== dir)
    : [...selectedDirections, dir];
  onWindDirectionChange(newSelected);
};
```

### AND/OR Toggle (expanded only)

When `isExpanded`, render this overlay:

- Container: `absolute top-0 right-0 z-10`
- Panel: `bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]`
- Button: `w-6 h-6`, `font-mono text-sm font-bold`, `border-none rounded-md cursor-pointer`
  - Content: `windFilterAndOperator ? '&' : '||'`
  - On click: `e.stopPropagation()` then `onFilterLogicChange()`
  - Optional: `hover:bg-[var(--accent)]/10` on non-mobile
  - Title: `Filter logic: ${windFilterAndOperator ? 'AND (&)' : 'OR (||)'}`

---

## 6. Usage Examples

**Location page (Standard display):**
```tsx
<div className="w-32 h-32 md:w-48 md:h-48 mb-4 float-right">
  <WindCompass allowedDirections={windDirections} />
</div>
```

**Card or inline (Tiny display):**
```tsx
<TinyWindCompass allowedDirections={allowedDirections} />
```

**Filter control (Interactive):**
```tsx
<WindFilterCompass
  onWindDirectionChange={handleWindDirectionChange}
  selectedDirections={selectedWindDirections}
  isExpanded={windFilterExpanded}
  setIsExpanded={setWindFilterExpanded}
  windFilterAndOperator={windFilterAndOperator}
  onFilterLogicChange={handleWindFilterLogicChange}
  closeOverlays={closeOverlays}
  variant="main"   // or "all" — affects right position
/>
```

---

## Additional Resources

- Geometry and coordinate math: [reference.md](reference.md)
