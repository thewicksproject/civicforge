/**
 * Custom SVG illustrations for CivicForge.
 *
 * Art direction: "Warm Line Drawing"
 * - Stroke-first with selective low-opacity accent fills
 * - Rounded caps/joins for a soft, friendly feel
 * - currentColor strokes for automatic dark mode adaptation
 * - CSS custom property fills for themed accent colors
 */

interface IllustrationProps {
  className?: string;
}

export function EmptyBoardIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      role="img"
      aria-label="Empty bulletin board"
    >
      {/* Board background */}
      <rect x="30" y="20" width="140" height="110" rx="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Pinned card */}
      <rect x="50" y="42" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="1.2" fill="var(--golden-hour)" fillOpacity="0.08" />
      {/* Push pin */}
      <circle cx="74" cy="42" r="4" fill="var(--golden-hour)" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
      {/* Card lines */}
      <line x1="56" y1="54" x2="86" y2="54" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="56" y1="60" x2="80" y2="60" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="56" y1="66" x2="72" y2="66" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

      {/* Empty slot 1 — dashed */}
      <rect x="108" y="42" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />

      {/* Empty slot 2 — dashed */}
      <rect x="50" y="90" width="48" height="28" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />

      {/* Empty slot 3 — dashed */}
      <rect x="108" y="90" width="48" height="28" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />

      {/* Sparkle accent */}
      <path d="M164 30l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="var(--golden-hour)" fillOpacity="0.5" />
      <path d="M42 130l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="var(--meadow)" fillOpacity="0.4" />
    </svg>
  );
}

export function EmailSentIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      className={className}
      role="img"
      aria-label="Email sent"
    >
      {/* Envelope body */}
      <rect x="30" y="50" width="100" height="65" rx="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Envelope flap (open) */}
      <path d="M30 56l50 32 50-32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Letter peeking out */}
      <rect x="45" y="35" width="70" height="40" rx="3" stroke="currentColor" strokeWidth="1.2" fill="var(--golden-hour)" fillOpacity="0.06" />
      <line x1="55" y1="48" x2="95" y2="48" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="55" y1="55" x2="85" y2="55" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="55" y1="62" x2="75" y2="62" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

      {/* Floating dots going up */}
      <circle cx="80" cy="28" r="2.5" fill="var(--meadow)" fillOpacity="0.5" />
      <circle cx="70" cy="18" r="2" fill="var(--meadow)" fillOpacity="0.4" />
      <circle cx="90" cy="20" r="1.5" fill="var(--meadow)" fillOpacity="0.35" />
      <circle cx="75" cy="10" r="1.5" fill="var(--meadow)" fillOpacity="0.25" />
      <circle cx="88" cy="12" r="1" fill="var(--meadow)" fillOpacity="0.2" />
    </svg>
  );
}

export function PostingLockedIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      className={className}
      role="img"
      aria-label="Posting locked"
    >
      {/* Padlock body */}
      <rect x="52" y="62" width="56" height="44" rx="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Lock shackle */}
      <path d="M65 62V48a15 15 0 0130 0v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Keyhole — warm glow */}
      <circle cx="80" cy="80" r="6" fill="var(--golden-hour)" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      <rect x="78" y="84" width="4" height="10" rx="2" fill="var(--golden-hour)" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />

      {/* Warm keyhole glow */}
      <circle cx="80" cy="82" r="14" fill="var(--golden-hour)" fillOpacity="0.06" />

      {/* Small floating key */}
      <g transform="translate(118, 42) rotate(30)">
        <circle cx="0" cy="0" r="5" stroke="currentColor" strokeWidth="1" fill="var(--golden-hour)" fillOpacity="0.1" />
        <line x1="5" y1="0" x2="16" y2="0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <line x1="14" y1="0" x2="14" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <line x1="11" y1="0" x2="11" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Sparkle */}
      <path d="M42 55l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="var(--golden-hour)" fillOpacity="0.4" />
    </svg>
  );
}

export function NoResponsesIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      className={className}
      role="img"
      aria-label="No responses yet"
    >
      {/* Speech bubble */}
      <path
        d="M20 20h80a8 8 0 018 8v32a8 8 0 01-8 8H55l-15 14V68H20a8 8 0 01-8-8V28a8 8 0 018-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--horizon)"
        fillOpacity="0.05"
      />

      {/* Typing dots */}
      <circle cx="45" cy="46" r="3" fill="currentColor" opacity="0.25" />
      <circle cx="60" cy="46" r="3" fill="currentColor" opacity="0.18" />
      <circle cx="75" cy="46" r="3" fill="currentColor" opacity="0.12" />
    </svg>
  );
}

