# Flappy Wings

A polished browser game inspired by classic Flappy-style gameplay, built with HTML5 Canvas, vanilla JavaScript, and modern CSS.

Flappy Wings emphasizes responsive controls, visual quality, and clean project structure. It is designed to be easy to run, easy to review, and easy to extend.

## Why This Project

- Demonstrates game-loop architecture and collision detection in plain JavaScript.
- Showcases custom canvas rendering (bird, pipes, layered sky effects).
- Includes UX refinements for desktop and mobile controls.
- Provides an approachable codebase for iteration and feature work.

## Demo

Run locally and open:

    http://localhost:8080/

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas 2D API

## Quick Start

### Option 1: Python (recommended)

From the project folder:

    py -m http.server 8080

If py is not available:

    python -m http.server 8080

Then open:

    http://localhost:8080/

### Option 2: PowerShell lightweight server

If you prefer PowerShell-only hosting, you can run a simple static file listener (as used during development).

## Controls

- Space: flap
- Up Arrow: flap
- Mouse click on canvas: flap
- Touch tap on canvas: flap

## Gameplay Notes

- Pass through pipe gaps to score points.
- High score is tracked during the session.
- Ground collision ends the run.

## Project Structure

    Flappy Wings/
    ├── index.html      # App shell and UI layout
    ├── style.css       # Theme, responsive layout, and component styling
    ├── script.js       # Game loop, rendering, input, collision, scoring
    └── README.md

## Architecture Overview

- Entry point
  - index.html loads styles and script, and defines canvas/UI elements.
- Game state
  - script.js manages bird state, pipe list, score, frame count, and game mode.
- Main loop
  - requestAnimationFrame drives updates and drawing.
- Rendering
  - Bird and pipe classes draw directly to canvas.
  - Sky, clouds, glow, and layered effects are rendered each frame.
- Input handling
  - Keyboard, mouse, and touch routes through a unified primary action flow.

## Troubleshooting

### The game does not load on localhost

- Confirm you started the server in the project root.
- Confirm port 8080 is available.
- Try a different port:

    py -m http.server 8081

Then open:

    http://localhost:8081/

### I hear no sound effects

- Ensure sound files exist at:
  - sounds/flap.mp3
  - sounds/coin.mp3
- Browser autoplay restrictions may block audio until first user input.

### Controls are not responding

- Click inside the browser tab once to ensure focus.
- Start with the Start Game button, then use Space/Up Arrow.
- On mobile, tap directly on the canvas area.

### Visuals look stretched on mobile

- Ensure viewport zoom is default and no browser text scaling overrides are active.
- Use the latest Chrome, Edge, or Safari for best canvas behavior.

## Collaboration Notes

### Suggested workflow

1. Create a feature branch.
2. Keep rendering and logic changes in separate commits when possible.
3. Open a pull request with before/after screenshots or short clips.

### Good first improvements

- Add persistent high score via localStorage.
- Add pause/resume support.
- Add difficulty scaling over time.
- Add weather/theme presets.

## Recruiter Snapshot

Flappy Wings is a compact frontend game project that demonstrates:

- Practical JavaScript architecture for interactive apps.
- Canvas-based rendering and animation fluency.
- Attention to UX details across desktop and mobile.
- Iterative product polish through small, testable changes.

## License

No license file is currently included. Add an MIT license if you want open-source reuse by default.
