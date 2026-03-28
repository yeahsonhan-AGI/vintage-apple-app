// Cute Hand-drawn 3D Style Body Part Icons for Fitness App

export const StrengthTypeIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="56" rx="20" ry="4" fill="rgba(197, 232, 192, 0.3)" />
    {/* Dumbbell - hand-drawn style */}
    {/* Left weight plate */}
    <rect x="4" y="24" width="12" height="20" rx="5" fill="#E8F5E8" stroke="#C5E8C0" strokeWidth="2.5" />
    <rect x="6" y="26" width="8" height="16" rx="3" fill="#C5E8C0" opacity="0.5" />
    {/* Right weight plate */}
    <rect x="48" y="24" width="12" height="20" rx="5" fill="#E8F5E8" stroke="#C5E8C0" strokeWidth="2.5" />
    <rect x="50" y="26" width="8" height="16" rx="3" fill="#C5E8C0" opacity="0.5" />
    {/* Handle bar - hand-drawn curve */}
    <path
      d="M16 32Q24 30 32 32Q40 34 48 32"
      stroke="#A8D8EA"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M16 32Q24 30 32 32Q40 34 48 32"
      stroke="#B8E4F0"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cute highlights */}
    <ellipse cx="8" cy="28" rx="2" ry="3" fill="rgba(255, 255, 255, 0.7)" />
    <ellipse cx="56" cy="28" rx="2" ry="3" fill="rgba(255, 255, 255, 0.7)" />
  </svg>
)

export const CardioTypeIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="56" rx="18" ry="4" fill="rgba(255, 158, 158, 0.2)" />
    {/* Heart shape - hand-drawn wavy lines */}
    <path
      d="M32 52C32 52 8 38 8 24C8 16 14 12 20 12C24 12 28 14 32 18C36 14 40 12 44 12C50 12 56 16 56 24C56 38 32 52 32 52Z"
      fill="#FFE8E8"
      stroke="#FFB5C5"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Heart highlight - hand-drawn */}
    <path
      d="M18 18Q20 16 22 18"
      stroke="#FFD4E0"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Pulse line - ECG style */}
    <path
      d="M20 32L26 32L28 26L32 38L36 30L38 32L44 32"
      stroke="#FF9E9E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Cute blush spots */}
    <ellipse cx="20" cy="28" rx="3" ry="2" fill="rgba(255, 158, 158, 0.4)" />
    <ellipse cx="44" cy="28" rx="3" ry="2" fill="rgba(255, 158, 158, 0.4)" />
    {/* Sparkle */}
    <path d="M48 16L49 18L51 19L49 20L48 22L47 20L45 19L47 18Z" fill="#FFF4BD" />
  </svg>
)

export const EmptyStrengthIcon = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="40" cy="72" rx="24" ry="5" fill="rgba(197, 232, 192, 0.3)" />
    {/* Dumbbell shape - hand-drawn style */}
    {/* Left weight */}
    <rect x="8" y="32" width="16" height="24" rx="6" fill="#C5E8C0" stroke="#9DD49A" strokeWidth="2.5" />
    {/* Right weight */}
    <rect x="56" y="32" width="16" height="24" rx="6" fill="#C5E8C0" stroke="#9DD49A" strokeWidth="2.5" />
    {/* Handle bar */}
    <rect x="24" y="40" width="32" height="8" rx="4" fill="#A8D8EA" stroke="#7DB8D0" strokeWidth="2" />
    {/* Cute face */}
    <circle cx="40" cy="30" r="3" fill="var(--text-dark)" opacity="0.6" />
    <circle cx="40" cy="30" r="1.5" fill="white" />
    {/* Blush */}
    <ellipse cx="32" cy="34" rx="4" ry="2" fill="rgba(255, 158, 158, 0.4)" />
    <ellipse cx="48" cy="34" rx="4" ry="2" fill="rgba(255, 158, 158, 0.4)" />
  </svg>
)

