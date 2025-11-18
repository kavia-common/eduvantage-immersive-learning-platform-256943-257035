import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppRoutes from '../../routes';
import CourseDetailPage from '../CourseDetailPage';
import { coursesData } from '../Courses';

describe('CourseDetailPage routing', () => {
  it('renders course detail for /courses/:id', async () => {
    const course = coursesData[0];
    render(
      <MemoryRouter initialEntries={[`/courses/${course.id}`]}>
        <Routes>
          <Route path="/courses/:id" element={<CourseDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText(course.title)).toBeInTheDocument();
    // default overview tab should render some overview text if present
    if (course.overview) {
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
    }
  });

  it('honors tab query param (?tab=curriculum)', async () => {
    const course = coursesData[0];
    render(
      <MemoryRouter initialEntries={[`/courses/${course.id}?tab=curriculum`]}>
        <Routes>
          <Route path="/courses/:id" element={<CourseDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    // Expect curriculum panel to be visible by checking a curriculum element
    if (course.curriculum && course.curriculum.length > 0) {
      const sectionTitle = course.curriculum[0].title;
      expect(await screen.findByText(sectionTitle)).toBeInTheDocument();
    } else {
      // fallback: tab button should be highlighted/visible
      expect(screen.getByRole('tab', { name: /curriculum/i })).toBeInTheDocument();
    }
  });

  it('is reachable from main App routes', async () => {
    const course = coursesData[0];
    render(
      <MemoryRouter initialEntries={[`/courses/${course.id}`]}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(await screen.findByText(course.title)).toBeInTheDocument();
  });
});
