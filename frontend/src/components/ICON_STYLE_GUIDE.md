# Q-Draw OS 手绘图标风格指南

> 延续Q版手绘风格到你的其他应用

---

## 🎨 核心设计理念

### 视觉风格关键词
- **Q版可爱** - 圆润、胖嘟嘟的形状
- **手绘感** - 不完美的线条、波浪曲线
- **粉彩配色** - 柔和、低饱和度的颜色
- **温馨治愈** - 高光、腮红、可爱表情

---

## 🎯 风格特征拆解

### 1. 形状特征

```
┌─────────────────────────────────────┐
│  主形状: 圆润的有机形体              │
│  - 大量使用圆角 (rx, ry)            │
│  - 椭圆优于圆形                     │
│  - 路径使用曲线连接                 │
│  - 避免尖锐的直角                   │
└─────────────────────────────────────┘
```

**代码示例：**
```tsx
// ❌ 避免: 尖锐的矩形
<rect x="10" y="10" width="40" height="40" />

// ✅ 推荐: 圆润的矩形
<rect x="10" y="10" width="40" height="40" rx="10" ry="10" />

// ✅ 推荐: 手绘路径
<path d="M12 20C14 22 16 20 18 22"
      stroke="..."
      strokeWidth="2.5"
      strokeLinecap="round" />
```

### 2. 配色系统

#### 颜色变量定义
```css
:root {
  /* 主色调 - 粉彩系 */
  --q-pink: #FFB5C5;      /* 柔和粉 */
  --q-blue: #A8D8EA;      /* 天空蓝 */
  --q-yellow: #FFF4BD;    /* 淡黄色 */
  --q-mint: #C5E8C0;      /* 薄荷绿 */
  --q-lavender: #E8D5F2;  /* 薰衣草紫 */
  --q-peach: #FFDAB9;     /* 桃色 */
  --q-coral: #FF9E9E;     /* 珊瑚色 */
  --q-sky: #B8E4F0;       /* 浅天空蓝 */

  /* 填充色 - 比主色更浅 */
  --fill-pink: #FFF0F5;
  --fill-blue: #F0F8FF;
  --fill-peach: #FFF0E8;
  --fill-lavender: #F4EDF8;

  /* 文字色 */
  --text-dark: #5A4A3A;
  --text-medium: #8A7A6A;
  --text-light: #BAA898;
}
```

#### 配色组合公式
```
主体填充 = 主色调的极浅版本
边框描边 = 主色调
细节点缀 = 相关色系的粉彩色
高光 = rgba(255, 255, 255, 0.6-0.8)
阴影 = 主色调的透明版本 (opacity: 0.3)
```

### 3. 阴影系统

**底部柔和阴影：**
```tsx
<ellipse
  cx="32"
  cy="58"
  rx="20"
  ry="4"
  fill="rgba(主色R, 主色G, 主色B, 0.3)"
/>
```

**阴影颜色计算公式：**
```
阴影色 = rgba(主色R, 主色G, 主色B, 0.3)
例: 粉色 #FFB5C5 → rgba(255, 181, 197, 0.3)
例: 蓝色 #A8D8EA → rgba(168, 216, 234, 0.3)
```

### 4. 手绘线条特征

```tsx
// 直线 → 波浪曲线
<path d="M10 20 Q20 18 30 20" />

// 技巧: 使用二次贝塞尔曲线 (Q)
// Q 控制点X 控制点Y 终点X 终点Y
// 手绘感 = 轻微偏离直线的曲线

// 垂直线条也加波动
<path d="M32 10 Q31 20 32 30" />
```

### 5. 高光系统

```tsx
// 圆形高光 - 最常用
<ellipse
  cx="14"
  cy="18"
  rx="3"
  ry="2"
  fill="rgba(255, 255, 255, 0.7)"
/>

// 位置规律: 左上角区域
// cx: 12-18 (左上)
// cy: 14-22 (上方)
// rx: 2-4, ry: 1.5-3 (横向椭圆)
```

### 6. 可爱元素

```tsx
// 腮红 - 用于可爱角色
<ellipse
  cx="位置"
  cy="位置"
  rx="4"
  ry="2"
  fill="rgba(255, 158, 158, 0.4)"
/>

// 闪光点缀
<path
  d="M48 20L49 22L51 23L49 24L48 26L47 24L45 23L47 22Z"
  fill="#FFF4BD"
/>

// 可爱表情 (可选)
<circle cx="30" cy="28" r="1.5" fill="var(--text-dark)" />  // 左眼
<circle cx="34" cy="28" r="1.5" fill="var(--text-dark)" />  // 右眼
<path d="M30 32 Q32 34 34 32" stroke="#FFB5C5" ... />       // 微笑
```

---

## 📐 图标尺寸规范

