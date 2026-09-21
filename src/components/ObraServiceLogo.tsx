import React from 'react';

export const ObraServiceLogo: React.FC<{ className?: string }> = ({ className = "w-48" }) => (
  <svg viewBox="-10 0 300 60" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className="fill-current">
      <path d="M10 10h30v40H10z" opacity="0.4"/>
      <path d="M25 5h30v40H25z" opacity="0.7"/>
      <path d="M40 0h30v40H40z" className="text-orange-500 fill-current"/>
    </g>
    <text x="85" y="42" fontFamily="sans-serif" fontWeight="800" fontSize="36" letterSpacing="-1" fill="currentColor">
      <tspan>Obra</tspan>
      <tspan fill="#FF6600">Service</tspan>
    </text>
  </svg>
);
