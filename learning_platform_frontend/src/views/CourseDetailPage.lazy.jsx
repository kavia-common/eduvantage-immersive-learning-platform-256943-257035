import React, { lazy } from 'react';

// PUBLIC_INTERFACE
// Lazy-loaded wrapper for CourseDetailPage to align with router's lazy pattern.
const CourseDetailPage = lazy(() => import('./CourseDetailPage'));

export default CourseDetailPage;
