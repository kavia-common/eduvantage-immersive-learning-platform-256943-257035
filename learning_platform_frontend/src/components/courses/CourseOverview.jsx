import React from 'react';
import { VideoPlayer } from './VideoPlayer';

/**
 * PUBLIC_INTERFACE
 * CourseOverview displays the description and preview video for a course.
 */
export function CourseOverview({ course }) {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {course.previewVideo?.src && (
        <VideoPlayer src={course.previewVideo.src} caption={course.previewVideo.caption} />
      )}
      <p style={{ margin: 0, lineHeight: 1.6 }}>{course.description}</p>
      <div
        aria-label="Course quick stats"
        className="glass"
        style={{
          padding: '0.75rem',
          borderRadius: 10,
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          fontSize: 14,
        }}
      >
        <span>Category: {course.category}</span>
        <span>Level: {course.level}</span>
        <span>Duration: {course.duration}</span>
        <span>Lessons: {course.lessonsCount}</span>
        <span>Rating: {course.rating} ⭐</span>
      </div>
    </div>
  );
}
