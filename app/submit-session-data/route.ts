import { type NextRequest, NextResponse } from "next/server"
import { generateGeminiFeedback } from "@/lib/gemini-client"

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()

    // Validate session data
    if (!sessionData.mediapipe_data || !sessionData.text_chunks) {
      return NextResponse.json({ status: "error", message: "Invalid session data format" }, { status: 400 })
    }

    // Calculate session summary metrics
    const duration = sessionData.mediapipe_data.session_duration
    const postureScore = Math.round((sessionData.mediapipe_data.good_posture_seconds / duration) * 100)
    const gestureScore = Math.round((sessionData.mediapipe_data.hand_gestures_seconds / duration) * 100)
    const speakingScore = Math.round((sessionData.mediapipe_data.speaking_seconds / duration) * 100)

    // Generate comprehensive AI feedback using Gemini
    let report = ""
    try {
      report = await generateGeminiFeedback(sessionData)
    } catch (error) {
      console.error("Error generating Gemini feedback:", error)
      // Fallback to basic analysis if Gemini fails
      report = `
Session Analysis Summary:

Overall Performance: You completed a ${duration.toFixed(1)}-second speaking session with ${sessionData.text_chunks.length} AI interactions.

Key Metrics:
- Posture Quality: ${postureScore}% of the time maintained good posture
- Hand Gestures: ${gestureScore}% of the time used effective gestures  
- Speaking Activity: ${speakingScore}% of the time actively speaking

Strengths:
${postureScore >= 70 ? "- Excellent posture maintenance throughout the session" : ""}
${gestureScore >= 60 ? "- Good use of hand gestures for expression" : ""}
${speakingScore >= 70 ? "- Strong speaking engagement and activity" : ""}
${sessionData.text_chunks.length >= 3 ? "- Active participation with multiple AI interactions" : ""}

Areas for Improvement:
${postureScore < 70 ? "- Focus on maintaining better posture throughout your speech" : ""}
${gestureScore < 60 ? "- Incorporate more natural hand gestures to enhance expression" : ""}
${speakingScore < 70 ? "- Increase speaking activity and vocal engagement" : ""}

Recommendations:
- Continue practicing regularly to build confidence and consistency
- Focus on the areas that scored below 70% for targeted improvement
- Use the AI feedback to refine your speaking style and content

Overall Score: ${Math.round((postureScore + gestureScore + speakingScore) / 3)}/100
`
    }

    // Store session data (you can implement database storage here)
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Save to localStorage for now (in production, save to database)
    const sessionResult = {
      session_id: sessionId,
      status: "success",
      report: report,
      session_summary: {
        duration: duration,
        posture_score: postureScore,
        gesture_score: gestureScore,
        speaking_score: speakingScore,
        total_speech_chunks: sessionData.text_chunks.length,
      },
      raw_data: sessionData,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(sessionResult)
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
