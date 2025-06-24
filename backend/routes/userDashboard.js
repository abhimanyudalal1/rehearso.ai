const express = require("express")
const router = express.Router()
const { UserProgressModel, SpeechSessionModel } = require("../models/db")

// 1. Stats
router.get("/userstats/:userId", async (req, res) => {
  const { userId } = req.params
  try {
    const stats = await UserProgressModel.findOne({ userId })
    res.json({
      totalSessions: stats?.totalSessions || 0,
      thisWeekSessions: 3, // (optional: calculate real week-based sessions)
      averageScore: stats?.averageScore || 0,
      bestScore: 80, // (optional: calculate best score from sessions)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch user stats" })
  }
})

// 2. Recent Sessions
router.get("/usersessions/:userId", async (req, res) => {
  const { userId } = req.params
  const limit = parseInt(req.query.limit) || 3

  try {
    const sessions = await SpeechSessionModel.find({ userId }).sort({ createdAt: -1 }).limit(limit)
    res.json(sessions)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch sessions" })
  }
})

module.exports = router
