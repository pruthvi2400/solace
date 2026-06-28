import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false, // Don't return password in queries
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // For future scalability: roles, reset tokens, etc.
  // role: {
  //   type: String,
  //   enum: ['user', 'publisher'],
  //   default: 'user',
  // },
  // resetPasswordToken: String,
  // resetPasswordExpire: Date,
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (this: UserDocument) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.comparePassword = async function (this: UserDocument, enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  getSignedJwtToken(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const User = mongoose.model<UserDocument>("User", UserSchema);

export default User;
