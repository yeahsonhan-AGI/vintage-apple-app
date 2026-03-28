// Q-Draw Icons - Food Mini APP
// Hand-drawn cute style with pastel colors
// Following q-draw-icons skill specifications

// ============================================
// FOOD DOCK ICON
// ============================================

// Food - 鸡腿图标 (peach + coral gradient)
// 完全符合 q-draw-icons 规范：viewBox 0 0 64 64, strokeWidth 2.5, 高光在左上
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

    {/* Drumstick meat - hand-drawn chubby shape */}
    <path
      d="M18 22C12 24 10 30 12 38C14 46 20 50 28 50C36 50 44 44 46 36C48 28 44 20 36 18C30 16 22 18 18 22Z"
      fill="#FFF0E8"
      stroke="#FFDAB9"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bone - hand-drawn double stroke */}
    <path
      d="M38 10C38 6 42 4 46 6C50 8 50 14 46 16C44 17 42 16 40 15"
      stroke="#FFF4BD"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M38 10C38 6 42 4 46 6C50 8 50 14 46 16C44 17 42 16 40 15"
      stroke="#FFE8B8"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />

    {/* Meat texture - hand-drawn wavy lines using Q curves */}
    <path d="M18 32Q24 30 30 32" stroke="#F5C4A8" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M16 38Q24 36 32 38" stroke="#F5C4A8" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20 44Q28 42 36 44" stroke="#F5C4A8" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Highlight - Top-left (14-18, 14-22) */}
    <ellipse cx="20" cy="26" rx="4" ry="3" fill="rgba(255, 255, 255, 0.7)" />

    {/* Blush - extra cuteness */}
    <ellipse cx="24" cy="40" rx="4" ry="2" fill="rgba(255, 158, 158, 0.3)" />

    {/* Sparkle - for extra cuteness */}
    <path d="M48 16L49 18L51 19L49 20L48 22L47 20L45 19L47 18Z" fill="#FFF4BD" />
  </svg>
)

// ============================================
// FOOD APP UI ICONS
// ============================================

// Empty Plate Icon - for empty food state (peach + mint)
export const EmptyFoodIcon = ({ className = '', size = 80 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom Shadow */}
    <ellipse cx="32" cy="58" rx="24" ry="4" fill="rgba(255, 218, 185, 0.3)" />

    {/* Plate - hand-drawn ellipse */}
    <ellipse
      cx="32"
      cy="36"
      rx="26"
      ry="10"
      fill="#FFF0E8"
      stroke="#FFDAB9"
      strokeWidth="2.5"
    />

    {/* Plate inner ring - hand-drawn wavy */}
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

    {/* Plate center - cute depression */}
    <ellipse
      cx="32"
      cy="36"
      rx="12"
      ry="3"
      fill="#FFE8D8"
    />

    {/* Fork - hand-drawn on left */}
    <path d="M14 18L12 36" stroke="#FFE8B8" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 16Q8 20 10 24" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M14 15Q12 20 14 25" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M18 15Q16 20 18 25" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Knife - hand-drawn on right */}
    <path d="M50 18L52 36" stroke="#FFE8B8" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 16Q54 18 52 26" stroke="#FFDAB9" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Highlights - Top-left */}
    <ellipse cx="22" cy="32" rx="3" ry="1" fill="rgba(255, 255, 255, 0.6)" />
    <ellipse cx="42" cy="32" rx="3" ry="1" fill="rgba(255, 255, 255, 0.6)" />

    {/* Sad cute face */}
    <circle cx="28" cy="36" r="1.5" fill="#999" />
    <circle cx="36" cy="36" r="1.5" fill="#999" />
    <path d="M30 40Q32 38 34 40" stroke="#FFB5C5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
)

// Fire Icon - for calories display (coral + yellow)
// Inline icon size, smaller viewBox for inline use
export const FireIcon = ({ className = '', size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Fire flame - hand-drawn with curves */}
    <path
      d="M16 4C12 8 8 14 10 20C11 24 14 28 18 28C24 28 28 22 26 16C24 12 20 8 16 4Z"
      fill="#FFF0F0"
      stroke="#FF9E9E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Inner flame - layered for depth */}
    <path
      d="M16 10C14 14 12 18 14 22C15 24 17 25 19 24C22 22 22 18 20 14C18 12 17 10 16 10Z"
      fill="#FFB5C5"
      opacity="0.6"
    />

    {/* Flame highlight - top-left */}
    <path
      d="M14 14Q12 16 13 18"
      stroke="#FFF0F0"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Cute sparkle */}
    <path d="M24 12L25 13L26 12L25 11Z" fill="#FFF4BD" />
  </svg>
)