export function HeroIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      className={className}
      role="img"
      aria-label="Neighborhood connected by golden paths"
    >
      {/* Warm radial glow */}
      <circle cx="200" cy="150" r="120" fill="var(--golden-hour)" fillOpacity="0.06" />
      <circle cx="200" cy="150" r="80" fill="var(--golden-hour)" fillOpacity="0.04" />

      {/* Ground line */}
      <path d="M40 220c60-8 120-12 160-10s120 6 160 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" />

      {/* House 1 — left */}
      <g transform="translate(80, 155)">
        <rect x="0" y="20" width="40" height="35" rx="2" stroke="currentColor" strokeWidth="1.3" fill="var(--rose-clay)" fillOpacity="0.06" />
        <path d="M-5 22L20 5l25 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="15" y="35" width="10" height="20" rx="1" stroke="currentColor" strokeWidth="1" />
        <rect x="4" y="28" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </g>

      {/* House 2 — center */}
      <g transform="translate(175, 145)">
        <rect x="0" y="20" width="50" height="42" rx="2" stroke="currentColor" strokeWidth="1.3" fill="var(--meadow)" fillOpacity="0.06" />
        <path d="M-5 22L25 2l30 20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="18" y="38" width="14" height="24" rx="1" stroke="currentColor" strokeWidth="1" />
        <rect x="4" y="30" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <rect x="36" y="30" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </g>

      {/* House 3 — right */}
      <g transform="translate(280, 160)">
        <rect x="0" y="20" width="36" height="30" rx="2" stroke="currentColor" strokeWidth="1.3" fill="var(--horizon)" fillOpacity="0.06" />
        <path d="M-4 22L18 7l22 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="12" y="32" width="12" height="18" rx="1" stroke="currentColor" strokeWidth="1" />
      </g>

      {/* Golden connecting paths */}
      <path d="M120 195c20 5 40 2 55-2s30-5 50-2" stroke="var(--golden-hour)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0" opacity="0.5" />
      <path d="M225 192c15 3 30 5 45 2s25-5 35-2" stroke="var(--golden-hour)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* Figure 1 — giving */}
      <g transform="translate(155, 180)">
        <circle cx="0" cy="-12" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M0-7v16M-8 2l8-3 8 3M-5 14l-4 10M5 14l4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Small package */}
        <rect x="8" y="-4" width="8" height="6" rx="1" fill="var(--golden-hour)" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
      </g>

      {/* Figure 2 — receiving */}
      <g transform="translate(248, 178)">
        <circle cx="0" cy="-12" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M0-7v16M-8 2l8-3 8 3M-5 14l-4 10M5 14l4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Reaching hands */}
        <path d="M-8 0l-6-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Decorative sparkles */}
      <path d="M180 100l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="var(--golden-hour)" fillOpacity="0.4" />
      <path d="M310 130l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="var(--meadow)" fillOpacity="0.35" />
      <path d="M90 120l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="var(--horizon)" fillOpacity="0.3" />

      {/* Decorative dots */}
      <circle cx="140" cy="130" r="1.5" fill="var(--golden-hour)" fillOpacity="0.25" />
      <circle cx="260" cy="125" r="1" fill="var(--meadow)" fillOpacity="0.25" />
      <circle cx="200" cy="110" r="2" fill="var(--golden-hour)" fillOpacity="0.15" />
    </svg>
  );
}

export function OnboardingWelcomeIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      role="img"
      aria-label="Welcome home"
    >
      {/* Door frame */}
      <rect x="65" y="30" width="70" height="100" rx="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Door (open, angled) */}
      <path d="M65 130V30l-25 8v84z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="var(--golden-hour)" fillOpacity="0.06" />

      {/* Warm light spilling out */}
      <path d="M65 50c15 5 35 15 50 40s15 30 18 40" stroke="var(--golden-hour)" strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
      <ellipse cx="100" cy="100" rx="30" ry="20" fill="var(--golden-hour)" fillOpacity="0.08" />

      {/* Door handle */}
      <circle cx="72" cy="82" r="2.5" stroke="currentColor" strokeWidth="1" />

      {/* Welcome mat */}
      <rect x="70" y="130" width="50" height="8" rx="2" stroke="currentColor" strokeWidth="1" fill="var(--rose-clay)" fillOpacity="0.1" />
      <line x1="80" y1="134" x2="110" y2="134" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />

      {/* Plant */}
      <g transform="translate(145, 100)">
        <rect x="-6" y="10" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1" fill="var(--meadow)" fillOpacity="0.08" />
        <path d="M0 10c-2-8-8-12-6-18" stroke="var(--meadow)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M0 10c2-6 8-10 5-16" stroke="var(--meadow)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M0 10c0-8-4-14-1-20" stroke="var(--meadow)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        {/* Leaves */}
        <ellipse cx="-6" cy="-6" rx="4" ry="2.5" transform="rotate(-30 -6 -6)" fill="var(--meadow)" fillOpacity="0.15" />
        <ellipse cx="5" cy="-4" rx="4" ry="2.5" transform="rotate(20 5 -4)" fill="var(--meadow)" fillOpacity="0.15" />
      </g>

      {/* Sparkle */}
      <path d="M50 40l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="var(--golden-hour)" fillOpacity="0.4" />
    </svg>
  );
}

