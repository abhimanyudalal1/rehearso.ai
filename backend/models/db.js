const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId

// Updated User schema for SpeakAI
const User = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
})

// Speech Practice Session schema
const SpeechSession = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  title: String,
  content: String,
  duration: Number, // in seconds
  feedback: {
    overallScore: Number,
    clarity: Number,
    pace: Number,
    confidence: Number,
    suggestions: [String]
  },
  audioUrl: String, // if storing audio recordings
  createdAt: { type: Date, default: Date.now }
})

// User Progress/Stats schema
const UserProgress = new Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  totalSessions: { type: Number, default: 0 },
  totalPracticeTime: { type: Number, default: 0 }, // in minutes
  averageScore: { type: Number, default: 0 },
  improvementAreas: [String],
  achievements: [String],
  lastUpdated: { type: Date, default: Date.now }
})

const UserModel = mongoose.model('User', User)
const SpeechSessionModel = mongoose.model('SpeechSession', SpeechSession)
const UserProgressModel = mongoose.model('UserProgress', UserProgress)

module.exports = {
  UserModel,
  SpeechSessionModel,
  UserProgressModel
}