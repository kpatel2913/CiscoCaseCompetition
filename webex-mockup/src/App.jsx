import { AnimatePresence, motion } from 'framer-motion';
import useAppStore from './store/useAppStore';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MessagingView from './views/MessagingView';
import MeetingsView from './views/MeetingsView';
import InCallView from './views/InCallView';
import MeetingRecapView from './views/MeetingRecapView';
import WorkgraphView from './views/WorkgraphView';
import DailyBriefingView from './views/DailyBriefingView';
import WorkflowsView from './views/WorkflowsView';
import { Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  const { isInCall } = useAppStore();

  // When in call, show full-screen meeting room (no sidebar/topbar)
  if (isInCall) {
    return (
      <div className="app-shell" style={{ flexDirection: 'column' }}>
        <InCallView />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/messages" replace />} />
              <Route path="/messages" element={<MessagingView />} />
              <Route path="/meeting" element={<MeetingsView />} />
              <Route path="/meeting-recap" element={<MeetingRecapView />} />
              <Route path="/workgraph" element={<WorkgraphView />} />
              <Route path="/dailybriefing" element={<DailyBriefingView />} />
              <Route path="/workflows" element={<WorkflowsView />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
      {/* Toast components were removed, preserving previous empty spot to prevent error */}

    </div>
  );
}
