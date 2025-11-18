import React from 'react';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * CourseResources lists downloadable or link-based study materials.
 */
export function CourseResources({ course }) {
  const list = course.resources || [];
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {list.map((r) => (
        <div key={r.id} className="glass" style={{ padding: '0.75rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{r.title}</strong>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{r.type.toUpperCase()}</div>
          </div>
          <Button variant="outline" aria-label={`Open ${r.title}`}>Open</Button>
        </div>
      ))}
      {list.length === 0 && <p style={{ color: '#6b7280' }}>No resources yet.</p>}
    </div>
  );
}
