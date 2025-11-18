import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VirtualClassroom from '../VirtualClassroom';

describe('VirtualClassroom media UX', () => {
  it('renders Join button and idle hint', () => {
    render(<VirtualClassroom embedded />);
    expect(screen.getByRole('button', { name: /join classroom/i })).toBeInTheDocument();
    expect(screen.getByText(/click join to enable your camera preview/i)).toBeInTheDocument();
  });

  it('after clicking Join, shows requesting or error/insecure state hint (no real media in test)', async () => {
    // Force non-secure context in jsdom
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    render(<VirtualClassroom embedded />);
    fireEvent.click(screen.getByRole('button', { name: /join classroom/i }));
    // We expect a hint about insecure or requesting; since we set insecure, expect insecure hint
    expect(await screen.findByText(/insecure context/i)).toBeInTheDocument();
  });
});
