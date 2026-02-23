import { AnimatePresence, motion } from 'framer-motion';
import useAppStore from './store/useAppStore';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MessagingView from './views/MessagingView';
import MeetingsView from './views/MeetingsView';
import CallingView from './views/CallingView';
import PeopleView from './views/PeopleView';
import InCallView from './views/InCallView';
import { CheckCircle } from 'lucide-react';

function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-6 left-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
          style={{
            background: 'var(--webex-surface)',
            border: '1px solid var(--webex-border)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            transform: 'translateX(-50%)'
          }}
        >
          <CheckCircle size={18} style={{ color: 'var(--webex-green)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--webex-text)' }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ViewRenderer({ view }) {
  const views = {
    messaging: <MessagingView key="messaging" />,
    meetings: <MeetingsView key="meetings" />,
    calling: <CallingView key="calling" />,
    people: <PeopleView key="people" />,
    incall: <InCallView key="incall" />,
    apps: (
      <motion.div
        key="apps"
        className="flex flex-col items-center justify-center h-full"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ color: 'var(--webex-muted)' }}
      >
        <p className="text-lg font-semibold">Apps & Integrations</p>
        <p className="text-sm mt-2">Coming soon</p>
      </motion.div>
    )
  };
  return (
    <AnimatePresence mode="wait">
      {views[view] || views.messaging}
    </AnimatePresence>
  );
}

export default function App() {
  const { activeView, isInCall, showMeetingEndedToast } = useAppStore();

  // When in call, show full-screen meeting room (no sidebar/topbar)
  if (isInCall) {
    return (
      <div className="app-shell" style={{ flexDirection: 'column' }}>
        <InCallView />
        <Toast message="Meeting ended" visible={false} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <ViewRenderer view={activeView} />
        </div>
      </div>
      <Toast message="Meeting ended successfully" visible={showMeetingEndedToast} />
    </div>
  );
}
