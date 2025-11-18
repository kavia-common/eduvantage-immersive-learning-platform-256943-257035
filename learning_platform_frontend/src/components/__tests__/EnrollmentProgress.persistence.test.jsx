import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Courses from '../../views/Courses';
import { enrollmentService } from '../../services/enrollmentService';
import { progressService } from '../../services/progressService';

// Use fake timers for banner auto-hide
jest.useFakeTimers();

const sampleData = [
  {
    id: 'course-x',
    title: 'Course X',
    level: 'Beginner',
    category: 'Cat',
    description: 'Desc',
    thumbnail: 'https://via.placeholder.com/640x360',
    duration: '1h',
    lessonsCount: 2,
    rating: 4.5,
    instructor: { name: 'T', title: 'I', bio: 'B', avatar: 'https://via.placeholder.com/100' },
    curriculum: [
      { id: 'm1', title: 'M1', summary: 's', lessons: [{ id: 'l1', title: 'L1', duration: '1m' }] }
    ],
    assignments: [],
    quizzes: [],
    resources: [],
    previewVideo: { src: 'https://www.w3schools.com/html/mov_bbb.mp4', caption: 'c' },
  },
];

describe('Enrollment and Progress persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    enrollmentService.clear?.();
    progressService.clearAll?.();
  });

  test('Enroll persists state and banner shows', async () => {
    render(
      <MemoryRouter initialEntries={['/courses']}>
        <Routes>
          <Route path="/courses" element={<Courses coursesData={sampleData} />} />
        </Routes>
      </MemoryRouter>
    );

    // Open detail
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    // Enroll
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /enroll now/i }));
    });

    // Banner visible
    expect(screen.getByTestId('enroll-success-banner')).toBeInTheDocument();

    // Advance timers to hide
    act(() => jest.advanceTimersByTime(2200));

    // Check storage
    const raw = window.localStorage.getItem(enrollmentService.key);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed.enrolled)).toBe(true);
    expect(parsed.enrolled.includes('course-x')).toBe(true);
  });

  test('Mark lesson complete persists in progress service', async () => {
    // Pre-enroll to enable Start button
    enrollmentService.enroll('course-x');

    render(
      <MemoryRouter initialEntries={['/courses']}>
        <Routes>
          <Route path="/courses" element={<Courses coursesData={sampleData} />} />
        </Routes>
      </MemoryRouter>
    );

    // Open detail and go to curriculum
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    fireEvent.click(screen.getByRole('tab', { name: /curriculum/i }));

    // Start lesson
    const startBtn = screen.getByRole('button', { name: /start l1/i });
    fireEvent.click(startBtn);

    // Mark complete via inline player button
    const markBtn = screen.getByRole('button', { name: /mark complete/i });
    await act(async () => {
      fireEvent.click(markBtn);
    });

    const raw = window.localStorage.getItem(progressService.key);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed['course-x'].completed.includes('l1')).toBe(true);
  });
});
