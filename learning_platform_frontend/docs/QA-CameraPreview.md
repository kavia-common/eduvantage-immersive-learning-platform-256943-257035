# QA - Virtual Classroom Camera Preview

This guide helps verify that the Virtual Classroom preview correctly requests camera/microphone with clear UI states and proper cleanup.

## Pre-checks
- Use a browser that supports MediaDevices API (Chrome, Edge, Firefox, Safari).
- Prefer HTTPS origin. On HTTP, access from `http://localhost` is allowed for testing.
- Ensure no other app is exclusively using the camera/mic.

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
   - If HTTP non-secure (not localhost):
     - Hint shows "Insecure context..." and no preview.
   - If you Deny permission:
     - Hint shows "Permissions denied..." and an alert message.
   - If no camera/mic:
     - Hint shows "No camera/microphone found."
4. Toggle controls:
   - Camera button toggles video track enabled state (icon updates, preview freezes frame when off and resumes when on).
   - Mic button toggles audio track enabled state (icon updates).
5. Click "Leave":
   - Status returns to Disconnected.
   - Video element clears; camera light turns off.
   - Re-joining should reacquire media and show the preview again.

## Cleanup verification
- After leaving the classroom or navigating away, verify device indicator light turns off immediately (tracks stopped).

## Accessibility
- Buttons have clear aria-labels (Join Classroom, Leave, Turn camera off/on, Mute/Unmute microphone).
- Status region uses aria-live for updates.
- Video element labeled "Local camera preview".

