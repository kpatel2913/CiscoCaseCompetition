import { motion } from 'framer-motion';
import PeopleList from '../components/people/PeopleList';

export default function PeopleView() {
  return (
    <motion.div
      className="flex flex-1 overflow-hidden h-full"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
    >
      <PeopleList />
    </motion.div>
  );
}
