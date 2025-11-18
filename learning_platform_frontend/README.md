# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- Lightweight: No heavy UI frameworks - uses only vanilla CSS and React
- Modern UI: Clean, responsive design with Ocean Professional styling
- Fast: Minimal dependencies for quick loading times
- Simple: Easy to understand and modify

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.
Open http://localhost:3000 to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

## Theming

Theme variables are defined in `src/styles/variables.css` and applied via `src/styles/theme.css`.

## Glassmorphism Utilities

We added lightweight glassmorphism utility classes aligned with the Ocean Professional theme.

Available classes:
- `.glass` – light glass surface with blur, subtle gradient, border, and shadow
- `.glass-dark` – dark glass surface variant
- Helpers: `.glass-sm`, `.glass-lg`, `.glass-divider`
- Use `.is-interactive` alongside for hover elevation on interactive surfaces

Usage examples:
```jsx
// Card
import Card from './src/components/common/Card';
<Card variant="glass">Content</Card>
<Card variant="glass-dark">Content</Card>

// Button
import Button from './src/components/common/Button';
<Button variant="glass">Try it</Button>
<Button variant="glassDark">Dark</Button>

// Generic container
<div className="glass">Any content</div>
```

Where are the styles defined?
- Global utilities: `src/styles/utilities.css` (no secrets, uses theme variables)

Preview page:
- Navigate to `/style-preview` during development to see a simple visual smoke test.

## Learn More

To learn React, check out the React documentation: https://reactjs.org/
