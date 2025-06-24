// backend/routes/sessions.js
const { Router } = require('express');
const router = Router();
const authMiddleware = require('../middleware/auth'); // Assuming you have this
const { SpeechSessionModel, UserProgressModel } = require('../models/db');
const { z } = require('zod'); // For validation

// Schema for saving a speech session
const speechSessionSchema = z.object({
  userId: z.string().nonempty(), // Should be the ObjectId of the user
  title: z.string().optional(),
  content: z.string().nonempty(),
  duration: z.number().min(0),
  feedback: z.object({
    overallScore: z.number().min(0).max(100),
    clarity: z.number().min(0).max(100),
    pace: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    suggestions: z.array(z.string()),
  }),
  audioUrl: z.string().optional(),
});

// Route to create a new speech session
router.post('/sessions', authMiddleware, async (req, res) => { // CHANGED: Removed '/api' prefix
  try {
    // Ensure the userId from the token matches the userId in the request body (for security)
    if (req.user.id !== req.body.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized: User ID mismatch." });
    }

    const validatedData = speechSessionSchema.parse(req.body);

    const newSession = await SpeechSessionModel.create({
      userId: validatedData.userId,
      title: validatedData.title || `Solo Practice - ${new Date().toLocaleString()}`,
      content: validatedData.content,
      duration: validatedData.duration,
      feedback: validatedData.feedback,
      audioUrl: validatedData.audioUrl,
    });

    // Update UserProgress
    const userProgress = await UserProgressModel.findOneAndUpdate(
      { userId: validatedData.userId },
      {
        $inc: { totalSessions: 1, totalPracticeTime: Math.round(validatedData.duration / 60) }, // Increment total sessions and time in minutes
        $set: { lastUpdated: new Date() },
        // You might want to update averageScore and improvementAreas here too,
        // which would require fetching existing progress and recalculating.
        // For simplicity, I'm omitting complex recalculation here.
        // E.g., $avg and $push to arrays would be more complex and require aggregation or manual logic.
      },
      { new: true, upsert: true } // Create if not exists
    );

    res.status(201).json({
      success: true,
      message: "Speech session saved successfully",
      session: newSession,
      userProgress: userProgress,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("Error saving speech session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;