```
Dock图标: 56x56 (size={56})
App内大图标: 64x64 (size={64})
小图标/inline: 20-32 (size={20-32})

SVG viewBox: "0 0 64 64" (固定)
```

---

## 🔧 标准代码模板

### 基础图标模板

```tsx
export const YourIcon = ({
  className = '',
  size = 56
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 1. 底部阴影 */}
    <ellipse
      cx="32"
      cy="58"
      rx="20"
      ry="4"
      fill="rgba(主色R, 主色G, 主色B, 0.3)"
    />

    {/* 2. 主体形状 */}
    <rect/path/circle/ellipse
      fill="#浅色填充"
      stroke="#主色描边"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* 3. 内部细节 */}
    <path
      d="手绘曲线路径"
      stroke="#细节色"
      strokeWidth="2-2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* 4. 高光 (左上角) */}
    <ellipse
      cx="14-18"
      cy="14-22"
      rx="2-4"
      ry="1.5-3"
      fill="rgba(255, 255, 255, 0.6-0.8)"
    />

    {/* 5. 可选: 腮红/闪光/表情 */}
  </svg>
)
```

### Inline 小图标模板

```tsx
// 用于文本中的小图标
export const YourSmallIcon = ({
  className = '',
  size = 20
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"  // 小图标用更小的viewBox
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 简化版本，省略阴影，减少细节 */}
  </svg>
)
```

---

## 🎨 颜色组合速查表

| 图标类型 | 填充色 | 描边色 | 阴影色 | 点缀色 |
|---------|--------|--------|--------|--------|
| **粉色系** | #FFF0F5 | #FFB5C5 | rgba(255,181,197,0.3) | #E8D5F2 |
| **蓝色系** | #F0F8FF | #A8D8EA | rgba(168,216,234,0.3) | #B8E4F0 |
| **紫色系** | #F4EDF8 | #E8D5F2 | rgba(232,213,242,0.3) | #D8C4E8 |
| **绿色系** | #E8F5E8 | #C5E8C0 | rgba(197,232,192,0.3) | #A8D8B0 |
| **黄色系** | #FFFEF8 | #FFF4BD | rgba(255,244,189,0.3) | #F5E8A8 |
| **桃色系** | #FFF0E8 | #FFDAB9 | rgba(255,218,185,0.3) | #F5C4A8 |
| **珊瑚系** | #FFF0F0 | #FF9E9E | rgba(255,158,158,0.3) | #FF8A80 |

---

## ✨ 设计检查清单

创建新图标时，确保：

- [ ] 使用 `viewBox="0 0 64 64"`
- [ ] 添加底部椭圆阴影
- [ ] 主形状使用 `strokeWidth="2.5"`
- [ ] 所有线条使用 `strokeLinecap="round"`
- [ ] 曲线优先于直线
- [ ] 添加左上角高光
- [ ] 使用粉彩配色系统
- [ ] 填充色比描边色浅
- [ ] 可选: 添加腮红或闪光

---

## 📚 现有图标参考

### Dock 图标
- `MoreIcon` - 九宫格 (薄荷绿+天空蓝)
- `NotesIcon` - 笔记本 (粉色+薰衣草)
- `FoodIcon` - 鸡腿 (桃色+黄色)
- `CalendarIcon` - 日历 (天空蓝+薰衣草)
- `FitnessIcon` - 健身 (薰衣草+天空蓝)

### 功能图标
- `EmptyFoodIcon` - 空盘子
- `FireIcon` - 火焰
- `CameraAddIcon` - 相机

### Fitness 图标
- `ChestIcon` - 胸部
- `BackIcon` - 背部
- `LegsIcon` - 腿部
- `ShouldersIcon` - 肩部
- `ArmsIcon` - 手臂
- `CoreIcon` - 核心

---

## 🚀 快速开始步骤

1. **复制基础模板**
2. **选择配色组合** (参考速查表)
3. **绘制主形状** (使用圆润线条)
4. **添加手绘细节** (曲线 > 直线)
5. **放置高光** (左上角)
6. **添加可爱元素** (可选)
7. **测试不同尺寸** (56, 64, 20-32)

---

## 💡 设计技巧

### 让图标更可爱的方法
```
1. 把圆形变成椭圆
2. 把方形变成圆角矩形 (rx ≥ 8)
3. 添加轻微的胖嘟嘟感
4. 使用不完美但对称的曲线
5. 添加腮红 (rgba(255, 158, 158, 0.4))
6. 添加闪光点缀 (#FFF4BD)
```

### 手绘线条技巧
```tsx
// 不用直线
// ❌ <path d="M10 10 L50 10" />

// 使用轻微波动
// ✅ <path d="M10 10 Q30 8 50 10" />

// 垂直线条也波动
// ✅ <path d="M32 10 Q31 20 32 30" />
```

---

*最后更新: 2026-03-27*
*适用于: Q-Draw OS / VibeDesign 项目*
