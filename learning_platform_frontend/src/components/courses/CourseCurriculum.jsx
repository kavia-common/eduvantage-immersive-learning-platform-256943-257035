import React, { useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * CourseCurriculum shows expandable modules with nested lessons.
 * Accessible with aria-expanded and region roles for module panels.
 */
export function CourseCurriculum({ course }) {
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = (id) => {
    setOpenIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
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
                <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.25rem' }}>
                  {mod.lessons?.map((lesson) => (
                    <li key={lesson.id} style={{ color: '#374151', fontSize: 14 }}>
                      {lesson.title} <span style={{ color: '#6b7280' }}>• {lesson.duration}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
