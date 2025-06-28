"use client" // This must be at the very top of the file


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, Users, Brain, BarChart3, Plus, Clock, Trophy, TrendingUp, Github, Linkedin, LogOut } from "lucide-react"
import Link from "next/link"
// import { TrendingUp } from "lucide-react"

const achievements = [
  { title: "First Session", description: "Complete your first speaking session", earned: false },
  { title: "Weekly Goal", description: "Reach your weekly goal of 5 sessions", earned: false },
  { title: "Level Up", description: "Advance to the next level", earned: false },
]

// Define the structure of a session item for better type safety and clarity
interface SessionItem {
  id: string;
  type: string;
  topic: string;
  score: number;
  date: string;
}

// Define the structure of stats data from the backend
interface StatsData {
  _id: string;
  report: string;
  posture_score: number;
  gesture_score: number;
  speaking_score: number;
  total_score: number;
  timestamp: number;
}

interface ReportsResponse {
  stats: StatsData[];
  total_sessions: number;
  average_total_score: number;
  average_posture_score: number;
  average_gesture_score: number;
  average_speaking_score: number;
  maximum_total_score: number;
}

export default function Dashboard() {
  const [user, setUser] = useState({
    name: "",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    level: "Beginner",
    totalSessions: 0,
    weeklyGoal: 5,
    completedThisWeek: 0,
    averageScore: 0,
    bestScore: 0,
  })

  // Initialize as an empty array of SessionItem to prevent map errors and provide type safety
  const [recentSessions, setRecentSessions] = useState<SessionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch data from the get-reports endpoint
        const response = await fetch('http://localhost:8000/get-reports');
        
        if (response.ok) {
          const data: ReportsResponse = await response.json();
          
          // Update user stats with fetched data
          const thisWeekSessions = Math.min(data.total_sessions, 4); // Max 4 for weekly progress
          
          setUser((prev) => ({
            ...prev,
            totalSessions: data.total_sessions,
            completedThisWeek: thisWeekSessions,
            averageScore: Math.round(data.average_total_score),
            bestScore: Math.round(data.maximum_total_score),
          }));

          // Get the latest 4 sessions (or less if there are fewer sessions)
          const latestSessions = data.stats.slice(0, 4);
          
          // Transform the sessions data to match the SessionItem interface
          const transformedSessions: SessionItem[] = latestSessions.map((session, index) => ({
            id: session._id,
            type: "Solo Practice", // Default type since the endpoint doesn't specify type
            topic: `Session ${index + 1}`, // Generic topic since the endpoint doesn't provide specific topics
            score: Math.round(session.total_score),
            date: new Date(session.timestamp * 1000).toLocaleDateString(),
          }));

          setRecentSessions(transformedSessions);
          
        } else {
          console.error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error("Reports Error Details:", errorText);
        }
        
      } catch (error) {
        console.error("Error fetching reports data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center animate-pulse">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SpeakAI
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300" asChild>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 text-gray-700 hover:text-blue-600" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300" asChild>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4 text-blue-600 hover:text-purple-600" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300">
              <LogOut className="w-4 h-4 mr-2 text-red-500 hover:text-red-600" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back! {user.name}
          </h1>
          <p className="text-gray-600 text-lg">Ready to improve your speaking skills today?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/practice/solo">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 group">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-700">Solo Practice</CardTitle>
                <CardDescription className="text-blue-600">Practice with AI virtual audience</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/practice/group">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 group">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-purple-700">Group Session</CardTitle>
                <CardDescription className="text-purple-600">Practice with friends</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/rooms/create">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 group">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-green-700">Create Room</CardTitle>
                <CardDescription className="text-green-600">Start a new group session</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 group">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg text-orange-700">Analytics</CardTitle>
                <CardDescription className="text-orange-600">View your progress</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* **new add on** */}

        <Link href="/analytics/detailed" className="block mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-indigo-200">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-lg">Detailed Analytics</CardTitle>
            <CardDescription>Comprehensive performance insights</CardDescription>
          </CardHeader>
        </Card>
      </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your data...</p>
              </div>
            ) : (
              <>
                {/* Progress Overview */}
                <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-white">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Sessions this week</span>
                        <span className="text-sm text-blue-600 font-semibold">
                          {user.completedThisWeek}/{user.weeklyGoal}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={(user.completedThisWeek / user.weeklyGoal) * 100} className="h-3 bg-blue-100" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                             style={{width: `${(user.completedThisWeek / user.weeklyGoal) * 100}%`}}></div>
                      </div>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        {user.weeklyGoal - user.completedThisWeek > 0
                          ? `🎯 ${user.weeklyGoal - user.completedThisWeek} more sessions to reach your weekly goal`
                          : "🎉 Congratulations! You've reached your weekly goal!"
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center text-white">
                      <Clock className="w-5 h-5 mr-2" />
                      Recent Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {recentSessions.length > 0 ? (
                        recentSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-all duration-300">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {session.type}
                                </Badge>
                                <span className="text-sm text-purple-600 font-medium">{session.date}</span>
                              </div>
                              <h4 className="font-medium text-gray-800">{session.topic}</h4>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{session.score}</div>
                              <div className="text-xs text-purple-500 font-medium">Score</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mic className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-purple-600 font-medium">No recent sessions found. Start practicing!</p>
                        </div>
                      )}
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                      View All Sessions
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            <Card className="bg-gradient-to-br from-white to-green-50 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle className="text-lg text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Level</span>
                  <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">{user.level}</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Total Sessions</span>
                  <span className="font-bold text-green-600 text-lg">{user.totalSessions}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Average Score</span>
                  <span className="font-bold text-green-600 text-lg">{user.averageScore}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                  <span className="text-gray-700 font-medium">Best Score</span>
                  <span className="font-bold text-green-600 text-xl">🏆 {user.bestScore}</span>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-gradient-to-br from-white to-yellow-50 border-yellow-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-lg text-white">
                  <Trophy className="w-5 h-5 mr-2" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        achievement.earned 
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-md" 
                          : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Trophy className={`w-4 h-4 ${achievement.earned ? "text-yellow-600" : "text-gray-400"}`} />
                        <span
                          className={`font-medium text-sm ${
                            achievement.earned ? "text-yellow-800" : "text-gray-600"
                          }`}
                        >
                          {achievement.title}
                        </span>
                      </div>
                      <p className={`text-xs ${achievement.earned ? "text-yellow-700" : "text-gray-500"}`}>
                        {achievement.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-white to-pink-50 border-pink-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
                <CardTitle className="text-lg text-white">Today's Tip</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg border border-pink-200 mb-4">
                  <p className="text-sm text-gray-700 font-medium">
                    💡 Practice the "power pose" for 2 minutes before speaking to boost confidence and reduce stress
                    hormones.
                  </p>
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg">
                  More Tips
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}