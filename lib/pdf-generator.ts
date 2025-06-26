import jsPDF from "jspdf"

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

export async function generatePDF(feedback: SessionFeedback) {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  let yPosition = 20

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return y + lines.length * fontSize * 0.4
  }

  // Header
  pdf.setFontSize(24)
  pdf.setFont("helvetica", "bold")
  pdf.text("AI Speech Analysis Report", pageWidth / 2, yPosition, { align: "center" })
  yPosition += 15

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 8
  pdf.text(`Session ID: ${feedback.session_id}`, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 20

  // Overall Score
  const overallScore = Math.round(
    (feedback.session_summary.posture_score +
      feedback.session_summary.gesture_score +
      feedback.session_summary.speaking_score) /
      3,
  )

  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")
  pdf.text("Performance Summary", 20, yPosition)
  yPosition += 10

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "normal")
  pdf.text(`Overall Score: ${overallScore}/100`, 20, yPosition)
  yPosition += 8
  pdf.text(`Session Duration: ${Math.round(feedback.session_summary.duration)} seconds`, 20, yPosition)
  yPosition += 8
  pdf.text(`AI Interactions: ${feedback.session_summary.total_speech_chunks}`, 20, yPosition)
  yPosition += 15

  // Real-time Analysis Metrics
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("MediaPipe Analysis Results", 20, yPosition)
  yPosition += 10

  pdf.setFontSize(12)
  pdf.setFont("helvetica", "normal")
  pdf.text(`Posture Quality: ${Math.round(feedback.session_summary.posture_score)}%`, 20, yPosition)
  yPosition += 6
  pdf.text(`Hand Gestures: ${Math.round(feedback.session_summary.gesture_score)}%`, 20, yPosition)
  yPosition += 6
  pdf.text(`Speaking Activity: ${Math.round(feedback.session_summary.speaking_score)}%`, 20, yPosition)
  yPosition += 10

  pdf.text(`Total Frames Analyzed: ${feedback.raw_data.mediapipe_data.total_frames}`, 20, yPosition)
  yPosition += 6
  pdf.text(`Good Posture Time: ${feedback.raw_data.mediapipe_data.good_posture_seconds.toFixed(1)}s`, 20, yPosition)
  yPosition += 6
  pdf.text(`Gesture Time: ${feedback.raw_data.mediapipe_data.hand_gestures_seconds.toFixed(1)}s`, 20, yPosition)
  yPosition += 6
  pdf.text(`Speaking Time: ${feedback.raw_data.mediapipe_data.speaking_seconds.toFixed(1)}s`, 20, yPosition)
  yPosition += 15

  // Gemini AI Analysis Report
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text("Gemini AI Comprehensive Analysis", 20, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  yPosition = addWrappedText(feedback.report, 20, yPosition, pageWidth - 40, 10)
  yPosition += 15

  // Speech Conversation (first 5 exchanges)
  if (feedback.raw_data.text_chunks && feedback.raw_data.text_chunks.length > 0) {
    if (yPosition > pageHeight - 100) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("Live AI Conversation Highlights", 20, yPosition)
    yPosition += 10

    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")

    feedback.raw_data.text_chunks.slice(0, 5).forEach((chunk, index) => {
      if (yPosition > pageHeight - 60) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFont("helvetica", "bold")
      pdf.text(`${index + 1}. You said:`, 20, yPosition)
      yPosition += 5

      pdf.setFont("helvetica", "normal")
      yPosition = addWrappedText(chunk.text, 25, yPosition, pageWidth - 50, 9)
      yPosition += 3

      pdf.setFont("helvetica", "bold")
      pdf.text("Gemini AI Response:", 25, yPosition)
      yPosition += 5

      pdf.setFont("helvetica", "italic")
      yPosition = addWrappedText(chunk.response, 30, yPosition, pageWidth - 55, 9)
      yPosition += 8
    })

    if (feedback.raw_data.text_chunks.length > 5) {
      pdf.setFont("helvetica", "normal")
      pdf.text(`... and ${feedback.raw_data.text_chunks.length - 5} more AI interactions`, 20, yPosition)
    }
  }

  // Footer
  const footerY = pageHeight - 20
  pdf.setFontSize(8)
  pdf.setFont("helvetica", "italic")
  pdf.text(
    "Generated by AI Speech Practice Platform - Real MediaPipe Analysis & Gemini AI Feedback",
    pageWidth / 2,
    footerY,
    { align: "center" },
  )

  // Save the PDF
  const fileName = `speech-analysis-${feedback.session_id.slice(-8)}-${new Date().toISOString().split("T")[0]}.pdf`
  pdf.save(fileName)
}
