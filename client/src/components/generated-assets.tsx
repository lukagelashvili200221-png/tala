/**
 * Generated Assets Components
 * Ready-to-use React components for the gold trading app design assets
 */

import React from 'react';

/**
 * Hero Background Component
 * Modern gradient background with gold/amber tones
 */
export const HeroBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url(/assets/hero_gradient_background.png)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * Mobile Pattern Background Component
 * Subtle geometric pattern with gold theme
 */
export const MobilePatternBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="relative w-full min-h-screen"
      style={{
        backgroundImage: 'url(/assets/gold_pattern_mobile_background.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * Lucky Wheel Centerpiece Component
 * Modern decorative icon for lucky wheel center
 */
export const LuckyWheelCenterpiece: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}> = ({ size = 'md', animated = false }) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  };

  return (
    <div
      className={`${sizeClasses[size]} relative ${animated ? 'animate-spin' : ''}`}
      style={animated ? { animationDuration: '3s' } : {}}
    >
      <img
        src="/assets/lucky_wheel_centerpiece_icon.png"
        alt="Lucky Wheel Center"
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
};

/**
 * Success Celebration Component
 * Celebration/success graphic with confetti
 */
export const SuccessCelebration: React.FC<{
  title?: string;
  message?: string;
  onClose?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title = 'Success!', message, onClose, actionButton }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Celebration Graphic */}
        <div className="relative h-48">
          <img
            src="/assets/success_celebration_graphic.png"
            alt="Success"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          {message && <p className="text-gray-600 mb-6">{message}</p>}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {actionButton && (
              <button
                onClick={actionButton.onClick}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {actionButton.label}
              </button>
            )}
            {onClose && !actionButton && (
              <button
                onClick={onClose}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Close
              </button>
            )}
            {onClose && actionButton && (
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Background Component
 * Mobile pattern background for dashboard/wallet pages
 */
export const DashboardBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full" style={{ background: '#141E3C' }}>
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'url(/assets/gold_pattern_mobile_background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * Trading Interface Header
 * Hero section for trading page with gradient
 */
export const TradingHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="relative w-full py-12 mb-6"
      style={{
        backgroundImage: 'url(/assets/hero_gradient_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4">{children}</div>
    </div>
  );
};

/**
 * Responsive Image Component with Lazy Loading
 * Generic component for displaying any of the generated assets
 */
export const ResponsiveAsset: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}> = ({ src, alt, className = '', fill = false, priority = false }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={`${className} ${fill ? 'w-full h-full object-cover' : ''}`}
    />
  );
};

/**
 * Success Toast Notification
 * Lightweight success notification using celebration graphic
 */
export const SuccessToast: React.FC<{
  message: string;
  visible: boolean;
  onClose?: () => void;
}> = ({ message, visible, onClose }) => {
  React.useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
      <img
        src="/assets/success_celebration_graphic.png"
        alt="Success"
        className="w-12 h-12 object-cover rounded"
      />
      <p className="text-gray-800 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
};

export default {
  HeroBackground,
  MobilePatternBackground,
  LuckyWheelCenterpiece,
  SuccessCelebration,
  DashboardBackground,
  TradingHeader,
  ResponsiveAsset,
  SuccessToast,
};
