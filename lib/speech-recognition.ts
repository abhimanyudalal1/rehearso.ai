// Speech Recognition Service for analyzing speech patterns

export interface SpeechMetrics {
  transcript: string
  duration: number
  fillerWordCount: number
  averageVolume: number
  eyeContactPercentage: number
  gestureCount: number
  wordsPerMinute: number
  pauseCount: number
}

class SpeechRecognitionService {
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private recognition: any = null
  private startTime = 0
  private volumeData: number[] = []
  private transcript = ""

  async initialize(): Promise<void> {
    // Initialize Web Speech API if available
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = "en-US"

      this.recognition.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " "
          }
        }
        if (finalTranscript) {
          this.transcript += finalTranscript
        }
      }
    }
  }

  async startRecording(stream: MediaStream): Promise<void> {
    this.startTime = Date.now()
    this.transcript = ""
    this.volumeData = []

    // Set up audio analysis
    try {
      this.audioContext = new AudioContext()
      const source = this.audioContext.createMediaStreamSource(stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      source.connect(this.analyser)

      // Start volume monitoring
      this.monitorVolume()
    } catch (error) {
      console.warn("Audio analysis not available:", error)
    }

    // Start speech recognition
    if (this.recognition) {
      try {
        this.recognition.start()
      } catch (error) {
        console.warn("Speech recognition not available:", error)
      }
    }

    // Set up media recorder for backup
    try {
      this.mediaRecorder = new MediaRecorder(stream)
      this.mediaRecorder.start()
    } catch (error) {
      console.warn("Media recording not available:", error)
    }
  }

  private monitorVolume(): void {
    if (!this.analyser) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkVolume = () => {
      if (!this.analyser) return

      this.analyser.getByteFrequencyData(dataArray)

      // Calculate average volume
      const sum = dataArray.reduce((a, b) => a + b, 0)
      const average = sum / bufferLength
      const normalizedVolume = average / 255

      this.volumeData.push(normalizedVolume)

      // Continue monitoring if still recording
      if (this.mediaRecorder?.state === "recording" || this.volumeData.length < 1000) {
        requestAnimationFrame(checkVolume)
      }
    }

    checkVolume()
  }

  stopRecording(): SpeechMetrics {
    const endTime = Date.now()
    const duration = Math.round((endTime - this.startTime) / 1000) // in seconds

    // Stop all recording services
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch (error) {
        console.warn("Error stopping speech recognition:", error)
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop()
    }

    if (this.audioContext) {
      this.audioContext.close()
    }

    // Calculate metrics
    const averageVolume =
      this.volumeData.length > 0 ? this.volumeData.reduce((a, b) => a + b, 0) / this.volumeData.length : 0.5

    // Count filler words (simplified)
    const fillerWords = ["um", "uh", "like", "you know", "so", "actually", "basically"]
    const fillerWordCount = fillerWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      return count + (this.transcript.match(regex) || []).length
    }, 0)

    // Calculate words per minute
    const wordCount = this.transcript.trim().split(/\s+/).length
    const wordsPerMinute = duration > 0 ? Math.round((wordCount / duration) * 60) : 0

    // Simulate eye contact and gesture detection (would use computer vision in real implementation)
    const eyeContactPercentage = Math.random() * 30 + 60 // 60-90%
    const gestureCount = Math.floor(Math.random() * 10) + 3 // 3-12 gestures

    // Count pauses (simplified - based on transcript punctuation)
    const pauseCount = (this.transcript.match(/[.!?]/g) || []).length

    return {
      transcript: this.transcript || "Speech recognition not available in this environment.",
      duration,
      fillerWordCount,
      averageVolume,
      eyeContactPercentage,
      gestureCount,
      wordsPerMinute,
      pauseCount,
    }
  }

  // Get real-time metrics during recording
  getCurrentMetrics(): Partial<SpeechMetrics> {
    const currentTime = Date.now()
    const duration = Math.round((currentTime - this.startTime) / 1000)

    const averageVolume =
      this.volumeData.length > 0 ? this.volumeData.reduce((a, b) => a + b, 0) / this.volumeData.length : 0.5

    return {
      duration,
      averageVolume,
      transcript: this.transcript,
    }
  }
}

export const speechRecognition = new SpeechRecognitionService()
