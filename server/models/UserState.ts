import mongoose, { Schema, Document, Types } from "mongoose";

// The shape of the onboarding and privacy sub-documents
export interface Onboarding {
  name: string;
  reasons: string[];
  feeling: string;
  goals: string[];
  onboarded: boolean;
}

export interface Privacy {
  passcodeEnabled: boolean;
  passcode: string;
  aiMemoryEnabled: boolean;
  dataSharingConsent: boolean;
}

export interface NoContact {
  startDate: string;
  relapsesCount: number;
  lastContactDate: string;
}

export interface Routine {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

export interface Mood {}

export interface Journal {}

export interface Memory {}

export interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
}

export interface Encouragement {
  affirmation: string;
  quote: string;
  challenge: string;
  challengeCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  role: string;
  text: string;
  createdAt: string;
}

export interface UserStateDocument extends Document {
  user: Types.ObjectId;
  onboarding: Onboarding;
  privacy: Privacy;
  noContact: NoContact;
  routines: Routine[];
  moods: Mood[];
  journals: Journal[];
  memories: Memory[];
  goals: Goal[];
  encouragement: Encouragement;
  chatHistory: ChatMessage[];
}

const OnboardingSchema: Schema = new Schema({
  name: { type: String, default: "" },
  reasons: { type: [String], default: [] },
  feeling: { type: String, default: "lonely" },
  goals: { type: [String], default: [] },
  onboarded: { type: Boolean, default: false },
});

const PrivacySchema: Schema = new Schema({
  passcodeEnabled: { type: Boolean, default: false },
  passcode: { type: String, default: "" },
  aiMemoryEnabled: { type: Boolean, default: true },
  dataSharingConsent: { type: Boolean, default: true },
});

const NoContactSchema: Schema = new Schema({
  startDate: { type: String, default: "" },
  relapsesCount: { type: Number, default: 0 },
  lastContactDate: { type: String, default: "" },
});

const RoutineSchema: Schema = new Schema({
  id: { type: String, default: "" },
  text: { type: String, default: "" },
  completed: { type: Boolean, default: false },
  category: { type: String, default: "" },
});

const GoalSchema: Schema = new Schema({
  id: { type: String, default: "" },
  title: { type: String, default: "" },
  category: { type: String, default: "" },
  progress: { type: Number, default: 0 },
});

const EncouragementSchema: Schema = new Schema({
  affirmation: { type: String, default: "" },
  quote: { type: String, default: "" },
  challenge: { type: String, default: "" },
  challengeCompleted: { type: Boolean, default: false },
});

const ChatMessageSchema: Schema = new Schema({
  id: { type: String, default: "" },
  role: { type: String, default: "" },
  text: { type: String, default: "" },
  createdAt: { type: String, default: "" },
});

const UserStateSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  onboarding: { type: OnboardingSchema, default: () => ({}) },
  privacy: { type: PrivacySchema, default: () => ({}) },
  noContact: { type: NoContactSchema, default: () => ({}) },
  routines: { type: [RoutineSchema], default: [] },
  moods: { type: [Schema.Types.Mixed], default: [] },
  journals: { type: [Schema.Types.Mixed], default: [] },
  memories: { type: [Schema.Types.Mixed], default: [] },
  goals: { type: [GoalSchema], default: [] },
  encouragement: { type: EncouragementSchema, default: () => ({}) },
  chatHistory: { type: [ChatMessageSchema], default: [] },
});

export const UserState = mongoose.model<UserStateDocument>("UserState", UserStateSchema);
