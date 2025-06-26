// Enhanced session management with real data collection
export class SessionManager {
  private sessionData: any = null
  private isCollecting = false

  startSession() {
    this.isCollecting = true
    this.sessionData = {
      session_id: this.generateSessionId(),
      start_time: Date.now(),
      mediapipe_data: {
        session_duration: 0,
        good_posture_seconds: 0,
        hand_gestures_seconds: 0,
        speaking_seconds: 0,
        total_frames: 0,
      },
      text_chunks: [],
    }
  }

  addMediaPipeData(data: any) {
    if (!this.isCollecting) return

    this.sessionData.mediapipe_data = {
      ...this.sessionData.mediapipe_data,
      ...data,
    }
  }

  addTextChunk(text: string, response: string) {
    if (!this.isCollecting) return

    this.sessionData.text_chunks.push({
      text,
      response,
      timestamp: Date.now(),
    })
  }

  async stopSession(): Promise<any> {
    if (!this.isCollecting) return null

    this.isCollecting = false
    this.sessionData.mediapipe_data.session_duration = (Date.now() - this.sessionData.start_time) / 1000

    try {
      // Submit to your API endpoint
      const response = await fetch("/api/submit-session-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.sessionData),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit session: ${response.status}`)
      }

      const result = await response.json()

      // Store in localStorage for backup
      localStorage.setItem("latest_session_feedback", JSON.stringify(result))

      return result
    } catch (error) {
      console.error("Error submitting session:", error)
      throw error
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const sessionManager = new SessionManager()
