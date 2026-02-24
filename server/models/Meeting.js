import mongoose from 'mongoose';

const TranscriptEntrySchema = new mongoose.Schema({
  speaker:   { type: String },
  text:      { type: String },
  timestamp: { type: Number }, // ms from meeting start
}, { _id: false });

const MeetingSchema = new mongoose.Schema({
  meetingId:   { type: String, required: true, unique: true },
  title:       { type: String, default: 'Untitled Meeting' },
  hostName:    { type: String },
  startedAt:   { type: Date, default: Date.now },
  endedAt:     { type: Date },
  durationMs:  { type: Number },
  transcript:  [TranscriptEntrySchema],
  summary:     { type: String },
  actionItems: [String],
  keyDecisions:[String],
  createdAt:   { type: Date, default: Date.now },
});

export default mongoose.model('Meeting', MeetingSchema);
