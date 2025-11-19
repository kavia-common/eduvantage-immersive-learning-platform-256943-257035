import React, { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { CourseOverview } from '../components/courses/CourseOverview';
import { CourseCurriculum } from '../components/courses/CourseCurriculum';
import { CourseInstructor } from '../components/courses/CourseInstructor';
import { CourseAssignments } from '../components/courses/CourseAssignments';
import { CourseResources } from '../components/courses/CourseResources';
import Button from '../components/common/Button';
import { useAuth } from '../auth/AuthProvider';
import { addToCart, addToWishlist } from '../services/supabaseDataService';

/**
 * PUBLIC_INTERFACE
 * CourseDetailPage
 * 
 * Dedicated route page for displaying a specific course by id with tabbed content.
 * - Reads :id from route params.
 * - Reads ?tab=<name> from query to support deep-linking into tabs.
 * - Renders the same Course Detail layout using existing components.
 * - Provides Back to Courses navigation.
 */
function CourseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [msg, setMsg] = React.useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Supported tabs mapping
  const TABS = useMemo(() => ([
    { key: 'overview', label: 'Overview' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'resources', label: 'Resources' },
  ]), []);

  // Determine active tab from query param with default fallback
  const activeTab = useMemo(() => {
    const qp = (searchParams.get('tab') || '').toLowerCase();
    const valid = TABS.some(t => t.key === qp);
    return valid ? qp : 'overview';
  }, [searchParams, TABS]);

  // Retrieve all courses from the catalog page module to avoid duplication.
  // Courses.jsx exports coursesData; if not, we fallback to an empty list.
  let coursesData = [];
  try {
    // eslint-disable-next-line global-require
    const catalog = require('./Courses.jsx');
    if (catalog && catalog.coursesData) {
      coursesData = catalog.coursesData;
    }
  } catch (e) {
    // no-op: Courses.jsx not resolvable in tests or export not present
  }

  const course = useMemo(() => {
    const cid = String(id);
    return (coursesData || []).find(c => String(c.id) === cid || String(c.slug || '') === cid) || null;
  }, [coursesData, id]);

  const handleTabChange = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key && key !== 'overview') {
      next.set('tab', key);
    } else {
      next.delete('tab');
    }
    setSearchParams(next, { replace: false });
  };

  if (!course) {
    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Button onClick={() => navigate('/courses')} variant="secondary">Back to Courses</Button>
        </div>
        <h2>Course not found</h2>
        <p>The course you are looking for does not exist or is unavailable.</p>
      </div>
    );
  }

  async function onAddToCart() {
    if (!user) { setMsg("Please login to add to cart."); return; }
    try {
      await addToCart(user.id, course.id, 1);
      setMsg("Added to cart");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      setMsg(String(e?.message || e));
    }
  }
  async function onAddToWishlist() {
    if (!user) { setMsg("Please login to add to wishlist."); return; }
    try {
      await addToWishlist(user.id, course.id);
      setMsg("Added to wishlist");
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      setMsg(String(e?.message || e));
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Button onClick={() => navigate('/courses')} variant="secondary">Back to Courses</Button>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{course.title}</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={onAddToCart}>Add to Cart</Button>
          <Button variant="secondary" onClick={onAddToWishlist}>Add to Wishlist</Button>
        </div>
      </div>
      {Boolean(msg) && <div style={{ color: '#2563EB', marginBottom: '.5rem' }}>{msg}</div>}

      {/* Tabs */}
      <div role="tablist" aria-label="Course Tabs" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '0.5rem 0.75rem',
                border: 'none',
                borderBottom: isActive ? '3px solid #2563EB' : '3px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                color: isActive ? '#2563EB' : '#374151',
                fontWeight: isActive ? 600 : 500
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div role="tabpanel" aria-label={`${activeTab} panel`}>
        {activeTab === 'overview' && <CourseOverview course={course} />}
        {activeTab === 'curriculum' && <CourseCurriculum course={course} />}
        {activeTab === 'instructor' && <CourseInstructor course={course} />}
        {activeTab === 'assignments' && <CourseAssignments course={course} />}
        {activeTab === 'resources' && <CourseResources course={course} />}
      </div>

      {/* Deep link hints */}
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
        Shareable link for this tab:{" "}
        <code>
          {`${window.location.origin}/courses/${encodeURIComponent(String(id))}${activeTab !== 'overview' ? `?tab=${activeTab}` : ''}`}
        </code>
      </div>

      {/* Footer navigation */}
      <div style={{ marginTop: '1rem' }}>
        <Link to="/courses" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">Back to Courses</Button>
        </Link>
      </div>
    </div>
  );
}

export default CourseDetailPage;
