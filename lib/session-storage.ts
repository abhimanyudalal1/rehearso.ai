// Utility functions for managing session data in localStorage

export interface SessionData {
  sessionId: string
  timestamp: number
  mediapipe_data: {
    session_duration: number
    good_posture_seconds: number
    hand_gestures_seconds: number
    speaking_seconds: number
  }
  text_chunks: Array<{
    text: string
    response: string
    timestamp: number
  }>
  audio_features?: {
    pitch_mean: number
    pitch_std: number
    rms_mean: number
    tempo: number
    spectral_centroid: number
    mfcc_features: number[]
  }
  speaking_patterns?: {
    filler_words: number
    pause_count: number
    words_per_minute: number
    clarity_score: number
  }
}

export const saveSessionData = (data: SessionData) => {
  try {
    localStorage.setItem("latest_session_data", JSON.stringify(data))

    // Also save to session history
    const history = getSessionHistory()
    history.unshift(data)

    // Keep only last 10 sessions
    const trimmedHistory = history.slice(0, 10)
    localStorage.setItem("session_history", JSON.stringify(trimmedHistory))

    return true
  } catch (error) {
    console.error("Error saving session data:", error)
    return false
  }
}

export const getLatestSessionData = (): SessionData | null => {
  try {
    const data = localStorage.getItem("latest_session_data")
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Error retrieving session data:", error)
    return null
  }
}

export const getSessionHistory = (): SessionData[] => {
  try {
    const history = localStorage.getItem("session_history")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("Error retrieving session history:", error)
    return []
  }
}

export const clearSessionData = () => {
  try {
    localStorage.removeItem("latest_session_data")
    return true
  } catch (error) {
    console.error("Error clearing session data:", error)
    return false
  }
}

// Helper function to generate session data from MediaPipe and audio analysis
export const createSessionData = (mediaPipeResults: any, audioFeatures: any, textChunks: any[]): SessionData => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return {
    sessionId,
    timestamp: Date.now(),
    mediapipe_data: {
      session_duration: mediaPipeResults.duration || 0,
      good_posture_seconds: mediaPipeResults.goodPostureSeconds || 0,
      hand_gestures_seconds: mediaPipeResults.handGesturesSeconds || 0,
      speaking_seconds: mediaPipeResults.speakingSeconds || 0,
    },
    text_chunks: textChunks || [],
    audio_features: audioFeatures
      ? {
          pitch_mean: audioFeatures.pitch_mean || 0,
          pitch_std: audioFeatures.pitch_std || 0,
          rms_mean: audioFeatures.rms_mean || 0,
          tempo: audioFeatures.tempo || 0,
          spectral_centroid: audioFeatures.spectral_centroid || 0,
          mfcc_features: audioFeatures.mfcc_features || [],
        }
      : undefined,
    speaking_patterns: audioFeatures
      ? {
          filler_words: audioFeatures.filler_words || 0,
          pause_count: audioFeatures.pause_count || 0,
          words_per_minute: audioFeatures.words_per_minute || 0,
          clarity_score: audioFeatures.clarity_score || 0,
        }
      : undefined,
  }
}
