import { useState, useEffect } from 'react';

/**
 * Robust media query detection hook.
 * Returns true whenever the viewport width is below the specified breakpoint (default: 768px).
 *
 * Capabilities:
 * - SSR / initial render safe.
 * - Uses `window.matchMedia` with fractional boundary precision (< 768px -> max-width: 767.98px).
 * - Implements dual modern `addEventListener('change')` and legacy `addListener('change')` fallbacks.
 * - Passive window `resize` and `orientationchange` listener safeguards for instant response on mobile rotation & resizing.
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fractional pixel to avoid ambiguous boundary states at exactly 768px
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`);

    const updateStatus = () => {
      const matches = window.innerWidth < breakpoint || mediaQuery.matches;
      setIsMobile((prev) => (prev !== matches ? matches : prev));
    };

    // Run once on mount to synchronize with current window dimensions
    updateStatus();

    const handleMediaChange = (event: MediaQueryListEvent) => {
      const matches = event.matches || window.innerWidth < breakpoint;
      setIsMobile((prev) => (prev !== matches ? matches : prev));
    };

    // Modern matchMedia listener with fallback for older WebKit/iOS Safari
    try {
      mediaQuery.addEventListener('change', handleMediaChange);
    } catch {
      mediaQuery.addListener(handleMediaChange);
    }

    // Passive listeners for viewport resizing and orientation changes
    window.addEventListener('resize', updateStatus, { passive: true });
    window.addEventListener('orientationchange', updateStatus, { passive: true });

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } catch {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('resize', updateStatus);
      window.removeEventListener('orientationchange', updateStatus);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
