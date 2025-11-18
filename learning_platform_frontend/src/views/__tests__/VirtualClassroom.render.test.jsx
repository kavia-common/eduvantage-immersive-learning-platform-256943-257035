import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VirtualClassroom from '../../components/VirtualClassroom';

describe('VirtualClassroom', () => {
  it('renders and toggles connection state', () => {
    render(<VirtualClassroom />);
    // Initially disconnected
    expect(screen.getByRole('button', { name: /join classroom/i })).toBeInTheDocument();

    // Join
    fireEvent.click(screen.getByRole('button', { name: /join classroom/i }));
    expect(screen.getByLabelText(/classroom connected preview/i)).toBeInTheDocument();

    // Toggle camera UI
    fireEvent.click(screen.getByRole('button', { name: /toggle camera/i }));
    expect(screen.getByRole('button', { name: /toggle camera/i })).toBeInTheDocument();

    // Leave
    fireEvent.click(screen.getByRole('button', { name: /leave/i }));
    expect(screen.getByRole('button', { name: /join classroom/i })).toBeInTheDocument();
  });
});
