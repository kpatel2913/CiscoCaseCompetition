import { motion } from 'framer-motion';
import { Phone, PhoneIncoming, PhoneMissed } from 'lucide-react';
import Avatar from '../components/shared/Avatar';

const recentCalls = [
  { id: 'c1', userId: 'u1', name: 'Sarah Chen', type: 'outgoing', time: '10:42 AM', duration: '12m 30s' },
  { id: 'c2', userId: 'u2', name: 'Marcus Williams', type: 'incoming', time: 'Yesterday', duration: '5m 12s' },
  { id: 'c3', userId: 'u4', name: 'James Okafor', type: 'missed', time: 'Yesterday', duration: null },
  { id: 'c4', userId: 'u5', name: 'Aiko Tanaka', type: 'outgoing', time: 'Mon', duration: '32m 08s' },
  { id: 'c5', userId: 'u3', name: 'Priya Patel', type: 'incoming', time: 'Mon', duration: '8m 55s' },
];

const typeConfig = {
  outgoing: { icon: Phone, color: 'var(--webex-blue)', label: 'Outgoing' },
  incoming: { icon: PhoneIncoming, color: 'var(--webex-green)', label: 'Incoming' },
  missed: { icon: PhoneMissed, color: 'var(--webex-red)', label: 'Missed' }
};

export default function CallingView() {
  return (
    <motion.div
      className="flex flex-col h-full p-6"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
    >
      <div className="mb-6">
        <h2 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--webex-text)' }}>Calling</h2>
        <p style={{ fontSize: 13, color: 'var(--webex-muted)' }}>Recent calls</p>
      </div>

      {/* Dial pad hint */}
      <div
        className="flex items-center justify-between mb-6 rounded-2xl p-4"
        style={{ background: 'rgba(0,188,240,0.06)', border: '1px solid rgba(0,188,240,0.15)' }}
      >
        <div>
          <p className="font-medium text-sm" style={{ color: 'var(--webex-text)' }}>Make a call</p>
          <p style={{ fontSize: 12, color: 'var(--webex-muted)' }}>Search for a contact or enter a number</p>
        </div>
        <button
          className="flex items-center justify-center rounded-xl"
          style={{ width: 44, height: 44, background: 'var(--webex-blue)', color: '#07202E', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = ''}
        >
          <Phone size={20} />
        </button>
      </div>

      {/* Recent calls */}
      <div className="flex flex-col gap-1">
        {recentCalls.map((call, idx) => {
          const { icon: Icon, color, label } = typeConfig[call.type];
          return (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer"
              style={{ background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar userId={call.userId} size={40} showPresence={false} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: 'var(--webex-text)' }}>{call.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Icon size={12} style={{ color }} />
                  <span style={{ fontSize: 12, color: 'var(--webex-muted)' }}>{label}</span>
                  {call.duration && <span style={{ fontSize: 12, color: 'var(--webex-muted)' }}>· {call.duration}</span>}
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--webex-muted)', flexShrink: 0 }}>{call.time}</span>
              <button
                className="flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                style={{ width: 36, height: 36, background: 'rgba(0,188,240,0.15)', color: 'var(--webex-blue)', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,188,240,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,188,240,0.15)'}
              >
                <Phone size={15} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
