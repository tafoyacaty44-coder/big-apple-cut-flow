import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import logoIntroVideo from "@/assets/logo-intro.mp4";

export const VideoIntro = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Show intro every time unless user prefers reduced motion
    if (!prefersReducedMotion) {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIntro]);

  const handleSkip = () => {
    setShowIntro(false);
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 300);
  };

  const handleVideoError = () => {
    // If video fails to load, skip the intro
    console.error("Video intro failed to load");
    handleSkip();
  };

  if (!showIntro) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
        onClick={handleSkip}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            src={logoIntroVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-300",
              videoEnded && "opacity-0"
            )}
            style={{ willChange: 'auto' }}
            aria-label="Big Apple Barbers logo introduction"
          />

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
            aria-label="Skip intro"
          >
            <X className="w-4 h-4" />
            Skip Intro
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
