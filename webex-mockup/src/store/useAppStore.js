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
    // Simulate typing indicator + response after a delay
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

  joinCall: (meeting) => {
    set({ isInCall: true, currentMeeting: meeting, callDuration: 0 });
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
  endCall: () => {
    const { callTimer, speakerCycleTimer } = get();
    if (callTimer) clearInterval(callTimer);
    if (speakerCycleTimer) clearInterval(speakerCycleTimer);
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
      activeSpeakerIndex: 0
    });
    set({ activeView: 'meetings', showMeetingEndedToast: true });
    setTimeout(() => set({ showMeetingEndedToast: false }), 4000);
  },
  toggleMic: () => set((state) => ({ micMuted: !state.micMuted })),
  toggleCamera: () => set((state) => ({ cameraOff: !state.cameraOff })),
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  toggleParticipantsPanel: () => set((state) => ({ participantsPanelOpen: !state.participantsPanelOpen, chatPanelOpen: false })),
  toggleChatPanel: () => set((state) => ({ chatPanelOpen: !state.chatPanelOpen, participantsPanelOpen: false })),
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
}));

export default useAppStore;
