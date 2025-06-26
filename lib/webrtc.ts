// WebRTC Service for video calling and peer connections

export interface PeerConnection {
  id: string
  connection: RTCPeerConnection
  stream?: MediaStream
}

export interface CallState {
  isConnected: boolean
  localStream?: MediaStream
  remoteStreams: Map<string, MediaStream>
  participants: string[]
}

class WebRTCService {
  private localStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private callState: CallState = {
    isConnected: false,
    remoteStreams: new Map(),
    participants: [],
  }

  // ICE servers configuration
  private iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  }

  async initializeLocalStream(
    constraints: MediaStreamConstraints = { video: true, audio: true },
  ): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw new Error("Could not access camera or microphone")
    }
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.iceServers)

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      this.callState.remoteStreams.set(peerId, remoteStream)
      this.onRemoteStreamAdded?.(peerId, remoteStream)
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate?.(peerId, event.candidate)
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer ${peerId} connection state:`, peerConnection.connectionState)
      if (peerConnection.connectionState === "connected") {
        this.callState.isConnected = true
        if (!this.callState.participants.includes(peerId)) {
          this.callState.participants.push(peerId)
        }
      } else if (peerConnection.connectionState === "disconnected" || peerConnection.connectionState === "failed") {
        this.removePeer(peerId)
      }
    }

    this.peerConnections.set(peerId, peerConnection)
    return peerConnection
  }

  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(peerId)
    if (!peerConnection) {
      throw new Error(`No peer connection found for ${peerId}`)
    }

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    let peerConnection = this.peerConnections.get(peerId)
    if (!peerConnection) {
      peerConnection = await this.createPeerConnection(peerId)
    }

    await peerConnection.setRemoteDescription(offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    return answer
  }

  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(peerId)
    if (!peerConnection) {
      throw new Error(`No peer connection found for ${peerId}`)
    }

    await peerConnection.setRemoteDescription(answer)
  }

  async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(peerId)
    if (!peerConnection) {
      console.warn(`No peer connection found for ${peerId}`)
      return
    }

    await peerConnection.addIceCandidate(candidate)
  }

  removePeer(peerId: string): void {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(peerId)
    }

    this.callState.remoteStreams.delete(peerId)
    this.callState.participants = this.callState.participants.filter((id) => id !== peerId)

    if (this.callState.participants.length === 0) {
      this.callState.isConnected = false
    }

    this.onPeerDisconnected?.(peerId)
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  async switchCamera(): Promise<void> {
    if (!this.localStream) return

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (!videoTrack) return

    try {
      // Get current constraints
      const constraints = videoTrack.getConstraints()
      const currentFacingMode = constraints.facingMode

      // Switch between front and back camera
      const newFacingMode = currentFacingMode === "user" ? "environment" : "user"

      // Stop current track
      videoTrack.stop()

      // Get new stream with switched camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true,
      })

      const newVideoTrack = newStream.getVideoTracks()[0]

      // Replace track in all peer connections
      this.peerConnections.forEach((peerConnection) => {
        const sender = peerConnection.getSenders().find((s) => s.track && s.track.kind === "video")
        if (sender) {
          sender.replaceTrack(newVideoTrack)
        }
      })

      // Update local stream
      this.localStream.removeTrack(videoTrack)
      this.localStream.addTrack(newVideoTrack)
    } catch (error) {
      console.error("Error switching camera:", error)
    }
  }

  endCall(): void {
    // Close all peer connections
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.close()
    })
    this.peerConnections.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // Reset call state
    this.callState = {
      isConnected: false,
      remoteStreams: new Map(),
      participants: [],
    }
  }

  getCallState(): CallState {
    return { ...this.callState, localStream: this.localStream || undefined }
  }

  // Event handlers (to be set by the consuming component)
  onRemoteStreamAdded?: (peerId: string, stream: MediaStream) => void
  onPeerDisconnected?: (peerId: string) => void
  onIceCandidate?: (peerId: string, candidate: RTCIceCandidate) => void
}

export const webrtcService = new WebRTCService()
