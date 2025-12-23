// controllers/authController.js
const User = require("../models/User");
const { otp, sentOtp } = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send response without password or token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Generate OTP
    const generatedOtp = otp(6); // from otpService

    // 2. Save OTP and expiry
    user.resetPasswordToken = generatedOtp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    // 3. Send OTP via email (use your otpService)
    await sentOtp(email, generatedOtp);

    res.json({
      message: "OTP sent to your email",
      expiresAt: new Date(user.resetPasswordExpire),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// controllers/authController.js
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. User check
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. OTP check
    if (!user.resetPasswordToken || user.resetPasswordToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 3. Expiry check
    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 4. OTP Verified Successfully
    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password without Token
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

