import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jwt

const userSchema = new Schema(
  {
    username: {
      required: true,
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      required: true,
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      required: true,
      type: String,
      trim: true,
      index: true,
    },
    avatar: {
      required: true,
      type: String,
    },
    coverImg: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  // use this middleware before saving.
  if (!this.isModified("password")) return next(); // if password is not modified then no need to hashed.
  this.password = await bcryptjs.hash(this.password, 10); // password is modified, needs to be hashed.
  next();
});

// Method to check if entered password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password); // here "password" is req.body password (entered by user) and this.password is the password stored in database after user was registered.
};

// Method to generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
