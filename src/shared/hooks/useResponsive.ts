import { useState, useEffect } from 'react';

export interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsive(breakpoints: Breakpoints = defaultBreakpoints) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < breakpoints.md,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    isLargeDesktop: windowSize.width >= breakpoints.xl,
    isSmall: windowSize.width < breakpoints.sm,
    isMedium: windowSize.width >= breakpoints.md,
    isLarge: windowSize.width >= breakpoints.lg,
    isExtraLarge: windowSize.width >= breakpoints.xl,
  };
} 
