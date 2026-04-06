/** Subtle timings (0.2–0.4s) for Framer Motion */
export const easeSoft = [0.25, 0.1, 0.25, 1];

export const subtle = { duration: 0.32, ease: easeSoft };

export const fadeInProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: subtle,
};

export const slideUpProps = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: subtle,
};

export const buttonHoverProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.22, ease: easeSoft },
};
