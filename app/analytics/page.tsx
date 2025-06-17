"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Award,
  ArrowLeft,
  Clock,
  Mic,
  MessageSquare,
  Users,
} from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/database"

export default function AnalyticsPage() {
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    bestScore: 0,
    thisWeekSessions: 0,
    improvementRate: 0,
  })
  const [recentSessions, setRecentSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const weeklyData = [
    { week: "Week 1", sessions: 3, avgScore: 72 },
    { week: "Week 2", sessions: 5, avgScore: 78 },
    { week: "Week 3", sessions: 4, avgScore: 82 },
    { week: "Week 4", sessions: 6, avgScore: 85 },
  ]

  const skillBreakdown = [
    { skill: "Voice Clarity", current: 85, previous: 78, trend: "up" },
    { skill: "Confidence", current: 82, previous: 75, trend: "up" },
    { skill: "Body Language", current: 79, previous: 82, trend: "down" },
    { skill: "Eye Contact", current: 88, previous: 84, trend: "up" },
    { skill: "Grammar", current: 91, previous: 89, trend: "up" },
  ]

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const userId = "current-user-id" // Replace with actual user ID

        // Load user stats
        const stats = await db.getUserStats(userId)
        setUserStats({
          ...stats,
          improvementRate: 12, // Calculate based on historical data
        })

        // Load recent sessions for detailed analysis
        const sessions = await db.getUserSessions(userId, 10)
        setRecentSessions(sessions)
      } catch (error) {
        console.error("Error loading analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-semibold">Speaking Analytics</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-3xl font-bold">{userStats.totalSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{userStats.thisWeekSessions} this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-3xl font-bold">{userStats.averageScore}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{userStats.improvementRate}% improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Score</p>
                    <p className="text-3xl font-bold text-purple-600">{userStats.bestScore}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Target className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600">Personal best</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Practice Streak</p>
                    <p className="text-3xl font-bold text-orange-600">7</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">Days in a row</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>Your speaking performance over the last 4 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyData.map((week, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium">{week.week}</div>
                          <Badge variant="secondary">{week.sessions} sessions</Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Avg Score</div>
                            <div className="text-lg font-semibold">{week.avgScore}</div>
                          </div>
                          <div className="w-24">
                            <Progress value={week.avgScore} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Goal Progress</CardTitle>
                  <CardDescription>Track your weekly speaking goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Weekly Goal: 5 sessions</span>
                      <span className="text-sm text-gray-600">{userStats.thisWeekSessions}/5 completed</span>
                    </div>
                    <Progress value={(userStats.thisWeekSessions / 5) * 100} className="h-3" />
                    <p className="text-sm text-gray-600">
                      {5 - userStats.thisWeekSessions > 0
                        ? `${5 - userStats.thisWeekSessions} more sessions to reach your weekly goal`
                        : "Congratulations! You've reached your weekly goal!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Breakdown</CardTitle>
                  <CardDescription>Detailed analysis of your speaking skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {skillBreakdown.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {skill.previous} → {skill.current}
                            </span>
                            <Badge variant={skill.trend === "up" ? "default" : "destructive"} className="text-xs">
                              {skill.trend === "up" ? "↗" : "↘"} {Math.abs(skill.current - skill.previous)}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={skill.current} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Excellent grammar and vocabulary</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Strong eye contact maintenance</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Clear voice projection</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Focus Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Body language consistency</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Reducing filler words</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Gesture coordination</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Detailed breakdown of your latest practice sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.length > 0 ? (
                      recentSessions.map((session, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge variant={session.type === "solo" ? "default" : "secondary"}>
                                {session.type === "solo" ? "Solo Practice" : "Group Session"}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{session.overall_score}</div>
                          </div>

                          <h4 className="font-medium mb-2">{session.topic}</h4>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Voice Clarity</span>
                              <div className="font-medium">{session.voice_clarity}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Confidence</span>
                              <div className="font-medium">{session.confidence}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Body Language</span>
                              <div className="font-medium">{session.body_language}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration</span>
                              <div className="font-medium">
                                {Math.floor(session.duration / 60)}m {session.duration % 60}s
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No sessions found. Start practicing to see your analytics!</p>
                        <Link href="/practice/solo">
                          <Button className="mt-4">Start Solo Practice</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>Personalized recommendations based on your speaking patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">🎯 Focus Recommendation</h4>
                      <p className="text-blue-800 text-sm">
                        Your voice clarity has improved significantly (+7 points this month). Continue working on body
                        language consistency to achieve more balanced scores across all areas.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">📈 Progress Highlight</h4>
                      <p className="text-green-800 text-sm">
                        Excellent progress on eye contact! You've maintained 85%+ eye contact in your last 5 sessions.
                        This shows great improvement in audience engagement.
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">💡 Practice Tip</h4>
                      <p className="text-orange-800 text-sm">
                        Try practicing with different topic categories. You perform best with "Personal Stories" (avg
                        89) but could benefit from more "Professional" topics (avg 78) to build versatility.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">🏆 Achievement Ready</h4>
                      <p className="text-purple-800 text-sm">
                        You're just 2 sessions away from earning the "Consistency Champion" badge for practicing 5 days
                        in a row. Keep up the great work!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/practice/solo">
                      <Button variant="outline" className="w-full justify-start">
                        <Mic className="w-4 h-4 mr-2" />
                        Practice body language with AI feedback
                      </Button>
                    </Link>
                    <Link href="/practice/group">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Join a professional topics group session
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      Set a new weekly goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
