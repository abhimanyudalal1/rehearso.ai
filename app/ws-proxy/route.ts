import { type NextRequest, NextResponse } from "next/server"

// This endpoint helps with WebSocket connection issues
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const message = url.searchParams.get("message")

  if (!message) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 })
  }

  try {
    // Forward to your FastAPI backend
    const response = await fetch("http://127.0.0.1:8000/api/analyze-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error forwarding to backend:", error)

    // Fallback response if backend is not available
    const fallbackResponses = [
      "Great point! Can you elaborate on that?",
      "That's an interesting perspective. What led you to that conclusion?",
      "I appreciate your clarity. How does this relate to your main argument?",
      "Excellent articulation! Can you provide an example?",
      "That's a compelling argument. What evidence supports this view?",
      "Well structured! How might others view this differently?",
      "Clear communication! What are the implications of this?",
      "Good insight! Can you connect this to a broader theme?",
    ]

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

    return NextResponse.json({
      response: randomResponse,
      source: "fallback",
    })
  }
}
