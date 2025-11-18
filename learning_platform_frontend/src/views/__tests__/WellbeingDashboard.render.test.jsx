import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WellbeingDashboard from '../../components/wellbeing/WellbeingDashboard';

describe('WellbeingDashboard', () => {
  it('renders mood buttons and allows selection', () => {
    render(<WellbeingDashboard />);

    const moodButtons = screen.getAllByRole('button', { name: /Select mood/i });
    expect(moodButtons.length).toBe(5);

    fireEvent.click(moodButtons[4]); // select 5
    const saveButton = screen.getByRole('button', { name: /Save mood entry/i });
    expect(saveButton).toBeEnabled();
  });

  it('renders weekly chart labels', () => {
    render(<WellbeingDashboard />);
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((d) => {
      expect(screen.getByText(d)).toBeInTheDocument();
    });
  });
});
