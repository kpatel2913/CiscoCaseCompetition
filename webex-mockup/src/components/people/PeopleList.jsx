import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Phone, Video, X, Building, Globe } from 'lucide-react';
import { mockUsers } from '../../data/mockUsers';
import useAppStore from '../../store/useAppStore';
import Avatar from '../shared/Avatar';
import Button from '../shared/Button';
import Modal from '../shared/Modal';

const presenceLabels = {
  active: { label: 'Available', color: '#3FD47A' },
  away: { label: 'Away', color: '#FFD166' },
  dnd: { label: 'Do Not Disturb', color: '#FF4F4F' },
  offline: { label: 'Offline', color: '#4A6B7A' }
};

function ContactCard({ user, onClose, onMessage }) {
  const p = presenceLabels[user.presence] || presenceLabels.offline;
  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Avatar userId={user.id} size={64} showPresence={true} />
        <div>
          <h2 className="font-bold" style={{ fontSize: 18, color: 'var(--webex-text)' }}>{user.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--webex-muted)' }}>{user.title}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="rounded-full" style={{ width: 8, height: 8, background: p.color }} />
            <span style={{ fontSize: 12, color: p.color }}>{p.label}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2.5 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--webex-border)' }}>
        <div className="flex items-center gap-3">
          <Building size={15} style={{ color: 'var(--webex-muted)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 11, color: 'var(--webex-muted)' }}>Department</p>
            <p style={{ fontSize: 13, color: 'var(--webex-text)' }}>{user.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Globe size={15} style={{ color: 'var(--webex-muted)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 11, color: 'var(--webex-muted)' }}>Email</p>
            <p style={{ fontSize: 13, color: 'var(--webex-blue)' }}>{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Globe size={15} style={{ color: 'var(--webex-muted)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 11, color: 'var(--webex-muted)' }}>Timezone</p>
            <p style={{ fontSize: 13, color: 'var(--webex-text)' }}>{user.timezone}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" size="md" style={{ flex: 1 }} onClick={() => onMessage(user)}>
          <MessageSquare size={15} /> Message
        </Button>
        <Button variant="secondary" size="md" style={{ flex: 1 }}>
          <Phone size={15} /> Call
        </Button>
        <Button variant="secondary" size="md" style={{ flex: 1 }}>
          <Video size={15} /> Video
        </Button>
      </div>
    </div>
  );
}

export default function PeopleList() {
  const [search, setSearch] = useState('');
  const { selectedContact, setSelectedContact, clearSelectedContact, setActiveView, setActiveSpace } = useAppStore();

  const filtered = mockUsers
    .filter(u => u.id !== 'me')
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase())
    );

  const handleMessage = (user) => {
    // Navigate to DM for this user
    clearSelectedContact();
    setActiveView('messaging');
  };

  return (
    <div className="flex flex-col h-full p-5">
      {/* Header */}
      <div className="mb-5">
        <h2 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--webex-text)' }}>People</h2>
        <p style={{ fontSize: 13, color: 'var(--webex-muted)' }}>{filtered.length} contacts</p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-xl mb-5"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--webex-border)', padding: '0 14px', height: 40 }}
      >
        <Search size={15} style={{ color: 'var(--webex-muted)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, department, or title…"
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--webex-text)', fontSize: 14 }}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {filtered.map((user, idx) => {
            const p = presenceLabels[user.presence] || presenceLabels.offline;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedContact(user)}
                className="flex flex-col items-center text-center p-4 rounded-2xl cursor-pointer transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--webex-border)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,188,240,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--webex-border)'; }}
              >
                <Avatar userId={user.id} size={52} showPresence={true} className="mb-3" />
                <p className="font-semibold text-sm" style={{ color: 'var(--webex-text)' }}>{user.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--webex-muted)' }}>{user.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--webex-muted)' }}>{user.department}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="rounded-full" style={{ width: 6, height: 6, background: p.color }} />
                  <span style={{ fontSize: 11, color: p.color }}>{p.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Contact modal */}
      <Modal open={!!selectedContact} onClose={clearSelectedContact} title={null}>
        {selectedContact && (
          <ContactCard
            user={selectedContact}
            onClose={clearSelectedContact}
            onMessage={handleMessage}
          />
        )}
      </Modal>
    </div>
  );
}
