const { Router } = require("express")
const router = Router()
const { UserProgressModel } = require("../models/db")
const authMiddleware = require("../middleware/auth")

// Update user progress
router.put("/", authMiddleware, async (req, res) => {
  try {
    const updates = req.body

    const progress = await UserProgressModel.findOneAndUpdate(
      { userId: req.user.id },
      {
        ...updates,
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
      },
    )

    res.json({
      success: true,
      message: "Progress updated successfully",
      progress,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating progress",
      error: error.message,
    })
  }
})

// Get user progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    const progress = await UserProgressModel.findOne({ userId: req.user.id })

    res.json({
      success: true,
      progress: progress || {
        userId: req.user.id,
        totalSessions: 0,
        totalPracticeTime: 0,
        averageScore: 0,
        improvementAreas: [],
        achievements: [],
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching progress",
      error: error.message,
    })
  }
})

module.exports = router
