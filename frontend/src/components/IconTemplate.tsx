// ============================================
// Q-Draw OS 手绘图标代码模板
// 复制此文件来创建新图标
// ============================================

// ============================================
// 1. 基础图标模板 - 标准尺寸 (56x56)
// ============================================
export const YourIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 1. 底部阴影 - 柔和的椭圆 */}
    <ellipse
      cx="32"
      cy="58"
      rx="20"
      ry="4"
      fill="rgba(168, 216, 234, 0.3)"  // 根据配色调整RGB
    />

    {/* 2. 主体形状 - 圆润的矩形/圆形/路径 */}
    <rect
      x="12"
      y="12"
      width="40"
      height="40"
      rx="10"  // 圆角，至少8-10
      fill="#F0F8FF"  // 浅色填充
      stroke="#A8D8EA"  // 主色描边
      strokeWidth="2.5"  // 标准描边宽度
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* 3. 内部细节 - 手绘曲线 */}
    <path
      d="M18 24 Q32 22 46 24"  // 使用 Q (二次贝塞尔) 制造手绘感
      stroke="#B8E4F0"  // 细节色
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />

    {/* 4. 高光 - 左上角，白色半透明 */}
    <ellipse
      cx="16"
      cy="18"
      rx="3"
      ry="2"
      fill="rgba(255, 255, 255, 0.7)"
    />

    {/* 5. 可选元素 */}
    {/* 腮红 */}
    {/* <ellipse cx="24" cy="38" rx="4" ry="2" fill="rgba(255, 158, 158, 0.4)" /> */}

    {/* 闪光 */}
    {/* <path d="M48 28L49 30L51 31L49 32L48 34L47 32L45 31L47 30Z" fill="#FFF4BD" /> */}
  </svg>
)

// ============================================
// 2. 大图标模板 - 用于App内展示 (64x64)
// ============================================
export const YourLargeIcon = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 更详细的版本，适合64px以上 */}
    <ellipse cx="32" cy="58" rx="22" ry="4" fill="rgba(168, 216, 234, 0.3)" />

    {/* 主体 */}
    <rect
      x="10"
      y="10"
      width="44"
      height="44"
      rx="12"
      fill="#F0F8FF"
      stroke="#A8D8EA"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* 更多细节 */}
    <path d="M16 22 Q32 20 48 22" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M16 32 Q32 30 48 32" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M16 42 Q32 40 48 42" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* 高光 */}
    <ellipse cx="14" cy="16" rx="4" ry="2" fill="rgba(255, 255, 255, 0.7)" />
    <ellipse cx="50" cy="16" rx="3" ry="2" fill="rgba(255, 255, 255, 0.6)" />

    {/* 可选: 可爱表情 */}
    {/* <circle cx="28" cy="36" r="2" fill="var(--text-dark)" />
    <circle cx="36" cy="36" r="2" fill="var(--text-dark)" />
    <path d="M28 42 Q32 44 36 42" stroke="#FFB5C5" strokeWidth="2" strokeLinecap="round" fill="none" /> */}
  </svg>
)

// ============================================
// 3. Inline小图标模板 - 用于文本中 (20-24px)
// ============================================
export const YourSmallIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"  // 小图标用更小的viewBox
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 小图标省略阴影，简化细节 */}
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="4"
      fill="#F0F8FF"
      stroke="#A8D8EA"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* 单一简单细节 */}
    <circle cx="12" cy="12" r="3" fill="#B8E4F0" />
  </svg>
)

// ============================================
// 4. 配色速查 - 复制使用
// ============================================

/*
粉彩配色系统:

粉色系:
  填充: #FFF0F5
  描边: #FFB5C5
  阴影: rgba(255, 181, 197, 0.3)
  细节: #E8D5F2

蓝色系:
  填充: #F0F8FF
  描边: #A8D8EA
  阴影: rgba(168, 216, 234, 0.3)
  细节: #B8E4F0

紫色系:
  填充: #F4EDF8
  描边: #E8D5F2
  阴影: rgba(232, 213, 242, 0.3)
  细节: #D8C4E8

绿色系:
  填充: #E8F5E8
  描边: #C5E8C0
  阴影: rgba(197, 232, 192, 0.3)
  细节: #A8D8B0

黄色系:
  填充: #FFFEF8
  描边: #FFF4BD
  阴影: rgba(255, 244, 189, 0.3)
  细节: #F5E8A8

桃色系:
  填充: #FFF0E8
  描边: #FFDAB9
  阴影: rgba(255, 218, 185, 0.3)
  细节: #F5C4A8

珊瑚系:
  填充: #FFF0F0
  描边: #FF9E9E
  阴影: rgba(255, 158, 158, 0.3)
  细节: #FF8A80
*/

// ============================================
// 5. 常用形状代码片段
// ============================================

/*
// 圆角矩形
<rect
  x="12" y="12" width="40" height="40"
  rx="10" ry="10"
  fill="..." stroke="..." strokeWidth="2.5"
/>

// 椭圆
<ellipse
  cx="32" cy="32" rx="20" ry="12"
  fill="..." stroke="..." strokeWidth="2.5"
/>

// 圆形
<circle
  cx="32" cy="32" r="16"
  fill="..." stroke="..." strokeWidth="2.5"
/>

// 手绘曲线 (关键!)
<path d="M10 20 Q20 18 30 20"
  stroke="..." strokeWidth="2.5"
  strokeLinecap="round" fill="none"
/>

// 波浪线
<path d="M10 30 Q20 26 30 30 Q40 34 50 30"
  stroke="..." strokeWidth="2"
  strokeLinecap="round" fill="none"
/>

// 心形
<path
  d="M32 48 C32 48 12 36 12 24 C12 18 18 14 24 14 C28 14 32 18 32 22 C36 18 40 14 44 14 C50 14 56 18 56 24 C56 36 32 48 32 48Z"
  fill="..." stroke="..." strokeWidth="2.5"
/>

// 星形
<path
  d="M32 10 L36 22 L48 24 L38 32 L40 44 L32 38 L24 44 L26 32 L16 24 L28 22Z"
  fill="..." stroke="..." strokeWidth="2.5"
/>

// 三角形
<path
  d="M32 14 L44 40 L20 40Z"
  fill="..." stroke="..." strokeWidth="2.5"
  strokeLinejoin="round"
/>

// 闪光
<path
  d="M48 16 L49 18 L51 19 L49 20 L48 22 L47 20 L45 19 L47 18Z"
  fill="#FFF4BD"
/>
*/

// ============================================
// 6. 可爱元素代码片段
// ============================================

/*
// 腮红 (椭圆形)
<ellipse
  cx="22" cy="36" rx="5" ry="3"
  fill="rgba(255, 158, 158, 0.4)"
/>

// 简单表情 (眼睛+微笑)
<circle cx="28" cy="30" r="2" fill="var(--text-dark)" />
<circle cx="36" cy="30" r="2" fill="var(--text-dark)" />
<path
  d="M28 36 Q32 38 36 36"
  stroke="#FFB5C5" strokeWidth="2"
  strokeLinecap="round" fill="none"
/>

// 高光 (左上角)
<ellipse
  cx="16" cy="18" rx="3" ry="2"
  fill="rgba(255, 255, 255, 0.7)"
/>

// 双高光效果
<ellipse cx="16" cy="18" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
<ellipse cx="48" cy="18" rx="3" ry="2" fill="rgba(255, 255, 255, 0.6)" />
*/
