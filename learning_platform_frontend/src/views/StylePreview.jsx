import React from 'react';
import '../styles/utilities.css';
import '../styles/theme.css';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

/**
 * PUBLIC_INTERFACE
 * StylePreview
 * Lightweight visual smoke test page to preview button variants and glass utilities.
 */
export default function StylePreview() {
  return (
    <div className="container" style={{ padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Style Preview</h2>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="analytics">Analytics</Button>
        <Button variant="aiTutor">AI Tutor</Button>
        <Button className="btn-outline">Outline</Button>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: '1.5rem' }}>
        <Card variant="glass">Card (glass)</Card>
        <Card variant="solid">Card (solid)</Card>
        <Card variant="glass-dark">Card (glass-dark)</Card>
      </div>

      <div className="glass" style={{ marginTop: '1.5rem', padding: '1rem' }}>
        <div style={{ height: 1 }} className="glass-divider" />
        <p style={{ marginTop: '0.75rem' }}>Generic container using .glass utility</p>
      </div>
    </div>
  );
}
