import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import MessageBubble from './MessageBubble';

function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 h-px" style={{ background: 'var(--webex-border)' }} />
      <span className="text-xs font-medium px-2" style={{ color: 'var(--webex-muted)' }}>{date}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--webex-border)' }} />
    </div>
  );
}

function TypingIndicator({ spaceId }) {
  const { typingInSpace, activeSpaceId, spaces } = useAppStore();
  if (typingInSpace !== spaceId) return null;
  const space = spaces.find(s => s.id === spaceId);
  const name = space?.members?.find(m => m !== 'me') || 'Someone';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-center gap-3 px-4 py-2"
    >
      <div style={{ width: 36 }} />
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{ width: 6, height: 6, background: 'var(--webex-muted)' }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--webex-muted)' }}>typing…</span>
      </div>
    </motion.div>
  );
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function MessageList() {
  const { activeSpaceId, messages, addReaction, spaces } = useAppStore();
  const endRef = useRef(null);
  const msgs = messages[activeSpaceId] || [];
  const space = spaces.find(s => s.id === activeSpaceId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSpaceId, msgs.length]);

  // Group messages with date dividers
  const withDividers = [];
  let lastDate = null;
  msgs.forEach((msg, idx) => {
    const dateLabel = formatDateLabel(msg.timestamp);
    if (dateLabel !== lastDate) {
      withDividers.push({ type: 'divider', date: dateLabel, id: `div-${msg.id}` });
      lastDate = dateLabel;
    }
    const prevMsg = msgs[idx - 1];
    const showAvatar = !prevMsg || prevMsg.userId !== msg.userId ||
      new Date(msg.timestamp) - new Date(prevMsg.timestamp) > 5 * 60000;
    withDividers.push({ type: 'message', ...msg, showAvatar });
  });

  return (
    <div className="flex flex-col h-full">
      {/* Space header */}
      <div
        className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--webex-border)' }}
      >
        <div>
          <h2 className="font-semibold" style={{ fontSize: 15, color: 'var(--webex-text)' }}>
            {space?.type === 'dm' ? '@ ' : '# '}{space?.name}
          </h2>
          {space?.members && (
            <p style={{ fontSize: 12, color: 'var(--webex-muted)' }}>
              {space.members.length} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence initial={false}>
          {withDividers.map(item =>
            item.type === 'divider' ? (
              <DateDivider key={item.id} date={item.date} />
            ) : (
              <MessageBubble
                key={item.id}
                message={item}
                showAvatar={item.showAvatar}
                spaceId={activeSpaceId}
                onAddReaction={(msgId, emoji) => addReaction(activeSpaceId, msgId, emoji)}
              />
            )
          )}
        </AnimatePresence>

        <AnimatePresence>
          <TypingIndicator spaceId={activeSpaceId} />
        </AnimatePresence>

        <div ref={endRef} />
      </div>
    </div>
  );
}
