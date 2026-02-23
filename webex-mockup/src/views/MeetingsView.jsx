import { motion } from 'framer-motion';
import MeetingsHome from '../components/meetings/MeetingsHome';
import PreJoinModal from '../components/meetings/PreJoinModal';
import JoinModal from '../components/meetings/JoinModal';

export default function MeetingsView() {
  return (
    <motion.div
      className="flex flex-1 overflow-hidden h-full relative"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex-1 overflow-hidden">
        <MeetingsHome />
      </div>

      {/* Pre-join lobby overlay */}
      <PreJoinModal />

      {/* Join by number modal */}
      <JoinModal />
    </motion.div>
  );
}
