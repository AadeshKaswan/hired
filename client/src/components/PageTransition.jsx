import { motion } from 'framer-motion';

// Variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(4px)',
    scale: 0.985,
    y: 12,
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for premium feel
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(6px)',
    scale: 0.985,
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      // Respect reduced motion
      style={{ willChange: 'transform, opacity' }} // GPU acceleration
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;