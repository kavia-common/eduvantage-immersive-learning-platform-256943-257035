import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseCurriculum } from '../courses/CourseCurriculum';

const course = {
  curriculum: [
    { id: 'm1', title: 'Module 1', summary: 'sum', lessons: [{ id: 'l1', title: 'Lesson 1', duration: '1m' }] }
  ]
};

describe('CourseCurriculum', () => {
  it('expands and collapses modules', () => {
    render(<CourseCurriculum course={course} />);
    const toggle = screen.getByRole('button', { name: /module 1/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Lesson 1/i)).toBeInTheDocument();
  });
});