export function HowItWorksPostIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      role="img"
      aria-label="Post a need or offer"
    >
      {/* Board */}
      <rect x="20" y="20" width="80" height="70" rx="6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Card being placed */}
      <g transform="translate(35, 35)">
        <rect x="0" y="0" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="1.2" fill="var(--meadow)" fillOpacity="0.08" />
        {/* Pin */}
        <circle cx="20" cy="0" r="3" fill="var(--golden-hour)" fillOpacity="0.5" stroke="currentColor" strokeWidth="0.8" />
        {/* Text lines */}
        <line x1="6" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        <line x1="6" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        <line x1="6" y1="22" x2="18" y2="22" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* Hand placing */}
      <path d="M85 45c4-2 10-6 14-4s2 8-2 10l-12 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Motion lines */}
      <line x1="95" y1="30" x2="100" y2="25" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <line x1="100" y1="36" x2="106" y2="33" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <line x1="98" y1="44" x2="104" y2="43" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />

      {/* Small sparkle */}
      <path d="M30 85l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="var(--golden-hour)" fillOpacity="0.35" />
    </svg>
  );
}

export function HowItWorksMatchIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      role="img"
      aria-label="Get matched with neighbors"
    >
      {/* Person 1 */}
      <g transform="translate(28, 45)">
        <circle cx="0" cy="0" r="10" stroke="currentColor" strokeWidth="1.3" />
        <path d="M0 10v18M-10 16l10-2 10 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Person 2 */}
      <g transform="translate(92, 45)">
        <circle cx="0" cy="0" r="10" stroke="currentColor" strokeWidth="1.3" />
        <path d="M0 10v18M-10 16l10-2 10 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Glowing connection arc */}
      <path d="M40 45c10-20 30-20 40 0" stroke="var(--golden-hour)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M40 45c10-20 30-20 40 0" stroke="var(--golden-hour)" strokeWidth="4" strokeLinecap="round" opacity="0.1" />

      {/* Sparkle at top of arc */}
      <path d="M60 28l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="var(--golden-hour)" fillOpacity="0.5" />

      {/* Small connection dots along arc */}
      <circle cx="47" cy="34" r="1.5" fill="var(--golden-hour)" fillOpacity="0.3" />
      <circle cx="73" cy="34" r="1.5" fill="var(--golden-hour)" fillOpacity="0.3" />

      {/* Glow behind sparkle */}
      <circle cx="60" cy="32" r="8" fill="var(--golden-hour)" fillOpacity="0.06" />
    </svg>
  );
}

export function HowItWorksTrustIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      role="img"
      aria-label="Build trust together"
    >
      {/* Hands cupping */}
      <path d="M25 65c-4 2-8 8-6 14s8 8 14 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M95 65c4 2 8 8 6 14s-8 8-14 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 85c8 6 20 8 27 8s19-2 27-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Heart */}
      <path
        d="M60 50c-3-8-14-12-18-6s0 14 18 26c18-12 22-20 18-26s-15-2-18 6z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--rose-clay)"
        fillOpacity="0.1"
      />

      {/* Upward growth lines */}
      <line x1="60" y1="38" x2="60" y2="28" stroke="var(--meadow)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="50" y1="40" x2="46" y2="30" stroke="var(--meadow)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <line x1="70" y1="40" x2="74" y2="30" stroke="var(--meadow)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

      {/* Sparkles above */}
      <path d="M60 20l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" fill="var(--golden-hour)" fillOpacity="0.5" />
      <path d="M44 24l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="var(--meadow)" fillOpacity="0.35" />
      <path d="M76 24l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="var(--meadow)" fillOpacity="0.35" />
    </svg>
  );
}
