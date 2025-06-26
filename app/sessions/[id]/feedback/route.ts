import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id

    // In a real implementation, you would fetch from your database
    // For now, we'll return a mock response or try to fetch from your backend
    const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"

    try {
      const response = await fetch(`${BACKEND_URL}/sessions/${sessionId}/feedback`)
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (backendError) {
      console.warn("Backend not available, using fallback data")
    }

    // Fallback response if backend is not available
    return NextResponse.json({
      status: "success",
      report: "Session feedback is being processed. Please check back in a few moments.",
      session_summary: {
        duration: 120,
        posture_score: 75,
        gesture_score: 80,
        speaking_score: 85,
        total_speech_chunks: 5,
      },
    })
  } catch (error) {
    console.error("Error fetching session feedback:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch session feedback",
      },
      { status: 500 },
    )
  }
}
