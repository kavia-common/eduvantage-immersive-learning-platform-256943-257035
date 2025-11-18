import React, { useEffect, useMemo, useRef, useState } from 'react';
import './virtualClassroom.css';
import Button from './common/Button';

/**
 * PUBLIC_INTERFACE
 * VirtualClassroom
 * A glass-styled virtual classroom preview component with:
 * - Join/Leave
 * - Media capture via getUserMedia behind user gesture
 * - Clear UI states: insecure context, permission denied, no device, generic error, and success
 * - Cleanup of MediaStream tracks on unmount or when toggling off
 *
 * Props:
 * - embedded?: boolean — if true, renders a compact header suited for dashboard panels
 */
function VirtualClassroom({ embedded = false }) {
  const [isConnected, setIsConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | requesting | insecure | denied | nodevice | error | ready
  const [message, setMessage] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Simple mock participants list (could later be lifted via props or context)
  const participants = useMemo(
    () => (isConnected ? ['You', 'Sam', 'Alex', 'Taylor', 'Jordan'] : []),
    [isConnected]
  );

  const participantCount = participants.length;

  // Helpers
  const isSecure = () => {
    // Secure contexts are required for getUserMedia except for localhost
    return window.isSecureContext || window.location.hostname === 'localhost';
  };

  const stopStream = () => {
    try {
      streamRef.current?.getTracks()?.forEach((t) => {
        try { t.stop(); } catch {}
      });
    } catch {}
    streamRef.current = null;
    if (videoRef.current) {
      try {
        const v = videoRef.current;
        v.onloadedmetadata = null;
        v.srcObject = null;
      } catch {}
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If a stream already exists but the video element ref was re-mounted, reattach.
    if (videoRef.current && streamRef.current) {
      try {
        const videoEl = videoRef.current;
        if (videoEl.srcObject !== streamRef.current) {
          videoEl.srcObject = streamRef.current;
        }
        const tryPlay = () => {
          Promise.resolve(videoEl.play()).catch(() => {});
        };
        if (videoEl.readyState >= 1) {
          tryPlay();
        } else {
          videoEl.onloadedmetadata = () => tryPlay();
        }
      } catch {
        // no-op
      }
    }
  });

  const requestMedia = async () => {
    setMessage('');
    if (!isSecure()) {
      setStatus('insecure');
      setMessage('Camera requires HTTPS (or localhost). Open the site over a secure connection.');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('error');
      setMessage('Media devices API is not supported in this browser.');
      return;
    }

    setStatus('requesting');
    try {
      // Request both audio and video, but we will allow toggling enabled state
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        // Attach stream to video element and attempt autoplay on metadata loaded
        const videoEl = videoRef.current;
        videoEl.srcObject = stream;
        const tryPlay = () => {
          // Some browsers require explicit play() call after metadata is ready
          Promise.resolve(videoEl.play()).catch(() => {
            // Autoplay might still be blocked if policies change; UI remains usable
          });
        };
        if (videoEl.readyState >= 1) {
          tryPlay();
        } else {
          videoEl.onloadedmetadata = () => {
            tryPlay();
          };
        }
      }
      // Enable tracks according to toggles
      const v = stream.getVideoTracks()[0];
      const a = stream.getAudioTracks()[0];
      if (v) v.enabled = true;
      if (a) a.enabled = true;

      setCameraOn(!!v);
      setMicOn(!!a);
      setStatus('ready');
      setIsConnected(true);
    } catch (err) {
      const name = err && (err.name || err.code);
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
        setMessage('Camera/Microphone permission was denied. Please allow access in browser settings.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
        setStatus('nodevice');
        setMessage('No suitable camera or microphone was found.');
      } else if (name === 'NotReadableError') {
        setStatus('error');
        setMessage('Another application may be using the camera/microphone.');
      } else {
        setStatus('error');
        setMessage(err?.message || 'Failed to access media devices.');
      }
      stopStream();
      setIsConnected(false);
    }
  };

  const handleJoin = async () => {
    await requestMedia();
  };

  const handleLeave = () => {
    setIsConnected(false);
    setStatus('idle');
    setMessage('');
    setCameraOn(false);
    setMicOn(false);
    stopStream();
  };

  const handleToggleCamera = () => {
    const v = streamRef.current?.getVideoTracks?.()[0];
    if (v) {
      const next = !v.enabled;
      v.enabled = next;
      setCameraOn(next);
    }
  };

  const handleToggleMic = () => {
    const a = streamRef.current?.getAudioTracks?.()[0];
    if (a) {
      const next = !a.enabled;
      a.enabled = next;
      setMicOn(next);
    }
  };

  // Build hint message based on status
  const hint = (() => {
    switch (status) {
      case 'idle':
        return 'Click Join to enable your camera preview.';
      case 'requesting':
        return 'Requesting camera/mic permission...';
      case 'insecure':
        return 'Insecure context: open over HTTPS or use localhost for camera access.';
      case 'denied':
        return 'Permissions denied: allow access in your browser settings.';
      case 'nodevice':
        return 'No camera/microphone found.';
      case 'error':
        return message || 'An error occurred while accessing media.';
      case 'ready':
        return 'Camera preview active.';
      default:
        return '';
    }
  })();

  return (
    <div className={`vc-container glass ${embedded ? 'vc-embedded' : ''}`} role="region" aria-label="Virtual Classroom section">
      <header className="vc-header">
        <div className="vc-title-group">
          <h3 className="vc-title">{embedded ? 'Classroom Preview' : 'Virtual Classroom'}</h3>
          <div className={`vc-status ${isConnected ? 'connected' : 'disconnected'}`} aria-live="polite">
            <span className="vc-status-dot" aria-hidden="true" />
            <span className="vc-status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="vc-actions">
          {!isConnected ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleJoin}
              aria-label="Join Classroom"
              title="Join Classroom"
            >
              Join Classroom
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={handleLeave}
              aria-label="Leave"
              title="Leave"
            >
              Leave
            </Button>
          )}
        </div>
      </header>

      <div className="vc-body">
        <aside className="vc-side glass-sm" aria-label="Participants">
          <div className="vc-side-header">
            <h4 className="vc-side-title">Participants</h4>
            <span className="vc-badge" aria-label={`Participants count ${participantCount}`}>
              {participantCount}
            </span>
          </div>
          <ul className="vc-participants-list">
            {participants.length === 0 ? (
              <li className="vc-participant muted">No participants yet</li>
            ) : (
              participants.map((p) => (
                <li key={p} className="vc-participant">
                  <span className="vc-avatar" aria-hidden="true">{p.charAt(0).toUpperCase()}</span>
                  <span className="vc-name">{p}</span>
                </li>
              ))
            )}
          </ul>
        </aside>

        <main className="vc-stage glass-sm">
          {!isConnected ? (
            <div className="vc-disconnected" aria-label="classroom disconnected placeholder">
              <p className="vc-helper-text">{hint}</p>
              {status === 'insecure' && (
                <p className="vc-helper-text" role="note">
                  Tip: Use https:// or run locally on http://localhost to test camera.
                </p>
              )}
              {(status === 'denied' || status === 'nodevice' || status === 'error') && message && (
                <p className="vc-helper-text" role="alert">{message}</p>
              )}
            </div>
          ) : (
            <div className="vc-connected" aria-label="classroom connected preview">
              <div className="vc-grid" role="grid" aria-label="Seating grid">
                {/* First tile shows actual camera preview */}
                <div role="gridcell" className="vc-seat" aria-label="Your seat video" style={{ position: 'relative' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, background: '#000' }}
                    aria-label="Local camera preview"
                  />
                  {streamRef.current && streamRef.current.getVideoTracks()[0] && streamRef.current.getVideoTracks()[0].readyState !== 'live' && (
                    <div
                      className="vc-fallback"
                      role="status"
                      aria-live="polite"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#e5e7eb',
                        fontSize: '0.9rem',
                        background: 'rgba(0,0,0,0.25)'
                      }}
                    >
                      Camera stream initializing...
                    </div>
                  )}
                </div>
                {/* Remaining tiles remain placeholders to imply layout */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div role="gridcell" className="vc-seat" key={i} aria-label={`Seat ${i + 2}`}>
                    <div className="vc-seat-video-sim" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="vc-controls">
        <div className="vc-controls-group" role="group" aria-label="Media controls">
          <Button
            variant="glass"
            size="sm"
            className={`vc-icon-btn ${cameraOn ? '' : 'off'}`}
            onClick={handleToggleCamera}
            aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}
            title="Toggle camera"
            disabled={!isConnected || status !== 'ready'}
          >
            {cameraOn ? '📷' : '🚫📷'}
          </Button>
          <Button
            variant="glass"
            size="sm"
            className={`vc-icon-btn ${micOn ? '' : 'off'}`}
            onClick={handleToggleMic}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            title="Toggle microphone"
            disabled={!isConnected || status !== 'ready'}
          >
            {micOn ? '🎙️' : '🔇'}
          </Button>
        </div>
        <div className="vc-hint" aria-live="polite">
          {hint}
        </div>
      </footer>
    </div>
  );
}

export default VirtualClassroom;