// Camera Icon - for add photo button (sky blue + lavender)
export const CameraAddIcon = ({ className = '', size = 32 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Camera body - hand-drawn rounded rectangle */}
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

    {/* Camera top - hand-drawn wavy */}
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

    {/* Lens reflection - top-left highlight */}
    <ellipse cx="22" cy="24" rx="2" ry="1.5" fill="rgba(255, 255, 255, 0.8)" />

    {/* Shutter button */}
    <circle cx="38" cy="12" r="3" fill="#E8D5F2" stroke="#A8D8EA" strokeWidth="1.5" />

    {/* Add/plus symbol on camera */}
    <path d="M24 26L24 26M24 23L24 29M21 26L27 26" stroke="#FF9E9E" strokeWidth="2" strokeLinecap="round" />

    {/* Highlights - top-left */}
    <ellipse cx="10" cy="18" rx="2" ry="1" fill="rgba(255, 255, 255, 0.7)" />

    {/* Flash sparkle */}
    <path d="M42 18L43 19L44 18L43 17Z" fill="#FFF4BD" />
  </svg>
)

// ============================================
// ADDITIONAL FOOD-RELATED ICONS
// ============================================

// Apple Icon - healthy food (red + green)
export const AppleIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom Shadow */}
    <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(255, 158, 158, 0.3)" />

    {/* Apple body - hand-drawn heart-like shape */}
    <path
      d="M32 48C32 48 12 38 12 26C12 18 20 14 26 14C28 14 30 16 32 18C34 16 36 14 38 14C44 14 52 18 52 26C52 38 32 48 32 48Z"
      fill="#FFF0F0"
      stroke="#FF9E9E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Apple indent - hand-drawn curve */}
    <path
      d="M32 18Q30 22 32 26"
      stroke="#FFB5C5"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Stem - hand-drawn */}
    <path d="M30 14Q32 10 34 14" stroke="#C5E8C0" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Leaf - hand-drawn */}
    <path
      d="M34 12C38 10 42 12 44 16C40 16 36 14 34 12Z"
      fill="#E8F5E8"
      stroke="#C5E8C0"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Highlight - top-left */}
    <ellipse cx="20" cy="24" rx="4" ry="3" fill="rgba(255, 255, 255, 0.6)" />

    {/* Blush */}
    <ellipse cx="22" cy="32" rx="3" ry="2" fill="rgba(255, 158, 158, 0.3)" />
  </svg>
)

// Burger Icon - fast food (yellow + coral)
export const BurgerIcon = ({ className = '', size = 56 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom Shadow */}
    <ellipse cx="32" cy="58" rx="22" ry="4" fill="rgba(255, 218, 185, 0.3)" />

    {/* Top bun - hand-drounded */}
    <path
      d="M14 26Q32 20 50 26Q52 30 50 34Q32 28 14 34Q12 30 14 26Z"
      fill="#FFF4BD"
      stroke="#FFE8B8"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Sesame seeds - hand-drawn ellipses */}
    <ellipse cx="24" cy="26" rx="3" ry="1.5" fill="#FFE8B8" />
    <ellipse cx="32" cy="24" rx="3" ry="1.5" fill="#FFE8B8" />
    <ellipse cx="40" cy="26" rx="3" ry="1.5" fill="#FFE8B8" />

    {/* Lettuce - hand-drawn wavy */}
    <path d="M12 36Q20 34 28 36Q36 38 44 36Q52 34 52 36" stroke="#C5E8C0" strokeWidth="3" strokeLinecap="round" fill="none" />

    {/* Patty - hand-drawn */}
    <path
      d="M14 40Q32 36 50 40Q52 44 50 48Q32 44 14 48Q12 44 14 40Z"
      fill="#E8D5F2"
      stroke="#B8A0D8"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Tomato - hand-drawn */}
    <path d="M16 50Q32 46 48 50" stroke="#FF9E9E" strokeWidth="3" strokeLinecap="round" />

    {/* Bottom bun - hand-drawn */}
    <path
      d="M14 52Q32 48 50 52Q52 56 50 56Q32 52 14 56Q12 56 14 52Z"
      fill="#FFE8B8"
      stroke="#FFDAB9"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Highlight - top-left */}
    <ellipse cx="20" cy="30" rx="3" ry="2" fill="rgba(255, 255, 255, 0.6)" />

    {/* Cute face */}
    <circle cx="30" cy="44" r="1.5" fill="var(--text-dark)" />
    <circle cx="34" cy="44" r="1.5" fill="var(--text-dark)" />
  </svg>
)

