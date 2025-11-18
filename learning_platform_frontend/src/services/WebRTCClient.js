"use strict";

/**
 * WebRTCClient
 * A small abstraction over WebRTC peer connection behavior tailored for an immersive classroom session.
 * This scaffolding provides signaling method stubs (offer/answer/ice) that use a wsClient placeholder.
 * It manages local media, remote participant tracks, and exposes lifecycle events via a simple emitter.
 *
 * SECURITY:
 * - No secrets are hardcoded.
 * - Avoid logging sensitive media info; logs are minimal and level-controlled via logger.
 *
 * ENV:
 * - Signaling is expected through wsClient (already configured to use REACT_APP_WS_URL or a derived URL).
 */

import { wsClient } from "./wsClient";
import { logger } from "./logger";

/**
 * Internal event emitter utility (minimal).
 */
class Emitter {
  constructor() {
    this.listeners = {};
  }
  on(evt, handler) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(handler);
    return () => this.off(evt, handler);
  }
  off(evt, handler) {
    if (!this.listeners[evt]) return;
    this.listeners[evt] = this.listeners[evt].filter((h) => h !== handler);
  }
  emit(evt, payload) {
    (this.listeners[evt] || []).forEach((h) => {
      try { h(payload); } catch { /* noop */ }
    });
  }
}

/**
 * Shape of events emitted:
 * - "local-stream": { stream }
 * - "participant-joined": { id }
 * - "participant-left": { id }
 * - "track-added": { id, stream }
 * - "error": { message }
 * - "connection-state": { state }
 */

// PUBLIC_INTERFACE
export class WebRTCClient {
  /**
   * Create a WebRTC client instance for a classroom session.
   * @param {Object} opts
   * @param {string} opts.roomId - Logical room identifier for signaling
   * @param {string} opts.userId - Current user id for presence/sender id
   */
  constructor({ roomId, userId } = {}) {
    this.roomId = roomId || "default";
    this.userId = userId || `u-${Math.random().toString(36).slice(2, 8)}`;
    this.emitter = new Emitter();

    this.pc = null;
    this.localStream = null;
    this.remoteStreams = new Map(); // participantId -> MediaStream
    this._wsUnsubs = [];
    this._started = false;

    this._onWsMessage = this._onWsMessage.bind(this);
  }

  // PUBLIC_INTERFACE
  on(event, handler) {
    /** Subscribe to client events. */
    return this.emitter.on(event, handler);
  }

