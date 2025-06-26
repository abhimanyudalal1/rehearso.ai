// MongoDB API client for SpeakAI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }
  return null
}

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Network error" }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export interface UserProgress {
  userId: string
  totalSessions: number
  totalPracticeTime: number
  averageScore: number
  improvementAreas: string[]
  achievements: string[]
  lastUpdated: string
}

export interface SpeechSession {
  id?: string
  userId: string
  title?: string
  content?: string
  duration: number
  feedback: {
    overallScore: number
    clarity: number
    pace: number
    confidence: number
    suggestions: string[]
  }
  audioUrl?: string
  createdAt?: string
}

export interface Session {
  id: string
  user_id: string
  type: "solo" | "group"
  topic: string
  duration: number
  overall_score: number
  voice_clarity: number
  confidence: number
  body_language: number
  created_at: string
  analysis_data: any
}

// Auth functions
export const authService = {
  async signup(userData: { name: string; email: string; password: string; confirmPassword: string }) {
    return apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async login(credentials: { email: string; password: string }) {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.token) {
      localStorage.setItem("authToken", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  },

  async logout() {
    try {
      await apiCall("/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
    }
  },

  async getCurrentUser() {
    return apiCall("/auth/me")
  },

  isAuthenticated() {
    return !!getAuthToken()
  },

  getCurrentUserFromStorage() {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },
}

export class DatabaseService {
  // Create a new speech session
  async createSession(sessionData: Partial<SpeechSession>) {
    const payload = {
      title: sessionData.title || "Solo Practice Session",
      content: sessionData.content || "",
      duration: sessionData.duration || 0,
      feedback: {
        overallScore: sessionData.feedback?.overallScore || 0,
        clarity: sessionData.feedback?.clarity || 0,
        pace: sessionData.feedback?.pace || 0,
        confidence: sessionData.feedback?.confidence || 0,
        suggestions: sessionData.feedback?.suggestions || [],
      },
      audioUrl: sessionData.audioUrl,
    }

    return apiCall("/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  // Get user's speech sessions
  async getUserSessions(userId?: string, limit = 10) {
    return apiCall(`/sessions?limit=${limit}`)
  }

  // Get user statistics
  async getUserStats(userId?: string) {
    try {
      const response = await apiCall("/auth/me")
      const progress = response.user?.progress || {
        totalSessions: 0,
        totalPracticeTime: 0,
        averageScore: 0,
        improvementAreas: [],
        achievements: [],
      }

      return {
        totalSessions: progress.totalSessions,
        averageScore: Math.round(progress.averageScore),
        bestScore: progress.averageScore, // Using average as best for now
        thisWeekSessions: Math.floor(progress.totalSessions / 4), // Rough estimate
        totalPracticeTime: progress.totalPracticeTime,
        improvementAreas: progress.improvementAreas,
        achievements: progress.achievements,
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      return {
        totalSessions: 0,
        averageScore: 0,
        bestScore: 0,
        thisWeekSessions: 0,
        totalPracticeTime: 0,
        improvementAreas: [],
        achievements: [],
      }
    }
  }

  // Update user progress
  async updateUserProgress(progressData: Partial<UserProgress>) {
    return apiCall("/progress", {
      method: "PUT",
      body: JSON.stringify(progressData),
    })
  }

  // Legacy methods for compatibility (these will need backend routes)
  async createUser(userData: Partial<User>) {
    throw new Error("Use authService.signup instead")
  }

  async getUser(userId: string) {
    return apiCall(`/users/${userId}`)
  }

  async updateUser(userId: string, updates: Partial<User>) {
    return apiCall(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  // Room methods (for group sessions - you'll need to implement these in backend)
  async createRoom(roomData: any) {
    return apiCall("/rooms", {
      method: "POST",
      body: JSON.stringify(roomData),
    })
  }

  async getPublicRooms() {
    return apiCall("/rooms/public")
  }

  async joinRoom(roomId: string, userId: string) {
    return apiCall(`/rooms/${roomId}/join`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  async getRoomParticipants(roomId: string) {
    return apiCall(`/rooms/${roomId}/participants`)
  }
}

export const db = new DatabaseService()

// Helper function to check if database is configured
export const isDatabaseConfigured = () => {
  return true // Always true for MongoDB setup
}

// Export auth service for easy access
export { authService as auth }
