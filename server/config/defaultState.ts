// Default state for a new user. Only includes onboarding and privacy as required.
export const DEFAULT_STATE = {
  onboarding: {
    name: "",
    reasons: [],
    feeling: "lonely",
    goals: [],
    onboarded: false,
  },
  privacy: {
    passcodeEnabled: false,
    passcode: "",
    aiMemoryEnabled: true,
    dataSharingConsent: true,
  },
  noContact: {
    startDate: "",
    relapsesCount: 0,
    lastContactDate: "",
  },
  routines: [
    { id: "1", text: "Drink water regularly", completed: false, category: "body" },
    { id: "2", text: "Eat three nourishing meals", completed: false, category: "body" },
    { id: "3", text: "Brush teeth and shower", completed: false, category: "body" },
    { id: "4", text: "Step outside into nature for 10 min", completed: false, category: "soul" },
    { id: "5", text: "Avoid checking their social media", completed: false, category: "mind" },
    { id: "6", text: "Journal my raw feelings", completed: false, category: "mind" },
    { id: "7", text: "Practice 5 minutes of deep breathing", completed: false, category: "soul" },
    { id: "8", text: "Do one small thing that makes me smile", completed: false, category: "soul" },
  ],
  moods: [],
  journals: [],
  memories: [],
  goals: [
    { id: "g1", title: "Read 10 pages of a comforting book", category: "mind", progress: 0 },
    { id: "g2", title: "Move my body (stretch, walk, or gym)", category: "body", progress: 0 },
    { id: "g3", title: "Spend 20 mins learning a skill or language", category: "growth", progress: 0 },
    { id: "g4", title: "Tidy up my room/desk space", category: "environment", progress: 0 },
  ],
  encouragement: {
    affirmation: "",
    quote: "",
    challenge: "",
    challengeCompleted: false,
  },
  chatHistory: [
    {
      id: "welcome",
      role: "model",
      text: "Hello, I'm Solace. I'm here to listen, support, and stand by you. You don't have to carry this weight alone. How are you holding up right now?",
      createdAt: new Date().toISOString(),
    },
  ],
};
