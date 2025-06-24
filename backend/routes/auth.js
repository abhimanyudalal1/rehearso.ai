const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const { UserModel, UserProgressModel } = require('../models/db');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET; // Make sure this is set in your .env

// Validation schemas
const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Signup route
router.post('/signup', async (req, res) => { // CHANGED: Removed '/api/auth' prefix
  try {
    const validatedData = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const newUser = await UserModel.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword
    });

    // Create user progress record
    await UserProgressModel.create({
      userId: newUser._id
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => { // CHANGED: Removed '/api/auth' prefix
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await UserModel.findOne({ email: validatedData.email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login
    await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => { // CHANGED: Removed '/api/auth' prefix
  try {
    // req.user.id is populated by authMiddleware
    const user = await UserModel.findById(req.user.id).select('-password');
    if (!user) { // Added check for user existence
        return res.status(404).json({ success: false, message: "User not found." });
    }
    const progress = await UserProgressModel.findOne({ userId: req.user.id });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        progress
      }
    });
  } catch (error) {
    console.error("Error in /me route:", error); // Added console.error for debugging
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Logout (client-side mainly, but we can track it)
router.post('/logout', authMiddleware, async (req, res) => { // CHANGED: Removed '/api/auth' prefix
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

module.exports = router;