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
}

export interface Feedback {
  from_participant: string
  message: string
  timestamp: string
  type: "positive" | "constructive" | "question"
}

export interface SessionReport {
  participant_id: string
  room_id: string
  speaking_duration: number
  confidence_score: number
  clarity_score: number
  engagement_score: number
  feedback_summary: string[]
  improvement_areas: string[]
  strengths: string[]
  overall_score: number
  generated_at: string
}

class RoomManager {
  private rooms: Map<string, Room> = new Map()
  private reports: Map<string, SessionReport[]> = new Map()

  // Create a new room
  createRoom(roomData: Omit<Room, "participants" | "speaking_order">): Room {
    const room: Room = {
      ...roomData,
      participants: [],
      speaking_order: [],
    }

    this.rooms.set(room.id, room)
    return room
  }

  // Get room by ID
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  // Add participant to room
  addParticipant(
    roomId: string,
    participant: Omit<Participant, "joined_at" | "has_spoken" | "speaking_time_used" | "feedback_received">,
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
    }

    room.participants.push(newParticipant)

    // If this is the first participant and they're the host, or if room is full, update speaking order
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
  }

  // Start session
  startSession(roomId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.status !== "waiting") return false

    room.status = "active"
    room.session_start_time = new Date().toISOString()

    // Start preparation time for first speaker
    if (room.speaking_order.length > 0) {
      room.current_speaker = room.speaking_order[0]
      room.preparation_end_time = new Date(Date.now() + 60000).toISOString() // 1 minute prep
    }

    return true
  }

  // Move to next speaker
  nextSpeaker(roomId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.status !== "active") return false

    const currentIndex = room.speaking_order.findIndex((id) => id === room.current_speaker)
    if (currentIndex === -1) return false

    // Mark current speaker as having spoken
    const currentParticipant = room.participants.find((p) => p.id === room.current_speaker)
    if (currentParticipant) {
      currentParticipant.has_spoken = true
    }

    // Move to next speaker or end session
    if (currentIndex < room.speaking_order.length - 1) {
      room.current_speaker = room.speaking_order[currentIndex + 1]
      room.preparation_end_time = new Date(Date.now() + 60000).toISOString() // 1 minute prep
    } else {
      // Session complete
      room.status = "completed"
      room.current_speaker = undefined
      this.generateReports(roomId)
    }

    return true
  }

  // Add feedback
  addFeedback(roomId: string, toParticipant: string, feedback: Omit<Feedback, "timestamp">): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const participant = room.participants.find((p) => p.id === toParticipant)
    if (!participant) return false

    const newFeedback: Feedback = {
      ...feedback,
      timestamp: new Date().toISOString(),
    }

    participant.feedback_received.push(newFeedback)
    return true
  }

  // Generate AI reports for all participants
  private generateReports(roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    const reports: SessionReport[] = []

    room.participants.forEach((participant) => {
      // Simulate AI analysis scores
      const report: SessionReport = {
        participant_id: participant.id,
        room_id: roomId,
        speaking_duration: participant.speaking_time_used,
        confidence_score: Math.floor(Math.random() * 30) + 70, // 70-100
        clarity_score: Math.floor(Math.random() * 25) + 75, // 75-100
        engagement_score: Math.floor(Math.random() * 20) + 80, // 80-100
        feedback_summary: participant.feedback_received.map((f) => f.message),
        improvement_areas: this.generateImprovementAreas(),
        strengths: this.generateStrengths(),
        overall_score: 0, // Will be calculated
        generated_at: new Date().toISOString(),
      }

      // Calculate overall score
      report.overall_score = Math.round((report.confidence_score + report.clarity_score + report.engagement_score) / 3)

      reports.push(report)
    })

    this.reports.set(roomId, reports)
  }

  private generateImprovementAreas(): string[] {
    const areas = [
      "Reduce filler words (um, uh, like)",
      "Maintain better eye contact with camera",
      "Vary speaking pace for emphasis",
      "Use more expressive gestures",
      "Improve voice projection",
      "Better structure with clear introduction and conclusion",
    ]
    return areas.slice(0, Math.floor(Math.random() * 3) + 2) // 2-4 areas
  }

  private generateStrengths(): string[] {
    const strengths = [
      "Clear articulation and pronunciation",
      "Good use of examples and stories",
      "Confident body language",
      "Engaging tone and enthusiasm",
      "Well-organized content structure",
      "Effective use of pauses",
    ]
    return strengths.slice(0, Math.floor(Math.random() * 3) + 2) // 2-4 strengths
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
    return true
  }

  // Get all public rooms
  getPublicRooms(): Room[] {
    return Array.from(this.rooms.values()).filter((room) => room.is_public && room.status === "waiting")
  }
}

export const roomManager = new RoomManager()
