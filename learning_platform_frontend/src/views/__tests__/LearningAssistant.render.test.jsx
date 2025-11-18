import React from 'react';
import { render, screen } from '@testing-library/react';
import LearningAssistant from '../../components/assistant/LearningAssistant';

describe('LearningAssistant (static UI)', () => {
  it('renders header and intro message', () => {
    render(<LearningAssistant />);
    expect(screen.getByRole('heading', { name: /learning assistant/i })).toBeInTheDocument();
    expect(
      screen.getByText(/i'm your learning assistant/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /quick suggestions/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /message input/i })).toBeInTheDocument();
  });
});
