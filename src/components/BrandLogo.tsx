import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  withTag?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  withTag = false,
}) => {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Original Geometric Emblem: Hexagonal layered rings with Plus core */}
      <div className={`relative ${iconSize} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-md shadow-emerald-500/20 text-white select-none`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 drop-shadow-sm"
        >
          {/* Hexagonal outer nodes */}
          <circle cx="20" cy="7" r="2.5" fill="currentColor" fillOpacity="0.9" />
          <circle cx="31.2" cy="13.5" r="2.5" fill="currentColor" fillOpacity="0.9" />
          <circle cx="31.2" cy="26.5" r="2.5" fill="currentColor" fillOpacity="0.9" />
          <circle cx="20" cy="33" r="2.5" fill="currentColor" fillOpacity="0.9" />
          <circle cx="8.8" cy="26.5" r="2.5" fill="currentColor" fillOpacity="0.9" />
          <circle cx="8.8" cy="13.5" r="2.5" fill="currentColor" fillOpacity="0.9" />

          {/* Intersecting flow lines */}
          <path
            d="M20 7L31.2 13.5M31.2 26.5L20 33M8.8 26.5L8.8 13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />
          <path
            d="M31.2 13.5L31.2 26.5M20 33L8.8 26.5M8.8 13.5L20 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.4"
          />

          {/* Plus mark core */}
          <path
            d="M20 14V26M14 20H26"
            stroke="white"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base sm:text-lg">
              ChatGPT 6
            </span>
            <span className="text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Plus
            </span>
          </div>
          {withTag && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
              Independent Prototype
            </span>
          )}
        </div>
      )}
    </div>
  );
};
