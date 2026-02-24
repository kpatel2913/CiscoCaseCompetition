import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Meeting from '../models/Meeting.js';

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/meetings/start
// Create a new meeting document, return meetingId
// ──────────────────────────────────────────────
router.post('/start', async (req, res) => {
  try {
    const { title = 'Untitled Meeting', hostName = 'Host' } = req.body;
    const meetingId = uuidv4();
    const meeting = await Meeting.create({ meetingId, title, hostName });
    res.json({ meetingId: meeting.meetingId, _id: meeting._id });
  } catch (err) {
    console.error('start error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/meetings/:id/transcript
// Append one or more transcript segments
// Body: { segments: [{ speaker, text, timestamp }] }
// ──────────────────────────────────────────────
router.post('/:id/transcript', async (req, res) => {
  try {
    const { segments = [] } = req.body;
    const meeting = await Meeting.findOneAndUpdate(
      { meetingId: req.params.id },
      { $push: { transcript: { $each: segments } } },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, count: meeting.transcript.length });
  } catch (err) {
    console.error('transcript error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/meetings/:id/end
// Close the meeting and trigger AI summary
// Body: { endedAt: ISO string }
// ──────────────────────────────────────────────
router.post('/:id/end', async (req, res) => {
  try {
    const { endedAt } = req.body;

    // Fetch the latest document (to get the complete transcript at end-of-meeting)
    const meeting = await Meeting.findOne({ meetingId: req.params.id });
    if (!meeting) return res.status(404).json({ error: 'Not found' });

    const endDate = endedAt ? new Date(endedAt) : new Date();
    const durationMs = endDate - meeting.startedAt;

    // Build full transcript text from the latest snapshot
    const fullTranscript = meeting.transcript
      .map(e => `${e.speaker}: ${e.text}`)
      .join('\n');

    let summary = '';
    let actionItems = [];
    let keyDecisions = [];

    // ── Gemini 2.5 Flash summary ──
    if (process.env.GEMINI_API_KEY && fullTranscript.trim().length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a meeting summarizer.
Given the following meeting transcript, produce a JSON response with exactly these fields:
{
  "summary": "A concise 3-5 sentence meeting summary.",
  "actionItems": ["• Action item 1", "• Action item 2"],
  "keyDecisions": ["Decision 1", "Decision 2"]
}

Transcript:
${fullTranscript}

Return ONLY valid JSON, no markdown fences.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        // Strip possible markdown fences Gemini sometimes adds
        const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(cleaned);
        summary = parsed.summary || '';
        actionItems = parsed.actionItems || [];
        keyDecisions = parsed.keyDecisions || [];
      } catch (aiErr) {
        console.warn('Gemini summary failed:', aiErr.message);
        summary = 'AI summary unavailable.';
      }
    } else if (fullTranscript.trim().length === 0) {
      summary = 'No transcript was recorded for this meeting.';
    } else {
      summary = 'AI summary unavailable — GEMINI_API_KEY not configured.';
    }

    // Single atomic write — prevents race conditions with concurrent transcript appends
    const updated = await Meeting.findOneAndUpdate(
      { meetingId: req.params.id },
      { $set: { endedAt: endDate, durationMs, summary, actionItems, keyDecisions } },
      { new: true }
    );

    console.log(`✅ Meeting ${req.params.id} ended — ${meeting.transcript.length} transcript segments, summary: ${summary.slice(0, 60)}…`);
    res.json(updated);
  } catch (err) {
    console.error('end error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ──────────────────────────────────────────────
// GET /api/meetings
// List all meetings (newest first)
// ──────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const meetings = await Meeting.find({})
      .sort({ createdAt: -1 })
      .select('-transcript'); // omit large transcript array for list view
    res.json(meetings);
  } catch (err) {
    console.error('list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/meetings/:id
// Full meeting document (including transcript)
// ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingId: req.params.id });
    if (!meeting) return res.status(404).json({ error: 'Not found' });
    res.json(meeting);
  } catch (err) {
    console.error('get error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
