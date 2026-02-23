import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus, FileText, Image, Link } from 'lucide-react';
import Avatar from '../shared/Avatar';
import { mockUsers } from '../../data/mockUsers';

const EMOJIS = ['👍','❤️','😂','🎉','🔥','💯','🚀','👏','🤔','✅'];

function renderText(text) {
  const atRegex = /@([A-Za-z\s]+?)(?=[,.\s!?]|$)/g;
  const parts = [];
  let last = 0;
  let match;
  while ((match = atRegex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'text', content: text.slice(last, match.index) });
    parts.push({ type: 'mention', content: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });

  return parts.map((p, i) =>
    p.type === 'mention'
      ? <span key={i} className="mention">{p.content}</span>
      : <span key={i}>{p.content}</span>
  );
}

function AttachmentPreview({ attachment }) {
  const icons = { pdf: FileText, image: Image, link: Link };
  const Icon = icons[attachment.icon] || FileText;
  return (
    <div
      className="flex items-center gap-3 mt-2 rounded-xl p-3 cursor-pointer transition-all duration-150"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--webex-border)',
        maxWidth: 280
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{ width: 36, height: 36, background: 'rgba(0,188,240,0.15)', color: 'var(--webex-blue)' }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--webex-text)' }}>{attachment.title}</p>
        {attachment.size && <p className="text-xs mt-0.5" style={{ color: 'var(--webex-muted)' }}>{attachment.size}</p>}
      </div>
    </div>
  );
}

export default function MessageBubble({ message, showAvatar, spaceId, onAddReaction }) {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const isMe = message.userId === 'me';
  const user = mockUsers.find(u => u.id === message.userId);
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 px-4 py-1 group relative"
      style={{ paddingTop: showAvatar ? 12 : 2 }}
    >
      {/* Avatar column */}
      <div className="flex-shrink-0" style={{ width: 36 }}>
        {showAvatar && <Avatar userId={message.userId} size={36} showPresence={false} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--webex-text)' }}>
              {isMe ? 'You' : user?.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--webex-muted)' }}>{time}</span>
          </div>
        )}

        <div style={{ color: 'var(--webex-text)', fontSize: 14, lineHeight: 1.6 }}>
          {renderText(message.text)}
        </div>

        {message.attachment && <AttachmentPreview attachment={message.attachment} />}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onAddReaction && onAddReaction(message.id, r.emoji)}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs cursor-pointer transition-all duration-150"
                style={{
                  background: 'rgba(0,188,240,0.1)',
                  border: '1px solid rgba(0,188,240,0.25)',
                  color: 'var(--webex-text)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,188,240,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,188,240,0.1)'}
              >
                {r.emoji} <span style={{ color: 'var(--webex-muted)' }}>{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div
        className="absolute right-4 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ zIndex: 5 }}
      >
        <div className="relative">
          <button
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{
              width: 28, height: 28,
              background: 'var(--webex-surface)',
              border: '1px solid var(--webex-border)',
              color: 'var(--webex-muted)', cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--webex-blue)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--webex-muted)'}
          >
            <SmilePlus size={14} />
          </button>

          <AnimatePresence>
            {emojiPickerOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 bottom-full mb-2 flex gap-1 p-2 rounded-xl"
                style={{ background: 'var(--webex-surface)', border: '1px solid var(--webex-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 20 }}
                onBlur={() => setEmojiPickerOpen(false)}
              >
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { onAddReaction && onAddReaction(message.id, emoji); setEmojiPickerOpen(false); }}
                    className="text-base rounded-lg transition-transform cursor-pointer"
                    style={{ width: 28, height: 28, background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
