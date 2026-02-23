import { useState, useRef } from 'react';
import { Search, Bell, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import Avatar from '../shared/Avatar';

export default function TopBar() {
  const { searchQuery, setSearchQuery, searchOpen, setSearchOpen } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const inputRef = useRef(null);

  return (
    <div
      className="flex items-center flex-shrink-0 px-5 gap-4"
      style={{
        height: 56,
        background: 'var(--webex-surface)',
        borderBottom: '1px solid var(--webex-border)',
        zIndex: 9
      }}
    >
      {/* Search bar */}
      <div className="flex-1 relative max-w-xl">
        <div
          className="flex items-center gap-2 rounded-xl transition-all duration-200"
          style={{
            background: searchOpen ? 'rgba(0,188,240,0.08)' : 'rgba(255,255,255,0.05)',
            border: searchOpen ? '1px solid rgba(0,188,240,0.4)' : '1px solid var(--webex-border)',
            padding: '0 12px',
            height: 36
          }}
        >
          <Search size={15} style={{ color: searchOpen ? 'var(--webex-blue)' : 'var(--webex-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => { setTimeout(() => setSearchOpen(false), 150); }}
            placeholder="Search spaces, people, files…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--webex-text)', fontSize: 14 }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              style={{ color: 'var(--webex-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        <AnimatePresence>
          {searchOpen && searchQuery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden"
              style={{
                background: 'var(--webex-surface)',
                border: '1px solid var(--webex-border)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                zIndex: 50
              }}
            >
              <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--webex-border)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--webex-muted)' }}>SPACES</p>
              </div>
              {['Q3 Product Roadmap', 'Platform Engineering', 'AI Working Group']
                .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(s => (
                  <button
                    key={s}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-100"
                    style={{ color: 'var(--webex-text)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    # {s}
                  </button>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative flex items-center justify-center rounded-xl transition-all duration-150"
            style={{
              width: 36, height: 36,
              background: notifOpen ? 'rgba(0,188,240,0.12)' : 'transparent',
              color: 'var(--webex-muted)', border: 'none', cursor: 'pointer'
            }}
            onMouseEnter={e => { if(!notifOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { if(!notifOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={17} />
            <div className="absolute top-1.5 right-1.5 rounded-full" style={{ width: 7, height: 7, background: 'var(--webex-blue)' }} />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 rounded-xl overflow-hidden"
                style={{ width: 300, background: 'var(--webex-surface)', border: '1px solid var(--webex-border)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 50 }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--webex-border)' }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--webex-text)' }}>Notifications</p>
                </div>
                {[
                  { text: 'Sarah Chen mentioned you in Q3 Roadmap', time: '2m ago' },
                  { text: 'Your meeting starts in 15 minutes', time: '13m ago' },
                  { text: 'Marcus: The API is ready on staging 🚀', time: '1h ago' }
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 cursor-pointer" style={{ borderBottom: '1px solid var(--webex-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <p className="text-sm mb-0.5" style={{ color: 'var(--webex-text)' }}>{n.text}</p>
                    <p className="text-xs" style={{ color: 'var(--webex-muted)' }}>{n.time}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-xl px-2 transition-all duration-150"
            style={{
              height: 36,
              background: profileOpen ? 'rgba(0,188,240,0.12)' : 'transparent',
              border: 'none', cursor: 'pointer'
            }}
            onMouseEnter={e => { if(!profileOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { if(!profileOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            <Avatar userId="me" size={28} showPresence={false} />
            <span className="text-sm font-medium" style={{ color: 'var(--webex-text)' }}>Alex Morgan</span>
            <ChevronDown size={13} style={{ color: 'var(--webex-muted)' }} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 rounded-xl overflow-hidden"
                style={{ width: 200, background: 'var(--webex-surface)', border: '1px solid var(--webex-border)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 50 }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--webex-border)' }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--webex-text)' }}>Alex Morgan</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--webex-muted)' }}>Product Strategist</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="rounded-full" style={{ width: 7, height: 7, background: 'var(--webex-green)' }} />
                    <span className="text-xs" style={{ color: 'var(--webex-green)' }}>Available</span>
                  </div>
                </div>
                {['My Profile', 'Account Settings', 'Keyboard Shortcuts', 'Sign Out'].map(item => (
                  <button key={item} className="w-full text-left px-4 py-2.5 text-sm"
                    style={{ color: item === 'Sign Out' ? 'var(--webex-red)' : 'var(--webex-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
