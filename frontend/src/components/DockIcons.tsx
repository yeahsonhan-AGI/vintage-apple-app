// Cute Hand-drawn 3D Style Dock Icons for Q-Draw OS
// Matching the style of ChestIcon and BackIcon from FitnessIcons.tsx

// More - 九宫格图标 (mint + blue gradient)
export const MoreIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(168, 216, 234, 0.3)" />
    {/* Grid base - hand-drawn rounded rectangle */}
    <rect
      x="12"
      y="12"
      width="40"
      height="40"
      rx="10"
      fill="#E8F5E8"
      stroke="#C5E8C0"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Grid dots - hand-drawn circles */}
    <circle cx="22" cy="22" r="4" fill="#A8D8EA" />
    <circle cx="32" cy="22" r="4" fill="#A8D8EA" />
    <circle cx="42" cy="22" r="4" fill="#A8D8EA" />
    <circle cx="22" cy="32" r="4" fill="#A8D8EA" />
    <circle cx="32" cy="32" r="4" fill="#A8D8EA" />
    <circle cx="42" cy="32" r="4" fill="#A8D8EA" />
    <circle cx="22" cy="42" r="4" fill="#A8D8EA" />
    <circle cx="32" cy="42" r="4" fill="#A8D8EA" />
    <circle cx="42" cy="42" r="4" fill="#A8D8EA" />
    {/* Cute highlights */}
    <ellipse cx="16" cy="16" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
    <ellipse cx="48" cy="16" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
  </svg>
)

// Notes - 笔记本+笔图标 (pink + lavender gradient)
export const NotesIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(255, 181, 197, 0.3)" />
    {/* Notebook base - hand-drawn */}
    <rect
      x="14"
      y="10"
      width="32"
      height="42"
      rx="5"
      fill="#FFF0F5"
      stroke="#FFB5C5"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Notebook lines - hand-drawn wavy */}
    <path d="M18 20Q30 19 42 20" stroke="#E8D5F2" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M18 28Q30 27 42 28" stroke="#E8D5F2" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M18 36Q30 35 42 36" stroke="#E8D5F2" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Pencil - hand-drawn */}
    <rect
      x="40"
      y="8"
      width="10"
      height="8"
      rx="2"
      fill="#FFE8B8"
      stroke="#FFDAB9"
      strokeWidth="2"
      transform="rotate(-30, 45, 12)"
    />
    {/* Pencil tip */}
    <path
      d="M52 6L56 10L52 14L48 10Z"
      fill="#FFB5C5"
      stroke="#FF9E9E"
      strokeWidth="1.5"
      transform="rotate(-30, 52, 10)"
    />
    {/* Pencil eraser */}
    <ellipse
      cx="42"
      cy="10"
      rx="4"
      ry="3"
      fill="#FFB5C5"
      transform="rotate(-30, 42, 10)"
    />
    {/* Cute highlights */}
    <ellipse cx="18" cy="14" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
  </svg>
)

// YouTube - 播放按钮图标 (coral + orange gradient)
export const YouTubeIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(255, 158, 158, 0.3)" />
    {/* Screen base - hand-drawn rounded rectangle */}
    <rect
      x="10"
      y="14"
      width="44"
      height="32"
      rx="8"
      fill="#FFF0F0"
      stroke="#FF9E9E"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Play button - hand-drawn triangle */}
    <path
      d="M28 22L28 38L42 30Z"
      fill="#FF9E9E"
      stroke="#FF8A80"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Screen stand - hand-drawn */}
    <path
      d="M24 46L40 46"
      stroke="#FFB5C5"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M32 46L32 50"
      stroke="#FFB5C5"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Cute highlights */}
    <ellipse cx="14" cy="18" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
    {/* Sparkle effect */}
    <path d="M48 20L49 22L51 23L49 24L48 26L47 24L45 23L47 22Z" fill="#FFF4BD" />
  </svg>
)

// Food - 鸡腿图标 (Q版手绘风格 - peach + coral)
export const FoodIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom Shadow - rgba(mainColor, 0.3) */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(255, 218, 185, 0.3)" />

    {/* Drumstick meat - 手绘丰满形状 */}
    <path
      d="M18 22C12 24 10 30 12 38C14 46 20 50 28 50C36 50 44 44 46 36C48 28 44 20 36 18C30 16 22 18 18 22Z"
      fill="#FFF0E8"
      stroke="#FFDAB9"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bone - 手绘双线效果 */}
    <path
      d="M40 8C40 4 44 2 48 4C52 6 52 12 48 14C46 15 44 14 42 13"
      stroke="#FFF4BD"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 8C40 4 44 2 48 4C52 6 52 12 48 14C46 15 44 14 42 13"
      stroke="#FFE8B8"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Meat texture - 手绘波浪线用Q曲线 */}
    <path d="M18 32Q24 30 30 32" stroke="#F5C4A8" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M16 38Q24 36 32 38" stroke="#F5C4A8" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20 44Q28 42 36 44" stroke="#F5C4A8" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Highlight - 左上角 (14-18, 14-22) */}
    <ellipse cx="20" cy="26" rx="4" ry="3" fill="rgba(255, 255, 255, 0.7)" />

    {/* Blush - 腮红效果 */}
    <ellipse cx="24" cy="40" rx="4" ry="2" fill="rgba(255, 158, 158, 0.3)" />

    {/* Sparkle - 可爱闪光 */}
    <path d="M50 18L51 20L53 21L51 22L50 24L49 22L47 21L49 20Z" fill="#FFF4BD" />
  </svg>
)

