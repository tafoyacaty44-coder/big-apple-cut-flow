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

          {/* Logo container */}
          <div className="relative flex items-center justify-center">
            {/* Logo with simple fade */}
            <motion.img
              src={logoSrc}
              alt="Big Apple Barbers"
              className="relative z-10 h-32 w-auto md:h-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
            />

            {/* Diagonal sheen sweep effect */}
            {!prefersReduced && (
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                style={{
                  WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 65%)",
                  maskImage: "radial-gradient(circle, black 40%, transparent 65%)"
                }}
              >
                <motion.div
                  className="absolute h-[200%] w-[40%] rotate-45"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                    filter: "blur(20px)"
                  }}
                  initial={{ x: "-100%", y: "-50%" }}
                  animate={{ x: "250%", y: "-50%" }}
                  transition={{
                    duration: 1.2,
                    delay: 0.3,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
