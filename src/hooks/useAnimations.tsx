import { useEffect, useState } from 'react';
import { Variants } from 'framer-motion';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook for responsive animation variants based on device type
 * Optimizes animations for mobile performance and accessibility
 */
export function useAnimations() {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check device type
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < MOBILE_BREAKPOINT) {
        setDevice('mobile');
      } else if (width < TABLET_BREAKPOINT) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkDevice);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Page transition variants
  const pageTransition: Variants = {
    initial: prefersReducedMotion
      ? { opacity: 1 }
      : device === 'mobile'
      ? { x: '100%', opacity: 0 }
      : { opacity: 0 },
    animate: prefersReducedMotion
      ? { opacity: 1 }
      : device === 'mobile'
      ? { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
      : { opacity: 1, transition: { duration: 0.3 } },
    exit: prefersReducedMotion
      ? { opacity: 1 }
      : device === 'mobile'
      ? { x: '-100%', opacity: 0, transition: { duration: 0.2 } }
      : { opacity: 0, transition: { duration: 0.2 } },
  };

  // Card entrance with stagger
  const cardEntrance: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { y: 20, opacity: 0, scale: 0.95 },
    visible: (i: number = 0) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: prefersReducedMotion ? 0 : i * 0.05,
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  // Interactive press animation
  const pressAnimation = prefersReducedMotion
    ? {}
    : {
        scale: 0.98,
        transition: { duration: 0.1 },
      };

  // Hover animation
  const hoverAnimation = prefersReducedMotion
    ? {}
    : {
        scale: 1.02,
        transition: { duration: 0.2 },
      };

  // Slide up animation (for modals, sheets)
  const slideUp: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: prefersReducedMotion
      ? { opacity: 1 }
      : { y: '100%', opacity: 0, transition: { duration: 0.2 } },
  };

  // Fade in/out
  const fade: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 },
    },
  };

  // Scale animation
  const scale: Variants = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 300, damping: 20 },
    },
    exit: prefersReducedMotion
      ? { opacity: 1 }
      : { scale: 0.9, opacity: 0, transition: { duration: 0.15 } },
  };

  // Stagger children container
  const staggerContainer: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.05,
            delayChildren: 0.1,
          },
    },
  };

  return {
    device,
    prefersReducedMotion,
    pageTransition,
    cardEntrance,
    pressAnimation,
    hoverAnimation,
    slideUp,
    fade,
    scale,
    staggerContainer,
  };
}
