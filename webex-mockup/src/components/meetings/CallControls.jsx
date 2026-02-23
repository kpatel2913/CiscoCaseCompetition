import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, Users,
  MessageSquare, Smile, Circle, PhoneOff, StopCircle
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const REACTIONS = ['👍','❤️','🎉','🔥','😂','🙌'];

function ControlBtn({ icon: Icon, activeIcon: ActiveIcon, label, isActive, onClick, danger, activeColor }) {
  const DisplayIcon = (isActive && ActiveIcon) ? ActiveIcon : Icon;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onClick}
        className="flex items-center justify-center rounded-2xl transition-all duration-150"
        style={{
          width: 52, height: 52, border: 'none', cursor: 'pointer',
          background: danger
            ? (isActive ? 'var(--webex-red)' : 'rgba(255,79,79,0.15)')
            : isActive
              ? (activeColor ? `${activeColor}22` : 'rgba(0,188,240,0.18)')
              : 'rgba(255,255,255,0.08)',
          color: danger
            ? (isActive ? '#fff' : 'var(--webex-red)')
            : isActive
              ? (activeColor || 'var(--webex-blue)')
              : 'var(--webex-text)'
        }}
        onMouseEnter={e => {
          if (!danger) e.currentTarget.style.background = isActive ? 'rgba(0,188,240,0.28)' : 'rgba(255,255,255,0.14)';
          else e.currentTarget.style.background = isActive ? '#e03e3e' : 'rgba(255,79,79,0.25)';
        }}
        onMouseLeave={e => {
          if (!danger) e.currentTarget.style.background = isActive ? 'rgba(0,188,240,0.18)' : 'rgba(255,255,255,0.08)';
          else e.currentTarget.style.background = isActive ? 'var(--webex-red)' : 'rgba(255,79,79,0.15)';
        }}
      >
        <DisplayIcon size={22} />
      </motion.button>
      <span style={{ fontSize: 11, color: 'var(--webex-muted)' }}>{label}</span>
    </div>
  );
}

export default function CallControls() {
  const {
    micMuted, toggleMic,
    cameraOff, toggleCamera,
    isRecording, toggleRecording,
    isScreenSharing, toggleScreenShare,
    participantsPanelOpen, toggleParticipantsPanel,
    chatPanelOpen, toggleChatPanel,
    endCall
  } = useAppStore();

  const [showReactions, setShowReactions] = useState(false);
  const [floatingEmoji, setFloatingEmoji] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const sendReaction = (emoji) => {
    setFloatingEmoji({ emoji, id: Date.now() });
    setShowReactions(false);
    setTimeout(() => setFloatingEmoji(null), 2500);
  };

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center px-6 py-4 relative"
      style={{ borderTop: '1px solid rgba(26,61,80,0.8)', background: 'rgba(7,32,46,0.95)', zIndex: 20 }}
    >
      {/* Floating reaction */}
      <AnimatePresence>
        {floatingEmoji && (
          <motion.div
            key={floatingEmoji.id}
            className="absolute bottom-full left-1/2 text-4xl select-none pointer-events-none"
            initial={{ opacity: 1, y: 0, x: '-50%' }}
            animate={{ opacity: 0, y: -120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          >
            {floatingEmoji.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-5">
        <ControlBtn icon={Mic} activeIcon={MicOff} label={micMuted ? 'Unmute' : 'Mute'} isActive={micMuted} onClick={toggleMic} activeColor="var(--webex-red)" />
        <ControlBtn icon={Video} activeIcon={VideoOff} label={cameraOff ? 'Start Video' : 'Stop Video'} isActive={cameraOff} onClick={toggleCamera} activeColor="var(--webex-red)" />
        <ControlBtn icon={MonitorUp} label={isScreenSharing ? 'Stop Share' : 'Share'} isActive={isScreenSharing} onClick={toggleScreenShare} activeColor="var(--webex-green)" />
        <ControlBtn icon={Users} label="Participants" isActive={participantsPanelOpen} onClick={toggleParticipantsPanel} />
        <ControlBtn icon={MessageSquare} label="Chat" isActive={chatPanelOpen} onClick={toggleChatPanel} />

        {/* Reactions */}
        <div className="relative flex flex-col items-center">
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowReactions(!showReactions)}
              className="flex items-center justify-center rounded-2xl transition-all"
              style={{
                width: 52, height: 52, border: 'none', cursor: 'pointer',
                background: showReactions ? 'rgba(0,188,240,0.18)' : 'rgba(255,255,255,0.08)',
                color: showReactions ? 'var(--webex-blue)' : 'var(--webex-text)'
              }}
            >
              <Smile size={22} />
            </motion.button>
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex gap-2 p-3 rounded-2xl"
                  style={{ background: 'var(--webex-surface)', border: '1px solid var(--webex-border)', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', zIndex: 30 }}
                >
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-2xl rounded-xl cursor-pointer flex items-center justify-center"
                      style={{ width: 40, height: 40, background: 'none', border: 'none', transition: 'transform 0.1s' }}
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
          <span style={{ fontSize: 11, color: 'var(--webex-muted)' }}>React</span>
        </div>

        <ControlBtn
          icon={isRecording ? StopCircle : Circle}
          label={isRecording ? 'Stop Rec' : 'Record'}
          isActive={isRecording}
          onClick={toggleRecording}
          activeColor="var(--webex-red)"
        />

        {/* End call */}
        <div className="flex flex-col items-center gap-1.5 relative">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: 52, height: 52, border: 'none', cursor: 'pointer',
              background: 'var(--webex-red)', color: '#fff'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          >
            <PhoneOff size={22} />
          </motion.button>
          <span style={{ fontSize: 11, color: 'var(--webex-muted)' }}>End</span>

          <AnimatePresence>
            {showEndConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-3 right-0 rounded-2xl p-4"
                style={{
                  background: 'var(--webex-surface)', border: '1px solid var(--webex-border)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)', zIndex: 30, width: 200
                }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--webex-text)' }}>Leave meeting?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--webex-muted)', border: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => { setShowEndConfirm(false); endCall(); }}
                    className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ background: 'var(--webex-red)', color: '#fff', border: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.filter = ''}
                  >
                    Leave
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
