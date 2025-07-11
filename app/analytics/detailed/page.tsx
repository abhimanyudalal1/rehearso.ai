"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Settings, LogOut, BarChart3, TrendingUp, Clock, Trophy, Brain, Target } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

import ReactMarkdown from 'react-markdown'

// Chart.js imports - you'll need to install: npm install chart.js react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

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

interface SessionDisplay {
  id: string;
  type: string;
  title: string;
  date: string;
  score: number;
}

export default function DetailedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<ReportsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<SessionDisplay[]>([])
  const [summary, setSummary] = useState("")
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('http://localhost:8000/get-reports')
        
        if (response.ok) {
          const data: ReportsResponse = await response.json()
          setAnalyticsData(data)
          
          // Transform sessions data
          const transformedSessions: SessionDisplay[] = data.stats.slice(0, 10).map((session, index) => ({
            id: session._id,
            type: index % 3 === 0 ? "Group Session" : "Solo Practice",
            title: `Session ${data.stats.length - index}`,
            date: new Date(session.timestamp * 1000).toLocaleDateString(),
            score: Math.round(session.total_score),
          }))
          
          setSessions(transformedSessions)
          
          // Load detailed summary from backend
          await loadDetailedSummary()
        } else {
          console.error('Failed to fetch analytics data')
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const loadDetailedSummary = async () => {
    setIsSummaryLoading(true)
    try {
      const response = await fetch('http://localhost:4000/finalsummary')
      
      if (response.ok) {
        const summaryData = await response.json()
        // Assuming the API returns either a string or an object with a summary field
        const summaryText = typeof summaryData === 'string' ? summaryData : summaryData.summary || summaryData.message
        setSummary(summaryText)
      } else {
        console.error('Failed to fetch detailed summary')
        // Fallback to local summary generation
        if (analyticsData) {
          generateLocalSummary(analyticsData)
        }
      }
    } catch (error) {
      console.error('Error loading detailed summary:', error)
      // Fallback to local summary generation
      if (analyticsData) {
        generateLocalSummary(analyticsData)
      }
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const generateLocalSummary = (data: ReportsResponse) => {
    const improvement = data.stats.length > 5 ? 
      Math.round(((data.stats[0].total_score - data.stats[data.stats.length - 1].total_score) / data.stats[data.stats.length - 1].total_score) * 100) : 0
    
    let summaryText = `Great progress! You've completed ${data.total_sessions} sessions with an average score of ${data.average_total_score.toFixed(1)}. `
    
    if (improvement > 0) {
      summaryText += `Your performance has improved by ${improvement}% since you started. `
    }
    
    if (data.average_posture_score > data.average_speaking_score) {
      summaryText += "Your posture scores are consistently strong. Focus on speaking confidence and reducing filler words to reach the next level."
    } else {
      summaryText += "Your speaking skills are developing well. Work on maintaining good posture throughout your presentations."
    }
    
    setSummary(summaryText)
  }

  const progressChartData = {
    labels: analyticsData?.stats.slice().reverse().map((_, index) => `Session ${index + 1}`) || [],
    datasets: [
      {
        label: 'Total Score',
        data: analyticsData?.stats.slice().reverse().map(s => s.total_score) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const breakdownChartData = {
    labels: ['Posture', 'Gestures', 'Speaking'],
    datasets: [
      {
        data: [
          analyticsData?.average_posture_score || 0,
          analyticsData?.average_gesture_score || 0,
          analyticsData?.average_speaking_score || 0,
        ],
        backgroundColor: [
          '#10b981',
          '#8b5cf6',
          '#f59e0b',
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SpeakAI
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SpeakAI
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Performance Analytics</h1>
          <p className="text-gray-600">Track your public speaking progress and improvements over time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">{analyticsData?.total_sessions || 0}</CardTitle>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">{analyticsData?.average_total_score.toFixed(1) || 0}</CardTitle>
              <p className="text-sm text-gray-600">Average Score</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold">{analyticsData?.maximum_total_score.toFixed(1) || 0}</CardTitle>
              <p className="text-sm text-gray-600">Best Score</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold">{analyticsData?.average_posture_score.toFixed(1) || 0}</CardTitle>
              <p className="text-sm text-gray-600">Avg Posture Score</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">{analyticsData?.average_speaking_score.toFixed(1) || 0}</CardTitle>
              <p className="text-sm text-gray-600">Avg Speaking Score</p>
            </CardHeader>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={progressChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut data={breakdownChartData} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="default">{session.type}</Badge>
                      <span className="text-sm text-gray-500">{session.date}</span>
                    </div>
                    <h4 className="font-medium">{session.title}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{session.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


<Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
  <CardHeader>
    <CardTitle className="text-xl flex items-center">
      <Trophy className="w-5 h-5 mr-2 text-white" />
      AI Performance Summary
    </CardTitle>
  </CardHeader>
  <CardContent>
    {isSummaryLoading ? (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <p className="text-blue-100">Generating personalized insights...</p>
      </div>
    ) : summary ? (
      <div className="prose prose-sm prose-invert max-w-none text-blue-100">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    ) : (
      <p className="text-red-100">Unable to generate summary. Try again later.</p>
    )}
  </CardContent>
</Card>


      </div>
    </div>
  )
}