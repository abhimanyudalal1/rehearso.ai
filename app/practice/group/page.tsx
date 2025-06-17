"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Clock, Globe, Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/database"

export default function GroupPracticePage() {
  const [activeTab, setActiveTab] = useState<"join" | "create">("join")
  const [searchQuery, setSearchQuery] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [availableRooms, setAvailableRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const rooms = await db.getPublicRooms()
        setAvailableRooms(
          rooms.map((room) => ({
            id: room.id,
            name: room.name,
            host: room.host.name,
            participants: room.participants.length,
            maxParticipants: room.max_participants,
            topic: room.topic_category,
            isPublic: room.is_public,
            timePerSpeaker: room.time_per_speaker,
            status: room.status === "active" ? "active" : "waiting",
          })),
        )
      } catch (error) {
        console.error("Error loading rooms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRooms()
  }, [])

  const filteredRooms = availableRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.host.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleJoinRoom = async (roomId: number) => {
    try {
      await db.joinRoom(roomId.toString(), "current-user-id") // Replace with actual user ID
      window.location.href = `/rooms/${roomId}`
    } catch (error) {
      console.error("Error joining room:", error)
    }
  }

  const handleCreateRoom = async () => {
    try {
      const roomData = {
        name: "New Practice Room", // Get from form
        host_id: "current-user-id", // Replace with actual user ID
        topic_category: "Everyday Conversations", // Get from form
        time_per_speaker: 2, // Get from form
        max_participants: 6, // Get from form
        is_public: true, // Get from form
      }

      const room = await db.createRoom(roomData)
      window.location.href = `/rooms/${room.id}`
    } catch (error) {
      console.error("Error creating room:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Group Practice Sessions</h1>
            <p className="text-gray-600">Join existing rooms or create your own practice session with friends</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <Button
                variant={activeTab === "join" ? "default" : "ghost"}
                onClick={() => setActiveTab("join")}
                className="px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                Join Room
              </Button>
              <Button
                variant={activeTab === "create" ? "default" : "ghost"}
                onClick={() => setActiveTab("create")}
                className="px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </div>
          </div>

          {activeTab === "join" && (
            <div className="space-y-6">
              {/* Search and Quick Join */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Search Rooms</CardTitle>
                    <CardDescription>Find public practice rooms to join</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, topic, or host..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Join with Code</CardTitle>
                    <CardDescription>Enter a room code to join directly</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter room code..."
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        className="uppercase"
                      />
                      <Button disabled={!roomCode}>Join</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Available Rooms */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Available Rooms ({filteredRooms.length})</h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading rooms...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredRooms.map((room) => (
                      <Card key={room.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold">{room.name}</h4>
                                <div className="flex items-center space-x-2">
                                  {room.isPublic ? (
                                    <Badge variant="secondary" className="text-xs">
                                      <Globe className="w-3 h-3 mr-1" />
                                      Public
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      <Lock className="w-3 h-3 mr-1" />
                                      Private
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={room.status === "active" ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {room.status === "active" ? "In Progress" : "Waiting"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span>Host: {room.host}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{room.timePerSpeaker} min per speaker</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium">Topic: </span>
                                  <span className="text-sm text-gray-600">{room.topic}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {room.participants}/{room.maxParticipants} participants
                                </div>
                              </div>
                            </div>

                            <div className="ml-6">
                              <Button
                                onClick={() => handleJoinRoom(room.id)}
                                disabled={room.participants >= room.maxParticipants}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              >
                                {room.participants >= room.maxParticipants ? "Full" : "Join Room"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredRooms.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">No rooms found</h4>
                      <p className="text-gray-600 mb-4">
                        {searchQuery ? "Try adjusting your search terms" : "No public rooms are currently available"}
                      </p>
                      <Button onClick={() => setActiveTab("create")}>Create Your Own Room</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Practice Room</CardTitle>
                  <CardDescription>Set up a new group practice session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Name</label>
                      <Input placeholder="e.g., Morning Practice Group" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Participants</label>
                      <Input type="number" placeholder="6" min="2" max="10" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Speaking Topic Category</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>Everyday Conversations</option>
                      <option>Business & Professional</option>
                      <option>Current Events & Debate</option>
                      <option>Personal Stories</option>
                      <option>Educational Topics</option>
                      <option>Creative & Artistic</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Time per Speaker (minutes)</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="2">2 minutes</option>
                        <option value="3">3 minutes</option>
                        <option value="4">4 minutes</option>
                        <option value="5">5 minutes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Room Privacy</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="public">Public (anyone can join)</option>
                        <option value="private">Private (invite only)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Room Description (Optional)</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Describe your practice session goals or any specific guidelines..."
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Room Features:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Automatic topic generation for each speaker</li>
                      <li>• 1-minute preparation time before speaking</li>
                      <li>• Peer feedback collection after each speech</li>
                      <li>• Session recording and analysis (optional)</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleCreateRoom}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    Create Room
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
