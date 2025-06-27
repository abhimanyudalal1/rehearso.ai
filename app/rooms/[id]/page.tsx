"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useParams } from "next/navigation"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Clock,
  MessageSquare,
  Send,
  ArrowLeft,
  Play,
  SkipForward,
  Trophy,
  Star,
  Target,
  Eye,
  Volume2,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { webrtcService } from "@/lib/webrtc"
import { roomManager, type Room, type Participant, type Feedback } from "@/lib/room-manager"
import { mediaPipeAnalyzer } from "@/lib/mediapipe-analyzer"

export default function RoomPage() {
  const params = useParams()
  const id = params?.id as string
  const [room, setRoom] = useState<Room | null>(null)
  const [currentUser] = useState({ id: "current-user-id", name: "You" })
  const [isHost, setIsHost] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackType, setFeedbackType] = useState<"positive" | "constructive" | "question">("constructive")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [preparationTime, setPreparationTime] = useState(0)
  const [sessionPhase, setSessionPhase] = useState<"waiting" | "preparation" | "speaking" | "feedback" | "completed">(
    "waiting",
  )
  const [currentTopic, setCurrentTopic] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [liveFeedbacks, setLiveFeedbacks] = useState<Feedback[]>([])
  const [personalReport, setPersonalReport] = useState<any>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())
  const speakingStartTime = useRef<number>(0)
  const mediaPipeData = useRef<any>({
    eyeContact: 0,
    gestureCount: 0,
    confidenceScore: 0,
    speakingPace: 0,
  })

  useEffect(() => {
    if (!id) return

    const loadRoom = () => {
      try {
        setIsLoading(true)
        setError(null)

        let rooms: Room[] = []
        const roomsRaw = localStorage.getItem("practiceRooms")

        if (roomsRaw) {
          try {
            const parsed = JSON.parse(roomsRaw)
            if (Array.isArray(parsed)) {
              rooms = parsed.filter((room) => room && typeof room === "object" && room.id)
            } else {
              console.warn("practiceRooms is not an array, initializing empty array")
              localStorage.setItem("practiceRooms", JSON.stringify([]))
            }
          } catch (parseError) {
            console.error("Failed to parse practiceRooms:", parseError)
            localStorage.setItem("practiceRooms", JSON.stringify([]))
          }
        }

        if (rooms.length === 0) {
          const defaultRoom: Room = {
            id: id,
            name: "Practice Room",
            host_id: currentUser.id,
            topic_category: "Everyday Conversations",
            time_per_speaker: 2,
            max_participants: 6,
            total_duration: 12,
            is_public: true,
            description: "Default practice room",
            status: "waiting",
            created_at: new Date().toISOString(),
            participants: [],
            speaking_order: [],
            session_feedbacks: [],
            live_feedbacks: [],
          }

          rooms = [defaultRoom]
          localStorage.setItem("practiceRooms", JSON.stringify(rooms))
        }

        let foundRoom = rooms.find((r: Room) => r && r.id === id)

        if (!foundRoom) {
          foundRoom = {
            id: id,
            name: `Room ${id}`,
            host_id: currentUser.id,
            topic_category: "Everyday Conversations",
            time_per_speaker: 2,
            max_participants: 6,
            total_duration: 12,
            is_public: true,
            description: "Auto-created practice room",
            status: "waiting",
            created_at: new Date().toISOString(),
            participants: [],
            speaking_order: [],
            session_feedbacks: [],
            live_feedbacks: [],
          }

          rooms.push(foundRoom)
          localStorage.setItem("practiceRooms", JSON.stringify(rooms))
        }

        // Ensure all required arrays exist
        if (!foundRoom.participants) foundRoom.participants = []
        if (!foundRoom.speaking_order) foundRoom.speaking_order = []
        if (!foundRoom.session_feedbacks) foundRoom.session_feedbacks = []
        if (!foundRoom.live_feedbacks) foundRoom.live_feedbacks = []

        setRoom(foundRoom)
        setIsHost(foundRoom.host_id === currentUser.id)
        setLiveFeedbacks(foundRoom.live_feedbacks || [])

        const existingParticipant = foundRoom.participants.find((p: Participant) => p && p.id === currentUser.id)

        if (!existingParticipant) {
          if (foundRoom.participants.length >= foundRoom.max_participants) {
            setError("Room is full. Please try another room.")
            return
          }

          const newParticipant: Participant = {
            id: currentUser.id,
            name: currentUser.name,
            is_host: foundRoom.host_id === currentUser.id,
            camera_enabled: true,
            mic_enabled: true,
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

          foundRoom.participants.push(newParticipant)

          const updatedRooms = rooms.map((r) => (r.id === foundRoom!.id ? foundRoom : r))
          localStorage.setItem("practiceRooms", JSON.stringify(updatedRooms))

          setRoom({ ...foundRoom })
        }

        roomManager.loadRoom(foundRoom)
      } catch (error) {
        console.error("Error loading room:", error)
        setError("Failed to load room. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadRoom()

    const initWebRTC = async () => {
      try {
        await initializeWebRTC()
      } catch (error) {
        console.error("WebRTC initialization failed:", error)
      }
    }

    if (!error) {
      initWebRTC()
    }

    return () => {
      webrtcService.endCall()
      mediaPipeAnalyzer.stop()
    }
  }, [id, currentUser.id])

  const initializeWebRTC = async () => {
    try {
      const stream = await webrtcService.initializeLocalStream()
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize MediaPipe analyzer
      if (localVideoRef.current) {
        await mediaPipeAnalyzer.initialize(localVideoRef.current)
      }

      webrtcService.onRemoteStreamAdded = (peerId: string, stream: MediaStream) => {
        const videoElement = remoteVideosRef.current.get(peerId)
        if (videoElement) {
          videoElement.srcObject = stream
        }
      }
    } catch (error) {
      console.error("Failed to initialize WebRTC:", error)
    }
  }

  const toggleCamera = () => {
    const newState = !cameraEnabled
    setCameraEnabled(newState)
    webrtcService.toggleVideo(newState)

    if (room) {
      const updatedRoom = { ...room }
      const participant = updatedRoom.participants.find((p) => p.id === currentUser.id)
      if (participant) {
        participant.camera_enabled = newState
        setRoom(updatedRoom)

        const rooms = JSON.parse(localStorage.getItem("practiceRooms") || "[]")
        const updatedRooms = rooms.map((r: Room) => (r.id === room.id ? updatedRoom : r))
        localStorage.setItem("practiceRooms", JSON.stringify(updatedRooms))
      }
    }
  }

  const toggleMic = () => {
    const newState = !micEnabled
    setMicEnabled(newState)
    webrtcService.toggleAudio(newState)

    if (room) {
      const updatedRoom = { ...room }
      const participant = updatedRoom.participants.find((p) => p.id === currentUser.id)
      if (participant) {
        participant.mic_enabled = newState
        setRoom(updatedRoom)

        const rooms = JSON.parse(localStorage.getItem("practiceRooms") || "[]")
        const updatedRooms = rooms.map((r: Room) => (r.id === room.id ? updatedRoom : r))
        localStorage.setItem("practiceRooms", JSON.stringify(updatedRooms))
      }
    }
  }

  const startSession = () => {
    if (!room || !isHost) return

    const updatedRoom = { ...room }
    updatedRoom.status = "active"
    updatedRoom.session_start_time = new Date().toISOString()

    if (updatedRoom.speaking_order.length === 0) {
      const participantIds = updatedRoom.participants.map((p) => p.id)
      for (let i = participantIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[participantIds[i], participantIds[j]] = [participantIds[j], participantIds[i]]
      }
      updatedRoom.speaking_order = participantIds
    }

    if (updatedRoom.speaking_order.length > 0) {
      updatedRoom.current_speaker = updatedRoom.speaking_order[0]
    }

    setRoom(updatedRoom)
    setSessionPhase("preparation")
    setPreparationTime(60)
    generateTopic()

    const rooms = JSON.parse(localStorage.getItem("practiceRooms") || "[]")
    const updatedRooms = rooms.map((r: Room) => (r.id === room.id ? updatedRoom : r))
    localStorage.setItem("practiceRooms", JSON.stringify(updatedRooms))

    const prepTimer = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimer)
          startSpeaking()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const generateTopic = () => {
    const topics = {
      "Everyday Conversations": [
        "Describe your ideal weekend and why it appeals to you",
        "Talk about a skill you'd like to learn and your motivation",
        "Share your thoughts on the importance of friendship",
        "Discuss a memorable meal you've had and what made it special",
        "Explain a hobby that brings you joy and why you recommend it",
      ],
      "Business & Professional": [
        "Present your idea for improving workplace productivity",
        "Discuss the future of remote work in your industry",
        "Explain how to give effective feedback to colleagues",
        "Describe the qualities of a great leader",
        "Present a solution to a common workplace challenge",
      ],
      "Current Events & Debate": [
        "Argue for or against social media age restrictions",
        "Discuss the impact of AI on future job markets",
        "Present your views on sustainable transportation",
        "Debate the role of technology in education",
        "Discuss the importance of digital privacy in modern society",
      ],
    }

    const categoryTopics = topics[room?.topic_category as keyof typeof topics] || topics["Everyday Conversations"]
    const randomTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)]
    setCurrentTopic(randomTopic)
  }

  const startSpeaking = () => {
    if (!room) return

    setSessionPhase("speaking")
    setTimeRemaining(room.time_per_speaker * 60)
    speakingStartTime.current = Date.now()

    // Start MediaPipe analysis for current speaker
    if (room.current_speaker === currentUser.id) {
      mediaPipeAnalyzer.startAnalysis()
    }

    const speakTimer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(speakTimer)
          endCurrentSpeech()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const endCurrentSpeech = async () => {
    if (!room) return

    // Stop MediaPipe analysis and get results
    if (room.current_speaker === currentUser.id) {
      const analysisResults = await mediaPipeAnalyzer.stopAnalysis()
      mediaPipeData.current = analysisResults

      // Update participant's MediaPipe data
      const updatedRoom = { ...room }
      const currentParticipant = updatedRoom.participants.find((p) => p.id === currentUser.id)
      if (currentParticipant) {
        currentParticipant.mediapipe_analysis = {
          eye_contact_percentage: analysisResults.eyeContactPercentage,
          gesture_count: analysisResults.gestureCount,
          confidence_score: analysisResults.confidenceScore,
          speaking_pace: analysisResults.speakingPace,
          volume_consistency: analysisResults.volumeConsistency,
        }
        currentParticipant.speaking_time_used = (Date.now() - speakingStartTime.current) / 1000
      }

      setRoom(updatedRoom)
      saveRoomToStorage(updatedRoom)
    }

    setSessionPhase("feedback")

    setTimeout(() => {
      nextSpeaker()
    }, 30000)
  }

  const nextSpeaker = () => {
    if (!room) return

    const currentIndex = room.speaking_order.findIndex((id) => id === room.current_speaker)
    if (currentIndex === -1) return

    const updatedRoom = { ...room }

    const currentParticipant = updatedRoom.participants.find((p) => p.id === room.current_speaker)
    if (currentParticipant) {
      currentParticipant.has_spoken = true
    }

    if (currentIndex < updatedRoom.speaking_order.length - 1) {
      updatedRoom.current_speaker = updatedRoom.speaking_order[currentIndex + 1]
      setRoom(updatedRoom)
      setSessionPhase("preparation")
      setPreparationTime(60)
      generateTopic()

      const prepTimer = setInterval(() => {
        setPreparationTime((prev) => {
          if (prev <= 1) {
            clearInterval(prepTimer)
            startSpeaking()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      updatedRoom.status = "completed"
      updatedRoom.current_speaker = undefined
      setRoom(updatedRoom)
      setSessionPhase("completed")

      // Generate comprehensive reports for all participants
      generatePersonalReports(updatedRoom)
      setShowReport(true)
    }

    saveRoomToStorage(updatedRoom)
  }

  const sendFeedback = () => {
    if (!room || !feedbackMessage.trim()) return

    const currentSpeaker = room.participants.find((p) => p.id === room.current_speaker)
    if (currentSpeaker && currentSpeaker.id !== currentUser.id) {
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        from_participant: currentUser.id,
        from_name: currentUser.name,
        to_participant: currentSpeaker.id,
        message: feedbackMessage,
        timestamp: new Date().toISOString(),
        type: feedbackType,
        session_phase: sessionPhase,
      }

      const updatedRoom = { ...room }

      // Add to live feedbacks for real-time display
      updatedRoom.live_feedbacks = [...(updatedRoom.live_feedbacks || []), newFeedback]

      // Add to participant's feedback received
      const speaker = updatedRoom.participants.find((p) => p.id === currentSpeaker.id)
      if (speaker) {
        speaker.feedback_received.push(newFeedback)
      }

      setRoom(updatedRoom)
      setLiveFeedbacks(updatedRoom.live_feedbacks)
      setFeedbackMessage("")
      saveRoomToStorage(updatedRoom)
    }
  }

  const generatePersonalReports = (room: Room) => {
    const reports: any = {}

    room.participants.forEach((participant) => {
      const feedbacksReceived = participant.feedback_received || []
      const positiveFeedbacks = feedbacksReceived.filter((f) => f.type === "positive")
      const constructiveFeedbacks = feedbacksReceived.filter((f) => f.type === "constructive")
      const questions = feedbacksReceived.filter((f) => f.type === "question")

      // Analyze feedback content for insights
      const feedbackAnalysis = analyzeFeedbackContent(feedbacksReceived)

      // Calculate scores based on MediaPipe data and feedback
      const mediaPipeData = participant.mediapipe_analysis || {}
      const overallScore = calculateOverallScore(mediaPipeData, feedbacksReceived)

      const report = {
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
        insights: generatePersonalInsights(mediaPipeData, feedbackAnalysis, participant),

        // Recommendations
        recommendations: generateRecommendations(mediaPipeData, feedbackAnalysis),

        generated_at: new Date().toISOString(),
      }

      reports[participant.id] = report
    })

    // Save reports to localStorage
    localStorage.setItem(`session_reports_${room.id}`, JSON.stringify(reports))

    // Set personal report for current user
    if (reports[currentUser.id]) {
      setPersonalReport(reports[currentUser.id])
    }
  }

  const analyzeFeedbackContent = (feedbacks: Feedback[]) => {
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
    ]
    const improvementKeywords = ["improve", "better", "more", "less", "try", "consider", "maybe", "could", "should"]

    feedbacks.forEach((feedback) => {
      const message = feedback.message.toLowerCase()

      if (feedback.type === "positive" || positiveKeywords.some((keyword) => message.includes(keyword))) {
        strengths.push(feedback.message)
      }

      if (feedback.type === "constructive" || improvementKeywords.some((keyword) => message.includes(keyword))) {
        improvements.push(feedback.message)
      }

      // Extract common themes
      if (message.includes("eye contact")) themes.push("Eye Contact")
      if (message.includes("voice") || message.includes("speaking")) themes.push("Voice & Delivery")
      if (message.includes("gesture") || message.includes("body")) themes.push("Body Language")
      if (message.includes("pace") || message.includes("speed")) themes.push("Speaking Pace")
      if (message.includes("content") || message.includes("topic")) themes.push("Content Quality")
    })

    return {
      strengths: [...new Set(strengths)],
      improvements: [...new Set(improvements)],
      themes: [...new Set(themes)],
    }
  }

  const calculateOverallScore = (mediaPipeData: any, feedbacks: Feedback[]) => {
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

  const generatePersonalInsights = (mediaPipeData: any, feedbackAnalysis: any, participant: Participant) => {
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

    // Feedback-based insights
    if (feedbackAnalysis.themes.includes("Voice & Delivery")) {
      insights.push("Multiple peers commented on your voice delivery - this seems to be a key area of focus.")
    }

    if (feedbackAnalysis.strengths.length > feedbackAnalysis.improvements.length) {
      insights.push("Great job! You received more positive feedback than constructive criticism.")
    }

    return insights
  }

  const generateRecommendations = (mediaPipeData: any, feedbackAnalysis: any) => {
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

    // Feedback-based recommendations
    if (feedbackAnalysis.improvements.length > 0) {
      recommendations.push("Focus on the constructive feedback you received from peers")
    }

    if (feedbackAnalysis.themes.includes("Body Language")) {
      recommendations.push("Practice your body language and gestures in front of a mirror")
    }

    return recommendations
  }

  const saveRoomToStorage = (room: Room) => {
    const rooms = JSON.parse(localStorage.getItem("practiceRooms") || "[]")
    const updatedRooms = rooms.map((r: Room) => (r.id === room.id ? room : r))
    localStorage.setItem("practiceRooms", JSON.stringify(updatedRooms))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link href="/practice/group">
              <Button className="w-full">Browse Available Rooms</Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/practice/group">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
          </Link>

          <div className="flex items-center space-x-4">
            <Badge variant="outline">Room: {room.id}</Badge>
            <Badge variant={room.status === "active" ? "default" : "secondary"}>
              {room.status === "waiting" ? "Waiting" : room.status === "active" ? "Live" : "Completed"}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>{room.name}</span>
                  </CardTitle>

                  {sessionPhase === "preparation" && (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">Prep: {formatTime(preparationTime)}</span>
                    </div>
                  )}

                  {sessionPhase === "speaking" && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">Speaking: {formatTime(timeRemaining)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Current Topic Display */}
                {(sessionPhase === "preparation" || sessionPhase === "speaking") && currentTopic && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-900 mb-2">Current Topic:</h3>
                    <p className="text-blue-800">{currentTopic}</p>
                  </div>
                )}

                {/* Video Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Local Video */}
                  <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      You {room.current_speaker === currentUser.id && sessionPhase === "speaking" && "(Speaking)"}
                    </div>
                    <div className="absolute bottom-2 right-2 flex space-x-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${micEnabled ? "bg-green-600" : "bg-red-600"}`}
                      >
                        {micEnabled ? (
                          <Mic className="w-3 h-3 text-white" />
                        ) : (
                          <MicOff className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${cameraEnabled ? "bg-green-600" : "bg-red-600"}`}
                      >
                        {cameraEnabled ? (
                          <Video className="w-3 h-3 text-white" />
                        ) : (
                          <VideoOff className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remote Videos */}
                  {room.participants
                    .filter((p) => p && p.id !== currentUser.id)
                    .map((participant) => (
                      <div
                        key={participant.id}
                        className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
                      >
                        <video
                          ref={(el) => {
                            if (el) remoteVideosRef.current.set(participant.id, el)
                          }}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          {participant.name}{" "}
                          {room.current_speaker === participant.id && sessionPhase === "speaking" && "(Speaking)"}
                          {participant.is_host && " (Host)"}
                        </div>
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${participant.mic_enabled ? "bg-green-600" : "bg-red-600"}`}
                          >
                            {participant.mic_enabled ? (
                              <Mic className="w-3 h-3 text-white" />
                            ) : (
                              <MicOff className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${participant.camera_enabled ? "bg-green-600" : "bg-red-600"}`}
                          >
                            {participant.camera_enabled ? (
                              <Video className="w-3 h-3 text-white" />
                            ) : (
                              <VideoOff className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  <Button onClick={toggleMic} variant={micEnabled ? "default" : "destructive"} size="lg">
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>

                  <Button onClick={toggleCamera} variant={cameraEnabled ? "default" : "destructive"} size="lg">
                    {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  {isHost && sessionPhase === "waiting" && (
                    <Button onClick={startSession} className="bg-green-600 hover:bg-green-700" size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      Start Session
                    </Button>
                  )}

                  {isHost && sessionPhase === "speaking" && (
                    <Button onClick={endCurrentSpeech} className="bg-orange-600 hover:bg-orange-700" size="lg">
                      <SkipForward className="w-5 h-5 mr-2" />
                      Next Speaker
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Room Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium">
                    {room.participants?.length || 0}/{room.max_participants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time per speaker:</span>
                  <span className="font-medium">{room.time_per_speaker} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium text-sm">{room.topic_category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Speaking Order */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Speaking Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {room.speaking_order?.map((participantId, index) => {
                    const participant = room.participants?.find((p) => p && p.id === participantId)
                    const isCurrent = room.current_speaker === participantId
                    const hasSpoken = participant?.has_spoken

                    if (!participant) return null

                    return (
                      <div
                        key={participantId}
                        className={`flex items-center space-x-3 p-2 rounded ${
                          isCurrent ? "bg-blue-100 border border-blue-300" : hasSpoken ? "bg-green-50" : "bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCurrent
                              ? "bg-blue-600 text-white"
                              : hasSpoken
                                ? "bg-green-600 text-white"
                                : "bg-gray-400 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="flex-1">{participant.name}</span>
                        {hasSpoken && (
                          <Badge variant="secondary" className="text-xs">
                            Done
                          </Badge>
                        )}
                        {isCurrent && <Badge className="text-xs">Speaking</Badge>}
                      </div>
                    )
                  }) || <p className="text-gray-500 text-sm">Speaking order will be set when session starts</p>}
                </div>
              </CardContent>
            </Card>

            {/* Live Feedback */}
            {(sessionPhase === "speaking" || sessionPhase === "feedback") &&
              room.current_speaker !== currentUser.id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Button
                          variant={feedbackType === "positive" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFeedbackType("positive")}
                        >
                          👍 Positive
                        </Button>
                        <Button
                          variant={feedbackType === "constructive" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFeedbackType("constructive")}
                        >
                          💡 Improve
                        </Button>
                        <Button
                          variant={feedbackType === "question" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFeedbackType("question")}
                        >
                          ❓ Question
                        </Button>
                      </div>
                      <Input
                        placeholder={`Type ${feedbackType} feedback...`}
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendFeedback()}
                      />
                      <Button onClick={sendFeedback} disabled={!feedbackMessage.trim()} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send {feedbackType} Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Live Feedback Display */}
            {sessionPhase === "speaking" && liveFeedbacks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Live Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {liveFeedbacks
                      .filter((feedback) => feedback.to_participant === room.current_speaker)
                      .slice(-5)
                      .map((feedback) => (
                        <div key={feedback.id} className="text-sm p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{feedback.from_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {feedback.type === "positive" ? "👍" : feedback.type === "constructive" ? "💡" : "❓"}
                            </Badge>
                          </div>
                          <p className="text-gray-700">{feedback.message}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Report */}
            {showReport && personalReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    Your Performance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Overall Scores */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{personalReport.overall_score}</div>
                        <div className="text-xs text-gray-600">Overall</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{personalReport.eye_contact_score}</div>
                        <div className="text-xs text-gray-600">Eye Contact</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{personalReport.confidence_score}</div>
                        <div className="text-xs text-gray-600">Confidence</div>
                      </div>
                    </div>

                    {/* MediaPipe Analysis */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        AI Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Eye Contact
                          </span>
                          <span className="font-medium">{personalReport.eye_contact_score}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Volume2 className="w-3 h-3 mr-1" />
                            Voice
                          </span>
                          <span className="font-medium">{personalReport.volume_score}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Peer Feedback Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Peer Feedback</h4>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {personalReport.positive_feedback_count}
                          </div>
                          <div className="text-xs text-gray-600">Positive</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-orange-600">
                            {personalReport.constructive_feedback_count}
                          </div>
                          <div className="text-xs text-gray-600">Constructive</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{personalReport.questions_received}</div>
                          <div className="text-xs text-gray-600">Questions</div>
                        </div>
                      </div>
                    </div>

                    {/* Strengths */}
                    {personalReport.feedback_summary.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-2 flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          Strengths (From Peers)
                        </h4>
                        <ul className="text-sm space-y-1">
                          {personalReport.feedback_summary.strengths
                            .slice(0, 3)
                            .map((strength: string, index: number) => (
                              <li key={index} className="text-gray-700">
                                • {strength}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvement Areas */}
                    {personalReport.feedback_summary.improvement_areas.length > 0 && (
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          Areas to Improve
                        </h4>
                        <ul className="text-sm space-y-1">
                          {personalReport.feedback_summary.improvement_areas
                            .slice(0, 3)
                            .map((area: string, index: number) => (
                              <li key={index} className="text-gray-700">
                                • {area}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Insights */}
                    {personalReport.insights.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">Key Insights</h4>
                        <ul className="text-sm space-y-1">
                          {personalReport.insights.slice(0, 2).map((insight: string, index: number) => (
                            <li key={index} className="text-gray-700">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        // Download detailed report
                        const dataStr = JSON.stringify(personalReport, null, 2)
                        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
                        const exportFileDefaultName = `speech-report-${new Date().toISOString().split("T")[0]}.json`
                        const linkElement = document.createElement("a")
                        linkElement.setAttribute("href", dataUri)
                        linkElement.setAttribute("download", exportFileDefaultName)
                        linkElement.click()
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Download Detailed Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
