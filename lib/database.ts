import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  total_sessions: number
  weekly_goal: number
  level: string
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

export interface Room {
  id: string
  name: string
  host_id: string
  code: string
  topic_category: string
  time_per_speaker: number
  max_participants: number
  is_public: boolean
  status: "waiting" | "active" | "completed"
  created_at: string
}

export interface RoomParticipant {
  id: string
  room_id: string
  user_id: string
  has_spoken: boolean
  joined_at: string
}

export class DatabaseService {
  async createUser(userData: Partial<User>) {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) throw error
    return data
  }

  async getUser(userId: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  }

  async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) throw error
    return data
  }

  async createSession(sessionData: Partial<Session>) {
    const { data, error } = await supabase.from("sessions").insert([sessionData]).select().single()

    if (error) throw error
    return data
  }

  async getUserSessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  async getUserStats(userId: string) {
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("overall_score, created_at")
      .eq("user_id", userId)

    if (error) throw error

    const totalSessions = sessions.length
    const averageScore =
      sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.overall_score, 0) / sessions.length) : 0
    const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.overall_score)) : 0

    // Calculate this week's sessions
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeekSessions = sessions.filter((s) => new Date(s.created_at) > oneWeekAgo).length

    return {
      totalSessions,
      averageScore,
      bestScore,
      thisWeekSessions,
    }
  }

  async createRoom(roomData: Partial<Room>) {
    // Generate unique room code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
      .from("rooms")
      .insert([{ ...roomData, code }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPublicRooms() {
    const { data, error } = await supabase
      .from("rooms")
      .select(`
        *,
        host:users(name),
        participants:room_participants(count)
      `)
      .eq("is_public", true)
      .eq("status", "waiting")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async joinRoom(roomId: string, userId: string) {
    const { data, error } = await supabase
      .from("room_participants")
      .insert([
        {
          room_id: roomId,
          user_id: userId,
          has_spoken: false,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getRoomParticipants(roomId: string) {
    const { data, error } = await supabase
      .from("room_participants")
      .select(`
        *,
        user:users(name, avatar_url)
      `)
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true })

    if (error) throw error
    return data
  }
}

export const db = new DatabaseService()
