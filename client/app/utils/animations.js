// Framer Motion 4 variants — import these wherever motion is used

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25,0.46,0.45,0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } }
};
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.2 } }
};
export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25,0.46,0.45,0.94] } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }
};
export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25,0.46,0.45,0.94] } },
  exit:    { opacity: 0, x: 40, transition: { duration: 0.3 } }
};
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};
export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25,0.46,0.45,0.94] } }
};
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25,0.46,0.45,0.94] } },
  exit:    { opacity: 0, transition: { duration: 0.15 } }
};
