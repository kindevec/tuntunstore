import React from 'react';

interface DiamondIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emerald' | 'gold' | 'cyan' | 'purple';
  className?: string;
}

export const DiamondIcon: React.FC<DiamondIconProps> = ({
  size = 'md',
  variant = 'emerald',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const gradientColors = {
    emerald: 'from-emerald-400 via-teal-300 to-emerald-600',
    gold: 'from-amber-300 via-yellow-400 to-amber-600',
    cyan: 'from-cyan-300 via-sky-400 to-blue-600',
    purple: 'from-purple-400 via-indigo-400 to-violet-600',
  };

  const glowShadows = {
    emerald: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    gold: 'drop-shadow-[0_0_14px_rgba(245,158,11,0.6)]',
    cyan: 'drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]',
    purple: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${glowShadows[variant]} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} transition-transform duration-300 hover:scale-110`}
      >
        <path
          d="M12 2L2 9L12 22L22 9L12 2Z"
          fill={`url(#diamond-grad-${variant})`}
          stroke={variant === 'gold' ? '#fef08a' : '#a7f3d0'}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M12 2L7 9M12 2L17 9M12 22L7 9M12 22L17 9M2 9H22M7 9L12 14L17 9"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id={`diamond-grad-${variant}`}
            x1="2"
            y1="2"
            x2="22"
            y2="22"
            gradientUnits="userSpaceOnUse"
          >
            {variant === 'emerald' && (
              <>
                <stop stopColor="#34d399" />
                <stop offset="0.5" stopColor="#10b981" />
                <stop offset="1" stopColor="#047857" />
              </>
            )}
            {variant === 'gold' && (
              <>
                <stop stopColor="#fde047" />
                <stop offset="0.5" stopColor="#f59e0b" />
                <stop offset="1" stopColor="#b45309" />
              </>
            )}
            {variant === 'cyan' && (
              <>
                <stop stopColor="#7dd3fc" />
                <stop offset="0.5" stopColor="#0284c7" />
                <stop offset="1" stopColor="#0369a1" />
              </>
            )}
            {variant === 'purple' && (
              <>
                <stop stopColor="#c084fc" />
                <stop offset="0.5" stopColor="#9333ea" />
                <stop offset="1" stopColor="#6b21a8" />
              </>
            )}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
