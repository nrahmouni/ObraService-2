import React from 'react';

interface PresentationModernBackdropProps {
  activeChapter: number;
  scrollProgress: number;
  isReducedMotion?: boolean;
}

const CHAPTER_ATMOSPHERES = [
  // 01: Cover (Warm Industrial Amber & Deep Obsidian)
  {
    glowA: 'rgba(234, 88, 12, 0.12)',
    glowB: 'rgba(251, 146, 60, 0.05)',
    spotX: '50%',
    spotY: '25%',
  },
  // 02: Problem (Rose & Crimson Diagnostics)
  {
    glowA: 'rgba(244, 63, 94, 0.10)',
    glowB: 'rgba(225, 29, 72, 0.05)',
    spotX: '20%',
    spotY: '45%',
  },
  // 03: Solution (Sky Blue & Cyan Resilient Cloud)
  {
    glowA: 'rgba(14, 165, 233, 0.12)',
    glowB: 'rgba(56, 189, 248, 0.06)',
    spotX: '80%',
    spotY: '35%',
  },
  // 04: Capabilities (Amber & Gold Functional Core)
  {
    glowA: 'rgba(245, 158, 11, 0.11)',
    glowB: 'rgba(217, 119, 6, 0.05)',
    spotX: '50%',
    spotY: '60%',
  },
  // 05: Tech Stack (Deep Cobalt & Electric Indigo)
  {
    glowA: 'rgba(59, 130, 246, 0.12)',
    glowB: 'rgba(99, 102, 241, 0.05)',
    spotX: '35%',
    spotY: '30%',
  },
  // 06: Benefits (Emerald Certified ROI)
  {
    glowA: 'rgba(16, 185, 129, 0.11)',
    glowB: 'rgba(5, 150, 105, 0.05)',
    spotX: '70%',
    spotY: '40%',
  },
  // 07: CTA (Commanding Amber & Sunset Halo)
  {
    glowA: 'rgba(234, 88, 12, 0.15)',
    glowB: 'rgba(245, 158, 11, 0.08)',
    spotX: '50%',
    spotY: '50%',
  },
];

export const PresentationModernBackdrop: React.FC<PresentationModernBackdropProps> = ({
  activeChapter,
  scrollProgress,
  isReducedMotion = false,
}) => {
  const currentAtmo = CHAPTER_ATMOSPHERES[Math.min(activeChapter, CHAPTER_ATMOSPHERES.length - 1)] || CHAPTER_ATMOSPHERES[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#09090b]">
      {/* 1. Subtle Precision Architectural Cadastral Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Micro Dot Matrix Accent */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 3. Smooth Atmospheric Ambient Glow Orbs (Fluid Linear/Apple Style) */}
      <div
        className="absolute rounded-full filter blur-[120px] transition-all duration-1000 ease-out"
        style={{
          width: '700px',
          height: '700px',
          left: currentAtmo.spotX,
          top: currentAtmo.spotY,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${currentAtmo.glowA} 0%, transparent 70%)`,
          opacity: 0.9,
        }}
      />

      <div
        className="absolute rounded-full filter blur-[160px] transition-all duration-1000 ease-out"
        style={{
          width: '900px',
          height: '600px',
          right: '10%',
          bottom: '15%',
          background: `radial-gradient(circle, ${currentAtmo.glowB} 0%, transparent 70%)`,
          opacity: 0.8,
        }}
      />

      {/* 4. Top Vignette / Linear Sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
    </div>
  );
};
