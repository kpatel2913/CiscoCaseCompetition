import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Hash, Lock } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';

const tabs = ['Spaces', 'Direct Messages', 'Teams'];

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now - d) / 36e5;
  if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function SpaceList() {
  const { spaces, activeSpaceId, setActiveSpace } = useAppStore();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = spaces.filter(s => {
    if (activeTab === 0) return s.type === 'space' && s.name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 1) return s.type === 'dm' && s.name.toLowerCase().includes(search.toLowerCase());
    return false;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold" style={{ fontSize: 16, color: 'var(--webex-text)' }}>Messages</h2>
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ width: 30, height: 30, background: 'transparent', color: 'var(--webex-muted)', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Filter size={15} />
            </button>
            <button
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ width: 30, height: 30, background: 'rgba(0,188,240,0.15)', color: 'var(--webex-blue)', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,188,240,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,188,240,0.15)'}
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-lg mb-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--webex-border)', padding: '0 10px', height: 32 }}
        >
          <Search size={13} style={{ color: 'var(--webex-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--webex-text)', fontSize: 13 }}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1" style={{ borderBottom: '1px solid var(--webex-border)', paddingBottom: 0 }}>
          {tabs.slice(0, 2).map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="pb-2 text-xs font-medium transition-colors relative"
              style={{
                color: activeTab === i ? 'var(--webex-blue)' : 'var(--webex-muted)',
                background: 'none', border: 'none', cursor: 'pointer', paddingRight: 8, paddingLeft: 2
              }}
            >
              {tab}
              {activeTab === i && (
                <motion.div layoutId="spaceTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                  style={{ background: 'var(--webex-blue)' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Space rows */}
      <div className="flex-1 overflow-y-auto py-1">
        <AnimatePresence mode="wait">
          {filtered.map((space, idx) => {
            const isActive = space.id === activeSpaceId;
            return (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <button
                  onClick={() => setActiveSpace(space.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer text-left transition-all duration-150 group relative"
                  style={{
                    background: isActive ? 'rgba(0,188,240,0.1)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '3px solid var(--webex-blue)' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {space.type === 'dm' ? (
                    <Avatar userId={space.userId} size={36} />
                  ) : (
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-lg"
                      style={{
                        width: 36, height: 36,
                        background: isActive ? 'rgba(0,188,240,0.2)' : 'rgba(255,255,255,0.07)',
                        color: isActive ? 'var(--webex-blue)' : 'var(--webex-muted)'
                      }}
                    >
                      {space.pinned ? <Lock size={15} /> : <Hash size={15} />}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="font-medium truncate text-sm"
                        style={{ color: space.unread > 0 ? 'var(--webex-text)' : 'var(--webex-muted)', fontWeight: space.unread > 0 ? 600 : 400 }}
                      >
                        {space.name}
                      </span>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--webex-muted)', fontSize: 11 }}>
                        {formatTime(space.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span
                        className="truncate"
                        style={{ fontSize: 12, color: 'var(--webex-muted)', maxWidth: '80%' }}
                      >
                        {space.lastMessage}
                      </span>
                      <Badge count={space.unread} />
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