  // PUBLIC_INTERFACE
  async startLocalMedia(constraints = { audio: true, video: { width: 640, height: 360 } }) {
    /**
     * Acquire local media and emit 'local-stream'.
     * @returns {Promise<MediaStream>}
     */
    if (this.localStream) return this.localStream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      this.emitter.emit("local-stream", { stream });
      logger.info("Local media acquired", {
        audio: !!stream.getAudioTracks().length,
        video: !!stream.getVideoTracks().length,
      });
      return stream;
    } catch (e) {
      const msg = String(e?.message || e);
      this.emitter.emit("error", { message: msg });
      logger.error("Failed to acquire local media", { error: msg });
      throw e;
    }
  }

  // PUBLIC_INTERFACE
  async join() {
    /**
     * Join the classroom: set up RTCPeerConnection, attach local tracks, and wire signaling.
     * Signaling: This is a stub; it relies on wsClient messages to be routed by backend later.
     */
    if (this._started) return;
    this._started = true;

    logger.info("Joining classroom", { roomId: this.roomId, userId: this.userId });

    const config = {
      iceServers: [
        // Use public STUN for scaffolding; TURN should be configured in production via env/config.
        { urls: "stun:stun.l.google.com:19302" },
      ],
    };

    this.pc = new RTCPeerConnection(config);

    this.pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        this._sendSignal({
          type: "ice-candidate",
          roomId: this.roomId,
          from: this.userId,
          candidate: evt.candidate,
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      this.emitter.emit("connection-state", { state: this.pc.connectionState });
      logger.debug("WebRTC connection state", { state: this.pc.connectionState });
    };

    // Unified ontrack: create/add to participant stream
    this.pc.ontrack = (evt) => {
      const [stream] = evt.streams;
      const pid = evt.transceiver?.mid || `p-${Math.random().toString(36).slice(2, 8)}`;
      if (stream) {
        // Maintain/reuse stream map by pid
        const existing = this.remoteStreams.get(pid) || stream;
        this.remoteStreams.set(pid, existing);
        this.emitter.emit("track-added", { id: pid, stream: existing });
        logger.info("Remote track added", { participantId: pid });
      }
    };

    // Attach local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream));
    } else {
      logger.warn("Joining without localStream; call startLocalMedia() prior to join for preview.");
    }

    // Wire WS signaling listeners
    this._wsUnsubs.push(wsClient.on("message", this._onWsMessage));
    // Report initial ws availability
    if (!wsClient || !wsClient.socket) {
      this.emitter.emit("error", { message: "Signaling socket not initialized. Check REACT_APP_WS_URL." });
    }

    // Announce presence (stub)
    this._sendSignal({ type: "join", roomId: this.roomId, from: this.userId });

    // Create and send offer as initiator (naive single-offer flow for scaffolding)
    await this._createAndSendOffer();
  }

  // PUBLIC_INTERFACE
  async leave() {
    /**
     * Leave the classroom and clean up resources.
     */
    logger.info("Leaving classroom", { roomId: this.roomId, userId: this.userId });
    try {
      this._sendSignal({ type: "leave", roomId: this.roomId, from: this.userId });
    } catch {
      // ignore best-effort
    }

    this._wsUnsubs.forEach((off) => {
      try { off(); } catch {}
    });
    this._wsUnsubs = [];

    if (this.pc) {
      try { this.pc.getSenders().forEach((s) => { try { s.track?.stop(); } catch {} }); } catch {}
      try { this.pc.close(); } catch {}
      this.pc = null;
    }

    // Do not stop localStream here to allow toggling camera/mic via UI; only stop if explicitly requested
    this.remoteStreams.clear();
    this._started = false;
  }

  // PUBLIC_INTERFACE
  async toggleCamera(on) {
    /** Enable/disable local video track */
    if (!this.localStream) return;
    const video = this.localStream.getVideoTracks()[0];
    if (video) video.enabled = on;
  }

  // PUBLIC_INTERFACE
  async toggleMic(on) {
    /** Enable/disable local audio track */
    if (!this.localStream) return;
    const audio = this.localStream.getAudioTracks()[0];
    if (audio) audio.enabled = on;
  }

  // PUBLIC_INTERFACE
  getParticipants() {
    /**
     * Get current participants map snapshot.
     * @returns {Array<{id:string, stream:MediaStream}>}
     */
    return Array.from(this.remoteStreams.entries()).map(([id, stream]) => ({ id, stream }));
  }

  async _createAndSendOffer() {
    try {
      const offer = await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await this.pc.setLocalDescription(offer);
      this._sendSignal({
        type: "offer",
        roomId: this.roomId,
        from: this.userId,
        sdp: offer.sdp,
      });
      logger.debug("Offer created and sent");
    } catch (e) {
      const msg = String(e?.message || e);
      this.emitter.emit("error", { message: msg });
      logger.error("Failed to create/send offer", { error: msg });
    }
  }

  async _onWsMessage(evt) {
    let data = null;
    try {
      data = typeof evt?.data === "string" ? JSON.parse(evt.data) : evt?.data;
    } catch {
      return;
    }
    if (!data || data.roomId !== this.roomId || data.from === this.userId) return;

    switch (data.type) {
      case "offer": {
        await this._handleRemoteOffer(data);
        break;
      }
      case "answer": {
        await this._handleRemoteAnswer(data);
        break;
      }
      case "ice-candidate": {
        await this._handleRemoteIce(data);
        break;
      }
      case "join": {
        this.emitter.emit("participant-joined", { id: data.from });
        logger.info("Participant joined", { id: data.from });
        // In a real SFU/MCU, the server coordinates; for P2P mesh you'd respond here.
        break;
      }
      case "leave": {
        this.emitter.emit("participant-left", { id: data.from });
        logger.info("Participant left", { id: data.from });
        break;
      }
      default:
        logger.debug("Unhandled signaling message", { type: data.type });
        break;
    }
  }

  async _handleRemoteOffer({ from, sdp }) {
    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this._sendSignal({ type: "answer", roomId: this.roomId, from: this.userId, to: from, sdp: answer.sdp });
      logger.debug("Answer created and sent");
    } catch (e) {
      const msg = String(e?.message || e);
      this.emitter.emit("error", { message: msg });
      logger.error("Failed to handle remote offer", { error: msg });
    }
  }

  async _handleRemoteAnswer({ sdp }) {
    try {
      const desc = new RTCSessionDescription({ type: "answer", sdp });
      await this.pc.setRemoteDescription(desc);
      logger.debug("Remote answer applied");
    } catch (e) {
      const msg = String(e?.message || e);
      this.emitter.emit("error", { message: msg });
      logger.error("Failed to handle remote answer", { error: msg });
    }
  }

  async _handleRemoteIce({ candidate }) {
    try {
      if (candidate) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        logger.debug("Remote ICE candidate added");
      }
    } catch (e) {
      const msg = String(e?.message || e);
      this.emitter.emit("error", { message: msg });
      logger.error("Failed to add remote ICE", { error: msg });
    }
  }

  _sendSignal(payload) {
    /**
     * Best-effort send via wsClient. Backend should route to peers in same room.
     */
    try {
      if (!wsClient?.socket || wsClient.socket.readyState !== 1) {
        this.emitter.emit("error", {
          message: "Signaling server not connected. Participants may not appear. Check REACT_APP_WS_URL.",
        });
        logger.warn("Attempted to send signal while socket not open", {
          readyState: wsClient?.socket?.readyState,
          payloadType: payload?.type,
        });
      }
      wsClient.send({ ...payload });
    } catch (e) {
      const msg = String(e?.message || e);
      logger.warn("Failed to send signal", { error: msg });
      this.emitter.emit("error", { message: "Failed to send signaling message." });
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * Convenience factory to create a client instance.
 */
export function createWebRTCClient(opts) {
  return new WebRTCClient(opts);
}
