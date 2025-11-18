# Learning Assistant (Static UI)

A glass-styled, accessible chat UI component.

- Header with title and simple controls
- Scrollable message list with an assistant intro
- Quick suggestion buttons
- Input and send button area (disabled)

Integrated on the Dashboard view. To embed elsewhere:
import LearningAssistant from 'src/components/assistant/LearningAssistant';
<LearningAssistant />

---

## Virtual Classroom (Placeholder)

A glass-styled VirtualClassroom component is available:

- Dashboard includes a "Virtual Classroom" panel preview.
- Full view is at the /classroom route.
- UI-only controls: Join/Leave, Camera, and Mic toggles.
- Displays a simple participant count and a seating grid preview when connected.

Usage:
```jsx
import VirtualClassroom from 'src/components/VirtualClassroom';

// Embedded in a panel
<VirtualClassroom embedded />

// Full view
<VirtualClassroom />
```

Notes:
- This is a placeholder without real media or signaling. No secrets are required.
- Accessibility: buttons include aria-labels; connected preview has an aria-label for screen readers.

---

## Social Feed

There are two feed experiences:
- Live Feed: available at /feed (uses FeedProvider, optimistic updates, comments)
- Static SocialFeed: a glass-styled demo with sample posts and a disabled composer at /feed-demo

Usage (component):
import SocialFeed from 'src/components/feed/SocialFeed';
<SocialFeed />

Dashboard includes:
- A "Social Feed" preview card linking to /feed
- An inline Community Feed preview panel showing a couple of sample posts

Accessibility:
- Action buttons include accessible labels and titles
- Semantic article/header sections
