import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import VirtualClassroom from '../VirtualClassroom';

function mockMediaStream({ videoReady = 'live' } = {}) {
  const videoTrack = { enabled: true, stop: jest.fn(), readyState: videoReady };
  const audioTrack = { enabled: true, stop: jest.fn(), readyState: 'live' };
  return {
    getTracks: () => [videoTrack, audioTrack],
    getVideoTracks: () => [videoTrack],
    getAudioTracks: () => [audioTrack],
  };
}

describe('VirtualClassroom media UX', () => {
  beforeEach(() => {
    // Secure context for media
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
  });

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
    expect(await screen.findByText(/insecure context/i)).toBeInTheDocument();
  });

  it('attaches MediaStream to video element and calls play on loadedmetadata', async () => {
    const stream = mockMediaStream();
    const getUserMedia = jest.fn().mockResolvedValue(stream);
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia },
      configurable: true
    });

    render(<VirtualClassroom embedded />);
    const joinBtn = screen.getByRole('button', { name: /join classroom/i });

    await act(async () => {
      fireEvent.click(joinBtn);
    });

    // Connected view present
    expect(await screen.findByLabelText(/classroom connected preview/i)).toBeInTheDocument();

    // Find the video and simulate metadata loaded
    const videoEl = screen.getByLabelText(/local camera preview/i);
    // JSDOM doesn't implement play; spy on it
    const playSpy = jest.spyOn(videoEl, 'play').mockResolvedValue();

    // Trigger loadedmetadata if handler was set
    if (typeof videoEl.onloadedmetadata === 'function') {
      await act(async () => {
        videoEl.onloadedmetadata();
      });
    } else {
      await act(async () => {
        videoEl.dispatchEvent(new Event('loadedmetadata'));
      });
    }

    expect(playSpy).toHaveBeenCalled();

    // srcObject assigned
    expect(videoEl.srcObject).toBe(stream);

    playSpy.mockRestore();
  });

  it('shows fallback overlay when track readyState is not live', async () => {
    const stream = mockMediaStream({ videoReady: 'ended' });
    const getUserMedia = jest.fn().mockResolvedValue(stream);
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: { getUserMedia },
      configurable: true
    });

    render(<VirtualClassroom embedded />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /join classroom/i }));
    });

    // Fallback message visible
    expect(await screen.findByText(/camera stream initializing/i)).toBeInTheDocument();
  });
});
