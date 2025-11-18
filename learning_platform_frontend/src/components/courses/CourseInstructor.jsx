import React from 'react';

/**
 * PUBLIC_INTERFACE
 * CourseInstructor shows instructor bio and avatar.
 */
export function CourseInstructor({ course }) {
  const i = course.instructor || {};
  return (
    <div className="glass" style={{ padding: '0.75rem', borderRadius: 10, display: 'flex', gap: '0.75rem' }}>
      <img
        src={i.avatar}
        alt={`${i.name} avatar`}
        width={64}
        height={64}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
      />
      <div>
        <h3 style={{ margin: '0 0 0.25rem 0' }}>{i.name}</h3>
        <p style={{ margin: 0, color: '#6b7280' }}>{i.title}</p>
        <p style={{ margin: '0.5rem 0 0', lineHeight: 1.6 }}>{i.bio}</p>
      </div>
    </div>
  );
}