export const EmptyCardioIcon = ({ className = '', size = 64 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="40" cy="72" rx="24" ry="5" fill="rgba(168, 216, 234, 0.3)" />
    {/* Running shoe - hand-drawn style */}
    <path
      d="M16 48C12 44 12 36 16 32C20 28 28 28 36 32L52 40C60 44 64 48 64 52C64 58 58 60 52 58L28 52C20 50 16 52 16 48Z"
      fill="#E8F4F8"
      stroke="#A8D8EA"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Shoe sole */}
    <path
      d="M14 52Q20 56 40 58Q60 60 66 56"
      stroke="#B8E4F0"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Laces */}
    <path d="M30 38L34 44" stroke="#7DB8D0" strokeWidth="2" strokeLinecap="round" />
    <path d="M36 36L40 44" stroke="#7DB8D0" strokeWidth="2" strokeLinecap="round" />
    <path d="M42 36L44 42" stroke="#7DB8D0" strokeWidth="2" strokeLinecap="round" />
    {/* Motion lines */}
    <path d="M68 36L72 34" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <path d="M70 42L76 40" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <path d="M70 48L74 48" stroke="#B8E4F0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </svg>
)

export const ChestIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(255, 158, 158, 0.3)" />
    {/* Body base */}
    <path
      d="M32 8C20 8 14 14 12 20C10 26 12 32 14 36L20 52L32 56L44 52L50 36C52 32 54 26 52 20C50 14 44 8 32 8Z"
      fill="#FFE4E1"
      stroke="#FF9E9E"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Left pec - hand-drawn wavy line */}
    <path
      d="M16 22Q18 28 20 34Q22 40 24 42"
      stroke="#FFB5C5"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Right pec - hand-drawn wavy line */}
    <path
      d="M48 22Q46 28 44 34Q42 40 40 42"
      stroke="#FFB5C5"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Chest line center */}
    <path
      d="M32 20V48"
      stroke="#FFB5C5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
    />
    {/* Cute highlight */}
    <ellipse cx="22" cy="26" rx="4" ry="2" fill="rgba(255, 255, 255, 0.6)" />
    <ellipse cx="42" cy="26" rx="4" ry="2" fill="rgba(255, 255, 255, 0.6)" />
    {/* Blush */}
    <ellipse cx="18" cy="32" rx="5" ry="3" fill="rgba(255, 158, 158, 0.4)" />
    <ellipse cx="46" cy="32" rx="5" ry="3" fill="rgba(255, 158, 158, 0.4)" />
  </svg>
)

export const BackIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
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
    {/* Back body base */}
    <path
      d="M32 6C24 6 18 10 16 16C14 22 14 30 16 38L18 54L32 56L46 54L48 38C50 30 50 22 48 16C46 10 40 6 32 6Z"
      fill="#E8F4F8"
      stroke="#A8D8EA"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Spine line - hand-drawn wavy */}
    <path
      d="M32 14Q31 22 32 30Q33 38 32 48"
      stroke="#B8E4F0"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Left shoulder blade */}
    <path
      d="M20 20Q18 26 20 32"
      stroke="#B8E4F0"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Right shoulder blade */}
    <path
      d="M44 20Q46 26 44 32"
      stroke="#B8E4F0"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cute highlight */}
    <ellipse cx="26" cy="22" rx="4" ry="2" fill="rgba(255, 255, 255, 0.7)" />
    <ellipse cx="38" cy="22" rx="4" ry="2" fill="rgba(255, 255, 255, 0.7)" />
  </svg>
)

export const LegsIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(197, 232, 192, 0.3)" />
    {/* Left leg */}
    <path
      d="M16 8C12 12 10 20 10 28C10 38 12 48 14 54L24 56C26 48 26 40 26 32C26 24 24 16 20 10Z"
      fill="#E8F5E8"
      stroke="#C5E8C0"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Right leg */}
    <path
      d="M48 8C52 12 54 20 54 28C54 38 52 48 50 54L40 56C38 48 38 40 38 32C38 24 40 16 44 10Z"
      fill="#E8F5E8"
      stroke="#C5E8C0"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Knee definition left */}
    <path
      d="M16 32Q18 34 20 32"
      stroke="#A8D8B0"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Knee definition right */}
    <path
      d="M48 32Q46 34 44 32"
      stroke="#A8D8B0"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cute highlights */}
    <ellipse cx="18" cy="20" rx="3" ry="5" fill="rgba(255, 255, 255, 0.6)" />
    <ellipse cx="46" cy="20" rx="3" ry="5" fill="rgba(255, 255, 255, 0.6)" />
  </svg>
)

