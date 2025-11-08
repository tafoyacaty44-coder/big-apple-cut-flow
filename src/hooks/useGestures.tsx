import { useState, useEffect, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

const SWIPE_THRESHOLD = 50; // minimum distance for swipe
const SWIPE_VELOCITY = 0.3; // minimum velocity for swipe
const MAX_SWIPE_TIME = 500; // maximum time for swipe (ms)

/**
 * Hook for handling touch gestures (swipe, pull-to-refresh)
 */
export function useSwipe(handlers: SwipeHandlers) {
  const [touchState, setTouchState] = useState<TouchState | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    });
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchState) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      const deltaTime = Date.now() - touchState.startTime;

      // Calculate velocity
      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Check if it's a valid swipe
      if (deltaTime > MAX_SWIPE_TIME) {
        setTouchState(null);
        return;
      }

      // Horizontal swipe
      if (
        Math.abs(deltaX) > SWIPE_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY) &&
        velocityX > SWIPE_VELOCITY
      ) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }

      // Vertical swipe
      if (
        Math.abs(deltaY) > SWIPE_THRESHOLD &&
        Math.abs(deltaY) > Math.abs(deltaX) &&
        velocityY > SWIPE_VELOCITY
      ) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }

      setTouchState(null);
    },
    [touchState, handlers]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(onRefresh: () => Promise<void> | void, threshold = 80) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only trigger if at top of scroll
    if (window.scrollY === 0) {
      const touch = e.touches[0];
      setIsPulling(true);
      setPullDistance(0);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;

      const touch = e.touches[0];
      const distance = Math.max(0, touch.clientY - (e.target as HTMLElement).getBoundingClientRect().top);
      
      // Apply resistance curve
      const resistance = Math.min(distance / 2, threshold * 1.5);
      setPullDistance(resistance);

      // Prevent default scroll if pulling
      if (distance > 10) {
        e.preventDefault();
      }
    },
    [isPulling, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh, isRefreshing]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    shouldTrigger: pullDistance >= threshold,
  };
}

/**
 * Trigger haptic feedback (if supported)
 */
export function haptic(pattern: number | number[] = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
