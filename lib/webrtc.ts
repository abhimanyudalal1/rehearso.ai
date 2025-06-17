export interface PeerConnection {
  id: string
  connection: RTCPeerConnection
  stream?: MediaStream
}

export class WebRTCService {
  private localStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private onRemoteStream?: (stream: MediaStream, peerId: string) => void
  private onPeerDisconnected?: (peerId: string) => void

  private configuration: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  }

  async initializeLocalStream(video = true, audio = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
      })
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
    }
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.configuration)
    this.peerConnections.set(peerId, peerConnection)

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (this.onRemoteStream) {
        this.onRemoteStream(remoteStream, peerId)
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer via signaling server
        this.sendSignalingMessage(peerId, {
          type: "ice-candidate",
          candidate: event.candidate,
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === "disconnected" || peerConnection.connectionState === "failed") {
        this.removePeerConnection(peerId)
        if (this.onPeerDisconnected) {
          this.onPeerDisconnected(peerId)
        }
      }
    }

    return peerConnection
  }

  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = await this.createPeerConnection(peerId)
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peerConnection = await this.createPeerConnection(peerId)
    await peerConnection.setRemoteDescription(offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    return answer
  }

  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer)
    }
  }

  async handleIceCandidate(peerId: string, candidate: RTCIceCandidate) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate)
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  removePeerConnection(peerId: string) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(peerId)
    }
  }

  disconnect() {
    // Close all peer connections
    this.peerConnections.forEach((connection, peerId) => {
      connection.close()
    })
    this.peerConnections.clear()

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }

  setOnRemoteStream(callback: (stream: MediaStream, peerId: string) => void) {
    this.onRemoteStream = callback
  }

  setOnPeerDisconnected(callback: (peerId: string) => void) {
    this.onPeerDisconnected = callback
  }

  private sendSignalingMessage(peerId: string, message: any) {
    // This would typically send to a WebSocket server
    // For now, we'll use a placeholder
    console.log("Sending signaling message to", peerId, message)
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }
}

export const webrtc = new WebRTCService()
