import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({
  to = '/dashboard',
  className = '',
  showSubtitle = true,
}) => {
  const content = (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-3.5 group shrink-0 ${className}`}>
      {/* Icon Container */}
      <div className="relative w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#0A0A0A] to-[#000000] border border-gym-gold/40 flex items-center justify-center shadow-lg shadow-gym-red/10 group-hover:border-gym-red transition-all shrink-0">
        <span className="font-display tracking-tight text-gym-red text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">S</span>
      </div>
      
      {/* Text Container */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-2.5">
          <span className="font-display tracking-tight text-xs sm:text-[15px] md:text-base lg:text-lg xl:text-xl tracking-wide text-slate-100 font-semibold whitespace-nowrap">
            SMART GYM
          </span>
          <span className="font-sans font-medium tracking-widest text-[7px] sm:text-[8.5px] md:text-[9px] lg:text-[10px] uppercase tracking-wider px-1 py-0.5 rounded bg-gym-gold/15 text-gym-gold border border-gym-gold/30 font-bold whitespace-nowrap">
            INDIA
          </span>
        </div>
        
        {showSubtitle && (
          <div className="hidden sm:flex items-center gap-1 font-sans font-medium tracking-widest uppercase text-[8px] md:text-[9.5px] lg:text-[10.5px] xl:text-[11px] tracking-wider text-gym-subtle whitespace-nowrap mt-[1px] sm:mt-0.5 lg:mt-1">
            <span className="w-1 h-1 md:w-1.5 md:h-1.5 lg:w-2 lg:h-2 rounded-full bg-gym-emerald animate-pulse2 shrink-0" />
            <span>12 Flagship Hubs</span>
          </div>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block hover:opacity-95 transition">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
