import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()

    // Forward the session data to your FastAPI backend
    const response = await fetch(`${BACKEND_URL}/submit-session-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result = await response.json()

    // Enhance the response with additional processing if needed
    const enhancedResult = {
      ...result,
      processed_at: new Date().toISOString(),
      detailed_metrics: sessionData.detailed_metrics || null,
    }

    return NextResponse.json(enhancedResult)
  } catch (error) {
    console.error("Error processing session data:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to process session data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
