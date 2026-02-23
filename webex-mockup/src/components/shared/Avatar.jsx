import { mockUsers } from '../../data/mockUsers';

const presenceColors = {
  active: '#3FD47A',
  away: '#FFD166',
  dnd: '#FF4F4F',
  offline: '#4A6B7A'
};

export default function Avatar({ userId, size = 36, showPresence = true, className = '' }) {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) return null;

  const fontSize = Math.round(size * 0.38);
  const dotSize = Math.round(size * 0.28);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-semibold select-none"
        style={{
          background: `linear-gradient(135deg, ${user.color}33, ${user.color}88)`,
          border: `1.5px solid ${user.color}55`,
          fontSize,
          color: user.color,
          letterSpacing: '-0.01em'
        }}
        title={user.name}
      >
        {user.initials}
      </div>
      {showPresence && (
        <div
          className="absolute rounded-full border-2"
          style={{
            width: dotSize,
            height: dotSize,
            background: presenceColors[user.presence] || presenceColors.offline,
            borderColor: 'var(--webex-navy)',
            bottom: 0,
            right: 0
          }}
        />
      )}
    </div>
  );
}
