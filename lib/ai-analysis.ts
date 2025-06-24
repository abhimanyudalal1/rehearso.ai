// lib\ai-analysis.ts

import { generateText } from "ai";
// import { openai } from "@ai-sdk/openai"; // REMOVE OR COMMENT OUT THIS LINE
import { google } from "@ai-sdk/google"; // ADD THIS LINE

// ... (rest of your interfaces and class) ...

export class AIAnalysisEngine {
  // ... (your existing feedbackMessages and generateLiveFeedback method) ...

  async generateTopics(category: string, count = 5): Promise<string[]> {
    try {
      const { text } = await generateText({
        model: google("models/gemini-pro"), // CHANGED: Use google() and specify the Gemini Pro model
        // OR model: google("models/gemini-1.5-pro-latest"), // For the latest powerful model
        prompt: `Generate <span class="math-inline">\{count\} engaging public speaking topics for the category "</span>{category}".
        Topics should be:
        - Thought-provoking but accessible
        - Suitable for 2-5 minute speeches
        - Encouraging personal reflection or opinion
        - Varied in scope and approach

        Return only the topics, one per line, without numbering.`,
      });

      return text
        .split("\n")
        .filter((topic) => topic.trim().length > 0)
        .slice(0, count);
    } catch (error) {
      console.error("Error generating topics:", error);
      // Fallback topics
      return [
        "Describe a moment that changed your perspective",
        "What skill do you wish everyone could learn?",
        "How has technology improved your daily life?",
        "What advice would you give your younger self?",
        "Describe your ideal work environment",
      ];
    }
  }

  async analyzeSpeech(
    transcript: string,
    duration: number,
    metrics: {
      fillerWordCount: number;
      averageVolume: number;
      eyeContactPercentage: number;
      gestureCount: number;
    },
  ): Promise<SpeechAnalysis> {
    try {
      const { text } = await generateText({
        model: google("models/gemini-pro"), // CHANGED: Use google() and specify the Gemini Pro model
        // OR model: google("models/gemini-1.5-pro-latest"), // For the latest powerful model
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
      });

      const aiAnalysis = JSON.parse(text);

      // ... (rest of your analysis logic) ...

    } catch (error) {
      console.error("Error analyzing speech:", error);
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
      };
    }
  }
}

export const aiAnalysis = new AIAnalysisEngine();