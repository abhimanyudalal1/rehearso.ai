import dotenv from 'dotenv'
dotenv.config()


interface GeminiAPIKey {
  key: string
  isActive: boolean
  lastUsed: number
}

class GeminiKeyManager {
  private keys: GeminiAPIKey[] = [
  { key: process.env.GEMINI_API_KEY_1!, isActive: true, lastUsed: 0 },
  { key: process.env.GEMINI_API_KEY_2!, isActive: true, lastUsed: 0 },
  { key: process.env.GEMINI_API_KEY_3!, isActive: true, lastUsed: 0 },
]


  getNextKey(): string {
    // Find the key that was used least recently
    const availableKeys = this.keys.filter((k) => k.isActive)
    if (availableKeys.length === 0) {
      throw new Error("No active Gemini API keys available")
    }

    const oldestKey = availableKeys.reduce((oldest, current) => (current.lastUsed < oldest.lastUsed ? current : oldest))

    oldestKey.lastUsed = Date.now()
    return oldestKey.key
  }

  markKeyInactive(key: string) {
    const keyObj = this.keys.find((k) => k.key === key)
    if (keyObj) {
      keyObj.isActive = false
    }
  }
}

const keyManager = new GeminiKeyManager()

export async function generateGeminiFeedback(sessionData: any): Promise<string> {
  const prompt = `
You are a comprehensive speech and presentation coach. Based on the following data from a speech session, provide a detailed analysis and recommendations:

Session Duration: ${sessionData.mediapipe_data.session_duration} seconds
Good Posture Time: ${sessionData.mediapipe_data.good_posture_seconds} seconds (${((sessionData.mediapipe_data.good_posture_seconds / sessionData.mediapipe_data.session_duration) * 100).toFixed(1)}%)
Hand Gestures Time: ${sessionData.mediapipe_data.hand_gestures_seconds} seconds (${((sessionData.mediapipe_data.hand_gestures_seconds / sessionData.mediapipe_data.session_duration) * 100).toFixed(1)}%)
Speaking Activity Time: ${sessionData.mediapipe_data.speaking_seconds} seconds (${((sessionData.mediapipe_data.speaking_seconds / sessionData.mediapipe_data.session_duration) * 100).toFixed(1)}%)
Total Frames Analyzed: ${sessionData.mediapipe_data.total_frames}

Speech Transcripts and AI Responses:
${sessionData.text_chunks
  .map(
    (chunk: any, index: number) => `
${index + 1}. User said: "${chunk.text}"
   AI Response: "${chunk.response}"
`,
  )
  .join("\n")}

Please provide:
1. Overall Performance Summary (2-3 sentences)
2. Strengths identified from the data
3. Areas for improvement based on the metrics
4. Specific recommendations for better public speaking
5. Score out of 10 for overall presentation skills

Keep the analysis comprehensive but concise, focusing on the real data provided.
`

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = keyManager.getNextKey()

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit hit, try next key
          keyManager.markKeyInactive(apiKey)
          continue
        }
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text
      } else {
        throw new Error("Invalid response format from Gemini API")
      }
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt + 1} failed:`, error)

      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error("Failed to generate feedback after all retries")
}
