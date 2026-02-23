import { motion } from 'framer-motion';
import MeetingsList from '../components/meetings/MeetingsList';
import JoinModal from '../components/meetings/JoinModal';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 }
};

export default function MeetingsView() {
  return (
    <motion.div
      className="flex flex-1 overflow-hidden h-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.15 }}
    >
      <div className="flex-1 overflow-hidden">
        <MeetingsList />
      </div>
      <JoinModal />
    </motion.div>
  );
}
