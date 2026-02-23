import { useState } from 'react';
import { Video, Hash, Lock } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import useAppStore from '../../store/useAppStore';
import { mockMeetings } from '../../data/mockMeetings';

export default function JoinModal() {
  const { joinModalOpen, setJoinModalOpen, joinCall, setActiveView } = useAppStore();
  const [meetingNum, setMeetingNum] = useState('');
  const [password, setPassword] = useState('');
  const [displayName] = useState('Alex Morgan');

  const handleJoin = () => {
    // Try to find a matching meeting or create a generic one
    const found = mockMeetings.find(m => m.meetingNumber?.replace(/\s/g, '') === meetingNum.replace(/\s/g, ''));
    const meeting = found || {
      id: 'instant',
      title: 'Instant Meeting',
      host: 'me',
      hostName: 'Alex Morgan',
      attendees: ['me', 'u1', 'u2', 'u3'],
      attendeeCount: 4,
      meetingNumber: meetingNum || '000 000 0000',
      status: 'active',
      type: 'instant'
    };
    joinCall(meeting);
    setActiveView('incall');
    setJoinModalOpen(false);
    setMeetingNum('');
    setPassword('');
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--webex-border)',
    borderRadius: 10,
    padding: '10px 14px',
    color: 'var(--webex-text)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s'
  };

  return (
    <Modal open={joinModalOpen} onClose={() => setJoinModalOpen(false)} title="Join a Meeting" width={440}>
      <div className="px-6 py-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--webex-muted)' }}>
            Meeting Number or Link
          </label>
          <div className="relative">
            <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--webex-muted)' }} />
            <input
              value={meetingNum}
              onChange={e => setMeetingNum(e.target.value)}
              placeholder="123 456 7890"
              style={{ ...inputStyle, paddingLeft: 36 }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,188,240,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--webex-border)'}
              className="mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--webex-muted)' }}>
            Meeting Password
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--webex-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...inputStyle, paddingLeft: 36 }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,188,240,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--webex-border)'}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--webex-muted)' }}>
            Display Name
          </label>
          <input
            value={displayName}
            readOnly
            style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={() => setJoinModalOpen(false)} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleJoin} style={{ flex: 2 }}>
            <Video size={15} /> Join Meeting
          </Button>
        </div>
      </div>
    </Modal>
  );
}
