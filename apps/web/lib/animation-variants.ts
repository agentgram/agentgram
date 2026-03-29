export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
};

/**
 * Check if user prefers reduced motion.
 * Use in components to skip initial hidden state.
 */
export function getReducedMotionInitial<T extends Record<string, unknown>>(
  variant: { initial: T },
): T | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? undefined
    : variant.initial;
}
