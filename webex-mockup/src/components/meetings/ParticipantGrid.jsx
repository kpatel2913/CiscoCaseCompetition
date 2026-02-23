import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import { mockUsers } from '../../data/mockUsers';

const PARTICIPANT_COLORS = ['#00BCF0', '#3FD47A', '#FFD166', '#B388FF', '#FF9F1C', '#F72585'];

const CALL_PARTICIPANTS = [
  { id: 'u1', name: 'Sarah Chen', initials: 'SC', color: '#00BCF0' },
  { id: 'u2', name: 'Marcus Williams', initials: 'MW', color: '#3FD47A' },
  { id: 'u3', name: 'Priya Patel', initials: 'PP', color: '#FFD166' },
  { id: 'me', name: 'You', initials: 'AM', color: '#00BCF0' },
  { id: 'u5', name: 'Aiko Tanaka', initials: 'AT', color: '#B388FF' },
];

function VideoTile({ participant, isActive, isSelf, small }) {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      animate={{
        boxShadow: isActive
          ? '0 0 0 3px #00BCF0, 0 0 30px rgba(0,188,240,0.35)'
          : '0 0 0 1px rgba(255,255,255,0.05)'
      }}
      transition={{ duration: 0.4 }}
      style={{
        background: `linear-gradient(135deg, ${participant.color}22, ${participant.color}44)`,
        aspectRatio: '16/9',
        minHeight: small ? 80 : 140
      }}
    >
      {/* Simulated camera off gradient */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${participant.color}33 0%, transparent 70%)` }}
      />

      {/* Initials avatar */}
      <div
        className="flex items-center justify-center rounded-full font-bold z-10"
        style={{
          width: small ? 36 : 60,
          height: small ? 36 : 60,
          background: `linear-gradient(135deg, ${participant.color}55, ${participant.color}99)`,
          border: `2px solid ${participant.color}77`,
          fontSize: small ? 14 : 22,
          color: participant.color
        }}
      >
        {participant.initials}
      </div>

      {/* Name label */}
      <div
        className="absolute bottom-2 left-2 right-2 flex items-center justify-between"
        style={{ zIndex: 10 }}
      >
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-md truncate"
          style={{ background: 'rgba(7,32,46,0.75)', color: 'var(--webex-text)', fontSize: small ? 10 : 12 }}
        >
          {participant.name}
        </span>
        {isActive && (
          <motion.div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'var(--webex-blue)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function ParticipantGrid() {
  const { activeSpeakerIndex, currentMeeting } = useAppStore();
  const participants = CALL_PARTICIPANTS.slice(0, 4);
  const selfParticipant = CALL_PARTICIPANTS[3]; // "You" tile

  return (
    <div className="flex-1 p-4 grid gap-3 relative overflow-hidden" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' }}>
      {participants.map((p, idx) => (
        <VideoTile
          key={p.id}
          participant={p}
          isActive={idx === activeSpeakerIndex % participants.length}
          isSelf={p.id === 'me'}
        />
      ))}
    </div>
  );
}
