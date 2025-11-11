import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface IntroRevealProps {
  logoSrc: string;
  onComplete?: () => void;
  duration?: number;
}

export default function IntroReveal({ 
  logoSrc,
  onComplete,
  duration = 1.8 
}: IntroRevealProps) {
  const prefersReduced = useReducedMotion();
  const actualDuration = prefersReduced ? 0.3 : duration;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";

    // Complete timer
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
        document.body.style.overflow = "";
      }, 500); // Allow exit animation to finish
    }, actualDuration * 1000);

    return () => {
      clearTimeout(completeTimer);
      document.body.style.overflow = "";
    };
  }, [actualDuration, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete?.();
      document.body.style.overflow = "";
    }, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.5,
            delay: prefersReduced ? 0 : 1.3,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          aria-label="Loading animation"
        >
          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 px-4 py-2 text-sm font-medium text-white/60 hover:text-white/90 transition-colors"
            aria-label="Skip intro animation"
          >
            Skip
          </motion.button>

          {/* Logo container with glow */}
          <div className="relative flex items-center justify-center">
            {/* Gold glow effect */}
            <motion.div
              className="absolute -inset-40 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(212,162,26,0.12) 0%, rgba(212,162,26,0.06) 40%, transparent 70%)",
                filter: "blur(40px)"
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8,
                delay: prefersReduced ? 0 : 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
            />

            {/* Logo with animation */}
            <motion.img
              src={logoSrc}
              alt="Big Apple Barbers"
              className="relative z-10 h-32 w-auto md:h-40"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: [0, 1, 1],
                scale: [0.95, 1, 1],
                filter: prefersReduced ? "brightness(1)" : [
                  "brightness(1)",
                  "brightness(1.15)",
                  "brightness(1)"
                ]
              }}
              transition={{ 
                duration: prefersReduced ? 0.2 : 1.0,
                ease: [0.16, 1, 0.3, 1],
                filter: { 
                  times: [0, 0.5, 1],
                  duration: 1.0 
                }
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
