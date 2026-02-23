export const mockMessages = {
  "space-1": [
    {
      id: "m1",
      userId: "u1",
      text: "Hey team, the Q3 roadmap deck is ready for review 🎉",
      timestamp: "2025-10-14T09:22:00Z",
      reactions: [{ emoji: "🎉", count: 3, users: ["u2","u3","me"] }, { emoji: "👀", count: 1, users: ["u5"] }]
    },
    {
      id: "m2",
      userId: "u2",
      text: "Awesome! Just opened it. The AI integration section looks really solid.",
      timestamp: "2025-10-14T09:25:00Z",
      reactions: [{ emoji: "💯", count: 2, users: ["u1","u3"] }]
    },
    {
      id: "m3",
      userId: "u3",
      text: "Agreed. @Sarah Chen — can we add a timeline slide for the Design System deliverables?",
      timestamp: "2025-10-14T09:28:00Z",
      reactions: []
    },
    {
      id: "m4",
      userId: "u1",
      text: "Yes! I'll add it before the review call at 2pm. Also dropping the Figma link here:",
      timestamp: "2025-10-14T09:30:00Z",
      reactions: [],
      attachment: {
        type: "link",
        title: "Q3 Roadmap — Figma",
        url: "#",
        icon: "figma"
      }
    },
    {
      id: "m5",
      userId: "u5",
      text: "Just ran the usage analytics — engagement on the AI features is up 42% QoQ 📈",
      timestamp: "2025-10-14T09:35:00Z",
      reactions: [{ emoji: "🚀", count: 4, users: ["u1","u2","u3","me"] }]
    },
    {
      id: "m6",
      userId: "me",
      text: "That's huge! @Aiko Tanaka can you export that data as a slide for the exec review?",
      timestamp: "2025-10-14T09:38:00Z",
      reactions: []
    },
    {
      id: "m7",
      userId: "u5",
      text: "On it! I'll have it ready by noon.",
      timestamp: "2025-10-14T09:39:00Z",
      reactions: [{ emoji: "👍", count: 1, users: ["me"] }]
    },
    {
      id: "m8",
      userId: "u1",
      text: "Perfect. Reminder: review is at 2pm PST. Link in calendar invite. See you all there!",
      timestamp: "2025-10-14T09:42:00Z",
      reactions: [{ emoji: "✅", count: 3, users: ["u2","u3","u5"] }],
      attachment: {
        type: "file",
        title: "Q3_Roadmap_FINAL.pdf",
        size: "2.4 MB",
        icon: "pdf"
      }
    }
  ],
  "space-2": [
    {
      id: "m9",
      userId: "u2",
      text: "Deployment pipeline is green ✅ All 147 tests passing.",
      timestamp: "2025-10-14T08:45:00Z",
      reactions: [{ emoji: "🎯", count: 2, users: ["u6","me"] }]
    },
    {
      id: "m10",
      userId: "u6",
      text: "Nice work. I bumped the Node version to 20 LTS on staging — no issues found.",
      timestamp: "2025-10-14T08:50:00Z",
      reactions: []
    },
    {
      id: "m11",
      userId: "u8",
      text: "Security scan came back clean. We're cleared for the prod push.",
      timestamp: "2025-10-14T08:55:00Z",
      reactions: [{ emoji: "🔒", count: 1, users: ["u2"] }]
    },
    {
      id: "m12",
      userId: "me",
      text: "Approving the prod deploy. Go for it @Marcus Williams.",
      timestamp: "2025-10-14T09:00:00Z",
      reactions: [{ emoji: "🚀", count: 2, users: ["u2","u6"] }]
    }
  ],
  "space-3": [
    {
      id: "m13",
      userId: "u3",
      text: "New component variants are live in Figma — Button, Input, and Card.",
      timestamp: "2025-10-13T16:30:00Z",
      reactions: [{ emoji: "🎨", count: 2, users: ["u1","u7"] }]
    },
    {
      id: "m14",
      userId: "u1",
      text: "The dark mode tokens look great. Will the React components follow this week?",
      timestamp: "2025-10-13T16:35:00Z",
      reactions: []
    },
    {
      id: "m15",
      userId: "u3",
      text: "Yep! Storybook PRs by Friday.",
      timestamp: "2025-10-13T16:38:00Z",
      reactions: [{ emoji: "👏", count: 3, users: ["u1","u7","me"] }]
    }
  ],
  "space-4": [
    {
      id: "m16",
      userId: "u4",
      text: "Q3 numbers are looking 🔥 — we hit 112% of target.",
      timestamp: "2025-10-13T14:10:00Z",
      reactions: [{ emoji: "🔥", count: 5, users: ["u7","u9","me","u1","u2"] }]
    },
    {
      id: "m17",
      userId: "u7",
      text: "The new campaign definitely helped. CAC dropped 18% this quarter!",
      timestamp: "2025-10-13T14:15:00Z",
      reactions: [{ emoji: "💡", count: 2, users: ["u4","u9"] }]
    }
  ],
  "space-5": [
    {
      id: "m18",
      userId: "u5",
      text: "Demo is ready for Thursday's call. The model accuracy improved to 94.2%.",
      timestamp: "2025-10-13T11:00:00Z",
      reactions: [{ emoji: "🤖", count: 3, users: ["u1","u2","me"] }]
    },
    {
      id: "m19",
      userId: "u1",
      text: "Amazing! Let's rehearse Wednesday at 3pm.",
      timestamp: "2025-10-13T11:05:00Z",
      reactions: [{ emoji: "📅", count: 1, users: ["u5"] }]
    }
  ],
  "dm-1": [
    {
      id: "dm1-1",
      userId: "u1",
      text: "Hey! Can you review the PRD before EOD? There are some open questions on the AI section.",
      timestamp: "2025-10-14T09:55:00Z",
      reactions: []
    },
    {
      id: "dm1-2",
      userId: "me",
      text: "Sure, I'll take a look! Should I leave comments in Notion or directly in the doc?",
      timestamp: "2025-10-14T10:00:00Z",
      reactions: []
    },
    {
      id: "dm1-3",
      userId: "u1",
      text: "Notion works perfectly. I'll tag you in the specific sections.",
      timestamp: "2025-10-14T10:02:00Z",
      reactions: [{ emoji: "👍", count: 1, users: ["me"] }]
    }
  ],
  "dm-2": [
    {
      id: "dm2-1",
      userId: "u2",
      text: "The API is ready on staging 🚀 All endpoints are documented in Swagger.",
      timestamp: "2025-10-14T08:20:00Z",
      reactions: [{ emoji: "🚀", count: 1, users: ["me"] }]
    },
    {
      id: "dm2-2",
      userId: "me",
      text: "Excellent! I'll test the auth flow this afternoon.",
      timestamp: "2025-10-14T08:25:00Z",
      reactions: []
    }
  ],
  "dm-3": [
    {
      id: "dm3-1",
      userId: "u3",
      text: "Attached the updated mockups — let me know what you think!",
      timestamp: "2025-10-13T17:45:00Z",
      reactions: [],
      attachment: {
        type: "image",
        title: "mockup-v3.png",
        size: "1.1 MB",
        icon: "image"
      }
    },
    {
      id: "dm3-2",
      userId: "me",
      text: "Love the new card layout! Can we try a slightly larger avatar size?",
      timestamp: "2025-10-13T17:50:00Z",
      reactions: [{ emoji: "❤️", count: 1, users: ["u3"] }]
    }
  ]
};
