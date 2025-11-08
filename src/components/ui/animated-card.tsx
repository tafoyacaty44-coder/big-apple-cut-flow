import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAnimations } from "@/hooks/useAnimations";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  index?: number;
  enableHover?: boolean;
  enablePress?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, index = 0, className, enableHover = true, enablePress = true, onClick, ...props }, ref) => {
    const { cardEntrance, hoverAnimation, pressAnimation, prefersReducedMotion } = useAnimations();

    return (
      <motion.div
        ref={ref}
        custom={index}
        variants={cardEntrance}
        initial="hidden"
        animate="visible"
        whileHover={enableHover && !prefersReducedMotion ? hoverAnimation : undefined}
        whileTap={enablePress && !prefersReducedMotion ? pressAnimation : undefined}
        className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
        onClick={onClick}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export const AnimatedCardContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { staggerContainer } = useAnimations();

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
});

AnimatedCardContainer.displayName = "AnimatedCardContainer";
