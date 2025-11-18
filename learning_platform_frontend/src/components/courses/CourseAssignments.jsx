import React from 'react';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * CourseAssignments lists assignments and provides action buttons.
 */
export function CourseAssignments({ course }) {
  const list = course.assignments || [];
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {list.map((a) => (
        <div key={a.id} className="glass" style={{ padding: '0.75rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{a.title}</strong>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Due: {a.due}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" aria-label={`View ${a.title}`}>View</Button>
            <Button variant="primary" aria-label={`Start ${a.title}`}>Start</Button>
          </div>
        </div>
      ))}
      {list.length === 0 && <p style={{ color: '#6b7280' }}>No assignments yet.</p>}
    </div>
  );
}
