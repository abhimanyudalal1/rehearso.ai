// Room management service for group practice sessions
export interface Room {
  id: string
  name: string
  host_id: string
  topic_category: string
  time_per_speaker: number
  max_participants: number
  total_duration: number
  is_public: boolean
  description: string
  status: "waiting" | "active" | "completed"
  created_at: string
  participants: Participant[]
  current_speaker?: string
  speaking_order: string[]
  session_start_time?: string
  preparation_end_time?: string
  session_feedbacks: Feedback[]
  live_feedbacks: Feedback[]
}

export interface Participant {
  id: string
  name: string
  is_host: boolean
  joined_at: string
  camera_enabled: boolean
  mic_enabled: boolean
  has_spoken: boolean
  speaking_time_used: number
  feedback_received: Feedback[]
  mediapipe_analysis: {
    eye_contact_percentage: number
    gesture_count: number
    confidence_score: number
    speaking_pace: number
    volume_consistency: number
  }
}

export interface Feedback {
  id: string
  from_participant: string
  from_name: string
  to_participant: string
  message: string
  timestamp: string
  type: "positive" | "constructive" | "question"
  session_phase: string
}

export interface SessionReport {
  participant_id: string
  participant_name: string
  room_id: string
  session_date: string
  speaking_duration: number

  // AI Analysis Scores
  eye_contact_score: number
  gesture_score: number
  confidence_score: number
  pace_score: number
  volume_score: number
  overall_score: number

  // Feedback Analysis
  total_feedbacks_received: number
  positive_feedback_count: number
  constructive_feedback_count: number
  questions_received: number

  // Detailed Analysis
  feedback_summary: {
    strengths: string[]
    improvement_areas: string[]
    common_themes: string[]
  }

  // Peer Feedback
  peer_feedback: {
    positive_comments: Array<{ from: string; comment: string; timestamp: string }>
    constructive_comments: Array<{ from: string; comment: string; timestamp: string }>
    questions_asked: Array<{ from: string; question: string; timestamp: string }>
  }

  // AI Insights
  insights: string[]
  recommendations: string[]

  generated_at: string
}

class RoomManager {
  private rooms: Map<string, Room> = new Map()
  private reports: Map<string, SessionReport[]> = new Map()

  // Load room from localStorage or create new one
  loadRoom(roomData: Room): Room {
    this.rooms.set(roomData.id, roomData)
    return roomData
  }

  // Create a new room
  createRoom(roomData: Omit<Room, "participants" | "speaking_order" | "session_feedbacks" | "live_feedbacks">): Room {
    const room: Room = {
      ...roomData,
      participants: [],
      speaking_order: [],
      session_feedbacks: [],
      live_feedbacks: [],
    }

    this.rooms.set(room.id, room)
    this.saveToLocalStorage(room)
    return room
  }

