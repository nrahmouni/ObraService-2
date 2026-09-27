import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'orange';
}

export const ObraServiceLogo: React.FC<LogoProps> = ({ 
  className = "h-9 w-auto", 
  showText = true,
}) => (
  <div className={`inline-flex items-center gap-2.5 ${className}`}>
    {/* Geometric High-Contrast Industrial Construction Mark */}
    <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 border border-amber-400/30">
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-5 h-5 text-white"
      >
        {/* Modern Hardhat + Structural Foundation Beam icon */}
        <path 
          d="M2 18H22M4 18V13C4 8.58172 7.58172 5 12 5C16.4183 5 20 8.58172 20 13V18" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M12 5V11M8 18V14M16 18V14" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
      </svg>
    </div>

    {showText && (
      <div className="flex flex-col select-none">
        <div className="flex items-center">
          <span className="font-display font-black text-base sm:text-lg tracking-tight text-white leading-none">
            Obra<span className="text-orange-500">Service</span>
          </span>
          <span className="ml-1.5 px-1.5 py-0.2 bg-orange-500/20 border border-orange-500/40 text-orange-400 rounded text-[9px] font-mono font-black tracking-widest uppercase">
            PRO
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase leading-none mt-0.5">
          Construction Tech
        </span>
      </div>
    )}
  </div>
);

export default ObraServiceLogo;

