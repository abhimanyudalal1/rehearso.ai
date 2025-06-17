export interface SpeechMetrics {
  transcript: string
  fillerWordCount: number
  averageVolume: number
  eyeContactPercentage: number
  gestureCount: number
  duration: number
}

export class SpeechRecognitionService {
  private recognition: any | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private isRecording = false
  private transcript = ""
  private startTime = 0
  private volumeData: number[] = []
  private fillerWords = ["um", "uh", "er", "ah", "like", "you know", "so", "well"]

  async initialize(): Promise<void> {
    // Initialize Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = "en-US"

      this.recognition.onresult = (event) => {
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

    // Initialize Audio Context for volume analysis
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
    } catch (error) {
      console.error("Error initializing audio context:", error)
    }
  }

  async startRecording(stream: MediaStream): Promise<void> {
    if (!this.recognition || !this.audioContext || !this.analyser) {
      throw new Error("Speech recognition not initialized")
    }

    this.isRecording = true
    this.transcript = ""
    this.startTime = Date.now()
    this.volumeData = []

    // Start speech recognition
    this.recognition.start()

    // Connect microphone to analyser
    this.microphone = this.audioContext.createMediaStreamSource(stream)
    this.microphone.connect(this.analyser)

    // Start volume monitoring
    this.monitorVolume()
  }

  stopRecording(): SpeechMetrics {
    if (!this.isRecording) {
      throw new Error("Not currently recording")
    }

    this.isRecording = false
    const duration = (Date.now() - this.startTime) / 1000

    // Stop speech recognition
    if (this.recognition) {
      this.recognition.stop()
    }

    // Disconnect microphone
    if (this.microphone) {
      this.microphone.disconnect()
    }

    // Calculate metrics
    const fillerWordCount = this.countFillerWords(this.transcript)
    const averageVolume = this.calculateAverageVolume()

    // Simulate eye contact and gesture detection (would use computer vision in real implementation)
    const eyeContactPercentage = Math.floor(Math.random() * 40) + 60 // 60-100%
    const gestureCount = Math.floor(Math.random() * 10) + 5 // 5-15 gestures

    return {
      transcript: this.transcript.trim(),
      fillerWordCount,
      averageVolume,
      eyeContactPercentage,
      gestureCount,
      duration,
    }
  }

  private monitorVolume(): void {
    if (!this.isRecording || !this.analyser) return

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkVolume = () => {
      if (!this.isRecording) return

      this.analyser!.getByteFrequencyData(dataArray)
      const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
      this.volumeData.push(volume)

      requestAnimationFrame(checkVolume)
    }

    checkVolume()
  }

  private countFillerWords(transcript: string): number {
    const words = transcript.toLowerCase().split(/\s+/)
    return words.filter((word) => this.fillerWords.some((filler) => word.includes(filler))).length
  }

  private calculateAverageVolume(): number {
    if (this.volumeData.length === 0) return 0
    const sum = this.volumeData.reduce((acc, vol) => acc + vol, 0)
    return Math.round((sum / this.volumeData.length / 255) * 100) // Convert to percentage
  }

  isSupported(): boolean {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
  }
}

export const speechRecognition = new SpeechRecognitionService()
