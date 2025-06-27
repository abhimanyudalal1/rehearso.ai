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
  private signalingSocket: WebSocket | null = null // ADD THIS LINE
  
  private callState: CallState = {
    isConnected: false,
    remoteStreams: new Map(),
    participants: [],
  }

  // ICE servers configuration
  private iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  }
  // ADD THIS METHOD
  async joinRoom(roomId: string) {
    // Connect to the room's WebSocket for signaling
    this.signalingSocket = new WebSocket(`ws://localhost:8000/ws/room/${roomId}`)
    
    this.signalingSocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      
      if (message.type === "webrtc_offer") {
        this.handleRemoteOffer(message.from, message.offer)
      } else if (message.type === "webrtc_answer") {
        this.handleAnswer(message.from, message.answer)
      } else if (message.type === "webrtc_ice_candidate") {
        this.handleIceCandidate(message.from, message.candidate)
      }
    }
  }
  // ADD THIS METHOD
  async handleRemoteOffer(fromPeerId: string, offer: RTCSessionDescriptionInit) {
    const answer = await this.createAnswer(fromPeerId, offer)
    // Answer is automatically sent via WebSocket in createAnswer method
  }
  async initializeLocalStream(
    constraints: MediaStreamConstraints = { video: true, audio: true },
  ): Promise<MediaStream> {
    try {
      // Check if we already have a stream
      if (this.localStream) {
        return this.localStream
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.callState.localStream = this.localStream
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw new Error("Could not access camera or microphone. Please check permissions.")
    }
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.iceServers)

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          peerConnection.addTrack(track, this.localStream)
        }
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
      if (event.candidate && this.signalingSocket?.readyState === WebSocket.OPEN) {
        this.signalingSocket.send(JSON.stringify({
          type: "webrtc_ice_candidate",
          from: "current-user-id", // Replace with actual user ID
          to: peerId,
          candidate: event.candidate
        }))
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
    
    // ADD: Send offer via WebSocket
    if (this.signalingSocket?.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify({
        type: "webrtc_offer",
        from: "current-user-id", // Replace with actual user ID
        to: peerId,
        offer: offer
      }))
    }
    
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
    
    // ADD: Send answer via WebSocket
    if (this.signalingSocket?.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify({
        type: "webrtc_answer",
        from: "current-user-id", // Replace with actual user ID
        to: peerId,
        answer: answer
      }))
    }
    
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

    try {
      await peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error("Error adding ICE candidate:", error)
    }
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
    if (this.signalingSocket) {
      this.signalingSocket.close()
      this.signalingSocket = null
    }
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
