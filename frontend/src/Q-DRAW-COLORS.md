# Q-Draw Icons - Color Reference for Q-Draw OS

## Pastel Candy Color Palette

```css
/* Q-version Colors */
--q-pink: #FFB5C5;      /* 柔和粉色 */
--q-blue: #A8D8EA;      /* 天空蓝 */
--q-yellow: #FFF4BD;    /* 淡黄色 */
--q-mint: #C5E8C0;      /* 薄荷绿 */
--q-lavender: #E8D5F2;  /* 淡紫色 */
--q-peach: #FFDAB9;     /* 桃色 */
--q-coral: #FF9E9E;     /* 珊瑚红 */
--q-sky: #B8E4F0;       /* 浅天蓝 */

/* Backgrounds */
--bg-paper: #FFFDF9;    /* 纸白 - 主背景 */
--bg-warm: #FFF8F0;     /* 温暖白 - 强调背景 */

/* Text */
--text-dark: #5A4A3A;   /* 深棕 - 主文字 */
--text-medium: #8A7A6A; /* 中棕 - 次要文字 */
--text-light: #BAA898;  /* 浅棕 - 提示文字 */
```

## Color Mapping Table

| Component | Primary Color | Accent Color | Fill/Background |
|-----------|--------------|--------------|------------------|
| **FoodIcon (Dock)** | --q-peach (#FFDAB9) | --q-yellow (#FFF4BD) | #FFF0E8 |
| **EmptyFoodIcon** | --q-peach (#FFDAB9) | --q-mint (#C5E8C0) | #FFF8EB |
| **FireIcon** | --q-coral (#FF9E9E) | --q-peach (#FFDAB9) | #FFF0EB |
| **CameraAddIcon** | --q-blue (#A8D8EA) | --q-sky (#B8E4F0) | #F0F8FF |
| **Date Navigation** | linear-gradient(135deg, --q-mint, --q-blue) | - | - |
| **Calories Display** | linear-gradient(135deg, --q-mint, --q-blue) | - | - |
| **Add Button** | linear-gradient(135deg, --q-mint, --q-blue) | - | - |
| **Delete Button** | --q-coral (#FF9E9E) | --q-peach (#FFDAB9) | #FF9E9E |
| **Camera Trigger** | --q-peach (#FFDAB9) | --q-yellow (#FFF4BD) | #FFDAB9 |
| **Cancel Button** | --bg-warm (#FFF8F0) | --text-medium (#8A7A6A) | #FFF8F0 |
| **Save Button** | linear-gradient(135deg, --q-mint, --q-blue) | - | - |
| **Meal Type Buttons** | --q-peach (#FFDAB9) | --q-yellow (#FFF4BD) | #FFF8EB |
| **Modal Border** | --q-lavender (#E8D5F2) | - | - |
| **Confidence High** | --q-mint (#C5E8C0) | - | #C5E8C0 |
| **Confidence Medium** | --q-yellow (#FFF4BD) | - | #FFF4BD |
| **Confidence Low** | --q-coral (#FF9E9E) | - | #FF9E9E |

## Buttons Reference

### Primary Buttons
- **Save/Add**: `background: linear-gradient(135deg, #C5E8C0, #A8D8EA); color: var(--text-dark);`
- **Hover**: `transform: scale(1.02); box-shadow: 0 4px 12px rgba(168, 216, 234, 0.3);`

### Secondary Buttons
- **Cancel/Secondary**: `background: var(--bg-warm); color: var(--text-dark);`
- **Hover**: `background: #FFFFFF;`

### Destructive Buttons
- **Delete**: `background: var(--q-coral); color: white;`
- **Hover**: `background: var(--q-peach);`

## Borders Reference

### Active State
- `border: 2px solid var(--q-blue);` (天空蓝)

### Default State
- `border: 2px solid var(--q-lavender);` (淡紫)

### Modal
- `border: 3px solid var(--q-lavender);` (淡紫)

## Backgrounds Reference

### Card/Paper
- `background: var(--bg-paper);` (纸白)
- `background: #FFFFFF;` (纯白 - 用于卡片/模态框)

### Accent Backgrounds
- `background: var(--bg-warm);` (温暖白)
- `background: #F0F8FF;` (冷色调 - 用于特定图标)

## Shadows Reference

### Subtle Shadow
```css
box-shadow: 0 2px 8px rgba(90, 74, 58, 0.08);
```

### Medium Shadow
```css
box-shadow: 0 4px 16px rgba(90, 74, 58, 0.12);
```

### Strong Shadow
```css
box-shadow: 0 8px 32px rgba(90, 74, 58, 0.16);
```

### Button Shadows
```css
/* Primary button shadow */
box-shadow: 0 2px 8px rgba(168, 216, 234, 0.25);

/* Secondary button shadow */
box-shadow: 0 2px 8px rgba(255, 218, 185, 0.25);
```

## Icon Color Usage Guidelines

### Primary Interactive Icons
Use `--q-blue` (#A8D8EA) for:
- Main action buttons
- Active navigation items
- Primary icons (Camera, Calendar, Fitness)

### Warm Decorative Icons
Use `--q-peach` (#FFDAB9) for:
- Food-related icons
- Highlight elements
- Secondary actions
- Sparkles and decorative elements

### Status Icons
Use pastel colors for semantic meaning:
- `--q-mint` (#C5E8C0) - Success states, completion
- `--q-yellow` (#FFF4BD) - Warning states, medium confidence
- `--q-coral` (#FF9E9E) - Error states, delete actions, low confidence

## Quick Reference for Common UI Elements

### Buttons
```css
/* Primary Button - Mint to Blue Gradient */
.primary-btn {
  background: linear-gradient(135deg, #C5E8C0, #A8D8EA);
  color: var(--text-dark);
  box-shadow: 0 2px 8px rgba(168, 216, 234, 0.25);
}

/* Secondary Button */
.secondary-btn {
  background: var(--bg-warm);
  color: var(--text-dark);
}

/* Destructive Button */
.destructive-btn {
  background: var(--q-coral);
  color: white;
}
```

### Text Colors
```css
/* Headings and Labels */
h1, h2, h3, .label {
  color: var(--text-dark);
}

/* Body Text */
p, span, .text {
  color: var(--text-medium);
}

/* Placeholder and Disabled */
.placeholder, .disabled {
  color: var(--text-light);
}
```

## Design Principles

1. **Soft and Playful**: Use the pastel candy color palette to create a friendly, approachable feel
2. **Consistent Color Usage**: Each color has a specific meaning - maintain consistency across the app
3. **Good Contrast**: Ensure text readability with proper color contrast ratios
4. **Subtle Depth**: Use shadows and borders to create depth without being heavy
5. **Hand-drawn Charm**: The pastel colors enhance the cute, hand-drawn aesthetic

## Quick Color Selection Guide

| Purpose | Recommended Color |
|---------|------------------|
| Primary Actions | `--q-blue` (#A8D8EA) or mint→blue gradient |
| Food/Appetite | `--q-peach` (#FFDAB9) |
| Success/Complete | `--q-mint` (#C5E8C0) |
| Warning/Attention | `--q-yellow` (#FFF4BD) |
| Error/Delete | `--q-coral` (#FF9E9E) |
| Decorative/Soft | `--q-pink` (#FFB5C5), `--q-lavender` (#E8D5F2) |
| Background | `--bg-paper` (#FFFDF9) |
| Card/Modal | `#FFFFFF` |

## Gradient Formulas

### Mint to Blue (Primary)
```css
background: linear-gradient(135deg, #C5E8C0, #A8D8EA);
```
Used for: Primary buttons, active states, calories display

### Peach to Yellow (Warm)
```css
background: linear-gradient(135deg, #FFDAB9, #FFF4BD);
```
Used for: Food-related elements, warm accents

### Lavender to Sky (Soft)
```css
background: linear-gradient(135deg, #E8D5F2, #B8E4F0);
```
Used for: Decorative elements, soft highlights

### Pink to Peach (Sweet)
```css
background: linear-gradient(135deg, #FFB5C5, #FFDAB9);
```
Used for: Sweet/cute accents
