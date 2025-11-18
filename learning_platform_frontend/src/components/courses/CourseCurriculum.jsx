import React, { useState, useMemo } from 'react';
import Button from '../common/Button';
import { progressService } from '../../services/progressService';
import { VideoPlayer } from './VideoPlayer';

/**
 * PUBLIC_INTERFACE
 * CourseCurriculum shows expandable modules with nested lessons.
 * Accessible with aria-expanded and region roles for module panels.
 */
export function CourseCurriculum({ course, isEnrolled }) {
  const [openIds, setOpenIds] = useState(() => new Set());
  const [activeLesson, setActiveLesson] = useState(null); // { moduleId, lessonId }
  const completed = useMemo(() => progressService.getCompleted(course?.id), [course?.id]);

  const toggle = (id) => {
    setOpenIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const isCompleted = (lessonId) => {
    return completed?.includes(lessonId);
  };

  const handleStart = (modId, lesson) => {
    // Open inline player (simple stub using previewVideo if present)
    setActiveLesson({ moduleId: modId, lessonId: lesson.id, title: lesson.title });
  };

  const handleMarkComplete = (lessonId) => {
    const res = progressService.completeLesson(course.id, lessonId);
    // Force re-render by updating activeLesson; completed is derived from service via useMemo on course.id,
    // so to reflect immediate UI change we can set local state flag or re-open state reference.
    // Simplest: update activeLesson (no-op) and rely on dynamic check against service.
    setActiveLesson((prev) => ({ ...prev }));
    return res;
  };

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {course.curriculum?.map((mod) => {
        const isOpen = openIds.has(mod.id);
        return (
          <section
            key={mod.id}
            className="glass"
            style={{ borderRadius: 10, overflow: 'hidden' }}
            aria-label={`Module ${mod.title}`}
          >
            <button
              onClick={() => toggle(mod.id)}
              aria-expanded={isOpen}
              aria-controls={`module-panel-${mod.id}`}
              id={`module-header-${mod.id}`}
              className="btn btn-ghost"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                <strong>{mod.title}</strong>
                <span style={{ display: 'block', color: '#6b7280', fontSize: 13 }}>
                  {mod.summary}
                </span>
              </span>
              <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <div
                id={`module-panel-${mod.id}`}
                role="region"
                aria-labelledby={`module-header-${mod.id}`}
                style={{ padding: '0.5rem 0.75rem 0.75rem' }}
              >
                <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.5rem' }}>
                  {mod.lessons?.map((lesson) => {
                    const done = isCompleted(lesson.id);
                    const isActive = activeLesson?.lessonId === lesson.id;
                    return (
                      <li key={lesson.id} style={{ color: '#374151', fontSize: 14, display: 'grid', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ flex: '1 1 auto' }}>
                            {lesson.title} <span style={{ color: '#6b7280' }}>• {lesson.duration}</span>
                          </span>
                          {done ? (
                            <span className="glass" style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: 12, color: '#065f46', background: 'rgba(16,185,129,0.12)' }}>
                              Completed
                            </span>
                          ) : null}
                          <Button
                            variant={done ? 'glass' : 'primary'}
                            size="sm"
                            disabled={!isEnrolled}
                            aria-label={`${done ? 'Review' : 'Start'} ${lesson.title}`}
                            onClick={() => handleStart(mod.id, lesson)}
                          >
                            {done ? 'Review' : 'Start'}
                          </Button>
                        </div>
                        {isActive && (
                          <div className="glass" style={{ padding: '0.5rem', borderRadius: 8 }}>
                            <VideoPlayer
                              src={course?.previewVideo?.src || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                              caption={`Playing: ${lesson.title}`}
                            />
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                              <Button
                                variant="success"
                                size="sm"
                                aria-label="Mark lesson complete"
                                onClick={() => handleMarkComplete(lesson.id)}
                              >
                                Mark Complete
                              </Button>
                              <Button
                                variant="glass"
                                size="sm"
                                aria-label="Close player"
                                onClick={() => setActiveLesson(null)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
