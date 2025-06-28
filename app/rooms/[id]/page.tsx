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
  const [socket, setSocket] = useState<WebSocket | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null) // Add this state

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

    let isCleanedUp = false
    let currentSocket: WebSocket | null = null
    let connectionAttempted = false

    const loadRoom = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`http://localhost:8000/api/rooms/${id}`)
        
        if (!response.ok) {
          throw new Error(`Room not found: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.room) {
          setError("Room not found")
          return
        }

        const foundRoom = data.room
        const transformedRoom: Room = {
          id: foundRoom.id,
          name: foundRoom.name,
          host_id: foundRoom.host_id || "host-id",
          topic_category: foundRoom.topic_category,
          time_per_speaker: foundRoom.time_per_speaker,
          max_participants: foundRoom.max_participants,
          total_duration: foundRoom.time_per_speaker * foundRoom.max_participants,
          is_public: foundRoom.is_public,
          description: foundRoom.description,
          status: foundRoom.status,
          created_at: foundRoom.created_at,
          participants: foundRoom.participants || [],
          speaking_order: foundRoom.speaking_order || [],
          session_feedbacks: [],
          live_feedbacks: [],
        }

        setRoom(transformedRoom)
        setIsHost(foundRoom.host_id === currentUser.id)

      } catch (error) {
        console.error("Error loading room:", error)
        setError("Failed to load room. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    const connectWebSocket = () => {
      if (isCleanedUp || connectionAttempted || currentSocket) {
        console.log("🚫 WebSocket connection prevented - already attempted or exists")
        return null
      }
      
      connectionAttempted = true
      console.log(`🔗 Connecting to WebSocket: ws://localhost:8000/ws/room/${id}`)
      
      const ws = new WebSocket(`ws://localhost:8000/ws/room/${id}`)
      currentSocket = ws
      
      ws.onopen = () => {
        if (isCleanedUp) {
          console.log("🧹 Connection opened but component unmounted, closing...")
          ws.close()
          return
        }
        
        console.log("✅ Connected to room WebSocket")
        setSocket(ws)
        setError(null)
        
        // Set the WebSocket for WebRTC service
        webrtcService.setSignalingSocket(ws)
        
        // Send user information immediately
        ws.send(JSON.stringify({
          type: "set_participant_name",
          user_name: currentUser.name
        }))
      }

      ws.onmessage = async (event) => {
        if (isCleanedUp) return
        
        try {
          const message = JSON.parse(event.data)
          console.log("📨 Received:", message.type)
          
          switch (message.type) {
            case "room_state":
              console.log("📊 Room state received, participants:", message.room.participants?.length)
              console.log("🆔 Received user_id from backend:", message.user_id)
              setRoom(message.room)
              
              // ✅ CRITICAL: Set the user ID for WebRTC service
              if (message.user_id) {
                console.log("🆔 Setting currentUserId and WebRTC user ID to:", message.user_id)
                setCurrentUserId(message.user_id)
                webrtcService.setCurrentUserId(message.user_id)
              } else {
                console.error("❌ No user_id received from backend!")
              }
              
              
              const currentParticipant = message.room.participants?.find(
                (p: any) => (p.user_id || p.id) === message.user_id
              )
              if (currentParticipant?.is_host) {
                setIsHost(true)
              }
              
              // Initialize WebRTC after UI has time to render
              setTimeout(async () => {
                if (!isCleanedUp) {
                  try {
                    console.log("🎥 Initializing WebRTC after room state...")
                    await initializeWebRTC()
                    
                    // IMPORTANT: Wait for video elements to render before connecting
                    setTimeout(() => {
                      if (message.room.participants && message.room.participants.length > 1) {
                        const otherParticipants = message.room.participants.filter(
                          (p: any) => (p.user_id || p.id) !== message.user_id
                        )
                        
                        console.log("🔗 Establishing connections with existing participants:", otherParticipants.length)
                        
                        otherParticipants.forEach(async (participant: any, index: number) => {
                          const participantId = participant.user_id || participant.id
                          console.log("🔗 Connecting to existing participant:", participantId)
                          
                          setTimeout(async () => {
                            try {
                              await webrtcService.createOffer(participantId)
                            } catch (error) {
                              console.error("Failed to create offer for existing participant:", error)
                            }
                          }, 3000 + (index * 1000)) // Staggered with longer delays
                        })
                      }
                    }, 2000) // Wait for video elements to be created
                    
                  } catch (error) {
                    console.error("WebRTC initialization failed:", error)
                  }
                }
              }, 1000) // Initial delay for UI rendering
              break
            case "participant_joined":
              console.log("👥 Participant joined. Total:", message.room.participants?.length)
              setRoom(message.room)
              
              // IMPORTANT: Only initiate connection if we have a user ID
              if (message.new_participant && message.new_participant.user_id !== currentUserId && currentUserId) {
                const newParticipantId = message.new_participant.user_id
                console.log("🔗 Initiating WebRTC connection:", currentUserId, "->", newParticipantId)
                
                // Wait for UI to render the new video element
                setTimeout(async () => {
                  try {
                    console.log("🎯 Creating offer for participant:", newParticipantId)
                    await webrtcService.createOffer(newParticipantId)
                  } catch (error) {
                    console.error("Failed to create offer for new participant:", error)
                  }
                }, 3000) // Increased delay to ensure UI renders
              }
              break
              
            case "participant_disconnected":
              console.log("👋 Participant left. Total:", message.room.participants?.length)
              setRoom(message.room)
              break
              
            case "participant_updated":
              setRoom(message.room)
              break
              
            case "session_started":
              setRoom(message.room)
              setSessionPhase("preparation")
              generateTopic()
              break
              
            case "speaker_changed":
              setRoom(message.room)
              if (message.room.status === "completed") {
                setSessionPhase("completed")
                getPersonalReport()
                setShowReport(true)
              }
              break
              
            case "send_feedback":
              setLiveFeedbacks(prev => [...prev, message.feedback])
              break
              
            case "webrtc_offer":
  console.log("📞 Received WebRTC offer from:", message.from, "to:", message.to)
  console.log("📞 Current user ID:", currentUserId)
  console.log("📞 Should process?", !message.to || message.to === currentUserId)
  
  if (!message.to || message.to === currentUserId) {
    console.log("✅ Processing WebRTC offer from:", message.from)
    try {
      await webrtcService.handleRemoteOffer(message.from, message.offer)
      console.log("✅ Successfully handled offer from:", message.from)
    } catch (error) {
      console.error("❌ Error handling offer:", error)
    }
  } else {
    console.log("⏭️ Skipping offer - not for us")
  }
  break

            case "webrtc_answer":
              console.log("📞 Received WebRTC answer from:", message.from, "to:", message.to, "currentUserId:", currentUserId)
              // ✅ FIXED: Use currentUserId instead of message.user_id
              if (!message.to || message.to === currentUserId) {
                console.log("✅ Processing WebRTC answer from:", message.from)
                webrtcService.handleAnswer(message.from, message.answer)
              } else {
                console.log("⏭️ Skipping answer - not for us. Target:", message.to, "We are:", currentUserId)
              }
              break

            case "webrtc_ice_candidate":
              console.log("🧊 Received ICE candidate from:", message.from, "to:", message.to, "currentUserId:", currentUserId)
              // ✅ FIXED: Use currentUserId instead of message.user_id
              if (!message.to || message.to === currentUserId) {
                console.log("✅ Processing ICE candidate from:", message.from)
                webrtcService.handleIceCandidate(message.from, message.candidate)
              } else {
                console.log("⏭️ Skipping ICE candidate - not for us. Target:", message.to, "We are:", currentUserId)
              }
              break
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.onclose = (event) => {
        if (isCleanedUp) return
        
        console.log("❌ WebSocket closed:", event.code, event.reason)
        setSocket(null)
        currentSocket = null
        connectionAttempted = false
        
        if (event.code !== 1000 && event.code !== 1001) {
          setError("Connection lost. Please refresh the page.")
        }
      }

      ws.onerror = (error) => {
        console.error("🚨 WebSocket error:", error)
        setError("Failed to connect to room")
        setSocket(null)
        currentSocket = null
        connectionAttempted = false
      }

      return ws
    }

    const initializeRoom = async () => {
      console.log("🚀 Starting room initialization...")
      
      await loadRoom()
      
      if (!isCleanedUp && !error) {
        console.log("📡 Room loaded successfully, connecting WebSocket...")
        
        setTimeout(() => {
          if (!isCleanedUp && !currentSocket) {
            connectWebSocket()
          }
        }, 100)
      }
    }

    initializeRoom()

    return () => {
      isCleanedUp = true
      console.log("🧹 Cleaning up room connection")
      
      if (currentSocket) {
        if (currentSocket.readyState === WebSocket.OPEN) {
          currentSocket.close(1000, "Component unmounting")
        }
        currentSocket = null
      }
      
      connectionAttempted = false
      setSocket(null)
      webrtcService.endCall()
      mediaPipeAnalyzer.stop()
    }
  }, [id, currentUser.id])

  const initializeWebRTC = async () => {
  try {
    console.log("🎥 Starting WebRTC initialization...")
    
    const stream = await webrtcService.initializeLocalStream()
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }

    if (localVideoRef.current) {
      await mediaPipeAnalyzer.initialize(localVideoRef.current)
    }

    // ENHANCED: Better remote stream handler with DOM lookup
    webrtcService.onRemoteStreamAdded = (peerId: string, stream: MediaStream) => {
      console.log("🎥 Remote stream received from peer:", peerId)
      console.log("📺 Stream details:", {
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      })
      
      // Method 1: Try ref first
      let videoElement = remoteVideosRef.current.get(peerId)
      
      // Method 2: If ref not found, search DOM directly
      if (!videoElement) {
        console.log("🔍 Video element not found in ref, searching DOM...")
        const videoElements = document.querySelectorAll('video[data-peer-id]')
        for (const el of videoElements) {
          if (el.getAttribute('data-peer-id') === peerId) {
            videoElement = el as HTMLVideoElement
            console.log("✅ Found video element in DOM for peer:", peerId)
            // Update the ref for future use
            remoteVideosRef.current.set(peerId, videoElement)
            break
          }
        }
      }
      
      // Method 3: If still not found, try finding by key pattern
      if (!videoElement) {
        console.log("🔍 Searching for video element by pattern...")
        const allVideos = document.querySelectorAll('video')
        for (const video of allVideos) {
          // Skip local video
          if (video === localVideoRef.current) continue
          
          // Find video without srcObject (available for assignment)
          if (!video.srcObject) {
            videoElement = video as HTMLVideoElement
            console.log("✅ Found available video element for peer:", peerId)
            // Mark this element with peer ID and update ref
            videoElement.setAttribute('data-peer-id', peerId)
            remoteVideosRef.current.set(peerId, videoElement)
            break
          }
        }
      }
      
      if (videoElement) {
        console.log("📺 Assigning stream to video element for peer:", peerId)
        videoElement.srcObject = stream
        
        // Ensure video plays
        videoElement.play().then(() => {
          console.log("✅ Video playing successfully for peer:", peerId)
        }).catch(error => {
          console.error("❌ Error playing video for peer:", peerId, error)
          // Try again after a delay
          setTimeout(() => {
            videoElement.play().catch(e => console.error("❌ Retry failed:", e))
          }, 1000)
        })
      } else {
        console.error("❌ No video element found for peer:", peerId)
        console.log("Available refs:", Array.from(remoteVideosRef.current.keys()))
        console.log("Available DOM videos:", document.querySelectorAll('video').length)
        
        // Enhanced retry with DOM search
        let retryCount = 0
        const maxRetries = 10
        
        const retryAssignment = () => {
          // Search all video elements in DOM
          const allVideos = document.querySelectorAll('video')
          let foundElement = null
          
          for (const video of allVideos) {
            if (video === localVideoRef.current) continue
            if (!video.srcObject || video.srcObject.id === 'placeholder') {
              foundElement = video as HTMLVideoElement
              break
            }
          }
          
          if (foundElement) {
            console.log(`📺 Retry ${retryCount + 1} successful for peer:`, peerId)
            foundElement.setAttribute('data-peer-id', peerId)
            foundElement.srcObject = stream
            remoteVideosRef.current.set(peerId, foundElement)
            foundElement.play().catch(error => console.error("❌ Retry play error:", error))
          } else if (retryCount < maxRetries) {
            retryCount++
            console.log(`🔄 Retry ${retryCount}/${maxRetries} for peer:`, peerId)
            setTimeout(retryAssignment, 500 * retryCount)
          } else {
            console.error("❌ Failed to assign stream after", maxRetries, "retries for peer:", peerId)
          }
        }
        
        setTimeout(retryAssignment, 500)
      }
    }
    
    webrtcService.onPeerDisconnected = (peerId: string) => {
      console.log("👋 Peer disconnected:", peerId)
      const videoElement = remoteVideosRef.current.get(peerId)
      if (videoElement) {
        videoElement.srcObject = null
        videoElement.removeAttribute('data-peer-id')
      }
      remoteVideosRef.current.delete(peerId)
    }
    
    console.log("✅ WebRTC initialization complete")
    
  } catch (error) {
    console.error("Failed to initialize WebRTC:", error)
    setError("Failed to initialize camera and microphone")
  }
}
  const toggleCamera = () => {
    const newState = !cameraEnabled
    setCameraEnabled(newState)
    webrtcService.toggleVideo(newState)
    if (socket && room) {
      socket.send(JSON.stringify({
        type: "toggle_camera",
        participant_id: currentUser.id,
        camera_enabled: newState
      }))
    }
  }

  const toggleMic = () => {
    const newState = !micEnabled
    setMicEnabled(newState)
    webrtcService.toggleAudio(newState)
    if (socket && room) {
      socket.send(JSON.stringify({
        type: "toggle_mic",
        participant_id: currentUser.id,
        mic_enabled: newState
      }))
    }
  }

  const startSession = () => {
    if (!room || !isHost || !socket) return

    socket.send(JSON.stringify({
      type: "start_session",
      room_id: room.id
    }))
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
    if (!room || !socket) return

    const analysisResults = await mediaPipeAnalyzer.stopAnalysis()
    mediaPipeData.current = analysisResults

    if (socket) {
      socket.send(JSON.stringify({
        type: "update_participant_data",
        participant_id: currentUser.id,
        mediapipe_analysis: {
          eye_contact_percentage: analysisResults.eyeContactPercentage,
          gesture_count: analysisResults.gestureCount,
          confidence_score: analysisResults.confidenceScore,
          speaking_pace: analysisResults.speakingPace,
          volume_consistency: analysisResults.volumeConsistency,
        },
        speaking_time_used: (Date.now() - speakingStartTime.current) / 1000
      }))
    }
    await getPersonalReport()
    setShowReport(true)

    setSessionPhase("feedback")

    setTimeout(() => {
      nextSpeaker()
    }, 30000)
  }

  const nextSpeaker = () => {
    if (!room || !isHost || !socket) return

    socket.send(JSON.stringify({
      type: "next_speaker",
      room_id: room.id
    }))
  }
  // ✅ ENHANCED: Better debug function
const debugWebRTCConnections = () => {
  console.log("🔍 === WebRTC Debug Info ===")
  console.log("Current User ID:", currentUserId)
  console.log("Room Participants:", room?.participants?.map(p => ({ 
    id: p.user_id || p.id, 
    name: p.user_name || p.name 
  })))
  console.log("WebRTC Current User ID:", webrtcService.getCallState())
  console.log("WebRTC Peer Connections:", Array.from(webrtcService.getCallState().participants))
  console.log("Remote Streams:", Array.from(webrtcService.getCallState().remoteStreams.entries()))
  console.log("Video Elements:", Array.from(remoteVideosRef.current.entries()))
  console.log("Socket ready state:", socket?.readyState)
  console.log("=== End Debug Info ===")
}
  // Call this every 10 seconds for debugging
  useEffect(() => {
    const interval = setInterval(debugWebRTCConnections, 10000)
    return () => clearInterval(interval)
  }, [currentUserId, room])

  const sendFeedback = () => {
    if (!room || !feedbackMessage.trim() || !socket) return

    const newFeedback = {
      id: Date.now().toString(),
      from_participant: currentUser.id,
      from_name: currentUser.name,
      to_participant: room.current_speaker,
      message: feedbackMessage,
      timestamp: new Date().toISOString(),
      type: feedbackType,
      session_phase: sessionPhase,
    }

    socket.send(JSON.stringify({
      type: "send_feedback",
      feedback: newFeedback
    }))

    setFeedbackMessage("")
  }

  const getPersonalReport = async () => {
    if (!room) {
      console.error("Cannot get personal report: room is null")
      return
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/rooms/${room.id}/reports/${currentUser.id}`)
      const report = await response.json()
      setPersonalReport(report)
    } catch (error) {
      console.error("Failed to load personal report:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

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
                {(sessionPhase === "preparation" || sessionPhase === "speaking") && currentTopic && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-900 mb-2">Current Topic:</h3>
                    <p className="text-blue-800">{currentTopic}</p>
                  </div>
                )}

                <div className="grid gap-4 mb-6" style={{ 
                  gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, room.participants?.length || 1))}, 1fr)` 
                }}>
                  <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      You {room.current_speaker === currentUser.id && sessionPhase === "speaking" && "(Speaking)"}
                    </div>
                    <div className="absolute bottom-2 right-2 flex space-x-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${micEnabled ? "bg-green-600" : "bg-red-600"}`}>
                        {micEnabled ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cameraEnabled ? "bg-green-600" : "bg-red-600"}`}>
                        {cameraEnabled ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>

                  {room.participants && room.participants.length > 0 && (() => {
                    const currentUserParticipant = room.participants.find(p => 
                      p && (p.user_name === currentUser.name || p.name === currentUser.name)
                    )
                    const currentUserParticipantId = currentUserParticipant?.user_id || currentUserParticipant?.id
                    
                    return room.participants
                      .filter((p) => {
                        if (!p || !(p.user_id || p.id)) return false
                        const participantId = p.user_id || p.id
                        return participantId !== currentUserParticipantId
                      })
                      .slice(0, 7)
                      .map((participant) => {
                        const participantId = participant.user_id || participant.id
                        const participantName = participant.user_name || participant.name || 'Participant'
                        
                        return (
                          <div
                            key={`remote-${participantId}`}
                            className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
                          >
                            <video
                              ref={(el) => {
                                if (el && participantId) {
                                  console.log(`📹 Setting video ref for participant: ${participantId}`)
                                  
                                  // Set data attribute for DOM lookup
                                  el.setAttribute('data-peer-id', participantId)
                                  
                                  // Store in ref
                                  remoteVideosRef.current.set(participantId, el)
                                  
                                  // Check if there's already a stream for this participant
                                  const existingStream = webrtcService.getCallState().remoteStreams.get(participantId)
                                  if (existingStream) {
                                    console.log("🔄 Assigning existing stream to new video element:", participantId)
                                    el.srcObject = existingStream
                                    el.play().catch(error => console.error("❌ Error playing existing stream:", error))
                                  } else {
                                    // Set placeholder to mark this element as available
                                    console.log("📺 Video element ready for peer:", participantId)
                                  }
                                }
                              }}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                              data-peer-id={participantId} // Add this for DOM lookup
                            />
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                              {participantName}{" "}
                              {room.current_speaker === participantId && sessionPhase === "speaking" && "(Speaking)"}
                              {participant.is_host && " (Host)"}
                            </div>
                            <div className="absolute bottom-2 right-2 flex space-x-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                participant.mic_enabled !== false ? "bg-green-600" : "bg-red-600"
                              }`}>
                                {participant.mic_enabled !== false ? (
                                  <Mic className="w-3 h-3 text-white" />
                                ) : (
                                  <MicOff className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                participant.camera_enabled !== false ? "bg-green-600" : "bg-red-600"
                              }`}>
                                {participant.camera_enabled !== false ? (
                                  <Video className="w-3 h-3 text-white" />
                                ) : (
                                  <VideoOff className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                  })()}
                </div>

                <div className="flex justify-center space-x-4">
                  <Button onClick={toggleMic} variant={micEnabled ? "default" : "destructive"} size="lg">
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>

                  <Button onClick={toggleCamera} variant={cameraEnabled ? "default" : "destructive"} size="lg">
                    {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  {isHost && sessionPhase === "waiting" && room && room.participants && room.participants.length > 0 && (
                    <Button onClick={startSession} className="bg-green-600 hover:bg-green-700" size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      Start Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Speaking Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {room.speaking_order?.map((participantId, index) => {
                    const participant = room.participants?.find((p) => 
                      p && ((p.user_id && p.user_id === participantId) || (p.id && p.id === participantId))
                    )
                    const isCurrent = room.current_speaker === participantId
                    const hasSpoken = participant?.has_spoken

                    if (!participant) return null

                    const displayName = participant.user_name || participant.name || 'Participant'

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
                        <span className="flex-1">{displayName}</span>
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