import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(7, 32, 46, 0.75)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="relative rounded-2xl z-10 flex flex-col overflow-hidden"
            style={{
              width,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 64px)',
              background: 'var(--webex-surface)',
              border: '1px solid var(--webex-border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
            }}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--webex-border)' }}
              >
                <span className="font-semibold text-base" style={{ color: 'var(--webex-text)' }}>{title}</span>
                <button
                  onClick={onClose}
                  className="rounded-lg transition-colors duration-150 flex items-center justify-center"
                  style={{ color: 'var(--webex-muted)', width: 28, height: 28, background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
