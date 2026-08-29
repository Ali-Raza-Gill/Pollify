import User from "../models/userModal.js";
import Poll from "../models/pollModal.js";
import CommentModal from "../models/commentModal.js";
import { generateAccessToken, verifyAccessToken } from "../helper/jwtHelper.js";
import {
  conflict,
  success,
  created,
  serverError,
  badRequest,
  unauthorized,
} from "../helper/responseHandler.js";
import { hashPassword, verifyPassword } from "../helper/hashHelper.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";
import { generateOTP, otpExpiry, validOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../config/mailer.js";
import { passwordRegex } from "../helper/passwordRegex.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, userName, password } = req.body;
    if (!name || !email || !userName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });
    if (existingUser) {
      return conflict(res, "Email or username already exists");
    }

    let avatar = "";
    if (req.file) {
      try {
        avatar = await uploadToCloudinary(req.file.buffer); // Assuming you're using multer for file uploads
      } catch (e) {
        console.error("Error uploading avatar to Cloudinary:", e);
      }
    }
    // Generate otp
    const otp = generateOTP();

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      userName,
      password: hashedPassword,
      avatar,
      otp,
      otpExpires: otpExpiry(),
    });
    await sendOTPEmail(email, otp, "Verify your Pollify account");
    return created(
      res,
      "User registered successfully. Please check your email for the OTP to verify your account.",
      {
        userId: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        needsVerification: true,
      },
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// to verify the user with otp
export const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and OTP are both required" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user, !user.isVerified || !validOTP(user, otp));
    if (user.isVerified || !validOTP(user, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate a new access token after verification
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.userName,
      avatar: user.avatar,
      bio: user.bio,
    });
    return success(res, "User verified successfully", {
      token: accessToken,
      user: {
        name: user.userName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// to resend the otp to the user
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email: email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.otp = generateOTP();
    user.otpExpires = otpExpiry();
    await user.save();
    await sendOTPEmail(email, user.otp, "Verify your Pollify account");
    return success(
      res,
      "OTP resent successfully. Please check your email for the new OTP.",
      { email: user.email },
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// login a user

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email });
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "User is not verified. Please verify your account first.",
        needsVerification: true,
        email: user.email,
      });
    }
    console.log("User logged in:", user);

    const userResponse = user.toObject();
    delete userResponse.password; // Remove password,otp,otpExpires from the response
    delete userResponse.otp;
    delete userResponse.otpExpires;

    return success(res, "User logged in successfully", {
      accessToken: generateAccessToken({
        userId: user._id,
        userName: user.userName,
        email: user.email,
        username: user.userName,
      }),
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// update user profile

export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const taken = await User.findOne({ username });
      if (taken) {
        return res.status(409).json({ message: "Username is already taken" });
      }
      user.username = username;
    }
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      console.log("file image: " + req.file);

      const avatarUrl = await uploadToCloudinary(
        req.file.buffer,
        "Polling-app/avatars",
      );

      // 2. Delete OLD image
      if (user.avatar?.publicId) {
        try {
          await deleteFromCloudinary(user.avatar.publicId);
        } catch (error) {
          console.error("Failed to delete old avatar:", error);
        }
      }

      // 3. Save NEW image information
      user.avatar = {
        url: avatarUrl.secure_url,
        publicId: avatarUrl.public_id,
      };
    }

    await user.save();
    return success(res, "Profile updated successfully", {
      user: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

// Update User Password

export const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, and a number",
      });
    }
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    return success(res, "Password updated successfully");
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

// Delete User Account
export const deleteUserAccount = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.user?.userId;
    if (!userId) {
      session.abortTransaction();
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(userId).session(session);
    if (!user) {
      session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    const userPolls = await Poll.find({ creator: userId })
      .select("_id")
      .session(session);
    console.log("Polls data", userPolls);

    const pollIds = userPolls.map((poll) => poll._id);
    console.log("Poll data", pollIds);

    await CommentModal.deleteMany(
      {
        $or: [{ user: userId }, { poll: { $in: pollIds } }],
      },
      { session },
    );

    // 3. Remove user's votes
    await Poll.updateMany(
      {},
      {
        $pull: {
          votes: { user: userId },
        },
      },
      { session },
    );

    await User.deleteOne({ _id: userId }, { session });
    await session.commitTransaction();
    return success(
      res,
      "User account and associated data deleted successfully",
    );
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  } finally {
    await session.endSession();
  }
};

// Get User Profile
export const getMe = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = await User.findById(userId).select(
      "-password -otp -otpExpires",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const [created, voted] = await Promise.all([
      Poll.countDocuments({ creator: userId }),
      Poll.countDocuments({ "votes.user": userId }),
    ]);
    return res.status(200).json({
      user,
      stats: {
        created,
        voted,
        bookmarked: user.bookmarks.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Forgot Password and Reset Password functionalities can be added here in the future.

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = generateOTP();
    const otpExpires = otpExpiry();

    user.otp = otp;
    user.otpExpires = otpExpires;

    user.save();
    await sendOTPEmail(email, otp, "OTP send to your email");
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Verify forgot password OTP
export const verifyResetPassword = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return badRequest(res, "Invalid email or password");
    }
    const user = await User.findOne({ email: email });

    const valid = validOTP(user, otp);
    if (!valid) {
      return badRequest(res, "Invalid or Expired OTP");
    }
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_RESET_SECRET,
      { expiresIn: process.env.JWT_RESET_EXPIRY || "10m" },
    );
    console.log("Generated access token:", token); // Debugging line
    console.log("DECODED TOKEN:", jwt.decode(token));
    return success(res, "Verification succeeded", token);
  } catch (error) {
    console.error(error);
    return serverError(error);
  }
};

// set New Password
export const setNewPassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const password = req.body.newPassword;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, and a number",
      });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Token missing, please try again");
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const user = await User.findById(decodedToken.userId);

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();
    return success(res, "Password updated successfully");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Reset token is expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid reset token",
      });
    }
    return serverError(error);
  }
};