// Calendar/To do - 勾选框图标 (blue + lavender gradient)
export const CalendarIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(168, 216, 234, 0.3)" />
    {/* Calendar base - hand-drawn */}
    <rect
      x="14"
      y="12"
      width="36"
      height="40"
      rx="8"
      fill="#F0F8FF"
      stroke="#A8D8EA"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Calendar header strip */}
    <path
      d="M14 24Q32 22 50 24"
      stroke="#E8D5F2"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Ring holes */}
    <circle cx="22" cy="18" r="3" fill="#E8D5F2" />
    <circle cx="42" cy="18" r="3" fill="#E8D5F2" />
    {/* Checkmark - hand-drawn */}
    <path
      d="M24 36Q28 40 32 44Q40 32 44 28"
      stroke="#A8D8EA"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Cute highlights */}
    <ellipse cx="18" cy="16" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
    {/* Sparkle */}
    <path d="M48 30L49 32L51 33L49 34L48 36L47 34L45 33L47 32Z" fill="#E8D5F2" />
  </svg>
)

// Icons - 星星图标 (yellow + peach gradient)
export const IconsIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(255, 244, 189, 0.3)" />
    {/* Star base - hand-drawn wavy star */}
    <path
      d="M32 10L36 22L48 24L38 32L40 44L32 38L24 44L26 32L16 24L28 22Z"
      fill="#FFFEF8"
      stroke="#FFF4BD"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Star inner highlight */}
    <path
      d="M32 18L34 26L42 27L36 32L37 40L32 36L27 40L28 32L22 27L30 26Z"
      fill="#FFF8E8"
      opacity="0.7"
    />
    {/* Cute face */}
    <circle cx="30" cy="28" r="1.5" fill="var(--text-dark)" />
    <circle cx="34" cy="28" r="1.5" fill="var(--text-dark)" />
    <path
      d="M30 32Q32 34 34 32"
      stroke="#FFB5C5"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Blush */}
    <ellipse cx="28" cy="30" rx="2" ry="1" fill="rgba(255, 158, 158, 0.4)" />
    <ellipse cx="36" cy="30" rx="2" ry="1" fill="rgba(255, 158, 158, 0.4)" />
    {/* Sparkles around */}
    <path d="M12 20L13 22L15 23L13 24L12 26L11 24L9 23L11 22Z" fill="#FFDAB9" />
    <path d="M50 38L51 40L53 41L51 42L50 44L49 42L47 41L49 40Z" fill="#A8D8EA" />
  </svg>
)

// Fitness - 健身图标 (lavender + sky gradient)
export const FitnessIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(232, 213, 242, 0.3)" />
    {/* Arm/flexing shape - hand-drawn */}
    {/* Left arm */}
    <path
      d="M12 20C8 22 6 28 8 34C10 40 14 44 18 46L20 42C22 36 22 30 24 24C24 22 22 20 18 18Z"
      fill="#F4EDF8"
      stroke="#E8D5F2"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Right arm */}
    <path
      d="M52 20C56 22 58 28 56 34C54 40 50 44 46 46L44 42C42 36 42 30 40 24C40 22 42 20 46 18Z"
      fill="#F4EDF8"
      stroke="#E8D5F2"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Bicep bump left */}
    <ellipse cx="14" cy="30" rx="7" ry="9" fill="#FAF5FC" />
    {/* Bicep bump right */}
    <ellipse cx="50" cy="30" rx="7" ry="9" fill="#FAF5FC" />
    {/* Muscle definition lines - hand-drawn wavy */}
    <path
      d="M12 26Q14 28 16 26"
      stroke="#D8C4E8"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M52 26Q50 28 48 26"
      stroke="#D8C4E8"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cute highlights */}
    <ellipse cx="12" cy="24" rx="3" ry="4" fill="rgba(255, 255, 255, 0.7)" />
    <ellipse cx="52" cy="24" rx="3" ry="4" fill="rgba(255, 255, 255, 0.7)" />
    {/* Energy lines */}
    <path d="M24 14L26 12" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <path d="M32 12L32 10" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <path d="M40 14L38 12" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </svg>
)

