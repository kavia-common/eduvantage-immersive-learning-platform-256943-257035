import React, { useMemo, useState } from 'react';
import './dashboard.css';
import '../styles/utilities.css';
import { CourseOverview } from '../components/courses/CourseOverview';
import { CourseCurriculum } from '../components/courses/CourseCurriculum';
import { CourseInstructor } from '../components/courses/CourseInstructor';
import { CourseAssignments } from '../components/courses/CourseAssignments';
import { CourseQuizzes } from '../components/courses/CourseQuizzes';
import { CourseResources } from '../components/courses/CourseResources';
import { CourseCard } from '../components/courses/CourseCard';

/**
 * PUBLIC_INTERFACE
 * CourseCatalog view renders a responsive grid of CourseCards and
 * shows a CourseDetail panel with tabs when a course is selected.
 *
 * Accessibility:
 * - ARIA labels for interactive elements
 * - Keyboard navigable card selection
 * - Role attributes for tablist and tabs
 *
 * Styling:
 * - Uses existing .glass classes and shared Button variants from components/common/Button
 */

const defaultCourses = [
  {
    id: 'react-101',
    title: 'React 101: Fundamentals',
    level: 'Beginner',
    category: 'Web Development',
    description:
      'Learn the fundamentals of React, including components, props, state, and hooks with hands-on examples.',
    thumbnail:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    duration: '6h 30m',
    lessonsCount: 24,
    rating: 4.7,
    instructor: {
      name: 'Alex Rivera',
      title: 'Senior Frontend Engineer',
      bio: 'Alex has 10+ years building interactive web apps and mentoring teams on React best practices.',
      avatar:
        'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop',
    },
    curriculum: [
      {
        id: 'm1',
        title: 'Getting Started',
        summary: 'Introduction to React and project setup',
        lessons: [
          { id: 'l1', title: 'What is React?', duration: '7m' },
          { id: 'l2', title: 'Create React App and Vite', duration: '10m' },
          { id: 'l3', title: 'JSX, Components & Props', duration: '16m' },
        ],
      },
      {
        id: 'm2',
        title: 'State & Effects',
        summary: 'Manage component state and side-effects',
        lessons: [
          { id: 'l4', title: 'useState Deep Dive', duration: '14m' },
          { id: 'l5', title: 'useEffect Patterns', duration: '18m' },
          { id: 'l6', title: 'Data Fetching Basics', duration: '12m' },
        ],
      },
    ],
    assignments: [
      { id: 'a1', title: 'Build a Counter Component', due: 'Next Week' },
      { id: 'a2', title: 'Create a Todo App', due: '2 Weeks' },
    ],
    quizzes: [
      { id: 'q1', title: 'React Basics Quiz', questions: 10 },
      { id: 'q2', title: 'Hooks & State Quiz', questions: 12 },
    ],
    resources: [
      { id: 'r1', title: 'Cheatsheet: React Hooks', type: 'pdf' },
      { id: 'r2', title: 'GitHub Starter Repo', type: 'link' },
    ],
    previewVideo: {
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      caption: 'Course preview: What you will learn',
    },
  },
  {
    id: 'node-api',
    title: 'Node.js APIs with Express',
    level: 'Intermediate',
    category: 'Backend',
    description:
      'Design and build robust REST APIs using Node.js, Express, and best-practice middleware patterns.',
    thumbnail:
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop',
    duration: '8h 10m',
    lessonsCount: 30,
    rating: 4.6,
    instructor: {
      name: 'Priya Shah',
      title: 'Backend Architect',
      bio: 'Priya architects reliable services and teaches production-ready API design and security.',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    },
    curriculum: [
      {
        id: 'm1',
        title: 'API Foundations',
        summary: 'HTTP, REST, and Express fundamentals',
        lessons: [
          { id: 'l1', title: 'HTTP Refresher', duration: '9m' },
          { id: 'l2', title: 'Express Routing', duration: '15m' },
        ],
      },
    ],
    assignments: [{ id: 'a1', title: 'Build a CRUD API', due: '2 Weeks' }],
    quizzes: [{ id: 'q1', title: 'REST Principles', questions: 8 }],
    resources: [{ id: 'r1', title: 'Postman Collection', type: 'json' }],
    previewVideo: {
      src: 'https://www.w3schools.com/html/movie.mp4',
      caption: 'API course teaser',
    },
  },
];

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'instructor', label: 'Instructor' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'resources', label: 'Resources' },
];

export default function Courses({ coursesData }) {
  const courses = useMemo(() => coursesData || defaultCourses, [coursesData]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const onSelect = (course) => {
    setSelected(course);
    setActiveTab('overview');
  };

  const renderTab = () => {
    if (!selected) return null;
    switch (activeTab) {
      case 'overview':
        return <CourseOverview course={selected} />;
      case 'curriculum':
        return <CourseCurriculum course={selected} />;
      case 'instructor':
        return <CourseInstructor course={selected} />;
      case 'assignments':
        return <CourseAssignments course={selected} />;
      case 'quizzes':
        return <CourseQuizzes course={selected} />;
      case 'resources':
        return <CourseResources course={selected} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-container" data-testid="courses-page">
      <div className="page-header">
        <h1 className="page-title">Course Catalog</h1>
        <p className="page-subtitle">Explore curated paths to accelerate your learning</p>
      </div>

      <div className="grid-and-detail" style={{ display: 'grid', gridTemplateColumns: selected ? '1.2fr 1fr' : '1fr', gap: '1.25rem' }}>
        <section aria-label="Course list" className="glass panel" style={{ padding: '1rem' }}>
          <div
            className="course-grid"
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            }}
          >
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={() => onSelect(course)}
                isActive={selected?.id === course.id}
              />
            ))}
          </div>
        </section>

        {selected && (
          <aside
            aria-label="Course details"
            className="glass panel"
            style={{ padding: '1rem', minHeight: 360 }}
          >
            <header style={{ marginBottom: '0.75rem' }}>
              <h2 style={{ margin: 0 }}>{selected.title}</h2>
              <p style={{ margin: '0.25rem 0', color: '#4b5563' }}>
                {selected.category} • {selected.level} • {selected.duration}
              </p>
            </header>

            <nav
              aria-label="Course sections"
              role="tablist"
              className="tablist"
              style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.key}`}
                    id={`tab-${tab.key}`}
                    onClick={() => setActiveTab(tab.key)}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: 8 }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
            >
              {renderTab()}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
