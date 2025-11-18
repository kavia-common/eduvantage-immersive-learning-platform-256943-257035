# QA - Virtual Classroom Camera Preview

This guide helps verify that the Virtual Classroom preview correctly requests camera/microphone with clear UI states, proper autoplay handling, visibility, and cleanup.

## Pre-checks
- Use a browser that supports MediaDevices API (Chrome, Edge, Firefox, Safari).
- Prefer HTTPS origin. On HTTP, access from `http://localhost` is allowed for testing.
- Ensure no other app is exclusively using the camera/mic.

## Expected Implementation Details
- Video element attributes: `playsInline`, `autoPlay`, and `muted`.
- After assigning `video.srcObject = stream`, the component calls `video.play()` upon `loadedmetadata` (and retries if readyState already available) to satisfy autoplay requirements (including iOS Safari).
- If a stream exists and the video ref remounts, an effect reattaches `srcObject` and calls `play()` again.
- Fallback overlay text appears if a video track exists but `readyState !== 'live'` (e.g., initializing or ended).
- Cleanup removes `onloadedmetadata` handler and clears `srcObject`; media tracks are stopped only on Leave or unmount (not immediately after start).

## Steps
1. Open Dashboard and scroll to "Virtual Classroom" panel.
2. Expect to see:
   - Status: Disconnected
   - Hint: "Click Join to enable your camera preview."
   - A "Join Classroom" button.
3. Click "Join Classroom":
   - Browser prompts for camera/mic permission (on first use).
   - If HTTPS/localhost and devices available:
     - After allowing, the first seat should show your live camera preview, status becomes Connected, hint "Camera preview active."
     - The video should begin playing automatically without additional user action.
     - If the stream is initializing, a temporary "Camera stream initializing..." overlay may appear and then disappear when live.
   - If HTTP non-secure (not localhost):
     - Hint shows "Insecure context..." and no preview.
   - If you Deny permission:
     - Hint shows "Permissions denied..." and an alert message.
   - If no camera/mic:
     - Hint shows "No camera/microphone found."
4. Toggle controls:
   - Camera button toggles video track enabled state (icon updates, preview freezes/black when off and resumes when on).
   - Mic button toggles audio track enabled state (icon updates).
5. Click "Leave":
   - Status returns to Disconnected.
   - Video element clears; camera light turns off.
   - Re-joining should reacquire media and show the preview again.

## Visibility/CSS Validation
- The video fills its seat using `width: 100%`, `height: 100%`, `object-fit: cover`, with a black background to avoid flash.
- Ensure no external CSS hides or overlays the video; check any overlays' z-index. The fallback overlay uses semi-transparent background only while not `live`.

## Cleanup verification
- After leaving the classroom or navigating away, verify device indicator light turns off immediately (tracks stopped).
- No lingering onloadedmetadata handlers remain on the video element.

## Accessibility
- Buttons have clear aria-labels (Join Classroom, Leave, Turn camera off/on, Mute/Unmute microphone).
- Status region uses aria-live for updates.
- Video element labeled "Local camera preview".

## Troubleshooting
- Insecure context shows a clear hint; test over HTTPS or localhost.
- Permission denied surfaces an actionable message.
- Nodevice and NotReadable errors are handled with helpful hints.
- If the video does not play automatically, verify `muted`, `playsInline`, and that `video.play()` is invoked on `loadedmetadata`.
