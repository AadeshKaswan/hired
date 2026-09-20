import { motion } from 'framer-motion';
const MotionLink = motion(Link);

<MotionLink
  to="/register"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="..."
>
  Register
</MotionLink>