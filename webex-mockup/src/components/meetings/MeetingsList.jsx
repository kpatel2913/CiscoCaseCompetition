import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Copy, Check, Clock, Users, Play } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import Avatar from '../shared/Avatar';
import Button from '../shared/Button';
import { mockMeetings } from '../../data/mockMeetings';

function formatMeetingTime(iso) {
  return new Date(iso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function MeetingCard({ meeting, onJoin }) {
  const isRecorded = meeting.status === 'recorded';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 mb-3 cursor-pointer transition-all duration-150"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--webex-border)'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {meeting.type === 'recurring' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,209,102,0.15)', color: 'var(--webex-yellow)' }}>
                Recurring
              </span>
            )}
            {isRecorded && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,79,79,0.15)', color: 'var(--webex-red)' }}>
                Recorded · {meeting.duration}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--webex-text)' }}>{meeting.title}</h3>
          <div className="flex items-center gap-1 mb-2">
            <Clock size={12} style={{ color: 'var(--webex-muted)' }} />
            <span style={{ fontSize: 12, color: 'var(--webex-muted)' }}>{formatMeetingTime(meeting.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar userId={meeting.host} size={20} showPresence={false} />
            <span style={{ fontSize: 12, color: 'var(--webex-muted)' }}>Hosted by {meeting.hostName}</span>
            <div className="flex items-center gap-1 ml-2">
              <Users size={12} style={{ color: 'var(--webex-muted)' }} />
              <span style={{ fontSize: 12, color: 'var(--webex-muted)' }}>{meeting.attendeeCount}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {isRecorded ? (
            <Button variant="secondary" size="sm" onClick={() => {}}>
              <Play size={13} /> Watch
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => onJoin(meeting)}>
              <Video size={13} /> Join
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MeetingsList() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [copied, setCopied] = useState(false);
  const { joinCall, setActiveView, setJoinModalOpen } = useAppStore();

  const displayed = mockMeetings.filter(m =>
    activeTab === 'upcoming' ? m.status === 'upcoming' : m.status === 'recorded'
  );

  const handleJoin = (meeting) => {
    joinCall(meeting);
    setActiveView('incall');
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = ['upcoming', 'recorded'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--webex-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base" style={{ color: 'var(--webex-text)' }}>Meetings</h2>
          <Button variant="primary" size="sm" onClick={() => setJoinModalOpen(true)}>
            <Plus size={15} /> New Meeting
          </Button>
        </div>

        {/* Personal Room */}
        <div
          className="flex items-center justify-between rounded-xl p-3 mb-4"
          style={{ background: 'rgba(0,188,240,0.08)', border: '1px solid rgba(0,188,240,0.2)' }}
        >
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--webex-blue)' }}>Personal Meeting Room</p>
            <p className="mono text-xs" style={{ color: 'var(--webex-muted)' }}>acme.webex.com/meet/alex.morgan</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150"
            style={{ background: 'rgba(0,188,240,0.15)', color: 'var(--webex-blue)', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,188,240,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,188,240,0.15)'}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Start instant */}
        <Button
          variant="primary"
          size="md"
          className="w-full mb-4"
          onClick={() => handleJoin(mockMeetings[0])}
          style={{ width: '100%' }}
        >
          <Video size={16} /> Start Instant Meeting
        </Button>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2 text-xs font-medium capitalize relative transition-colors"
              style={{
                color: activeTab === tab ? 'var(--webex-blue)' : 'var(--webex-muted)',
                background: 'none', border: 'none', cursor: 'pointer', marginRight: 12
              }}
            >
              {tab === 'upcoming' ? 'Upcoming' : 'Recorded'}
              {activeTab === tab && (
                <motion.div layoutId="mtgTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                  style={{ background: 'var(--webex-blue)' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings list */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--webex-muted)' }}>
            <Video size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p className="text-sm">No {activeTab} meetings</p>
          </div>
        ) : (
          displayed.map(m => <MeetingCard key={m.id} meeting={m} onJoin={handleJoin} />)
        )}
      </div>
    </div>
  );
}
