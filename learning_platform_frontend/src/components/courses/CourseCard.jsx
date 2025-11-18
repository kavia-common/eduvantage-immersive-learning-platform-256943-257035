import React from 'react';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * CourseCard renders a summary card for a course with thumbnail, title,
 * meta info and a Select action button.
 */
export function CourseCard({ course, onSelect, isActive }) {
  return (
    <article
      className={`glass hover-lift`}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 260,
        outline: isActive ? '2px solid #2563EB' : 'none',
      }}
      tabIndex={0}
      aria-label={`Course card: ${course.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      <div style={{ position: 'relative', paddingTop: '56%', background: '#e5e7eb' }}>
        <img
          src={course.thumbnail}
          alt={`${course.title} thumbnail`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div style={{ padding: '0.75rem', display: 'grid', gap: '0.25rem', flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{course.title}</h3>
        <p style={{ margin: 0, color: '#4b5563', fontSize: 13 }}>
          {course.category} • {course.level} • {course.duration}{' '}
          {typeof course.price !== 'undefined' ? `• $${course.price}` : ''}
        </p>
        <p style={{ margin: '0.25rem 0 0', color: '#374151', fontSize: 14 }}>
          ⭐ {course.rating} • {course.lessonsCount} lessons
        </p>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" aria-label={`Select ${course.title}`} onClick={onSelect}>
            View
          </Button>
        </div>
      </div>
    </article>
  );
}