  // Get room by ID
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  // Add participant to room
  addParticipant(
    roomId: string,
    participant: Omit<
      Participant,
      "joined_at" | "has_spoken" | "speaking_time_used" | "feedback_received" | "mediapipe_analysis"
    >,
  ): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.participants.length >= room.max_participants) {
      return false
    }

    const newParticipant: Participant = {
      ...participant,
      joined_at: new Date().toISOString(),
      has_spoken: false,
      speaking_time_used: 0,
      feedback_received: [],
      mediapipe_analysis: {
        eye_contact_percentage: 0,
        gesture_count: 0,
        confidence_score: 0,
        speaking_pace: 0,
        volume_consistency: 0,
      },
    }

    room.participants.push(newParticipant)
    this.saveToLocalStorage(room)

    if (
      room.participants.length === room.max_participants ||
      (room.participants.length > 1 && room.speaking_order.length === 0)
    ) {
      this.generateSpeakingOrder(roomId)
    }

    return true
  }

  // Generate random speaking order
  private generateSpeakingOrder(roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    const participantIds = room.participants.map((p) => p.id)
    // Shuffle array
    for (let i = participantIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[participantIds[i], participantIds[j]] = [participantIds[j], participantIds[i]]
    }

    room.speaking_order = participantIds
    this.saveToLocalStorage(room)
  }

  // Add feedback to room
  addFeedback(roomId: string, feedback: Feedback): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    // Add to room's live feedbacks
    room.live_feedbacks.push(feedback)

    // Add to participant's received feedback
    const participant = room.participants.find((p) => p.id === feedback.to_participant)
    if (participant) {
      participant.feedback_received.push(feedback)
    }

    this.saveToLocalStorage(room)
    return true
  }

  // Generate comprehensive reports for all participants
  generateSessionReports(roomId: string): Map<string, SessionReport> {
    const room = this.rooms.get(roomId)
    if (!room) return new Map()

    const reports = new Map<string, SessionReport>()

    room.participants.forEach((participant) => {
      const report = this.generateParticipantReport(room, participant)
      reports.set(participant.id, report)
    })

    this.reports.set(roomId, Array.from(reports.values()))

    // Save reports to localStorage
    localStorage.setItem(`session_reports_${roomId}`, JSON.stringify(Array.from(reports.values())))

    return reports
  }

  private generateParticipantReport(room: Room, participant: Participant): SessionReport {
    const feedbacksReceived = participant.feedback_received || []
    const positiveFeedbacks = feedbacksReceived.filter((f) => f.type === "positive")
    const constructiveFeedbacks = feedbacksReceived.filter((f) => f.type === "constructive")
    const questions = feedbacksReceived.filter((f) => f.type === "question")

    // Analyze feedback content for insights
    const feedbackAnalysis = this.analyzeFeedbackContent(feedbacksReceived)

    // Calculate scores based on MediaPipe data and feedback
    const mediaPipeData = participant.mediapipe_analysis || {}
    const overallScore = this.calculateOverallScore(mediaPipeData, feedbacksReceived)

    return {
      participant_id: participant.id,
      participant_name: participant.name,
      room_id: room.id,
      session_date: new Date().toISOString(),
      speaking_duration: participant.speaking_time_used || 0,

      // Scores based on MediaPipe analysis
      eye_contact_score: Math.round(mediaPipeData.eye_contact_percentage || 0),
      gesture_score: Math.min(100, Math.round((mediaPipeData.gesture_count || 0) * 10)),
      confidence_score: Math.round(mediaPipeData.confidence_score || 0),
      pace_score: Math.round(mediaPipeData.speaking_pace || 0),
      volume_score: Math.round(mediaPipeData.volume_consistency || 0),
      overall_score: overallScore,

      // Feedback analysis
      total_feedbacks_received: feedbacksReceived.length,
      positive_feedback_count: positiveFeedbacks.length,
      constructive_feedback_count: constructiveFeedbacks.length,
      questions_received: questions.length,

      // Detailed feedback breakdown
      feedback_summary: {
        strengths: feedbackAnalysis.strengths,
        improvement_areas: feedbackAnalysis.improvements,
        common_themes: feedbackAnalysis.themes,
      },

      // Peer feedback quotes
      peer_feedback: {
        positive_comments: positiveFeedbacks.map((f) => ({
          from: f.from_name,
          comment: f.message,
          timestamp: f.timestamp,
        })),
        constructive_comments: constructiveFeedbacks.map((f) => ({
          from: f.from_name,
          comment: f.message,
          timestamp: f.timestamp,
        })),
        questions_asked: questions.map((f) => ({
          from: f.from_name,
          question: f.message,
          timestamp: f.timestamp,
        })),
      },

      // AI-generated insights
      insights: this.generatePersonalInsights(mediaPipeData, feedbackAnalysis, participant),

      // Recommendations
      recommendations: this.generateRecommendations(mediaPipeData, feedbackAnalysis),

      generated_at: new Date().toISOString(),
    }
  }

  private analyzeFeedbackContent(feedbacks: Feedback[]) {
    const strengths: string[] = []
    const improvements: string[] = []
    const themes: string[] = []

    const positiveKeywords = [
      "good",
      "great",
      "excellent",
      "clear",
      "confident",
      "engaging",
      "well",
      "strong",
      "impressive",
      "nice",
      "perfect",
    ]
    const improvementKeywords = [
      "improve",
      "better",
      "more",
      "less",
      "try",
      "consider",
      "maybe",
      "could",
      "should",
      "work on",
    ]

    feedbacks.forEach((feedback) => {
      const message = feedback.message.toLowerCase()

      if (feedback.type === "positive" || positiveKeywords.some((keyword) => message.includes(keyword))) {
        strengths.push(feedback.message)
      }

      if (feedback.type === "constructive" || improvementKeywords.some((keyword) => message.includes(keyword))) {
        improvements.push(feedback.message)
      }

      // Extract common themes
      if (message.includes("eye contact") || message.includes("looking")) themes.push("Eye Contact")
      if (message.includes("voice") || message.includes("speaking") || message.includes("volume"))
        themes.push("Voice & Delivery")
      if (message.includes("gesture") || message.includes("body") || message.includes("hand"))
        themes.push("Body Language")
      if (message.includes("pace") || message.includes("speed") || message.includes("fast") || message.includes("slow"))
        themes.push("Speaking Pace")
      if (message.includes("content") || message.includes("topic") || message.includes("story"))
        themes.push("Content Quality")
      if (message.includes("confident") || message.includes("nervous")) themes.push("Confidence")
    })

    return {
      strengths: [...new Set(strengths)],
      improvements: [...new Set(improvements)],
      themes: [...new Set(themes)],
    }
  }

  private calculateOverallScore(mediaPipeData: any, feedbacks: Feedback[]) {
    const eyeContactScore = mediaPipeData.eye_contact_percentage || 0
    const gestureScore = Math.min(100, (mediaPipeData.gesture_count || 0) * 10)
    const confidenceScore = mediaPipeData.confidence_score || 0
    const paceScore = mediaPipeData.speaking_pace || 0
    const volumeScore = mediaPipeData.volume_consistency || 0

    // Weight MediaPipe scores (70% of total)
    const mediaPipeAverage = (eyeContactScore + gestureScore + confidenceScore + paceScore + volumeScore) / 5

    // Weight peer feedback (30% of total)
    const positiveFeedbacks = feedbacks.filter((f) => f.type === "positive").length
    const totalFeedbacks = feedbacks.length
    const feedbackScore = totalFeedbacks > 0 ? (positiveFeedbacks / totalFeedbacks) * 100 : 50

    return Math.round(mediaPipeAverage * 0.7 + feedbackScore * 0.3)
  }

  private generatePersonalInsights(mediaPipeData: any, feedbackAnalysis: any, participant: Participant) {
    const insights: string[] = []

    // MediaPipe insights
    if (mediaPipeData.eye_contact_percentage < 30) {
      insights.push("Your eye contact could be improved. Try looking directly at the camera more often.")
    } else if (mediaPipeData.eye_contact_percentage > 70) {
      insights.push("Excellent eye contact! You maintained good visual connection throughout your speech.")
    }

    if (mediaPipeData.gesture_count < 3) {
      insights.push("Consider using more hand gestures to emphasize your points and engage your audience.")
    } else if (mediaPipeData.gesture_count > 15) {
      insights.push("You used gestures effectively, but be mindful not to overdo it.")
    }

    if (mediaPipeData.confidence_score < 50) {
      insights.push("Work on projecting more confidence through your posture and facial expressions.")
    }

    // Feedback-based insights
    if (feedbackAnalysis.themes.includes("Voice & Delivery")) {
      insights.push("Multiple peers commented on your voice delivery - this seems to be a key area of focus.")
    }

    if (feedbackAnalysis.strengths.length > feedbackAnalysis.improvements.length) {
      insights.push("Great job! You received more positive feedback than constructive criticism.")
    }

    if (feedbackAnalysis.themes.includes("Eye Contact")) {
      insights.push("Eye contact was mentioned in feedback - this aligns with our AI analysis.")
    }

    return insights
  }

  private generateRecommendations(mediaPipeData: any, feedbackAnalysis: any) {
    const recommendations: string[] = []

    // MediaPipe-based recommendations
    if (mediaPipeData.eye_contact_percentage < 50) {
      recommendations.push("Practice maintaining eye contact by looking directly at your camera lens")
    }

    if (mediaPipeData.confidence_score < 60) {
      recommendations.push("Work on your posture and facial expressions to project more confidence")
    }

    if (mediaPipeData.speaking_pace < 40) {
      recommendations.push("Try to speak a bit faster to maintain audience engagement")
    } else if (mediaPipeData.speaking_pace > 80) {
      recommendations.push("Slow down your speaking pace to ensure clarity")
    }

    if (mediaPipeData.gesture_count < 5) {
      recommendations.push("Use more hand gestures to emphasize key points")
    }

    // Feedback-based recommendations
    if (feedbackAnalysis.improvements.length > 0) {
      recommendations.push("Focus on the constructive feedback you received from peers")
    }

    if (feedbackAnalysis.themes.includes("Body Language")) {
      recommendations.push("Practice your body language and gestures in front of a mirror")
    }

    if (feedbackAnalysis.themes.includes("Voice & Delivery")) {
      recommendations.push("Work on voice modulation and speaking clarity")
    }

    return recommendations
  }

  // Get participant's report
  getParticipantReport(roomId: string, participantId: string): SessionReport | undefined {
    const roomReports = this.reports.get(roomId)
    return roomReports?.find((report) => report.participant_id === participantId)
  }

  // Update participant media status
  updateParticipantMedia(roomId: string, participantId: string, camera: boolean, mic: boolean): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const participant = room.participants.find((p) => p.id === participantId)
    if (!participant) return false

    participant.camera_enabled = camera
    participant.mic_enabled = mic
    this.saveToLocalStorage(room)
    return true
  }

  // Get all public rooms
  getPublicRooms(): Room[] {
    return Array.from(this.rooms.values()).filter((room) => room.is_public && room.status === "waiting")
  }

  // Save room to localStorage
  private saveToLocalStorage(room: Room): void {
    try {
      const rooms = JSON.parse(localStorage.getItem("practiceRooms") || "[]")
      const updatedRooms = rooms.filter((r: Room) => r.id !== room.id)
      updatedRooms.push(room)
      localStorage.setItem("practiceRooms", JSON.stringify(updatedRooms))
    } catch (error) {
      console.error("Error saving room to localStorage:", error)
    }
  }
}

export const roomManager = new RoomManager()
