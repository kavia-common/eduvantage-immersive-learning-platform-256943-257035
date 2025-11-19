import React, { useEffect, useMemo, useState } from 'react';
import './dashboard.css';
import '../styles/utilities.css';
import { useNavigate } from 'react-router-dom';
import { CourseOverview } from '../components/courses/CourseOverview';
import { CourseCurriculum } from '../components/courses/CourseCurriculum';
import { CourseInstructor } from '../components/courses/CourseInstructor';
import { CourseAssignments } from '../components/courses/CourseAssignments';
import { CourseResources } from '../components/courses/CourseResources';
import { CourseCard } from '../components/courses/CourseCard';
import Button from '../components/common/Button';
import { enrollmentService } from '../services/enrollmentService';
import { settingsStorage } from '../services/settingsStorage';

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
 *
 * Filters/Sorting:
 * - Search by title/description/instructor
 * - Multi-select Category and Level filters
 * - NEW: Instructor multi-select derived from data
 * - NEW: Price range (min/max)
 * - NEW: Duration range (in minutes; accepts “h/m” or “X weeks” parsing)
 * - Sort by rating, price (if present), duration (hh/mm), popularity (students), title A–Z
 */

// PUBLIC_INTERFACE
export const coursesData = [
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
    students: 1500,
    price: 0,
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
    students: 2200,
    price: 79,
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
  { key: 'resources', label: 'Resources' },
];

