import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Courses from '../Courses';

const sampleData = [
  {
    id: 'c1',
    title: 'Alpha React',
    level: 'Beginner',
    category: 'Web Development',
    description: 'Intro to React',
    thumbnail: 'https://via.placeholder.com/640x360',
    duration: '1h 30m',
    lessonsCount: 5,
    rating: 4.9,
    instructor: { name: 'Jane', title: 'Instructor', bio: 'Bio', avatar: 'https://via.placeholder.com/100' },
    curriculum: [],
    assignments: [],
    quizzes: [],
    resources: [],
    students: 500,
    price: 0,
  },
  {
    id: 'c2',
    title: 'Zebra Node',
    level: 'Intermediate',
    category: 'Backend',
    description: 'APIs with Node',
    thumbnail: 'https://via.placeholder.com/640x360',
    duration: '3h',
    lessonsCount: 12,
    rating: 4.4,
    instructor: { name: 'Alex', title: 'Instructor', bio: 'Bio', avatar: 'https://via.placeholder.com/100' },
    curriculum: [],
    assignments: [],
    quizzes: [],
    resources: [],
    students: 1200,
    price: 49,
  },
];

function renderCourses() {
  return render(
    <MemoryRouter initialEntries={['/courses']}>
      <Routes>
        <Route path="/courses" element={<Courses coursesData={sampleData} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Courses filtering and sorting', () => {
  it('filters by search query', () => {
    renderCourses();
    const search = screen.getByRole('searchbox', { name: /search courses/i });
    fireEvent.change(search, { target: { value: 'zebra' } });

    // Only Zebra Node should remain
    expect(screen.getByText(/zebra node/i)).toBeInTheDocument();
    expect(screen.queryByText(/alpha react/i)).not.toBeInTheDocument();
  });

  it('filters by category and level', () => {
    renderCourses();

    // Toggle Backend category
    const backendCheckbox = screen.getByLabelText(/Backend/i, { selector: 'input[type="checkbox"]' });
    fireEvent.click(backendCheckbox);

    // Toggle Intermediate level
    const intermediateCheckbox = screen.getByLabelText(/Intermediate/i, { selector: 'input[type="checkbox"]' });
    fireEvent.click(intermediateCheckbox);

    expect(screen.getByText(/zebra node/i)).toBeInTheDocument();
    expect(screen.queryByText(/alpha react/i)).not.toBeInTheDocument();
  });

  it('sorts by title A–Z', () => {
    renderCourses();

    const select = screen.getByRole('combobox', { name: /sort courses/i });
    fireEvent.change(select, { target: { value: 'title_asc' } });

    const cards = screen.getAllByRole('article');
    // First card should be Alpha React before Zebra Node
    const firstTitle = cards[0].querySelector('h3')?.textContent || '';
    expect(firstTitle.toLowerCase()).toContain('alpha');
  });

  it('shows empty state when nothing matches', () => {
    renderCourses();
    const search = screen.getByRole('searchbox', { name: /search courses/i });
    fireEvent.change(search, { target: { value: 'nope-nothing' } });

    expect(screen.getByRole('status', { name: /no courses match/i })).toBeInTheDocument();
  });
});
