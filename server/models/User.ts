import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserState } from "../../src/types";

interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  solaceState: UserState;
  getSignedJwtToken(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  solaceState: {
    type: Object,
    default: {
      onboarding: {
        name: "",
        reasons: [],
        feeling: "lonely",
        goals: [],
        onboarded: false,
      },
      noContact: {
        startDate: null,
        relapsesCount: 0,
        lastContactDate: null,
      },
      routines: [
        { id: "1", text: "Drink water regularly", completed: false, category: "body" },
        { id: "2", text: "Eat three nourishing meals", completed: false, category: "body" },
        { id: "3", text: "Brush teeth and shower", completed: false, category: "body" },
        { id: "4", text: "Step outside into nature for 10 min", completed: false, category: "soul" },
        { id: "5", text: "Avoid checking their social media", completed: false, category: "mind" },
        { id: "6", text: "Journal my raw feelings", completed: false, category: "mind" },
        { id: "7", text: "Practice 5 minutes of deep breathing", completed: false, category: "soul" },
        { id: "8", text: "Do one small thing that makes me smile", completed: false, category: "soul" }
      ],
      moods: [],
      journals: [],
      memories: [],
      goals: [
        { id: "g1", title: "Read 10 pages of a comforting book", category: "mind", progress: 0 },
        { id: "g2", title: "Move my body (stretch, walk, or gym)", category: "body", progress: 0 },
        { id: "g3", title: "Spend 20 mins learning a skill or language", category: "growth", progress: 0 },
        { id: "g4", title: "Tidy up my room/desk space", category: "environment", progress: 0 }
      ],
      encouragement: {
        affirmation:
          "You are allowed to feel everything you're feeling right now. Grief is not a sign of weakness, but a testament to how deeply you loved.",
        quote:
          "Healing is not a linear climb, but a spiral path. Do not judge your progress by today's heavy weather.",
        challenge:
          "Drink one warm cup of herbal tea or water, hold the mug in both hands, and take 5 slow, deep breaths.",
        challengeCompleted: false,
      },
      privacy: {
        passcodeEnabled: false,
        passcode: "",
        aiMemoryEnabled: true,
        dataSharingConsent: true,
      },
      chatHistory: [
        {
          id: "welcome-" + Date.now(),
          role: "model",
          text: "Hello, I'm Solace. I'm here to listen, support, and stand by you. You don't have to carry this weight alone. How are you holding up right now?",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  },
});

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "7d",
    }
  );
};

// Compare passwords
UserSchema.methods.comparePassword = async function (
  enteredPassword: string
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<UserDocument>("User", UserSchema);

export default User;