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
  private interimTranscript = "" // Added for live updates
  private startTime = 0
  private volumeData: number[] = []
  private fillerWords = ["um", "uh", "er", "ah", "like", "you know", "so", "well"]
  private websocket: WebSocket | null = null // WebSocket connection
  private onLiveFeedbackReceived?: (feedback: string) => void // Callback for live feedback

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
        let interimTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + " "
          } else {
            interimTranscript += transcriptPart + " "
          }
        }
        if (finalTranscript) {
          this.transcript += finalTranscript
          // Send final transcript parts to WebSocket if connected
          if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(finalTranscript.trim());
          }
        }
        // Update interim transcript for display or immediate feedback if needed on frontend
        this.interimTranscript = interimTranscript.trim();
        // You could also send interimTranscript to backend for faster, though less precise, live feedback
        // if (this.websocket && this.websocket.readyState === WebSocket.OPEN && interimTranscript.trim()) {
        //   this.websocket.send(interimTranscript.trim());
        // }
      }

      this.recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        // Handle specific errors like 'not-allowed' (microphone access denied)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings to use this feature.');
        }
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          // If recording is still active, restart recognition (due to browser limitations/timeouts)
          this.recognition.start();
        }
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
      alert("Speech Recognition is not supported in your browser. Please try Chrome for this feature.");
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
      throw new Error("Speech recognition not initialized or not supported.")
    }

    // Initialize WebSocket connection here
    // Replace with your actual FastAPI WebSocket URL
    this.websocket = new WebSocket("ws://localhost:8000/ws/audio"); // **IMPORTANT: Update this URL**

    this.websocket.onopen = () => {
      console.log("WebSocket connected to FastAPI.");
    };

    this.websocket.onmessage = (event) => {
      // Receive live feedback from FastAPI backend
      console.log("Live feedback from FastAPI:", event.data);
      if (this.onLiveFeedbackReceived) {
        this.onLiveFeedbackReceived(event.data);
      }
    };

    this.websocket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      if (this.isRecording) {
          // If WebSocket closes unexpectedly during recording, log it.
          // You might want to handle this more gracefully, e.g., attempt reconnect or notify user.
          console.warn("WebSocket closed unexpectedly during recording.");
      }
    };

    this.websocket.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    this.isRecording = true
    this.transcript = ""
    this.interimTranscript = ""
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
      this.recognition.stop() // This triggers onend, which might restart if isRecording is true
    }

    // Disconnect microphone
    if (this.microphone) {
      this.microphone.disconnect()
    }

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
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
    return Math.round((sum / this.volumeData.length / 255) * 100) // Convert to percentage (max volume is 255 from Uint8Array)
  }

  isSupported(): boolean {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
  }

  // New method to set a callback for live feedback
  public setOnLiveFeedbackReceived(callback: (feedback: string) => void): void {
    this.onLiveFeedbackReceived = callback;
  }
}

export const speechRecognition = new SpeechRecognitionService()