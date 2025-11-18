import React from 'react';
import '../styles/utilities.css';
import '../styles/theme.css';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

/**
 * PUBLIC_INTERFACE
 * StylePreview
 * Lightweight visual smoke test page to preview glass utilities.
 */
export default function StylePreview() {
  return (
    <div className="container" style={{ padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Glassmorphism Preview</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Card variant="glass">Card (glass)</Card>
        <Card variant="solid">Card (solid)</Card>
        <Card variant="glass-dark">Card (glass-dark)</Card>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="glass">Glass Button</Button>
        <Button variant="glassDark">Glass Dark Button</Button>
      </div>

      <div className="glass" style={{ marginTop: '1.5rem', padding: '1rem' }}>
        <div style={{ height: 1 }} className="glass-divider" />
        <p style={{ marginTop: '0.75rem' }}>Generic container using .glass utility</p>
      </div>
    </div>
  );
}
