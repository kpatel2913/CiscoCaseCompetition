import { motion } from 'framer-motion';
import PanelLayout from '../components/layout/PanelLayout';
import SpaceList from '../components/messaging/SpaceList';
import MessageList from '../components/messaging/MessageList';
import MessageInput from '../components/messaging/MessageInput';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 }
};

export default function MessagingView() {
  return (
    <motion.div
      className="flex flex-1 overflow-hidden h-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.15 }}
    >
      <PanelLayout
        leftWidth={280}
        left={<SpaceList />}
        center={
          <div className="flex flex-col h-full">
            <MessageList />
            <MessageInput />
          </div>
        }
      />
    </motion.div>
  );
}
