import React from 'react';

/**
 * PUBLIC_INTERFACE
 * VideoPlayer is a simple placeholder video player component.
 * It renders a native HTML5 video element with accessible labeling.
 */
export function VideoPlayer({ src, caption }) {
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
    </figure>
  );
}
