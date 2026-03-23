import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Video, Users, Settings,
  ChevronRight, Network, Sun, Package
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

const navItems = [
  { id: 'messaging',  icon: MessageSquare, label: 'Messaging' },
  { id: 'meetings',   icon: Video,         label: 'Meetings' },
  { id: 'briefing',  icon: Sun,            label: 'Daily Briefing', badge: 'NEW' },
  { id: 'workgraph', icon: Network,        label: 'Workgraph', badge: 'NEW' },
  { id: 'workflows', icon: Package,        label: 'Embedded Workflows', badge: 'NEW' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Mobile: render as bottom navigation bar ──────────────────────────────
  if (isMobile) {
    // Curated set: the 5 most important views for mobile
    const MOBILE_NAV_IDS = ['meetings', 'briefing', 'workgraph', 'workflows', 'messaging'];
    const mobileNavItems = MOBILE_NAV_IDS.map(id => navItems.find(n => n.id === id)).filter(Boolean);
    return (
      <nav
        className="sidebar"
        style={{
          display: 'flex',
          background: 'var(--webex-navy)',
        }}
      >
        {mobileNavItems.map(({ id, icon: Icon, label }) => {
          const isActive = location.pathname.includes(id) || (id === 'messaging' && location.pathname === '/messages');
          const routeId = id === 'messaging' ? 'messages' : id === 'meetings' ? 'meeting' : id === 'briefing' ? 'dailybriefing' : id;
          return (
            <button
              key={id}
              className="sidebar-item"
              onClick={() => navigate(`/${routeId}`)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--webex-blue)' : 'var(--webex-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '6px 0',
                position: 'relative',
              }}
            >
              {navItems.find(n => n.id === id)?.badge && (
                <span style={{
                  position: 'absolute', top: 6, right: '50%', marginRight: -16,
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#00BCF0', display: 'block'
                }} />
              )}
              <Icon size={20} />
              <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // ── Desktop: animated collapsible sidebar ────────────────────────────────
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
          <img 
            src="/cisco-logo.svg" 
            alt="Cisco" 
            className="flex-shrink-0 object-contain"
            style={{ width: 32, height: 32 }}
          />
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
          const isActive = location.pathname.includes(id) || (id === 'messaging' && location.pathname === '/messages') || (id === 'briefing' && location.pathname === '/dailybriefing');
          const routeId = id === 'messaging' ? 'messages' : id === 'meetings' ? 'meeting' : id === 'briefing' ? 'dailybriefing' : id;

          return (
            <div
              key={id}
              className="relative"
              style={{ height: 40 }}
              onMouseEnter={() => setHoveredItem(id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute left-0 rounded-r"
                  style={{ width: 3, height: 20, top: 10, background: 'var(--webex-blue)' }}
                />
              )}
              <button
                onClick={() => navigate(`/${routeId}`)}
                className="w-full flex items-center gap-3 rounded-lg transition-all duration-150 relative overflow-hidden"
                style={{
                  height: 40,
                  padding: '0 10px',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
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
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Icon size={18} />
                  {!expanded && navItems.find(n => n.id === id)?.badge && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#00BCF0', display: 'block'
                    }} />
                  )}
                </div>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="text-sm font-medium whitespace-nowrap"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {label}
                      {navItems.find(n => n.id === id)?.badge && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                          color: '#00BCF0', background: 'rgba(0,188,240,0.15)',
                          borderRadius: 20, padding: '1px 5px',
                        }}>
                          {navItems.find(n => n.id === id).badge}
                        </span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Tooltip (collapsed mode) */}
              {!expanded && hoveredItem === id && (
                <div
                  className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-50"
                  style={{
                    background: '#121212',
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
