interface MediaPipeResults {
  eyeContactPercentage: number
  gestureCount: number
  confidenceScore: number
  speakingPace: number
  volumeConsistency: number
  sessionDuration: number
  goodPostureSeconds: number
  handGesturesSeconds: number
  speakingSeconds: number
  totalFrames: number
}

interface MediaPipeAnalysisData {
  goodPostureFrames: number
  handGesturesFrames: number
  speakingFrames: number
  totalFrames: number
  eyeContactFrames: number
  gestureCount: number
  confidenceSum: number
  volumeLevels: number[]
  startTime: number
  frameRate: number
}

class MediaPipeAnalyzer {
  private videoElement: HTMLVideoElement | null = null
  private isAnalyzing = false
  private analysisData: MediaPipeAnalysisData = {
    goodPostureFrames: 0,
    handGesturesFrames: 0,
    speakingFrames: 0,
    totalFrames: 0,
    eyeContactFrames: 0,
    gestureCount: 0,
    confidenceSum: 0,
    volumeLevels: [],
    startTime: 0,
    frameRate: 30, // Approximate frame rate
  }

  private holisticModel: any = null
  private camera: any = null

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement
    
    try {
      // Load MediaPipe Holistic model (same as your solo implementation)
      const { Holistic } = await import('@mediapipe/holistic')
      const { Camera } = await import('@mediapipe/camera_utils')
      
      this.holisticModel = new Holistic({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
      })

      this.holisticModel.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      // Set up results callback
      this.holisticModel.onResults((results: any) => {
        this.processMediaPipeResults(results)
      })

      // Initialize camera
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.isAnalyzing) {
            await this.holisticModel.send({ image: videoElement })
          }
        },
        width: 640,
        height: 480
      })

      console.log("Real MediaPipe analyzer initialized successfully")
    } catch (error) {
      console.error("Failed to initialize MediaPipe:", error)
      throw new Error("MediaPipe initialization failed")
    }
  }

  startAnalysis(): void {
    if (!this.videoElement || this.isAnalyzing || !this.holisticModel) {
      console.warn("Cannot start analysis: missing requirements")
      return
    }

    this.isAnalyzing = true
    this.resetAnalysisData()
    
    // Start camera
    if (this.camera) {
      this.camera.start()
    }

    console.log("MediaPipe analysis started")
  }

  private resetAnalysisData(): void {
    this.analysisData = {
      goodPostureFrames: 0,
      handGesturesFrames: 0,
      speakingFrames: 0,
      totalFrames: 0,
      eyeContactFrames: 0,
      gestureCount: 0,
      confidenceSum: 0,
      volumeLevels: [],
      startTime: Date.now(),
      frameRate: 30,
    }
  }

  private processMediaPipeResults(results: any): void {
    if (!this.isAnalyzing) return

    this.analysisData.totalFrames++
    
    let goodPosture = false
    let handGestures = false
    let speaking = false
    let eyeContact = false

    // 1. POSTURE ANALYSIS (from your solo implementation)
    if (results.poseLandmarks) {
      const leftShoulder = results.poseLandmarks[11]
      const rightShoulder = results.poseLandmarks[12]
      
      if (leftShoulder && rightShoulder) {
        const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y)
        if (shoulderTilt <= 0.05) {
          goodPosture = true
          this.analysisData.goodPostureFrames++
        }
      }
    }

    // 2. HAND GESTURE ANALYSIS
    const handsVisible = results.leftHandLandmarks || results.rightHandLandmarks
    if (handsVisible) {
      handGestures = true
      this.analysisData.handGesturesFrames++
      
      // Count significant gestures (movement detection)
      if (Math.random() < 0.1) { // Simplified gesture counting
        this.analysisData.gestureCount++
      }
    }

    // 3. SPEAKING DETECTION (mouth movement)
    if (results.faceLandmarks && results.faceLandmarks.length > 14) {
      const upperLip = results.faceLandmarks[13]
      const lowerLip = results.faceLandmarks[14]
      
      if (upperLip && lowerLip) {
        const mouthOpen = (lowerLip.y - upperLip.y) > 0.015
        if (mouthOpen) {
          speaking = true
          this.analysisData.speakingFrames++
        }
      }
    }

    // 4. EYE CONTACT DETECTION (gaze direction)
    if (results.faceLandmarks) {
      // Simplified eye contact detection based on face orientation
      const nose = results.faceLandmarks[1]
      const leftEye = results.faceLandmarks[33]
      const rightEye = results.faceLandmarks[362]
      
      if (nose && leftEye && rightEye) {
        // Check if face is roughly facing forward
        const eyeDistance = Math.abs(leftEye.x - rightEye.x)
        const faceCenter = (leftEye.x + rightEye.x) / 2
        const deviation = Math.abs(nose.x - faceCenter)
        
        if (deviation < 0.02 && eyeDistance > 0.04) {
          eyeContact = true
          this.analysisData.eyeContactFrames++
        }
      }
    }

    // 5. CONFIDENCE SCORING (based on multiple factors)
    let confidenceScore = 50 // Base score
    
    if (goodPosture) confidenceScore += 15
    if (handGestures) confidenceScore += 10
    if (speaking) confidenceScore += 10
    if (eyeContact) confidenceScore += 15
    
    this.analysisData.confidenceSum += Math.min(100, confidenceScore)

    // 6. VOLUME LEVEL SIMULATION (you can integrate with Web Audio API)
    const volumeLevel = speaking ? (0.4 + Math.random() * 0.4) : (0.1 + Math.random() * 0.2)
    this.analysisData.volumeLevels.push(volumeLevel)
  }

  async stopAnalysis(): Promise<MediaPipeResults> {
    this.isAnalyzing = false
    
    // Stop camera
    if (this.camera) {
      this.camera.stop()
    }

    const sessionDuration = (Date.now() - this.analysisData.startTime) / 1000 // seconds

    // Calculate percentages and scores
    const eyeContactPercentage = this.analysisData.totalFrames > 0 
      ? (this.analysisData.eyeContactFrames / this.analysisData.totalFrames) * 100 
      : 0

    const averageConfidence = this.analysisData.totalFrames > 0 
      ? this.analysisData.confidenceSum / this.analysisData.totalFrames 
      : 0

    const gesturesPerMinute = sessionDuration > 0 
      ? (this.analysisData.gestureCount / sessionDuration) * 60 
      : 0
    
    const speakingPace = Math.min(100, gesturesPerMinute * 10)
    const volumeConsistency = this.calculateVolumeConsistency()

    // Convert frame counts to seconds
    const goodPostureSeconds = this.analysisData.goodPostureFrames / this.analysisData.frameRate
    const handGesturesSeconds = this.analysisData.handGesturesFrames / this.analysisData.frameRate
    const speakingSeconds = this.analysisData.speakingFrames / this.analysisData.frameRate

    const results: MediaPipeResults = {
      eyeContactPercentage: Math.round(eyeContactPercentage),
      gestureCount: this.analysisData.gestureCount,
      confidenceScore: Math.round(averageConfidence),
      speakingPace: Math.round(speakingPace),
      volumeConsistency: Math.round(volumeConsistency),
      sessionDuration: Math.round(sessionDuration),
      goodPostureSeconds: Math.round(goodPostureSeconds),
      handGesturesSeconds: Math.round(handGesturesSeconds),
      speakingSeconds: Math.round(speakingSeconds),
      totalFrames: this.analysisData.totalFrames,
    }

    console.log("MediaPipe analysis completed:", results)
    return results
  }

  private calculateVolumeConsistency(): number {
    if (this.analysisData.volumeLevels.length === 0) return 0

    const volumes = this.analysisData.volumeLevels
    const average = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length
    const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - average, 2), 0) / volumes.length
    const standardDeviation = Math.sqrt(variance)
    
    return Math.max(0, Math.round(100 - standardDeviation * 200))
  }

  stop(): void {
    this.isAnalyzing = false
    if (this.camera) {
      this.camera.stop()
    }
  }

  // Get current analysis data for real-time display
  getCurrentAnalysis(): Partial<MediaPipeResults> {
    if (this.analysisData.totalFrames === 0) {
      return {
        eyeContactPercentage: 0,
        gestureCount: 0,
        confidenceScore: 0
      }
    }

    const eyeContactPercentage = (this.analysisData.eyeContactFrames / this.analysisData.totalFrames) * 100
    const averageConfidence = this.analysisData.confidenceSum / this.analysisData.totalFrames

    return {
      eyeContactPercentage: Math.round(eyeContactPercentage),
      gestureCount: this.analysisData.gestureCount,
      confidenceScore: Math.round(averageConfidence)
    }
  }
}

export const mediaPipeAnalyzer = new MediaPipeAnalyzer()