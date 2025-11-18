import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Courses from '../Courses';

const sampleData = [
  {
    id: 'a',
    title: 'Fast React',
    level: 'Beginner',
    category: 'Web',
    description: 'React quickstart',
    thumbnail: 'https://via.placeholder.com/640x360',
    duration: '90m',
    lessonsCount: 10,
    rating: 4.9,
    students: 1000,
    price: 0,
    instructor: { name: 'Jane Doe' }
  },
  {
    id: 'b',
    title: 'Deep Node',
    level: 'Advanced',
    category: 'Backend',
    description: 'Node internals',
    thumbnail: 'https://via.placeholder.com/640x360',
    duration: '8 weeks',
    lessonsCount: 25,
    rating: 4.6,
    students: 2000,
    price: 99,
    instructor: { name: 'John Smith' }
  },
  {
    id: 'c',
    title: 'Design Systems',
    level: 'Intermediate',
    category: 'UI/UX',
    description: 'Systems',
    thumbnail: 'https://via.placeholder.com/640x360',
    duration: '6h 0m',
    lessonsCount: 12,
    rating: 4.7,
    students: 500,
    price: 49,
    instructor: { name: 'Jane Doe' }
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

describe('Courses new facets', () => {
  it('filters by instructor multi-select', () => {
    renderCourses();

    // Select Jane Doe instructor
    const instrCheckbox = screen.getByLabelText(/Jane Doe/i, { selector: 'input[type="checkbox"]' });
    fireEvent.click(instrCheckbox);

    expect(screen.getByText(/Fast React/i)).toBeInTheDocument();
    expect(screen.getByText(/Design Systems/i)).toBeInTheDocument();
    expect(screen.queryByText(/Deep Node/i)).not.toBeInTheDocument();
  });

  it('filters by price range', () => {
    renderCourses();

    const min = screen.getByRole('spinbutton', { name: /minimum price/i });
    const max = screen.getByRole('spinbutton', { name: /maximum price/i });

    fireEvent.change(min, { target: { value: '10' } });
    fireEvent.change(max, { target: { value: '60' } });

    // Only prices between 10 and 60 -> Design Systems ($49)
    expect(screen.getByText(/Design Systems/i)).toBeInTheDocument();
    expect(screen.queryByText(/Fast React/i)).not.toBeInTheDocument(); // $0
    expect(screen.queryByText(/Deep Node/i)).not.toBeInTheDocument(); // $99
  });

  it('filters by duration range with weeks parsing', () => {
    renderCourses();

    const min = screen.getByRole('spinbutton', { name: /minimum duration in minutes/i });
    const max = screen.getByRole('spinbutton', { name: /maximum duration in minutes/i });

    // Set min to a large value like 4000 minutes to try to include only "8 weeks" (~80640 minutes) and exclude others
    fireEvent.change(min, { target: { value: '40000' } }); // 40k minutes
    fireEvent.change(max, { target: { value: '100000' } }); // 100k minutes

    // Only the 8 weeks course should remain
    expect(screen.getByText(/Deep Node/i)).toBeInTheDocument();
    expect(screen.queryByText(/Fast React/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Design Systems/i)).not.toBeInTheDocument();
  });
});
