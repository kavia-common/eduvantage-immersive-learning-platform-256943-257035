import React from 'react';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * CourseQuizzes lists quizzes with attempt action.
 */
export function CourseQuizzes({ course }) {
  const list = course.quizzes || [];
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {list.map((q) => (
        <div key={q.id} className="glass" style={{ padding: '0.75rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{q.title}</strong>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{q.questions} questions</div>
          </div>
          <Button variant="primary" aria-label={`Start ${q.title}`}>Attempt</Button>
        </div>
      ))}
      {list.length === 0 && <p style={{ color: '#6b7280' }}>No quizzes available.</p>}
    </div>
  );
}
