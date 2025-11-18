import React from 'react';
import './assistant.css';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * LearningAssistant
 * A static, accessible chat-style panel using glassmorphism utilities.
 * Provides:
 * - Header with title and simple controls
 * - Scrollable messages list seeded with an assistant intro message
 * - Row of quick suggestion buttons
 * - Input area with send button (non-functional)
 *
 * Accessibility:
 * - aria-labels for buttons and input
 * - role and aria-live for messages region
 * - keyboard focusable controls
 */
function LearningAssistant() {
  // Seed messages (static, no state or backend calls for now)
  const messages = [
    {
      id: 'm1',
      role: 'assistant',
      name: 'Learning Assistant',
      content:
        "Hi! I'm your Learning Assistant. I can help you understand topics, summarize lessons, and plan your study path. How would you like to get started?",
      time: 'Just now',
    },
  ];

  const suggestions = [
    'Summarize my last lesson',
    'Create a study plan',
    'Explain a concept',
    'Practice quiz',
  ];

  return (
    <Card className="glass panel learning-assistant" aria-label="Learning Assistant panel">
      {/* Header */}
      <div className="assistant-header glass">
        <div className="assistant-title">
          <span className="assistant-status-dot" aria-hidden="true" />
          <h2 id="learning-assistant-title">Learning Assistant</h2>
        </div>
        <div className="assistant-controls" aria-label="Assistant controls">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Toggle compact view"
            title="Toggle compact view"
          >
            ···
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Open help for Learning Assistant"
            title="Help"
          >
            ?
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="assistant-messages glass scroll-container"
        role="region"
        aria-labelledby="learning-assistant-title"
        aria-live="polite"
      >
        <ul className="message-list" aria-label="Chat messages">
          {messages.map((m) => (
            <li key={m.id} className={`message ${m.role}`}>
              <div className="avatar" aria-hidden="true">🧭</div>
              <div className="bubble">
                <div className="meta">
                  <span className="name">{m.name}</span>
                  <span className="time" aria-label={`Sent ${m.time}`}>{m.time}</span>
                </div>
                <div className="content">{m.content}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick suggestions */}
      <div className="assistant-suggestions glass" role="group" aria-label="Quick suggestions">
        {suggestions.map((s, idx) => (
          <Button
            key={idx}
            variant="glass"
            size="sm"
            className="suggestion-btn"
            aria-label={`Suggestion: ${s}`}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Input area (non-functional) */}
      <div className="assistant-input glass" role="group" aria-label="Message input">
        <input
          type="text"
          className="input"
          placeholder="Type your message..."
          aria-label="Type your message"
          disabled
        />
        <Button
          variant="primary"
          size="sm"
          aria-label="Send message"
          title="Send"
          disabled
        >
          Send
        </Button>
      </div>
    </Card>
  );
}

export default LearningAssistant;
