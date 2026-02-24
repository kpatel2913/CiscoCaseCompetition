import { create } from 'zustand';
import { mockSpaces } from '../data/mockSpaces';
import { mockMessages } from '../data/mockMessages';

const useAppStore = create((set, get) => ({
  // Active navigation
  activeView: 'messaging',
  setActiveView: (view) => set({ activeView: view }),

  // Messaging
  activeSpaceId: 'space-1',
  spaces: mockSpaces,
  messages: mockMessages,
  setActiveSpace: (id) => set({ activeSpaceId: id }),
  sendMessage: (spaceId, text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      userId: 'me',
      text,
      timestamp: new Date().toISOString(),
      reactions: []
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [spaceId]: [...(state.messages[spaceId] || []), newMsg]
      }
    }));
    set({ typingInSpace: spaceId });
    setTimeout(() => set({ typingInSpace: null }), 3000);
  },
  typingInSpace: null,
  addReaction: (spaceId, messageId, emoji) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [spaceId]: state.messages[spaceId].map((m) =>
          m.id === messageId
            ? {
                ...m,
                reactions: m.reactions.some((r) => r.emoji === emoji)
                  ? m.reactions.map((r) =>
                      r.emoji === emoji
                        ? { ...r, count: r.count + 1, users: [...r.users, 'me'] }
                        : r
                    )
                  : [...m.reactions, { emoji, count: 1, users: ['me'] }]
              }
            : m
        )
      }
    }));
  },

  // Meetings / In-Call
  isInCall: false,
  currentMeeting: null,
  callDuration: 0,
  callTimer: null,
  micMuted: false,
  cameraOff: false,
  isRecording: false,
  isScreenSharing: false,
  participantsPanelOpen: false,
  chatPanelOpen: false,
  inCallMessages: [],
  activeSpeakerIndex: 0,

  // Transcript / Recap state
  meetingId: null,
  transcriptSegments: [],
  interimText: '',
  recapMeetingId: null,

  appendTranscriptSegment: (segment) =>
    set((state) => ({ transcriptSegments: [...state.transcriptSegments, segment] })),
  setInterimText: (text) => set({ interimText: text }),

  joinCall: async (meeting) => {
    set({
      isInCall: true,
      currentMeeting: meeting,
      callDuration: 0,
      transcriptSegments: [],
      interimText: '',
      meetingId: null,
    });

    // Start backend meeting document
    try {
      const res = await fetch('/api/meetings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meeting?.title || "Kris Patel's Meeting",
          hostName: 'Kris Patel',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ meetingId: data.meetingId });
      }
    } catch (err) {
      // Backend not running — still allow in-browser experience
      console.warn('Could not reach backend to start meeting:', err.message);
    }

    const timer = setInterval(() => {
      set((state) => ({ callDuration: state.callDuration + 1 }));
    }, 1000);
    const speakerCycle = setInterval(() => {
      set((state) => ({
        activeSpeakerIndex: (state.activeSpeakerIndex + 1) % 4
      }));
    }, 4000);
    set({ callTimer: timer, speakerCycleTimer: speakerCycle });
  },

  endCall: async (recapId) => {
    const { callTimer, speakerCycleTimer, meetingId } = get();
    if (callTimer) clearInterval(callTimer);
    if (speakerCycleTimer) clearInterval(speakerCycleTimer);

    const resolvedRecapId = recapId || meetingId;

    set({
      isInCall: false,
      currentMeeting: null,
      callDuration: 0,
      callTimer: null,
      speakerCycleTimer: null,
      micMuted: false,
      cameraOff: false,
      isRecording: false,
      isScreenSharing: false,
      participantsPanelOpen: false,
      chatPanelOpen: false,
      inCallMessages: [],
      activeSpeakerIndex: 0,
      transcriptSegments: [],
      interimText: '',
    });

    if (resolvedRecapId) {
      set({ recapMeetingId: resolvedRecapId, activeView: 'meeting-recap' });
    } else {
      set({ activeView: 'meetings', showMeetingEndedToast: true });
      setTimeout(() => set({ showMeetingEndedToast: false }), 4000);
    }
  },

  toggleMic: () => set((state) => ({ micMuted: !state.micMuted })),
  toggleCamera: () => set((state) => ({ cameraOff: !state.cameraOff })),
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  toggleParticipantsPanel: () => set((state) => ({
    participantsPanelOpen: !state.participantsPanelOpen,
    chatPanelOpen: false
  })),
  toggleChatPanel: () => set((state) => ({
    chatPanelOpen: !state.chatPanelOpen,
    participantsPanelOpen: false
  })),
  sendInCallMessage: (text) => {
    set((state) => ({
      inCallMessages: [...state.inCallMessages, {
        id: `icm-${Date.now()}`,
        userId: 'me',
        text,
        timestamp: new Date().toISOString()
      }]
    }));
  },

  // Toast notification
  showMeetingEndedToast: false,

  // People
  selectedContact: null,
  setSelectedContact: (user) => set({ selectedContact: user }),
  clearSelectedContact: () => set({ selectedContact: null }),

  // Global search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  // Join modal
  joinModalOpen: false,
  setJoinModalOpen: (open) => set({ joinModalOpen: open }),

  // Pre-join lobby modal
  preJoinModalOpen: false,
  setPreJoinModalOpen: (open) => set({ preJoinModalOpen: open }),
}));

export default useAppStore;
