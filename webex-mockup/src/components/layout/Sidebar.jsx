import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Video, Phone, Users, Settings,
  Grid3x3, ChevronRight
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const navItems = [
  { id: 'messaging', icon: MessageSquare, label: 'Messaging' },
  { id: 'meetings', icon: Video, label: 'Meetings' },
  { id: 'calling', icon: Phone, label: 'Calling' },
  { id: 'people', icon: Users, label: 'People' },
  { id: 'apps', icon: Grid3x3, label: 'Apps' },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <motion.div
      animate={{ width: expanded ? 220 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full relative flex-shrink-0 overflow-hidden"
      style={{
        background: 'var(--webex-navy)',
        borderRight: '1px solid var(--webex-border)',
        zIndex: 10
      }}
    >
      {/* Logo */}
      <div className="flex items-center px-4 h-14 flex-shrink-0" style={{ borderBottom: '1px solid var(--webex-border)' }}>
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-sm"
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #00BCF0, #005E7A)',
              color: '#fff',
              fontSize: 11,
              letterSpacing: '-0.03em'
            }}
          >
            Wx
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-semibold whitespace-nowrap"
                style={{ fontSize: 15, color: 'var(--webex-text)' }}
              >
                Cisco Webex
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col flex-1 py-3 gap-1 px-2 overflow-hidden">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = activeView === id;
          return (
            <div
              key={id}
              className="relative"
              onMouseEnter={() => setHoveredItem(id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r"
                  style={{ width: 3, height: 20, background: 'var(--webex-blue)' }}
                />
              )}
              <button
                onClick={() => setActiveView(id)}
                className="w-full flex items-center gap-3 rounded-lg transition-all duration-150 relative overflow-hidden"
                style={{
                  height: 40,
                  padding: '0 10px',
                  background: isActive ? 'rgba(0,188,240,0.12)' : 'transparent',
                  color: isActive ? 'var(--webex-blue)' : 'var(--webex-muted)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Tooltip (collapsed mode) */}
              {!expanded && hoveredItem === id && (
                <div
                  className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-50"
                  style={{
                    background: '#0E2D3D',
                    border: '1px solid var(--webex-border)',
                    color: 'var(--webex-text)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                  }}
                >
                  {label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Settings */}
      <div className="px-2 pb-4 flex flex-col gap-1">
        <button
          className="w-full flex items-center gap-3 rounded-lg transition-all duration-150"
          style={{
            height: 40,
            padding: '0 10px',
            background: 'transparent',
            color: 'var(--webex-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Settings size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            height: 32,
            background: 'transparent',
            color: 'var(--webex-muted)',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={14} />
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}
