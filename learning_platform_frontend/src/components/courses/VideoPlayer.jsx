import React from 'react';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * VideoPlayer is a simple placeholder video player component.
 * It renders a native HTML5 video element with accessible labeling.
 */
/**
 * PUBLIC_INTERFACE
 * @param {{ src: string, caption?: string, onComplete?: () => void }} props
 * Renders a player and an optional Mark Complete button if onComplete is provided.
 */
export function VideoPlayer({ src, caption, onComplete }) {
  return (
    <figure className="glass" style={{ borderRadius: 12, overflow: 'hidden', margin: 0 }}>
      <video
        controls
        src={src}
        style={{ width: '100%', display: 'block' }}
        aria-label={caption || 'Video player'}
      />
      {caption && (
        <figcaption style={{ padding: '0.5rem 0.75rem', fontSize: 14, color: '#4b5563' }}>
          {caption}
        </figcaption>
      )}
      {typeof onComplete === 'function' && (
        <div style={{ padding: '0.5rem 0.75rem' }}>
          <Button variant="success" size="sm" aria-label="Mark video complete" onClick={() => onComplete?.()}>
            Mark Complete
          </Button>
        </div>
      )}
    </figure>
  );
}
