"use client"

import { use, useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useParams } from 'next/navigation'
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
} from "lucide-react"
import Link from "next/link"
import { webrtcService } from "@/lib/webrtc"
import { roomManager, type Room, type Participant } from "@/lib/room-manager"

export default function RoomPage() {
  const params = useParams()
  const id = params?.id as string
  const [room, setRoom] = useState<Room | null>(null)
  const [currentUser] = useState({ id: "current-user-id", name: "You" })
  const [isHost, setIsHost] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [preparationTime, setPreparationTime] = useState(0)
  const [sessionPhase, setSessionPhase] = useState<"waiting" | "preparation" | "speaking" | "feedback" | "completed">(
    "waiting",
  )
  const [currentTopic, setCurrentTopic] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  useEffect(() => {
    // Don't proceed if id is not available yet
    if (!id) return

    const loadRoom = () => {
      try {
        let rooms: Room[] = []
        const roomsRaw = localStorage.getItem("practiceRooms")
        
        if (roomsRaw) {
          try {
            const parsed = JSON.parse(roomsRaw)
            if (Array.isArray(parsed)) {
              rooms = parsed
            } else {
              console.warn('practiceRooms is not an array:', parsed)
              setError("Invalid room data format")
              return
            }
          } catch (parseError) {
            console.error('Failed to parse practiceRooms:', parseError)
            setError("Failed to load room data")
            return
          }
        }

        // Check if we have any rooms and a valid id
        if (rooms.length === 0) {
          setError("No rooms found. Please create a room first.")
          return
        }

        if (!id) {
          setError("Invalid room ID")
          return
        }

        // Find the room safely
        const foundRoom = rooms.find((r: Room) => r && r.id === id)

        if (!foundRoom) {
          setError(`Room with ID "${id}" not found`)
          return
        }

        // Ensure participants array exists
        if (!foundRoom.participants) {
          foundRoom.participants = []
        }

        setRoom(foundRoom)
        setIsHost(foundRoom.host_id === currentUser.id)
        setError(null) // Clear any previous errors

        // Add current user as participant if not already added
        const existingParticipant = foundRoom.participants.find((p: Participant) => p && p.id === currentUser.id)
        
        if (!existingParticipant) {
          const success = roomManager.addParticipant(foundRoom.id, {
            id: currentUser.id,
            name: currentUser.name,
            is_host: foundRoom.host_id === currentUser.id,
            camera_enabled: true,
            mic_enabled: true,
          })
          
          if (!success) {
            setError("Failed to join room - room may be full")
            return
          }
          
          // Update the room state after adding participant
          const updatedRoom = roomManager.getRoom(foundRoom.id)
          if (updatedRoom) {
            setRoom(updatedRoom)
          }
        }

      } catch (error) {
        console.error('Error loading room:', error)
        setError("Failed to load room")
      }
    }

    loadRoom()
    
    // Only initialize WebRTC if we don't have an error
    if (!error) {
      initializeWebRTC()
    }

    return () => {
      webrtcService.endCall()
    }
  }, [id, currentUser.id, error]) // Add error as dependency

  const initializeWebRTC = async () => {
    try {
      const stream = await webrtcService.initializeLocalStream()
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Set up WebRTC event handlers
      webrtcService.onRemoteStreamAdded = (peerId: string, stream: MediaStream) => {
        const videoElement = remoteVideosRef.current.get(peerId)
        if (videoElement) {
          videoElement.srcObject = stream
        }
      }
    } catch (error) {
      console.error("Failed to initialize WebRTC:", error)
      setError("Failed to initialize video/audio")
    }
  }

  const toggleCamera = () => {
    const newState = !cameraEnabled
    setCameraEnabled(newState)
    webrtcService.toggleVideo(newState)

    if (room) {
      roomManager.updateParticipantMedia(room.id, currentUser.id, newState, micEnabled)
    }
  }

  const toggleMic = () => {
    const newState = !micEnabled
    setMicEnabled(newState)
    webrtcService.toggleAudio(newState)

    if (room) {
      roomManager.updateParticipantMedia(room.id, currentUser.id, cameraEnabled, newState)
    }
  }

  const startSession = () => {
    if (!room || !isHost) return

    roomManager.startSession(room.id)
    setSessionPhase("preparation")
    setPreparationTime(60) // 1 minute preparation
    generateTopic()

    // Start preparation timer
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
      ],
      "Business & Professional": [
        "Present your idea for improving workplace productivity",
        "Discuss the future of remote work in your industry",
        "Explain how to give effective feedback to colleagues",
        "Describe the qualities of a great leader",
      ],
      "Current Events & Debate": [
        "Argue for or against social media age restrictions",
        "Discuss the impact of AI on future job markets",
        "Present your views on sustainable transportation",
        "Debate the role of technology in education",
      ],
    }

    const categoryTopics = topics[room?.topic_category as keyof typeof topics] || topics["Everyday Conversations"]
    const randomTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)]
    setCurrentTopic(randomTopic)
  }

  const startSpeaking = () => {
    if (!room) return

    setSessionPhase("speaking")
    setTimeRemaining(room.time_per_speaker * 60) // Convert minutes to seconds

    // Start speaking timer
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

  const endCurrentSpeech = () => {
    setSessionPhase("feedback")

    // Auto-advance to next speaker after 30 seconds of feedback time
    setTimeout(() => {
      nextSpeaker()
    }, 30000)
  }

  const nextSpeaker = () => {
    if (!room) return

    const success = roomManager.nextSpeaker(room.id)
    if (success) {
      const updatedRoom = roomManager.getRoom(room.id)
      if (updatedRoom?.status === "completed") {
        setSessionPhase("completed")
        setShowReport(true)
      } else {
        setSessionPhase("preparation")
        setPreparationTime(60)
        generateTopic()

        // Start next preparation timer
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
    }
  }

  const sendFeedback = () => {
    if (!room || !feedbackMessage.trim()) return

    const currentSpeaker = room.participants.find((p) => p.id === room.current_speaker)
    if (currentSpeaker && currentSpeaker.id !== currentUser.id) {
      roomManager.addFeedback(room.id, currentSpeaker.id, {
        from_participant: currentUser.id,
        message: feedbackMessage,
        type: "constructive",
      })
      setFeedbackMessage("")
    }
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
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading if id is not available yet or room is not loaded
  if (!id || !room) {
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
                  }) || <p className="text-gray-500 text-sm">No speaking order set yet</p>}
                </div>
              </CardContent>
            </Card>

            {/* Live Feedback */}
            {sessionPhase === "speaking" && room.current_speaker !== currentUser.id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      placeholder="Type constructive feedback..."
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendFeedback()}
                    />
                    <Button onClick={sendFeedback} disabled={!feedbackMessage.trim()} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Complete - Show Report */}
            {showReport && (
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
                        <div className="text-2xl font-bold text-blue-600">87</div>
                        <div className="text-xs text-gray-600">Overall</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">92</div>
                        <div className="text-xs text-gray-600">Clarity</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">85</div>
                        <div className="text-xs text-gray-600">Confidence</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-green-600 mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Strengths
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li>• Clear articulation</li>
                        <li>• Good use of examples</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-orange-600 mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        Improve
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li>• Reduce filler words</li>
                        <li>• Maintain eye contact</li>
                      </ul>
                    </div>
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