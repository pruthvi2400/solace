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
        startDate: "",
        relapsesCount: 0,
        lastContactDate: "",
      },
      routines: [],
      moods: [],
      journals: [],
      memories: [],
      goals: [],
      encouragement: {
        affirmation: "",
        quote: "",
        challenge: "",
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
          text: "Hello, I\"m Solace. I\"m here to listen, support, and stand by you. You don\"t have to carry this weight alone. How are you holding up right now?",
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