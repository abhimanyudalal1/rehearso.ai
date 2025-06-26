"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Trophy, AlertCircle, Clock, Mic, FileText, User, Activity } from "lucide-react"
import { generatePDF } from "@/lib/pdf-generator"

interface SessionFeedback {
  session_id: string
  status: string
  report: string
  session_summary: {
    duration: number
    posture_score: number
    gesture_score: number
    speaking_score: number
    total_speech_chunks: number
  }
  raw_data: {
    mediapipe_data: {
      session_duration: number
      good_posture_seconds: number
      hand_gestures_seconds: number
      speaking_seconds: number
      total_frames: number
    }
    text_chunks: Array<{
      text: string
      response: string
      timestamp: number
    }>
  }
  timestamp: string
}

interface EnhancedFeedbackDisplayProps {
  sessionData: SessionFeedback | null
  isAnalyzing: boolean
  onReset: () => void
}

export function EnhancedFeedbackDisplay({ sessionData, isAnalyzing, onReset }: EnhancedFeedbackDisplayProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleDownloadPDF = async () => {
    if (!sessionData) return

    setIsGeneratingPDF(true)
    try {
      await generatePDF(sessionData)
    } catch (err) {
      console.error("Error generating PDF:", err)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  if (isAnalyzing) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Generating your comprehensive AI feedback report...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Session Data</h2>
        <p className="text-gray-600 mb-4">Unable to load session feedback</p>
        <Button onClick={onReset}>Try Again</Button>
      </div>
    )
  }

  const overallScore = Math.round(
    (sessionData.session_summary.posture_score +
      sessionData.session_summary.gesture_score +
      sessionData.session_summary.speaking_score) /
      3,
  )

  return (
    <div className="space-y-8">
      {/* Header with Download */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Analysis Complete!</h2>
          <p className="text-gray-600">
            Session ID: {sessionData.session_id.slice(-8)} • {Math.round(sessionData.session_summary.duration)}s
            duration
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
          {isGeneratingPDF ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isGeneratingPDF ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      {/* Overall Score */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          <Badge variant={getScoreBadgeVariant(overallScore)} className="px-3 py-1">
            {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Improvement"}
          </Badge>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(sessionData.session_summary.posture_score)}`}>
              {Math.round(sessionData.session_summary.posture_score)}%
            </div>
            <div className="text-sm text-gray-600">Posture Quality</div>
            <Progress value={sessionData.session_summary.posture_score} className="mt-2 h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {sessionData.raw_data.mediapipe_data.good_posture_seconds.toFixed(1)}s good posture
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(sessionData.session_summary.gesture_score)}`}>
              {Math.round(sessionData.session_summary.gesture_score)}%
            </div>
            <div className="text-sm text-gray-600">Hand Gestures</div>
            <Progress value={sessionData.session_summary.gesture_score} className="mt-2 h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {sessionData.raw_data.mediapipe_data.hand_gestures_seconds.toFixed(1)}s with gestures
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-purple-600" />
            </div>
            <div className={`text-2xl font-bold mb-1 ${getScoreColor(sessionData.session_summary.speaking_score)}`}>
              {Math.round(sessionData.session_summary.speaking_score)}%
            </div>
            <div className="text-sm text-gray-600">Speaking Activity</div>
            <Progress value={sessionData.session_summary.speaking_score} className="mt-2 h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {sessionData.raw_data.mediapipe_data.speaking_seconds.toFixed(1)}s active speaking
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold mb-1 text-orange-600">
              {Math.round(sessionData.session_summary.duration)}s
            </div>
            <div className="text-sm text-gray-600">Total Duration</div>
            <div className="text-xs text-gray-500 mt-1">
              {sessionData.raw_data.mediapipe_data.total_frames} frames analyzed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Comprehensive AI Analysis Report
          </CardTitle>
          <CardDescription>Generated by Gemini AI based on your real MediaPipe and speech data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{sessionData.report}</div>
          </div>
        </CardContent>
      </Card>

      {/* Session Conversation */}
      {sessionData.raw_data.text_chunks && sessionData.raw_data.text_chunks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Live AI Conversation</CardTitle>
            <CardDescription>Your speech and real-time Gemini AI responses during the session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sessionData.raw_data.text_chunks.map((chunk, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                    <p className="text-gray-800 mt-1">{chunk.text}</p>
                  </div>
                  <div>
                    <Badge variant="default" className="text-xs bg-purple-600">
                      Gemini AI
                    </Badge>
                    <p className="text-purple-800 mt-1 font-medium">{chunk.response}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{new Date(chunk.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
