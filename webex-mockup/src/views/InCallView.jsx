import { motion } from 'framer-motion';
import MeetingRoom from '../components/meetings/MeetingRoom';

export default function InCallView() {
  return (
    <motion.div
      className="flex flex-1 overflow-hidden h-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <MeetingRoom />
    </motion.div>
  );
}
