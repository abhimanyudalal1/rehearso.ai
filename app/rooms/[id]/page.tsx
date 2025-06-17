"use client"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  MessageSquare,
  Send,
  Copy,
  Share2,
  Settings,
  LogOut,
} from "lucide-react"

// Import WebRTC and database services
import { webrtc } from "@/lib/webrtc"
import { db } from "@/lib/database"
import { aiAnalysis } from "@/lib/ai-analysis"

export default function RoomPage({ params }: { params: { id: string } }) {
  const [currentSpeaker, setCurrentSpeaker] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPreparation, setIsPreparation] = useState(false)
  const [currentTopic, setCurrentTopic] = useState("")
  const [feedback, setFeedback] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  // Update to load real room data
  // Replace the roomData and participants with state:
  const [roomData, setRoomData] = useState<any>(null)
  const [participants, setParticipants] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())

  const chatMessages = [
    { id: 1, user: "Sarah Chen", message: "Welcome everyone! Let's start with introductions.", time: "2:30 PM" },
    { id: 2, user: "Mike Johnson", message: "Great topic choice!", time: "2:32 PM" },
    { id: 3, user: "Emma Wilson", message: "Looking forward to practicing together", time: "2:33 PM" },
  ]

  const topics = [
    "Describe your ideal weekend",
    "What's the most interesting place you've visited?",
    "How has technology changed communication?",
    "What skill would you like to learn and why?",
    "Describe a person who has influenced your life",
  ]

  // Add useEffect to load room data and initialize WebRTC
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        // Load room details (you'll need to implement getRoomById in DatabaseService)
        // const room = await db.getRoomById(params.id)
        // setRoomData(room)

        // Load participants
        const roomParticipants = await db.getRoomParticipants(params.id)
        setParticipants(
          roomParticipants.map((p) => ({
            id: p.user_id,
            name: p.user.name,
            avatar: p.user.avatar_url,
            isHost: false, // Determine from room data
            isOnline: true,
            hasSpoken: p.has_spoken,
          })),
        )

        // Initialize WebRTC
        const stream = await webrtc.initializeLocalStream(true, true)
        setLocalStream(stream)

        // Set up WebRTC callbacks
        webrtc.setOnRemoteStream((stream, peerId) => {
          setRemoteStreams((prev) => new Map(prev.set(peerId, stream)))
        })

        webrtc.setOnPeerDisconnected((peerId) => {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev)
            newMap.delete(peerId)
            return newMap
          })
        })
      } catch (error) {
        console.error("Error loading room data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRoomData()

    // Cleanup on unmount
    return () => {
      webrtc.disconnect()
    }
  }, [params.id])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && isPreparation) {
      setIsPreparation(false)
      setTimeRemaining(roomData?.timePerSpeaker * 60)
    } else if (timeRemaining === 0 && currentSpeaker !== null) {
      // Speaking time is up
      setCurrentSpeaker(null)
    }
  }, [timeRemaining, isPreparation, currentSpeaker, roomData?.timePerSpeaker])

  // Update the startSpeaking function to use AI topic generation
  const startSpeaking = async (participantId: number) => {
    try {
      const topics = await aiAnalysis.generateTopics(roomData?.topic_category || "General", 1)
      setCurrentTopic(topics[0] || "Describe your ideal weekend")
    } catch (error) {
      console.error("Error generating topic:", error)
      setCurrentTopic("Describe your ideal weekend")
    }

    setCurrentSpeaker(participantId)
    setIsPreparation(true)
    setTimeRemaining(60) // 1 minute preparation
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const submitFeedback = () => {
    if (feedback.trim()) {
      // Submit feedback logic here
      setFeedback("")
    }
  }

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      // Send message logic here
      setChatMessage("")
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomData.code)
  }

  // Update the mute/camera toggle functions to use WebRTC
  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    webrtc.toggleAudio(!newMutedState)
  }

  const toggleCamera = () => {
    const newCameraState = !isCameraOff
    setIsCameraOff(newCameraState)
    webrtc.toggleVideo(!newCameraState)
  }

  // Add loading state
  return (
    <>
      {isLoading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading room...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold">{roomData?.name}</h1>
                  <Badge variant="secondary">{roomData?.isPublic ? "Public" : "Private"}</Badge>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Room Code:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">{roomData?.code}</code>
                    <Button variant="ghost" size="sm" onClick={copyRoomCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Room
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Current Speaker Section */}
                {currentSpeaker ? (
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Mic className="w-5 h-5 mr-2 text-blue-600" />
                          {isPreparation ? "Preparation Time" : "Speaking Time"}
                        </CardTitle>
                        <div className="text-3xl font-bold text-blue-600">{formatTime(timeRemaining)}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={participants.find((p) => p.id === currentSpeaker)?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {participants
                                .find((p) => p.id === currentSpeaker)
                                ?.name.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {participants.find((p) => p.id === currentSpeaker)?.name} is speaking
                            </div>
                            <div className="text-sm text-gray-600">Topic: {currentTopic}</div>
                          </div>
                        </div>

                        <Progress
                          value={
                            isPreparation
                              ? ((60 - timeRemaining) / 60) * 100
                              : ((roomData?.timePerSpeaker * 60 - timeRemaining) / (roomData?.timePerSpeaker * 60)) *
                                100
                          }
                          className="h-2"
                        />

                        {isPreparation && (
                          <div className="bg-white p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Preparation Tips:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Think of 2-3 main points</li>
                              <li>• Consider personal examples</li>
                              <li>• Plan your opening and closing</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Waiting for Next Speaker</CardTitle>
                      <CardDescription>Click "Start Speaking" when you're ready to practice</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Ready to practice your speaking skills?</p>
                        <Button
                          onClick={() => startSpeaking(4)} // Assuming user is participant 4
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Start Speaking
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Video Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {participants.map((participant) => (
                        <div key={participant.id} className="relative">
                          <div
                            className={`aspect-video bg-gray-800 rounded-lg flex items-center justify-center ${
                              currentSpeaker === participant.id ? "ring-2 ring-blue-500" : ""
                            }`}
                          >
                            <div className="text-center text-white">
                              <Avatar className="w-16 h-16 mx-auto mb-2">
                                <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {participant.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm">{participant.name}</div>
                            </div>
                          </div>

                          <div className="absolute top-2 left-2 flex space-x-1">
                            {participant.isHost && (
                              <Badge className="bg-yellow-500 text-white text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Host
                              </Badge>
                            )}
                            {participant.hasSpoken && (
                              <Badge className="bg-green-500 text-white text-xs">✓ Spoke</Badge>
                            )}
                          </div>

                          <div className="absolute bottom-2 right-2 flex space-x-1">
                            <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                              {participant.id === 4 ? (
                                isMuted ? (
                                  <MicOff className="w-3 h-3 text-red-400" />
                                ) : (
                                  <Mic className="w-3 h-3 text-green-400" />
                                )
                              ) : (
                                <Mic className="w-3 h-3 text-green-400" />
                              )}
                            </div>
                            <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                              {participant.id === 4 ? (
                                isCameraOff ? (
                                  <VideoOff className="w-3 h-3 text-red-400" />
                                ) : (
                                  <Video className="w-3 h-3 text-green-400" />
                                )
                              ) : (
                                <Video className="w-3 h-3 text-green-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center space-x-4 mt-6">
                      <Button variant={isMuted ? "destructive" : "default"} size="sm" onClick={toggleMute}>
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button variant={isCameraOff ? "destructive" : "default"} size="sm" onClick={toggleCamera}>
                        {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback Section */}
                {!currentSpeaker && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Provide Feedback</CardTitle>
                      <CardDescription>Share constructive feedback for the last speaker</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Share your thoughts on the speaker's delivery, content, or areas for improvement..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                        />
                        <Button onClick={submitFeedback} disabled={!feedback.trim()}>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                      <span className="text-gray-600">Topic Category</span>
                      <span className="font-medium">{roomData?.topic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time per Speaker</span>
                      <span className="font-medium">{roomData?.timePerSpeaker} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participants</span>
                      <span className="font-medium">{participants.length}/6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Host</span>
                      <span className="font-medium">{roomData?.host}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Users className="w-5 h-5 mr-2" />
                      Participants ({participants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{participant.name}</span>
                              {participant.isHost && <Crown className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${participant.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                              ></div>
                              <span className="text-xs text-gray-500">
                                {participant.isOnline ? "Online" : "Offline"}
                              </span>
                              {participant.hasSpoken && (
                                <Badge variant="secondary" className="text-xs">
                                  Spoke
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="text-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{message.user}</span>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-gray-700">{message.message}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={sendChatMessage} disabled={!chatMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