export const ShouldersIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="56" rx="22" ry="4" fill="rgba(232, 213, 242, 0.3)" />
    {/* Shoulder base - hand-drawn rounded shape */}
    <path
      d="M8 24C6 20 8 14 14 12C20 10 26 12 32 14C38 12 44 10 50 12C56 14 58 20 56 24C54 28 50 30 44 32L32 34L20 32C14 30 10 28 8 24Z"
      fill="#F4EDF8"
      stroke="#E8D5F2"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Left shoulder ball */}
    <circle cx="16" cy="20" r="8" fill="#FAF5FC" stroke="#E8D5F2" strokeWidth="2" />
    {/* Right shoulder ball */}
    <circle cx="48" cy="20" r="8" fill="#FAF5FC" stroke="#E8D5F2" strokeWidth="2" />
    {/* Shoulder detail lines - hand-drawn */}
    <path
      d="M14 26Q16 28 18 26"
      stroke="#D8C4E8"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M50 26Q48 28 46 26"
      stroke="#D8C4E8"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cute highlights */}
    <ellipse cx="14" cy="18" rx="3" ry="2" fill="rgba(255, 255, 255, 0.8)" />
    <ellipse cx="50" cy="18" rx="3" ry="2" fill="rgba(255, 255, 255, 0.8)" />
  </svg>
)

export const ArmsIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="20" ry="4" fill="rgba(255, 218, 185, 0.3)" />
    {/* Left arm - flexing! */}
    <path
      d="M8 16C4 18 2 24 4 30C6 36 10 40 14 42L16 38C18 32 18 26 20 20C20 18 18 16 14 14Z"
      fill="#FFF0E8"
      stroke="#FFDAB9"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Right arm - flexing! */}
    <path
      d="M56 16C60 18 62 24 60 30C58 36 54 40 50 42L48 38C46 32 46 26 44 20C44 18 46 16 50 14Z"
      fill="#FFF0E8"
      stroke="#FFDAB9"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Bicep bump left */}
    <ellipse cx="12" cy="28" rx="6" ry="8" fill="#FFE8D8" />
    {/* Bicep bump right */}
    <ellipse cx="52" cy="28" rx="6" ry="8" fill="#FFE8D8" />
    {/* Muscle definition lines */}
    <path
      d="M10 24Q12 26 14 24"
      stroke="#F5C4A8"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M54 24Q52 26 50 24"
      stroke="#F5C4A8"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cute highlights */}
    <ellipse cx="10" cy="22" rx="3" ry="4" fill="rgba(255, 255, 255, 0.6)" />
    <ellipse cx="54" cy="22" rx="3" ry="4" fill="rgba(255, 255, 255, 0.6)" />
  </svg>
)

export const CoreIcon = ({ className = '', size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft shadow */}
    <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(255, 244, 189, 0.3)" />
    {/* Core/Abs base - rounded rectangular */}
    <rect
      x="20"
      y="10"
      width="24"
      height="44"
      rx="12"
      fill="#FFFEF5"
      stroke="#FFF4BD"
      strokeWidth="2.5"
    />
    {/* Top abs */}
    <path
      d="M26 20Q32 22 38 20"
      stroke="#F5E8A8"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Middle abs */}
    <path
      d="M26 28Q32 30 38 28"
      stroke="#F5E8A8"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Bottom abs */}
    <path
      d="M26 36Q32 38 38 36"
      stroke="#F5E8A8"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Center line */}
    <path
      d="M32 16V44"
      stroke="#F5E8A8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="3 3"
    />
    {/* Cute highlights */}
    <ellipse cx="26" cy="18" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
    <ellipse cx="38" cy="18" rx="3" ry="2" fill="rgba(255, 255, 255, 0.7)" />
  </svg>
)
