import { Variants } from 'framer-motion';

// ==================================================
// SHARED MOTION TIMING & EASING TOKENS
// Inspired by Apple & Linear design systems
// ==================================================

export const EASING = {
  apple: [0.16, 1, 0.3, 1] as [number, number, number, number],
  linear: [0.25, 1, 0.5, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const DURATION = {
  hover: 0.14,
  button: 0.15,
  card: 0.18,
  dropdown: 0.18,
  modal: 0.22,
  drawer: 0.25,
  page: 0.25,
  theme: 0.25,
};

// ==================================================
// REUSABLE FRAMER MOTION VARIANTS
// ==================================================

// Fade and slight upward reveal (Max 16-20px movement)
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.page,
      ease: EASING.apple,
    },
  },
};

// Simple fade in
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.card,
      ease: 'easeOut',
    },
  },
};

// Staggered container for grids and card lists (50ms stagger)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// Hero headline reveal (700ms duration)
export const heroHeadline: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASING.apple,
    },
  },
};

// Hero subtitle reveal (staggered after headline)
export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.15,
      ease: EASING.apple,
    },
  },
};

// Bento Card entry animation (12px translate, 50ms stagger)
export const bentoCardItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.card,
      ease: EASING.apple,
    },
  },
};

// Card hover effect (lift -3px, smooth shadow)
export const cardHoverProps = {
  whileHover: {
    y: -3,
    transition: { duration: DURATION.card, ease: EASING.apple },
  },
};

// Button hover & click tap effect (-2px lift, 0.98 scale)
export const buttonMotionProps = {
  whileHover: {
    y: -2,
    transition: { duration: DURATION.button, ease: EASING.apple },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.08 },
  },
};

// Modal animation (98% -> 100% scale + opacity)
export const modalVariant: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.modal,
      ease: EASING.apple,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

// Drawer animation (Slide in from right)
export const drawerVariant: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      duration: DURATION.drawer,
      ease: EASING.apple,
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// Dropdown animation (98% -> 100% scale from top)
export const dropdownVariant: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATION.dropdown,
      ease: EASING.apple,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -4,
    transition: {
      duration: 0.12,
      ease: 'easeIn',
    },
  },
};

// Page route transition (Fade + 12px translate, 250ms)
export const pageTransitionVariant: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.page,
      ease: EASING.apple,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
};

// Toast notification variant (Slide from top-right + fade)
export const toastVariant: Variants = {
  hidden: { opacity: 0, x: 24, y: 0 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.22,
      ease: EASING.apple,
    },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};
