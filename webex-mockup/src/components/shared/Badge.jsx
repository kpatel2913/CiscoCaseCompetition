import { motion, AnimatePresence } from 'framer-motion';

export default function Badge({ count, className = '' }) {
  if (!count || count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`flex items-center justify-center rounded-full font-semibold ${className}`}
        style={{
          minWidth: 18,
          height: 18,
          fontSize: 10,
          padding: '0 4px',
          background: 'var(--webex-blue)',
          color: '#07202E',
          lineHeight: 1
        }}
      >
        {count > 99 ? '99+' : count}
      </motion.div>
    </AnimatePresence>
  );
}
