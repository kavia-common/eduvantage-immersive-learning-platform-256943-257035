import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Courses from '../Courses';

const sampleData = [
  {
    id: 'c1',
    title: 'Sample Course',
    level: 'Beginner',
    category: 'Category',
    description: 'Desc',
    thumbnail: 'https://via.placeholder.com/640x360',
    duration: '1h',
    lessonsCount: 3,
    rating: 4.5,
    instructor: { name: 'Jane', title: 'Instructor', bio: 'Bio', avatar: 'https://via.placeholder.com/100' },
    curriculum: [{ id: 'm1', title: 'Intro', summary: 'sum', lessons: [{ id: 'l1', title: 'L1', duration: '1m' }] }],
    assignments: [{ id: 'a1', title: 'Assignment', due: 'Soon' }],
    quizzes: [{ id: 'q1', title: 'Quiz', questions: 5 }],
    resources: [{ id: 'r1', title: 'Res', type: 'pdf' }],
  },
];

describe('Courses Page', () => {
  it('renders the course catalog grid and allows selection', () => {
    render(
      <MemoryRouter initialEntries={['/courses']}>
        <Routes>
          <Route path="/courses" element={<Courses coursesData={sampleData} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('courses-page')).toBeInTheDocument();
    // Card present
    expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();

    // Select course
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(screen.getByRole('heading', { name: /sample course/i })).toBeInTheDocument();

    // Tab navigation
    fireEvent.click(screen.getByRole('tab', { name: /curriculum/i }));
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });
});
