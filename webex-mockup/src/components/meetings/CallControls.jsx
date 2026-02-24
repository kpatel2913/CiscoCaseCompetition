import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, Users, MessageSquare,
  Hand, MoreHorizontal, X, ChevronDown, Captions, Circle, StopCircle, LayoutGrid
} from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const WX = {
  bg: '#1C1C1E',
  surface: '#2C2C2E',
  border: '#3A3A3C',
  text: '#FFFFFF',
  muted: '#8E8E93',
  green: '#07D87C',
  red: '#FF3B30',
};

// Pill-style button (with icon + label + optional chevron)
function PillBtn({ icon: Icon, activeIcon: ActiveIcon, label, isActive, onClick, chevron, disabled }) {
  const DisplayIcon = (isActive && ActiveIcon) ? ActiveIcon : Icon;
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-full transition-all duration-150"
      style={{
        background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(255,255,255,0.25)' : WX.border}`,
        color: isActive ? WX.text : WX.text,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.12)' : 'transparent'; }}
    >
      <DisplayIcon size={16} />
      {label}
      {chevron && <ChevronDown size={13} style={{ color: WX.muted }} />}
    </motion.button>
  );
}

// Icon-only round button
function IconBtn({ icon: Icon, onClick, active }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex items-center justify-center rounded-full transition-all"
      style={{
        width: 36, height: 36, border: `1px solid ${WX.border}`,
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        color: WX.muted, cursor: 'pointer'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = active ? 'rgba(255,255,255,0.12)' : 'transparent'}
    >
      <Icon size={16} />
    </motion.button>
  );
}

export default function CallControls({ onEndMeeting }) {
  const {
    micMuted, toggleMic,
    cameraOff, toggleCamera,
    isRecording, toggleRecording,
    isScreenSharing, toggleScreenShare,
    participantsPanelOpen, toggleParticipantsPanel,
    chatPanelOpen, toggleChatPanel,
    endCall,
    meetingId,
  } = useAppStore();

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleLeave = () => {
    setShowEndConfirm(false);
    if (onEndMeeting) {
      onEndMeeting(meetingId);
    } else {
      endCall();
    }
  };

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center py-4 px-6 relative"
      style={{ background: WX.bg, zIndex: 20 }}
    >
      {/* Floating pill control bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-full relative"
        style={{
          background: WX.surface,
          border: `1px solid ${WX.border}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}
      >
        {/* CC */}
        <IconBtn icon={Captions} />

        <div style={{ width: 1, height: 20, background: WX.border }} />

        {/* Mute */}
        <PillBtn
          icon={Mic} activeIcon={MicOff}
          label={micMuted ? 'Unmute' : 'Mute'}
          isActive={micMuted}
          onClick={toggleMic}
          chevron
        />

        {/* Camera */}
        <PillBtn
          icon={Video} activeIcon={VideoOff}
          label={cameraOff ? 'Start video' : 'Stop video'}
          isActive={cameraOff}
          onClick={toggleCamera}
          chevron
        />

        {/* Share */}
        <PillBtn
          icon={MonitorUp}
          label="Share"
          isActive={isScreenSharing}
          onClick={toggleScreenShare}
        />

        {/* Record */}
        <PillBtn
          icon={isRecording ? StopCircle : Circle}
          label={isRecording ? 'Stop rec' : 'Record'}
          isActive={isRecording}
          onClick={toggleRecording}
        />

        {/* Raise hand */}
        <PillBtn icon={Hand} label="Raise" />

        {/* More */}
        <IconBtn icon={MoreHorizontal} />

        <div style={{ width: 1, height: 20, background: WX.border }} />

        {/* End call – red circle with × */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 42, height: 42,
              background: WX.red, color: '#fff',
              border: 'none', cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}
          >
            <X size={20} strokeWidth={2.5} />
          </motion.button>

          <AnimatePresence>
            {showEndConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-3 right-0 rounded-2xl p-4"
                style={{
                  background: WX.surface, border: `1px solid ${WX.border}`,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)', zIndex: 30, width: 200
                }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: WX.text }}>Leave meeting?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.1)', color: WX.muted, border: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    Stay
                  </button>
                  <button
                    onClick={handleLeave}
                    className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ background: WX.red, color: '#fff', border: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = ''}
                  >
                    Leave
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ width: 1, height: 20, background: WX.border }} />

        {/* Right group */}
        <IconBtn icon={LayoutGrid} />
        <IconBtn
          icon={Users}
          active={participantsPanelOpen}
          onClick={toggleParticipantsPanel}
        />
        <IconBtn
          icon={MessageSquare}
          active={chatPanelOpen}
          onClick={toggleChatPanel}
        />
        <IconBtn icon={MoreHorizontal} />
      </div>
    </div>
  );
}
