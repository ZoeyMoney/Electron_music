import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface MotionListProps {
  children: React.ReactNode;
  delay?: number; // 每项的间隔延迟，单位ms，默认100ms
}

export const MotionList: React.FC<MotionListProps> = ({ children, delay = 100 }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className="bg-[#1e1e1e73] rounded-[5px] h-[75vh] overflow-y-auto"
      id={'scrollableDiv'}
    >
      <AnimatePresence>
        {childrenArray.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              delay: (index % 20) * delay * 0.001, // 每20项循环延迟
              ease: 'easeOut',
            }}
            whileHover={{ backgroundColor: '#2A2A2A' }}
            viewport={{ once: false, amount: 0.2 }} // 进入视口20%时触发
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