// ============================================
// MEAL TYPE ICONS
// ============================================

// Breakfast Icon (sun + egg) (yellow + blue)
export const BreakfastIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sun rays - hand-drawn */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180
      const x1 = 24 + Math.cos(rad) * 14
      const y1 = 24 + Math.sin(rad) * 14
      const x2 = 24 + Math.cos(rad) * 18
      const y2 = 24 + Math.sin(rad) * 18
      return <path key={i} d={`M${x1} ${y1}Q${24} ${24} ${x2} ${y2}`} stroke="#FFF4BD" strokeWidth="2" strokeLinecap="round" />
    })}

    {/* Sun center */}
    <circle cx="24" cy="24" r="8" fill="#FFFEF8" stroke="#FFF4BD" strokeWidth="2" />

    {/* Egg white - hand-drawn ellipse */}
    <ellipse cx="32" cy="34" rx="10" ry="6" fill="#F0F8FF" stroke="#A8D8EA" strokeWidth="1.5" />

    {/* Egg yolk - hand-drawn circle */}
    <circle cx="32" cy="34" r="3" fill="#FFDAB9" />

    {/* Highlight */}
    <ellipse cx="20" cy="20" rx="2" ry="1" fill="rgba(255, 255, 255, 0.7)" />
  </svg>
)

// Lunch Icon (bowl) (mint + yellow)
export const LunchIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bowl - hand-drawn */}
    <path
      d="M12 18Q24 16 36 18L34 36Q24 40 14 36Z"
      fill="#E8F5E8"
      stroke="#C5E8C0"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Bowl rim - hand-drawn ellipse */}
    <ellipse cx="24" cy="18" rx="12" ry="4" fill="#F0F8F0" stroke="#C5E8C0" strokeWidth="2" />

    {/* Steam - hand-drawn wavy */}
    <path d="M18 12Q20 10 22 12" stroke="#FFF4BD" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M24 10Q26 8 28 10" stroke="#FFF4BD" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M30 12Q32 10 34 12" stroke="#FFF4BD" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Highlight */}
    <ellipse cx="16" cy="20" rx="2" ry="1" fill="rgba(255, 255, 255, 0.6)" />
  </svg>
)

// Dinner Icon (plate + cutlery) (lavender + pink)
export const DinnerIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Plate - hand-drawn */}
    <ellipse cx="24" cy="26" rx="16" ry="6" fill="#F4EDF8" stroke="#E8D5F2" strokeWidth="2" />

    {/* Fork left - hand-drawn */}
    <path d="M12 14L10 30" stroke="#E8D5F2" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 12Q6 16 8 20" stroke="#E8D5F2" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M12 11Q10 16 12 21" stroke="#E8D5F2" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M16 11Q14 16 16 21" stroke="#E8D5F2" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Knife right - hand-drawn */}
    <path d="M36 14L38 30" stroke="#E8D5F2" strokeWidth="2" strokeLinecap="round" />
    <path d="M36 12Q40 14 38 22" stroke="#E8D5F2" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Highlight */}
    <ellipse cx="18" cy="24" rx="2" ry="1" fill="rgba(255, 255, 255, 0.6)" />

    {/* Sparkle */}
    <path d="M40 20L41 21L42 20L41 19Z" fill="#FFF4BD" />
  </svg>
)

// Snack Icon (cookie) (peach + chocolate)
export const SnackIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Cookie - hand-drawn circle */}
    <circle cx="24" cy="24" r="16" fill="#FFF0E8" stroke="#FFDAB9" strokeWidth="2.5" />

    {/* Chocolate chips - hand-drawn circles */}
    <circle cx="18" cy="18" r="2.5" fill="#B8A0A0" />
    <circle cx="30" cy="20" r="2" fill="#B8A0A0" />
    <circle cx="20" cy="28" r="2" fill="#B8A0A0" />
    <circle cx="32" cy="30" r="2.5" fill="#B8A0A0" />
    <circle cx="24" cy="34" r="2" fill="#B8A0A0" />

    {/* Bite mark - hand-drawn */}
    <path
      d="M40 24Q42 18 38 14"
      stroke="#FFF0E8"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />

    {/* Highlight */}
    <ellipse cx="16" cy="16" rx="3" ry="2" fill="rgba(255, 255, 255, 0.6)" />

    {/* Crumbs */}
    <circle cx="10" cy="32" r="1.5" fill="#FFE8D8" />
    <circle cx="14" cy="38" r="1" fill="#FFE8D8" />
  </svg>
)
