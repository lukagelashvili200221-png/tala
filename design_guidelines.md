# Gold Trading Platform Design Guidelines

## Design Approach: Reference-Based Hybrid
Drawing inspiration from **Revolut** (financial trust), **Binance** (crypto trading UI), and **Duolingo** (gamification elements) to create a modern fintech platform with engaging game mechanics.

## Core Design Principles
1. **Trust Through Clarity**: Financial information displayed with high contrast, clear hierarchy
2. **Guided Experience**: Progressive disclosure - users should never feel lost
3. **Celebration Moments**: Reward actions with micro-animations (wheel spin, successful trades)
4. **Mobile-First Excellence**: Every interaction optimized for thumb-reach zones

---

## Typography System

### Font Families
- **Primary (Arabic/Persian)**: 'Vazirmatn' via Google Fonts - modern, highly legible Persian font
- **Numbers/English**: 'Inter' - excellent for financial figures
- **Display**: 'Outfit' - bold, modern headers

### Hierarchy
- **Hero Numbers** (wallet balances): text-5xl to text-6xl, font-bold
- **Page Titles**: text-3xl, font-bold
- **Section Headers**: text-xl, font-semibold
- **Body Text**: text-base, font-normal
- **Captions/Labels**: text-sm, text-gray-600
- **Critical Info** (warnings, KYC status): text-sm, font-medium

---

## Layout System

### Spacing Standards
Use Tailwind units: **4, 6, 8, 12, 16, 24** (consistent rhythm)
- Component padding: p-6 (mobile), p-8 (desktop)
- Section gaps: gap-6 (cards), gap-12 (major sections)
- Safe zones: Bottom nav occupies h-20, add pb-24 to scrollable content

### Grid Structure
- **Mobile**: Single column, max-w-lg mx-auto
- **Desktop**: max-w-6xl mx-auto, 2-column layouts where appropriate
- **Cards**: Consistent border-radius of rounded-2xl

---

## Component Library

### Navigation
**Bottom Tab Bar** (Fixed, Always Visible):
- 5 icons: Home, Wallet, Wheel, Trading, Profile
- Active state: icon with gradient background circle, subtle scale effect
- Icons: 24px, labels: text-xs
- Height: h-20 with backdrop-blur-xl, border-t

### Wallet Display
**Balance Cards** (Dashboard):
- Two prominent cards: Gold (Sut) and Toman balances
- Large numbers (text-5xl) with subtle animated counter on change
- Small icon indicators (trending up/down)
- Gradient backgrounds: Gold card (amber gradient), Toman card (blue gradient)
- Glass-morphism effect: backdrop-blur, semi-transparent

### Lucky Wheel Section
**Wheel Component**:
- Circular wheel with 8 segments, 45° each
- Center spin button: Large (120px diameter), pulsing glow effect
- Segment styling: Alternating subtle gradients, clear text labels
- Prize amounts: Bold, high-contrast text
- Confetti animation on win, shake animation on empty
- Daily limit indicator: Circular progress ring around wheel

### Trading Interface
**Sell Section** (Active):
- Input card: Large number input for gold amount
- Live conversion preview: "= X,XXX تومان" with refresh icon
- Prominent CTA: Full-width gradient button
- Current rate display: Small card showing live gold price

**Buy Section** (Locked):
- Overlay with blur + lock icon
- "Coming Soon" message with subtle animation

### KYC Verification
**Multi-Step Card**:
- Progress indicator: 4 dots (Personal Info, National ID, Birth Date, Bank Details)
- Each step in expandable accordion
- Upload zones: Dashed border, drag-drop with preview
- Success states: Green checkmark with slide-in animation

### Referral System
**Code Display Card**:
- Large, selectable referral code in monospace font
- Copy button with success feedback
- Referral counter: "3/5 Verified" with progress bar
- Reward tracker: "+1,000 Sut per referral"

---

## Images & Visual Assets

### Background Treatments
- **Hero/Landing**: Full-width gradient mesh background (gold/amber tones) with overlay pattern from user's img folder
- **Dashboard**: Subtle geometric pattern, low opacity
- **Wheel Section**: Radial gradient spotlight effect
- **KYC Section**: Clean white/neutral to emphasize form trust

### Image Placements
1. **Registration Flow**: Background pattern from user's images (25% opacity)
2. **Lucky Wheel**: Center decorative element/logo from user's assets
3. **Empty States**: Illustrations from user's folder (withdraw locked, no referrals)
4. **Success Modals**: Celebration graphics

### Icon Strategy
- **Font Awesome** for financial icons (wallet, chart, lock, bank)
- 24px base size, 32px for primary actions

---

## Interaction Patterns

### Button Hierarchy
1. **Primary CTA**: Full-width, gradient (gold-to-amber), rounded-xl, py-4, font-semibold
2. **Secondary**: Outlined, border-2, transparent background
3. **Tertiary**: Text-only, underline on hover

### Form Elements
- **Input Fields**: Large touch targets (h-14), rounded-xl, border-2
- **OTP Input**: 4 separate boxes, auto-focus next, scale animation on fill
- **Upload Zones**: min-h-48, dashed border with camera icon

### Feedback
- **Success**: Green toast (top), slide-down with checkmark, auto-dismiss 3s
- **Error**: Red toast, shake animation, manual dismiss
- **Loading**: Skeleton screens (not spinners) with shimmer effect
- **Disabled States**: 40% opacity, cursor-not-allowed

---

## Animation Guidelines

**Use Sparingly - High Impact Moments Only**:
1. Wheel spin (3s rotation with easing)
2. Balance update (counter animation, 1s)
3. Referral unlock (confetti burst)
4. Step completion checkmarks (scale + fade)
5. Bottom nav active tab (spring bounce)

All others: Subtle transitions (200ms ease-in-out)

---

## Mobile-Specific Optimizations

- **Thumb Zone Priority**: Primary actions in bottom 60% of screen
- **Swipe Gestures**: Horizontal swipe between wallet tabs
- **Pull-to-Refresh**: Dashboard updates
- **Haptic Feedback**: On critical actions (spin wheel, confirm trade)
- **Auto-Scroll**: After form submission to show feedback
- **Safe Areas**: Respect iOS notch/Android navigation

---

## Critical Quality Standards

1. **Persian RTL Support**: Full right-to-left layout, numbers LTR
2. **Number Formatting**: Persian numerals with thousand separators (۱,۰۰۰)
3. **Accessibility**: Minimum contrast 4.5:1, touch targets 44px
4. **Performance**: Smooth 60fps animations, lazy-load images
5. **Progressive Disclosure**: Don't show locked features until relevant

This design creates a premium, trustworthy fintech experience with playful gamification elements, optimized for mobile-first Persian users.