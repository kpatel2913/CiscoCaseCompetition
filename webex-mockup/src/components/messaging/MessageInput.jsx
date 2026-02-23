import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Code, List, Smile, Paperclip, 
  Send, Command
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const QUICK_EMOJIS = ['😊','👍','🎉','🔥','💯','❤️','🚀','😂'];

export default function MessageInput() {
  const { activeSpaceId, sendMessage } = useAppStore();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(activeSpaceId, trimmed);
    setText('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const applyFormat = (prefix, suffix = prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const selected = text.slice(s, e);
    const newText = text.slice(0, s) + prefix + selected + suffix + text.slice(e);
    setText(newText);
    setTimeout(() => {
      ta.selectionStart = s + prefix.length;
      ta.selectionEnd = e + prefix.length;
      ta.focus();
    }, 0);
  };

  return (
    <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid var(--webex-border)' }}>
      <div
        className="flex flex-col rounded-xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--webex-border)',
          transition: 'border-color 0.15s'
        }}
        onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(0,188,240,0.4)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--webex-border)'}
      >
        {/* Formatting toolbar */}
        <div
          className="flex items-center gap-1 px-3 py-2"
          style={{ borderBottom: '1px solid var(--webex-border)' }}
        >
          {[
            { icon: Bold, action: () => applyFormat('**'), label: 'Bold' },
            { icon: Italic, action: () => applyFormat('_'), label: 'Italic' },
            { icon: Code, action: () => applyFormat('`'), label: 'Code' },
            { icon: List, action: () => setText(t => t + '\n• '), label: 'List' },
          ].map(({ icon: Icon, action, label }) => (
            <button
              key={label}
              onClick={action}
              title={label}
              className="flex items-center justify-center rounded transition-all duration-100"
              style={{ width: 26, height: 26, background: 'none', border: 'none', color: 'var(--webex-muted)', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--webex-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--webex-muted)'; }}
            >
              <Icon size={14} />
            </button>
          ))}

          <div className="w-px h-4 mx-1" style={{ background: 'var(--webex-border)' }} />

          {/* Emoji */}
          <div className="relative">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="flex items-center justify-center rounded transition-all duration-100"
              style={{ width: 26, height: 26, background: showEmoji ? 'rgba(0,188,240,0.15)' : 'none', border: 'none', color: showEmoji ? 'var(--webex-blue)' : 'var(--webex-muted)', cursor: 'pointer' }}
            >
              <Smile size={14} />
            </button>
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-xl"
                  style={{ background: 'var(--webex-surface)', border: '1px solid var(--webex-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 20 }}
                >
                  {QUICK_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg rounded-lg cursor-pointer"
                      style={{ width: 32, height: 32, background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Attach */}
          <button
            title="Attach file"
            className="flex items-center justify-center rounded transition-all duration-100"
            style={{ width: 26, height: 26, background: 'none', border: 'none', color: 'var(--webex-muted)', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--webex-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--webex-muted)'; }}
          >
            <Paperclip size={14} />
          </button>

          <div className="flex-1" />

          {/* Slash hint */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Command size={11} style={{ color: 'var(--webex-muted)' }} />
            <span style={{ fontSize: 11, color: 'var(--webex-muted)' }}>/ commands</span>
          </div>
        </div>

        {/* Text area */}
        <div className="flex items-end gap-2 px-3 py-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the team… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none"
            style={{
              color: 'var(--webex-text)',
              fontSize: 14,
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: 'auto'
            }}
          />
          <motion.button
            onClick={handleSend}
            whileTap={{ scale: 0.9 }}
            disabled={!text.trim()}
            className="flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-150"
            style={{
              width: 32, height: 32,
              background: text.trim() ? 'var(--webex-blue)' : 'rgba(255,255,255,0.06)',
              color: text.trim() ? '#07202E' : 'var(--webex-muted)',
              border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <Send size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