// ============================================
// FOOD APP SPECIFIC ICONS
// ============================================

// Empty Plate Icon - 空盘子 (Q版手绘风格 - peach + mint)
export const EmptyFoodIcon = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom Shadow */}
    <ellipse cx="32" cy="56" rx="24" ry="4" fill="rgba(255, 218, 185, 0.3)" />

    {/* Plate - 手绘椭圆 */}
    <ellipse
      cx="32"
      cy="36"
      rx="26"
      ry="10"
      fill="#FFF0E8"
      stroke="#FFDAB9"
      strokeWidth="2.5"
    />

    {/* Plate inner ring - 手绘虚线 */}
    <ellipse
      cx="32"
      cy="36"
      rx="20"
      ry="6"
      fill="none"
      stroke="#FFE8D8"
      strokeWidth="1.5"
      strokeDasharray="4 3"
    />

    {/* Plate center凹陷 */}
    <ellipse
      cx="32"
      cy="36"
      rx="12"
      ry="3"
      fill="#FFE8D8"
    />

    {/* Fork - 左侧手绘 */}
    <path d="M14 18L12 36" stroke="#FFE8B8" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 16Q8 20 10 24" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M14 15Q12 20 14 25" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M18 15Q16 20 18 25" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Knife - 右侧手绘 */}
    <path d="M50 18L52 36" stroke="#FFE8B8" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 16Q54 18 52 26" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Highlights - 左上角 */}
    <ellipse cx="22" cy="32" rx="3" ry="1" fill="rgba(255, 255, 255, 0.6)" />
    <ellipse cx="42" cy="32" rx="3" ry="1" fill="rgba(255, 255, 255, 0.6)" />

    {/* 可爱表情 */}
    <circle cx="28" cy="36" r="1.5" fill="#999" />
    <circle cx="36" cy="36" r="1.5" fill="#999" />
    <path d="M30 40Q32 38 34 40" stroke="#FFB5C5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
)

// Fire Icon - 火焰 (Q版手绘风格 - coral + pink)
export const FireIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Fire flame - 手绘Q曲线 */}
    <path
      d="M16 4C12 8 8 14 10 20C11 24 14 28 18 28C24 28 28 22 26 16C24 12 20 8 16 4Z"
      fill="#FFF0F0"
      stroke="#FF9E9E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Inner flame - 分层效果 */}
    <path
      d="M16 10C14 14 12 18 14 22C15 24 17 25 19 24C22 22 22 18 20 14C18 12 17 10 16 10Z"
      fill="#FFB5C5"
      opacity="0.6"
    />

    {/* Flame highlight - 左上角 */}
    <path
      d="M14 14Q12 16 13 18"
      stroke="#FFF0F0"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* 可爱闪光 */}
    <path d="M24 12L25 13L26 12L25 11Z" fill="#FFF4BD" />
  </svg>
)

// Camera Icon - 相机 (Q版手绘风格 - sky blue + lavender)
export const CameraAddIcon = ({ className = '', size = 32 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Camera body - 手绘圆角矩形 */}
    <rect
      x="6"
      y="14"
      width="36"
      height="26"
      rx="8"
      fill="#F0F8FF"
      stroke="#A8D8EA"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Camera top - 手绘Q曲线 */}
    <path
      d="M14 14Q16 8 24 8Q32 8 34 14"
      fill="#E8F4F8"
      stroke="#A8D8EA"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Lens outer circle */}
    <circle cx="24" cy="26" r="9" fill="#E8D5F2" stroke="#B8E4F0" strokeWidth="2" />

    {/* Lens middle circle */}
    <circle cx="24" cy="26" r="6" fill="#D4EEF6" stroke="#A8D8EA" strokeWidth="1.5" />

    {/* Lens inner circle */}
    <circle cx="24" cy="26" r="3" fill="#F0F8FF" />

    {/* Lens reflection - 左上角高光 */}
    <ellipse cx="22" cy="24" rx="2" ry="1.5" fill="rgba(255, 255, 255, 0.8)" />

    {/* Shutter button */}
    <circle cx="38" cy="12" r="3" fill="#E8D5F2" stroke="#A8D8EA" strokeWidth="1.5" />

    {/* Add/plus symbol */}
    <path d="M24 26L24 26M24 23L24 29M21 26L27 26" stroke="#FF9E9E" strokeWidth="2" strokeLinecap="round" />

    {/* Highlight - 左上角 */}
    <ellipse cx="10" cy="18" rx="2" ry="1" fill="rgba(255, 255, 255, 0.7)" />

    {/* Flash闪光 */}
    <path d="M42 18L43 19L44 18L43 17Z" fill="#FFF4BD" />
  </svg>
)
