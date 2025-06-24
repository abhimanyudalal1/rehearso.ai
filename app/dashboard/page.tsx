"use client" // This must be at the very top of the file

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, Users, Brain, BarChart3, Plus, Clock, Trophy, TrendingUp, Settings, LogOut } from "lucide-react"
import Link from "next/link"
// import { db } from "@/lib/database" // This is commented out, which is fine for frontend

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

// Define the structure of raw session data from the backend
interface RawSessionData {
  _id: string;
  type: "solo" | "group";
  title?: string; // Assuming 'title' is used for the topic in your backend session schema
  feedback?: {
    overallScore?: number;
  };
  createdAt: string;
  // Add other properties if your backend session object has them
}


// Define the backend URL using environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_NODE_BACKEND_URL || 'http://localhost:4000';


export default function Dashboard() {
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    level: "Intermediate",
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
      setIsLoading(true); // Ensure loading state is true at the start of the fetch
      try {
        // TODO: Replace with actual ID from authenticated user (e.g., from a token/cookie)
        // Use a valid MongoDB ObjectId if testing directly and you have a user in DB
        const userId = "60c72b2f9f1b2c001c8e4d1a"; // Example: replace with actual user ID from your DB


        // --- 1. Fetch stats ---
        let statsData = { totalSessions: 0, thisWeekSessions: 0, averageScore: 0, bestScore: 0 };
        try {
          const statsRes = await fetch(`${BACKEND_URL}/api/userstats/${userId}`);
          if (statsRes.ok) {
            const data = await statsRes.json();
            statsData = {
              totalSessions: data.totalSessions || 0,
              thisWeekSessions: data.thisWeekSessions || 0,
              averageScore: data.averageScore || 0,
              bestScore: data.bestScore || 0,
            };
          } else {
            console.error(`Failed to fetch stats: ${statsRes.status} ${statsRes.statusText}`);
            // Optionally log response body for more details
            const errorText = await statsRes.text();
            console.error("Stats Error Details:", errorText);
          }
        } catch (error) {
          console.error("Error fetching user stats:", error);
        }

        // --- 2. Fetch sessions ---
        let fetchedSessions: RawSessionData[] = []; // Declare type for clarity
        try {
          const sessionsRes = await fetch(`${BACKEND_URL}/api/usersessions/${userId}?limit=3`);
          if (sessionsRes.ok) {
            const rawSessions = await sessionsRes.json();
            // This is the CRUCIAL CHECK: Ensure rawSessions is an array before processing
            if (Array.isArray(rawSessions)) {
              fetchedSessions = rawSessions;
            } else {
              console.warn("Sessions API did not return an array. Received:", rawSessions);
              fetchedSessions = []; // Fallback to empty array if not an array
            }
          } else {
            console.error(`Failed to fetch sessions: ${sessionsRes.status} ${sessionsRes.statusText}`);
            // Optionally log response body for more details
            const errorText = await sessionsRes.text();
            console.error("Sessions Error Details:", errorText);
          }
        } catch (error) {
          console.error("Error fetching user sessions:", error);
        }

        // --- Update state with fetched data ---
        setUser((prev) => ({
          ...prev,
          totalSessions: statsData.totalSessions,
          completedThisWeek: statsData.thisWeekSessions,
          averageScore: statsData.averageScore,
          bestScore: statsData.bestScore,
        }));

        // Now, `fetchedSessions` is guaranteed to be an array, even if empty or if fetch failed.
        setRecentSessions(
          fetchedSessions.map((session) => ({
            id: session._id,
            type: session.type === "solo" ? "Solo Practice" : (session.type === "group" ? "Group Session" : "Other"),
            topic: session.title || "Untitled", // Changed from session.topic to session.title based on schema
            score: session.feedback?.overallScore || 0,
            date: new Date(session.createdAt).toLocaleDateString(),
          }))
        );

      } catch (error) {
        // This catch block will primarily catch errors from the `fetch` calls themselves,
        // not usually type errors from `map` if the above checks are in place.
        console.error("Caught an unexpected error during user data loading:", error);
      } finally {
        setIsLoading(false); // Ensure loading state is set to false even if errors occur
      }
    };

    loadUserData();
  }, []); // Empty dependency array means this runs once on component mount


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SpeakAI
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Avatar>
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Ready to improve your speaking skills today?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/practice/solo">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Solo Practice</CardTitle>
                <CardDescription>Practice with AI virtual audience</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/practice/group">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Group Session</CardTitle>
                <CardDescription>Practice with friends</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/rooms/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Create Room</CardTitle>
                <CardDescription>Start a new group session</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-200">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>View your progress</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Weekly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Sessions this week</span>
                        <span className="text-sm text-gray-600">
                          {user.completedThisWeek}/{user.weeklyGoal}
                        </span>
                      </div>
                      <Progress value={(user.completedThisWeek / user.weeklyGoal) * 100} className="h-2" />
                      <p className="text-sm text-gray-600">
                        {user.weeklyGoal - user.completedThisWeek} more sessions to reach your weekly goal
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Recent Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentSessions.length > 0 ? ( // Added check for empty array
                        recentSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant={session.type === "Solo Practice" ? "default" : "secondary"}>
                                  {session.type}
                                </Badge>
                                <span className="text-sm text-gray-500">{session.date}</span>
                              </div>
                              <h4 className="font-medium">{session.topic}</h4>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{session.score}</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">No recent sessions found. Start practicing!</p>
                      )}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <Badge>{user.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-semibold">{user.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-semibold">{user.averageScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Score</span>
                  <span className="font-semibold text-green-600">{user.bestScore}</span>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"}`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Trophy className={`w-4 h-4 ${achievement.earned ? "text-yellow-600" : "text-gray-400"}`} />
                        <span
                          className={`font-medium text-sm ${achievement.earned ? "text-yellow-800" : "text-gray-600"}`}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Practice the "power pose" for 2 minutes before speaking to boost confidence and reduce stress
                  hormones.
                </p>
                <Button variant="outline" size="sm" className="w-full">
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