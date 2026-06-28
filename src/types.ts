export interface OnboardingAnswers {
  name: string;
  reasons: string[];
  feeling: string;
  goals: string[];
  onboarded: boolean;
}

export interface NoContactState {
  startDate: string | null; // ISO string
  relapsesCount: number;
  lastContactDate: string | null;
}

export interface RoutineItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

export interface MoodEntry {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  value: number; // 1-5
  note: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  unlockDate: string; // ISO string
  type: 'note' | 'photo' | 'song';
  photoUrl?: string;
  songUrl?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: string;
  progress: number; // 0 to 100
}

export interface DailyEncouragementState {
  affirmation: string;
  quote: string;
  challenge: string;
  challengeCompleted: boolean;
}

export interface PrivacySettingsState {
  passcodeEnabled: boolean;
  passcode: string;
  aiMemoryEnabled: boolean;
  dataSharingConsent: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

export interface UserState {
  onboarding: OnboardingAnswers;
  noContact: NoContactState;
  routines: RoutineItem[];
  moods: MoodEntry[];
  journals: JournalEntry[];
  memories: MemoryItem[];
  goals: GoalItem[];
  encouragement: DailyEncouragementState;
  privacy: PrivacySettingsState;
  chatHistory: ChatMessage[];
}
