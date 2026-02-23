import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Mic, VideoOff, ChevronDown, X } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const WX = {
  bg: '#1C1C1E',
  surface: '#2C2C2E',
  border: '#3A3A3C',
  text: '#FFFFFF',
  muted: '#8E8E93',
  green: '#07D87C',
};

function TrafficLights() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="rounded-full" style={{ width: 12, height: 12, background: '#FF5F57' }} />
      <div className="rounded-full" style={{ width: 12, height: 12, background: '#FFBD2E' }} />
      <div className="rounded-full" style={{ width: 12, height: 12, background: '#28C840' }} />
    </div>
  );
}

export default function PreJoinModal() {
  const { preJoinModalOpen, setPreJoinModalOpen, joinCall, setActiveView } = useAppStore();

  const handleStartMeeting = () => {
    setPreJoinModalOpen(false);
    joinCall({
      id: 'personal',
      title: "Kris Patel's meeting",
      host: 'me',
      hostName: 'Kris Patel',
      attendees: ['me'],
      attendeeCount: 1,
      meetingNumber: '123 456 7890',
      status: 'active',
      type: 'personal'
    });
    setActiveView('incall');
  };

  const pillBtn = {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'transparent', border: `1px solid ${WX.border}`,
    borderRadius: 999, padding: '10px 18px',
    color: WX.text, cursor: 'pointer', fontSize: 14, fontWeight: 500
  };

  return (
    <AnimatePresence>
      {preJoinModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Dimmed backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setPreJoinModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: 860, maxWidth: 'calc(100vw - 48px)',
              background: WX.bg,
              border: `1px solid ${WX.border}`,
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)'
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Modal top bar */}
            <div
              className="flex items-center px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${WX.border}` }}
            >
              <TrafficLights />
              {/* Centered title */}
              <div className="flex-1 flex justify-center items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-lg font-bold text-xs"
                  style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #00BCF0, #005E7A)', color: '#fff', fontSize: 10 }}
                >
                  Wx
                </div>
                <span style={{ fontSize: 13, color: WX.muted }}>Get ready to join</span>
              </div>
              {/* Right side */}
              <div className="flex items-center gap-2">
                <Monitor size={14} style={{ color: WX.muted }} />
                <span style={{ fontSize: 12, color: WX.muted }}>Connect to a device</span>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-6 flex flex-col gap-4">
              <h2 className="font-bold" style={{ fontSize: 22, color: WX.text }}>Kris Patel's meeting</h2>

              {/* Video preview area */}
              <div
                className="relative flex items-center justify-center rounded-2xl overflow-hidden"
                style={{
                  height: 400,
                  background: WX.surface
                }}
              >
                {/* Camera-off state */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-full font-bold"
                    style={{
                      width: 80, height: 80,
                      background: '#3A3A3C',
                      color: WX.text,
                      fontSize: 26
                    }}
                  >
                    KP
                  </div>
                  <p style={{ fontSize: 13, color: WX.muted }}>Camera is off</p>
                </div>
              </div>

              {/* Bottom controls */}
              <div className="flex items-center gap-3">
                {/* Mute pill */}
                <button
                  style={pillBtn}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Mic size={16} />
                  <span>Mute</span>
                  <ChevronDown size={14} style={{ color: WX.muted }} />
                </button>

                {/* Start video pill */}
                <button
                  style={pillBtn}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <VideoOff size={16} />
                  <span>Start video</span>
                  <ChevronDown size={14} style={{ color: WX.muted }} />
                </button>

                <div className="flex-1" />

                {/* Start meeting button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartMeeting}
                  className="rounded-full font-semibold"
                  style={{
                    background: WX.green,
                    color: '#07202E',
                    border: 'none',
                    padding: '12px 28px',
                    fontSize: 15,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = ''}
                >
                  Start meeting
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
