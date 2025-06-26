// AI Analysis Service for Speech Practice Platform

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
  type: "positive" | "improvement" | "neutral"
  message: string
  timestamp: number
}

class AIAnalysisService {
  // Generate speaking topics based on category
  async generateTopics(category: string, count = 5): Promise<string[]> {
    // Simulate AI topic generation with realistic topics
    const topicCategories = {
      "Public Speaking": [
        "The impact of social media on modern communication",
        "Why learning a new language benefits your career",
        "The importance of work-life balance in today's world",
        "How technology is changing the way we learn",
        "The role of creativity in problem-solving",
        "Why failure is essential for personal growth",
        "The benefits of reading in the digital age",
        "How to build meaningful relationships in a digital world",
        "The importance of mental health awareness",
        "Why volunteering makes a difference in communities",
      ],
      "Everyday Conversations": [
        "Describe your ideal weekend",
        "What's the most interesting place you've visited?",
        "How has technology changed communication?",
        "What skill would you like to learn and why?",
        "Describe a person who has influenced your life",
        "What's your favorite way to relax after a busy day?",
        "If you could have dinner with anyone, who would it be?",
        "What's the best advice you've ever received?",
        "Describe a challenge you overcame recently",
        "What hobby would you recommend to others?",
      ],
      Business: [
        "The future of remote work",
        "How to build effective teams",
        "The importance of customer feedback",
        "Strategies for managing workplace stress",
        "The role of innovation in business success",
        "Building a strong company culture",
        "The impact of artificial intelligence on jobs",
        "Effective leadership in challenging times",
        "The importance of continuous learning in careers",
        "How to give constructive feedback",
      ],
    }

    const topics = topicCategories[category as keyof typeof topicCategories] || topicCategories["Public Speaking"]

    // Shuffle and return requested count
    const shuffled = [...topics].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Generate live feedback during speaking
  generateLiveFeedback(): LiveFeedback {
    const feedbackOptions = [
      { type: "positive" as const, message: "Great eye contact! Keep it up." },
      { type: "positive" as const, message: "Your posture looks confident." },
      { type: "positive" as const, message: "Nice hand gestures - they support your message." },
      { type: "positive" as const, message: "Good speaking pace, very clear." },
      { type: "improvement" as const, message: "Try to reduce filler words like 'um' and 'uh'." },
      { type: "improvement" as const, message: "Consider speaking a bit louder." },
      { type: "improvement" as const, message: "Take a brief pause to emphasize key points." },
      { type: "improvement" as const, message: "Try to vary your tone for more engagement." },
      { type: "neutral" as const, message: "Remember to breathe naturally." },
      { type: "neutral" as const, message: "You're doing well, stay focused." },
    ]

    const randomFeedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]

    return {
      ...randomFeedback,
      timestamp: Date.now(),
    }
  }

  // Analyze completed speech
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
    // Simulate AI analysis processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Calculate scores based on metrics (simplified simulation)
    const wordCount = transcript.split(" ").length
    const wordsPerMinute = Math.round((wordCount / duration) * 60)

    // Voice clarity based on volume and filler words
    const voiceClarity = Math.max(60, 100 - metrics.fillerWordCount * 5 - (metrics.averageVolume < 0.3 ? 20 : 0))

    // Confidence based on volume, pace, and gestures
    const confidence = Math.max(50, 85 - (wordsPerMinute < 120 ? 10 : 0) + (metrics.gestureCount > 5 ? 10 : 0))

    // Body language based on eye contact and gestures
    const bodyLanguage = Math.max(60, Math.round(metrics.eyeContactPercentage * 0.8 + metrics.gestureCount * 2))

    // Eye contact score
    const eyeContact = Math.round(metrics.eyeContactPercentage)

    // Grammar and vocabulary (simulated based on transcript length and complexity)
    const grammarScore = Math.max(70, 90 - metrics.fillerWordCount * 2)
    const vocabularyScore = Math.max(65, Math.min(95, wordCount > 50 ? 85 : 75))

    // Pacing score based on words per minute
    const pacingScore =
      wordsPerMinute >= 120 && wordsPerMinute <= 160 ? 90 : wordsPerMinute >= 100 && wordsPerMinute <= 180 ? 80 : 70

    // Volume score
    const volumeScore = metrics.averageVolume >= 0.4 ? 85 : 70

    // Overall score (weighted average)
    const overallScore = Math.round(
      (voiceClarity * 0.2 +
        confidence * 0.2 +
        bodyLanguage * 0.15 +
        grammarScore * 0.15 +
        vocabularyScore * 0.1 +
        pacingScore * 0.1 +
        volumeScore * 0.1) *
        1.0,
    )

    // Generate strengths and improvements
    const strengths = []
    const improvements = []

    if (voiceClarity >= 80) strengths.push("Clear articulation and pronunciation")
    if (confidence >= 80) strengths.push("Confident delivery and presence")
    if (bodyLanguage >= 75) strengths.push("Good use of body language and gestures")
    if (grammarScore >= 85) strengths.push("Strong grammar and sentence structure")
    if (pacingScore >= 85) strengths.push("Appropriate speaking pace")

    if (voiceClarity < 75) improvements.push("Reduce filler words and speak more clearly")
    if (confidence < 75) improvements.push("Project more confidence through voice and posture")
    if (bodyLanguage < 70) improvements.push("Maintain more eye contact with the audience")
    if (metrics.fillerWordCount > 5) improvements.push("Practice speaking without filler words")
    if (volumeScore < 80) improvements.push("Speak with more volume and energy")

    // Ensure we have at least some feedback
    if (strengths.length === 0) {
      strengths.push("Good effort in completing the practice session")
    }
    if (improvements.length === 0) {
      improvements.push("Continue practicing to build confidence")
    }

    // Generate personalized recommendation
    const recommendation = this.generateRecommendation(overallScore, improvements)

    return {
      overallScore,
      voiceClarity,
      confidence,
      bodyLanguage,
      eyeContact,
      grammarScore,
      vocabularyScore,
      pacingScore,
      volumeScore,
      strengths,
      improvements,
      recommendation,
    }
  }

  private generateRecommendation(overallScore: number, improvements: string[]): string {
    if (overallScore >= 85) {
      return "Excellent work! You're demonstrating strong speaking skills. Continue practicing to maintain this level and consider challenging yourself with more complex topics."
    } else if (overallScore >= 75) {
      return `Good progress! Focus on ${improvements[0]?.toLowerCase() || "continuing to practice"}. Your foundation is solid - keep building on these skills.`
    } else if (overallScore >= 65) {
      return `You're on the right track! The main areas to focus on are ${improvements.slice(0, 2).join(" and ").toLowerCase()}. Regular practice will help you improve quickly.`
    } else {
      return `Keep practicing! Focus on the basics: ${improvements[0]?.toLowerCase() || "speaking clearly and confidently"}. Every practice session helps you improve.`
    }
  }
}

export const aiAnalysis = new AIAnalysisService()