export default function Courses({ coursesData: overrideData }) {
  const navigate = useNavigate();
  const courses = useMemo(() => overrideData || coursesData, [overrideData]);

  // Detail/enrollment state (existing)
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolledIds, setEnrolledIds] = useState(() => enrollmentService.getAll());
  const [banner, setBanner] = useState(null);

  // Filter/sort/search state
  const STORAGE_SECTION = 'courses_catalog';
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [sortKey, setSortKey] = useState('rating_desc'); // default sort

  // NEW: facet state
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [durationMin, setDurationMin] = useState(''); // minutes
  const [durationMax, setDurationMax] = useState(''); // minutes
  const [selectedInstructors, setSelectedInstructors] = useState([]);

  // Hydrate from settingsStorage (optional persistence)
  useEffect(() => {
    const settings = settingsStorage.get();
    if (settings?.[STORAGE_SECTION]) {
      const {
        query: q,
        selectedCategories: c,
        selectedLevels: l,
        sortKey: s,
        priceMin: pmin,
        priceMax: pmax,
        durationMin: dmin,
        durationMax: dmax,
        selectedInstructors: si,
      } = settings[STORAGE_SECTION];
      if (typeof q === 'string') setQuery(q);
      if (Array.isArray(c)) setSelectedCategories(c);
      if (Array.isArray(l)) setSelectedLevels(l);
      if (typeof s === 'string') setSortKey(s);
      if (pmin !== undefined) setPriceMin(String(pmin));
      if (pmax !== undefined) setPriceMax(String(pmax));
      if (dmin !== undefined) setDurationMin(String(dmin));
      if (dmax !== undefined) setDurationMax(String(dmax));
      if (Array.isArray(si)) setSelectedInstructors(si);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    const prev = settingsStorage.get() || {};
    const next = {
      ...prev,
      [STORAGE_SECTION]: {
        query,
        selectedCategories,
        selectedLevels,
        sortKey,
        priceMin,
        priceMax,
        durationMin,
        durationMax,
        selectedInstructors,
      },
    };
    settingsStorage.set(next);
  }, [query, selectedCategories, selectedLevels, sortKey, priceMin, priceMax, durationMin, durationMax, selectedInstructors]);

  useEffect(() => {
    // Hydrate enrolled state on mount or storage changes
    try {
      setEnrolledIds(enrollmentService.getAll());
    } catch {}
  }, []);

  // Derive available categories and levels from data
  const allCategories = useMemo(
    () => Array.from(new Set((courses || []).map(c => c.category).filter(Boolean))).sort(),
    [courses]
  );
  const allLevels = useMemo(
    () => Array.from(new Set((courses || []).map(c => c.level).filter(Boolean))).sort(),
    [courses]
  );

  const allInstructors = useMemo(
    () => Array.from(new Set((courses || []).map(c => c?.instructor?.name).filter(Boolean))).sort(),
    [courses]
  );

  // Helpers
  const parseDurationToMinutes = (dur) => {
    // Accept formats like "6h 30m", "8h", "45m", or "8 weeks"
    if (!dur) return 0;
    if (typeof dur === 'number') return dur;
    if (typeof dur === 'string') {
      const weeks = /([0-9]+)\s*week/i.exec(dur)?.[1];
      if (weeks) {
        const w = parseInt(weeks, 10);
        // Assume 1 week ~ 7 days * 24h -> minutes
        return w * 7 * 24 * 60;
      }
      const h = /([0-9]+)\s*h/i.exec(dur)?.[1];
      const m = /([0-9]+)\s*m/i.exec(dur)?.[1];
      const hours = h ? parseInt(h, 10) : 0;
      const mins = m ? parseInt(m, 10) : 0;
      return hours * 60 + mins;
    }
    return 0;
  };

  const toNumberOr = (v, fallback = undefined) => {
    if (v === '' || v === null || v === undefined) return fallback;
    const n = Number(v);
    return Number.isNaN(n) ? fallback : n;
  };

  const compareString = (a = '', b = '') => a.localeCompare(b, undefined, { sensitivity: 'base' });

  // Derived filtered + sorted list
  const visibleCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pmin = toNumberOr(priceMin, undefined);
    const pmax = toNumberOr(priceMax, undefined);
    const dmin = toNumberOr(durationMin, undefined);
    const dmax = toNumberOr(durationMax, undefined);

    const matchQuery = (c) => {
      if (!q) return true;
      const hay = [
        c.title,
        c.description,
        c.category,
        c.level,
        c?.instructor?.name,
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    };
    const matchCategory = (c) => selectedCategories.length === 0 || selectedCategories.includes(c.category);
    const matchLevel = (c) => selectedLevels.length === 0 || selectedLevels.includes(c.level);
    const matchInstructor = (c) =>
      selectedInstructors.length === 0 || selectedInstructors.includes(c?.instructor?.name);
    const matchPrice = (c) => {
      const val = toNumberOr(c.price ?? 0, 0);
      if (pmin !== undefined && val < pmin) return false;
      if (pmax !== undefined && val > pmax) return false;
      return true;
    };
    const matchDuration = (c) => {
      const mins = parseDurationToMinutes(c.duration);
      if (dmin !== undefined && mins < dmin) return false;
      if (dmax !== undefined && mins > dmax) return false;
      return true;
    };

    const filtered = (courses || []).filter(
      (c) =>
        matchQuery(c) &&
        matchCategory(c) &&
        matchLevel(c) &&
        matchInstructor(c) &&
        matchPrice(c) &&
        matchDuration(c)
    );

    const by = (key) => {
      switch (key) {
        case 'rating_desc':
          return (a, b) => (b.rating || 0) - (a.rating || 0);
        case 'rating_asc':
          return (a, b) => (a.rating || 0) - (b.rating || 0);
        case 'duration_asc':
          return (a, b) => parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration);
        case 'duration_desc':
          return (a, b) => parseDurationToMinutes(b.duration) - parseDurationToMinutes(a.duration);
        case 'students_desc':
          return (a, b) => (b.students || 0) - (a.students || 0);
        case 'students_asc':
          return (a, b) => (a.students || 0) - (b.students || 0);
        case 'price_asc':
          return (a, b) => (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (a, b) => (b.price || 0) - (a.price || 0);
        case 'title_asc':
          return (a, b) => compareString(a.title, b.title);
        default:
          return (a, b) => (b.rating || 0) - (a.rating || 0);
      }
    };

    return filtered.slice().sort(by(sortKey));
  }, [courses, query, selectedCategories, selectedLevels, selectedInstructors, priceMin, priceMax, durationMin, durationMax, sortKey]);

  const onSelect = (course) => {
    setSelected(course);
    setActiveTab('overview');
    // Navigate to dedicated page for shareable URL
    navigate(`/courses/${encodeURIComponent(String(course.id))}`);
  };

  const onEnroll = (courseId) => {
    const res = enrollmentService.enroll(courseId);
    setEnrolledIds(res.enrolled);
    setBanner({ type: 'success', text: 'Enrolled successfully! You can start the curriculum now.' });
    // Auto-hide banner after a short delay
    setTimeout(() => setBanner(null), 2000);
    // Optionally move to curriculum tab to begin
    setActiveTab('curriculum');
  };

  const renderTab = () => {
    if (!selected) return null;
    switch (activeTab) {
      case 'overview':
        return <CourseOverview course={selected} />;
      case 'curriculum':
        return <CourseCurriculum course={selected} isEnrolled={enrolledIds.includes(selected.id)} />;
      case 'instructor':
        return <CourseInstructor course={selected} />;
      case 'assignments':
        return <CourseAssignments course={selected} />;
      case 'resources':
        return <CourseResources course={selected} />;
      default:
        return null;
    }
  };

  // Multi-select handlers using checkboxes
  const toggleInArray = (arr, value) => (arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);

  return (
    <div className="page-container" data-testid="courses-page">
      <div className="page-header">
        <h1 className="page-title">Course Catalog</h1>
        <p className="page-subtitle">Explore curated paths to accelerate your learning</p>
      </div>

      {/* Controls bar */}
      <section
        aria-label="Course catalog controls"
        className="glass panel"
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '0.75rem',
          display: 'grid',
          gap: '0.75rem',
        }}
      >
        {/* Row 1: Search + Sort */}
        <div
          className="flex"
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <div style={{ flex: '1 1 260px', minWidth: 220 }}>
            <label htmlFor="course-search" className="sr-only">Search courses</label>
            <input
              id="course-search"
              type="search"
              placeholder="Search by title, description, or instructor"
              aria-label="Search courses"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="glass"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.06)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: '0 1 220px', minWidth: 160 }}>
            <label htmlFor="sort-select" className="sr-only">Sort courses</label>
            <select
              id="sort-select"
              aria-label="Sort courses"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="glass"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8 }}
            >
              <option value="rating_desc">Top rated</option>
              <option value="rating_asc">Rating: Low to High</option>
              <option value="duration_asc">Duration: Shortest</option>
              <option value="duration_desc">Duration: Longest</option>
              <option value="students_desc">Most popular</option>
              <option value="students_asc">Least popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Title: A–Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div
          className="flex"
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}
        >
          {/* Category filter */}
          <fieldset
            aria-labelledby="category-legend"
            className="glass"
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, minWidth: 220, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <legend id="category-legend" style={{ fontSize: 13, color: '#4b5563' }}>Categories</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allCategories.map((cat) => {
                const id = `cat-${cat}`;
                const checked = selectedCategories.includes(cat);
                return (
                  <label key={cat} htmlFor={id} className="is-interactive" style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => setSelectedCategories(prev => toggleInArray(prev, cat))}
                      aria-checked={checked}
                    />
                    <span>{cat}</span>
                  </label>
                );
              })}
              {allCategories.length === 0 && <span style={{ color: '#6b7280' }}>No categories</span>}
            </div>
          </fieldset>

          {/* Level filter */}
          <fieldset
            aria-labelledby="level-legend"
            className="glass"
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, minWidth: 200, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <legend id="level-legend" style={{ fontSize: 13, color: '#4b5563' }}>Levels</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allLevels.map((lvl) => {
                const id = `lvl-${lvl}`;
                const checked = selectedLevels.includes(lvl);
                return (
                  <label key={lvl} htmlFor={id} className="is-interactive" style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => setSelectedLevels(prev => toggleInArray(prev, lvl))}
                      aria-checked={checked}
                    />
                    <span>{lvl}</span>
                  </label>
                );
              })}
              {allLevels.length === 0 && <span style={{ color: '#6b7280' }}>No levels</span>}
            </div>
          </fieldset>

          {/* Instructor filter */}
          <fieldset
            aria-labelledby="instructor-legend"
            className="glass"
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, minWidth: 220, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <legend id="instructor-legend" style={{ fontSize: 13, color: '#4b5563' }}>Instructors</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxWidth: 420 }}>
              {allInstructors.map((name) => {
                const id = `instr-${name}`;
                const checked = selectedInstructors.includes(name);
                return (
                  <label key={name} htmlFor={id} className="is-interactive" style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => setSelectedInstructors(prev => toggleInArray(prev, name))}
                      aria-checked={checked}
                    />
                    <span>{name}</span>
                  </label>
                );
              })}
              {allInstructors.length === 0 && <span style={{ color: '#6b7280' }}>No instructors</span>}
            </div>
          </fieldset>

          {/* Price range */}
          <fieldset
            aria-labelledby="price-legend"
            className="glass"
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, minWidth: 220, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <legend id="price-legend" style={{ fontSize: 13, color: '#4b5563' }}>Price range</legend>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 90 }}>
                <label htmlFor="price-min" className="sr-only">Minimum price</label>
                <input
                  id="price-min"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Min"
                  aria-label="Minimum price"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="glass"
                  style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: 6 }}
                />
              </div>
              <span aria-hidden="true">–</span>
              <div style={{ minWidth: 90 }}>
                <label htmlFor="price-max" className="sr-only">Maximum price</label>
                <input
                  id="price-max"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Max"
                  aria-label="Maximum price"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="glass"
                  style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: 6 }}
                />
              </div>
            </div>
          </fieldset>

          {/* Duration range (minutes) */}
          <fieldset
            aria-labelledby="duration-legend"
            className="glass"
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, minWidth: 240, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <legend id="duration-legend" style={{ fontSize: 13, color: '#4b5563' }}>Duration (minutes)</legend>
            <div id="duration-help" style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              You can filter by total minutes. Durations like “8 weeks” are parsed to minutes automatically.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 90 }}>
                <label htmlFor="duration-min" className="sr-only">Minimum duration in minutes</label>
                <input
                  id="duration-min"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Min"
                  aria-label="Minimum duration in minutes"
                  aria-describedby="duration-help"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="glass"
                  style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: 6 }}
                />
              </div>
              <span aria-hidden="true">–</span>
              <div style={{ minWidth: 90 }}>
                <label htmlFor="duration-max" className="sr-only">Maximum duration in minutes</label>
                <input
                  id="duration-max"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Max"
                  aria-label="Maximum duration in minutes"
                  aria-describedby="duration-help"
                  value={durationMax}
                  onChange={(e) => setDurationMax(e.target.value)}
                  className="glass"
                  style={{ width: '100%', padding: '0.4rem 0.5rem', borderRadius: 6 }}
                />
              </div>
            </div>
          </fieldset>

          {/* Clear filters button */}
          <div style={{ marginLeft: 'auto' }}>
            <Button
              variant="glass"
              aria-label="Clear filters"
              onClick={() => {
                setQuery('');
                setSelectedCategories([]);
                setSelectedLevels([]);
                setSelectedInstructors([]);
                setPriceMin('');
                setPriceMax('');
                setDurationMin('');
                setDurationMax('');
                setSortKey('rating_desc');
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </section>

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
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={() => onSelect(course)}
                isActive={selected?.id === course.id}
              />
            ))}

            {visibleCourses.length === 0 && (
              <div
                role="status"
                aria-live="polite"
                className="glass"
                style={{ padding: '1rem', borderRadius: 8, gridColumn: '1 / -1', color: '#6b7280' }}
              >
                No courses match your filters.
              </div>
            )}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {!enrolledIds.includes(selected.id) ? (
                  <Button
                    variant="primary"
                    size="sm"
                    aria-label={`Enroll in ${selected.title}`}
                    onClick={() => onEnroll(selected.id)}
                  >
                    Enroll Now
                  </Button>
                ) : (
                  <span className="glass" style={{ padding: '0.25rem 0.5rem', borderRadius: 8, fontSize: 12, color: '#065f46', background: 'rgba(16,185,129,0.12)' }}>
                    Enrolled
                  </span>
                )}
                {banner && banner.type === 'success' && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="glass"
                    data-testid="enroll-success-banner"
                    style={{ padding: '0.4rem 0.6rem', borderRadius: 8, fontSize: 12, color: '#065f46', background: 'rgba(16,185,129,0.12)' }}
                  >
                    {banner.text}
                  </div>
                )}
              </div>
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
