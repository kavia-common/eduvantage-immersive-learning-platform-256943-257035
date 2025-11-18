import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Profile from '../Profile';

describe('Profile Page', () => {
  it('renders header and tabs', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    // Wait for loading skeleton to be replaced
    expect(await screen.findByText(/Your Profile/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Profile Info/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Learning Progress/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Account Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Security/i })).toBeInTheDocument();
  });
});
