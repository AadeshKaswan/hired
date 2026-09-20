import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(true); // Starts hidden until mouse moves inside window
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ultra-smooth spring physics for the trailing ring
  const springConfig = { damping: 28, stiffness: 400, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Disable on touch devices (phones/tablets)
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e) => {
      if (isHidden) setIsHidden(false);
      
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Detect hover on interactive elements globally
      const target = e.target;
      const isInteractive =
        target instanceof Element &&
        target.closest(
          "a, button, input, textarea, select, label, [role='button'], .cursor-pointer"
        );
      
      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    // Hide cursor when leaving the browser window
    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isHidden]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[9999]"
      animate={{ opacity: isHidden ? 0 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* --- Main Dot (Snaps instantly) --- */}
      <motion.div
        className="absolute top-0 left-0 h-2.5 w-2.5 rounded-full bg-[#4D8DFF] mix-blend-difference"
        style={{ x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: isClicking ? 0.5 : isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: "tween", duration: 0.15 }}
      />

      {/* --- Trailing Ring (Spring Physics) --- */}
      <motion.div
        className="absolute top-0 left-0 rounded-full transition-colors duration-300"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: isHovering ? "rgba(77, 141, 255, 0.15)" : "transparent",
          border: isHovering ? "1px solid transparent" : "1px solid rgba(77, 141, 255, 0.4)",
        }}
        animate={{
          height: isHovering ? 64 : 36,
          width: isHovering ? 64 : 36,
          scale: isClicking ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </motion.div>
  );
};

export default CustomCursor;