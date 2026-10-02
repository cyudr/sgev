import React from 'react';

interface ChargeSGLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  textColor?: string;
}

export const ChargeSGLogo: React.FC<ChargeSGLogoProps> = ({
  size = 'md',
  showBadge = true,
  showText = true,
  className = '',
  onClick,
  textColor,
}) => {
  const iconConfig = {
    xs: { box: 'w-6 h-6 rounded-lg', icon: 'text-[14px]' },
    sm: { box: 'w-7 h-7 rounded-xl', icon: 'text-[16px]' },
    md: { box: 'w-8 h-8 rounded-xl', icon: 'text-[19px]' },
    lg: { box: 'w-10 h-10 rounded-2xl', icon: 'text-[24px]' },
  }[size];

  const textClass = {
    xs: 'text-xs',
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 select-none ${
        onClick ? 'cursor-pointer group active:opacity-85 transition-all' : ''
      } ${className}`}
      title="ChargeSG - Singapore EV Charging Network"
    >
      <div
        className={`${iconConfig.box} bg-gradient-to-br from-[#006948] to-[#004f35] flex items-center justify-center text-white shadow-xs shadow-[#006948]/25 shrink-0 group-hover:scale-105 active:scale-95 transition-transform`}
      >
        <span className={`material-symbols-outlined text-[#85f8c4] leading-none ${iconConfig.icon}`}>
          bolt
        </span>
      </div>

      {showText && (
        <span
          className={`font-black tracking-tight leading-none transition-colors ${
            textColor || 'text-[#0d1c2f] group-hover:text-[#006948]'
          } ${textClass}`}
        >
          ChargeSG
        </span>
      )}

      {showBadge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#e6f8ef] text-[#006948] border border-[#85f8c4]/40 shrink-0 leading-none">
          SG 🇸🇬
        </span>
      )}
    </div>
  );
};
