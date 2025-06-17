import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface SpeechAnalysis {
  overallScore: number
  voiceClarity: number
  confidence: number
  bodyLanguage: number
  eyeContact: number
  grammarScore: number
  vocabularyScore: number
  pacingScore: number
  volumeScore: number
  strengths: string[]
  improvements: string[]
  recommendation: string
}

export interface LiveFeedback {
  type: "positive" | "warning" | "suggestion"
  message: string
  timestamp: number
}

export class AIAnalysisEngine {
  private feedbackMessages = {
    positive: [
      "Great eye contact! Keep it up.",
      "Your posture looks confident",
      "Nice hand gestures - they support your message",
      "Excellent voice modulation",
      "Strong opening statement",
      "Good pacing - easy to follow",
    ],
    warning: [
      "Try to reduce filler words like 'um' and 'uh'",
      "Consider speaking a bit louder",
      "Maintain more consistent eye contact",
      "Try to stand straighter",
      "Avoid looking down too often",
    ],
    suggestion: [
      "Take a brief pause to emphasize key points",
      "Use more hand gestures to engage audience",
      "Vary your tone to maintain interest",
      "Try moving slightly to engage different areas",
      "Consider using more specific examples",
    ],
  }

  generateLiveFeedback(): LiveFeedback {
    const types: Array<"positive" | "warning" | "suggestion"> = ["positive", "warning", "suggestion"]
    const type = types[Math.floor(Math.random() * types.length)]
    const messages = this.feedbackMessages[type]
    const message = messages[Math.floor(Math.random() * messages.length)]

    return {
      type,
      message,
      timestamp: Date.now(),
    }
  }

  async generateTopics(category: string, count = 5): Promise<string[]> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Generate ${count} engaging public speaking topics for the category "${category}". 
        Topics should be:
        - Thought-provoking but accessible
        - Suitable for 2-5 minute speeches
        - Encouraging personal reflection or opinion
        - Varied in scope and approach
        
        Return only the topics, one per line, without numbering.`,
      })

      return text
        .split("\n")
        .filter((topic) => topic.trim().length > 0)
        .slice(0, count)
    } catch (error) {
      console.error("Error generating topics:", error)
      // Fallback topics
      return [
        "Describe a moment that changed your perspective",
        "What skill do you wish everyone could learn?",
        "How has technology improved your daily life?",
        "What advice would you give your younger self?",
        "Describe your ideal work environment",
      ]
    }
  }

  async analyzeSpeech(
    transcript: string,
    duration: number,
    metrics: {
      fillerWordCount: number
      averageVolume: number
      eyeContactPercentage: number
      gestureCount: number
    },
  ): Promise<SpeechAnalysis> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Analyze this speech transcript and provide detailed feedback:

        Transcript: "${transcript}"
        Duration: ${duration} seconds
        Filler words detected: ${metrics.fillerWordCount}
        Average volume: ${metrics.averageVolume}%
        Eye contact: ${metrics.eyeContactPercentage}%
        Gesture count: ${metrics.gestureCount}

        Provide analysis in this JSON format:
        {
          "grammarScore": number (0-100),
          "vocabularyScore": number (0-100),
          "contentQuality": number (0-100),
          "strengths": ["strength1", "strength2", "strength3"],
          "improvements": ["improvement1", "improvement2", "improvement3"],
          "recommendation": "detailed recommendation paragraph"
        }`,
      })

      const aiAnalysis = JSON.parse(text)

      // Calculate derived scores
      const voiceClarity = Math.max(0, 100 - metrics.fillerWordCount * 5)
      const confidence = Math.min(100, metrics.averageVolume * 0.8 + metrics.eyeContactPercentage * 0.2)
      const bodyLanguage = Math.min(100, metrics.eyeContactPercentage * 0.6 + metrics.gestureCount * 2)
      const overallScore = Math.round(
        aiAnalysis.grammarScore * 0.2 +
          aiAnalysis.vocabularyScore * 0.2 +
          voiceClarity * 0.2 +
          confidence * 0.2 +
          bodyLanguage * 0.2,
      )

      return {
        overallScore,
        voiceClarity,
        confidence,
        bodyLanguage,
        eyeContact: metrics.eyeContactPercentage,
        grammarScore: aiAnalysis.grammarScore,
        vocabularyScore: aiAnalysis.vocabularyScore,
        pacingScore: duration > 0 ? Math.min(100, (transcript.split(" ").length / duration) * 60) : 0,
        volumeScore: metrics.averageVolume,
        strengths: aiAnalysis.strengths,
        improvements: aiAnalysis.improvements,
        recommendation: aiAnalysis.recommendation,
      }
    } catch (error) {
      console.error("Error analyzing speech:", error)

      // Fallback analysis
      return {
        overallScore: 75,
        voiceClarity: 80,
        confidence: 70,
        bodyLanguage: 75,
        eyeContact: metrics.eyeContactPercentage,
        grammarScore: 85,
        vocabularyScore: 80,
        pacingScore: 75,
        volumeScore: metrics.averageVolume,
        strengths: ["Clear articulation", "Good content structure", "Appropriate speaking pace"],
        improvements: ["Reduce filler words", "Maintain more eye contact", "Use more varied vocabulary"],
        recommendation:
          "Focus on practicing without filler words and maintaining consistent eye contact with your audience.",
      }
    }
  }
}

export const aiAnalysis = new AIAnalysisEngine()
