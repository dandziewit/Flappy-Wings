# Flappy Wings

Flappy Wings is a browser-based arcade game inspired by classic Flappy-style gameplay. Built with **HTML5 Canvas** and **vanilla JavaScript**, the project demonstrates real-time rendering, collision detection, and interactive game loop architecture.

The game focuses on responsive controls, smooth animations, and a clean, readable codebase designed to be easy to review and extend.

## Live Demo

- https://dandziewit.github.io/Flappy-Wings/

## Features

- Real-time game loop using `requestAnimationFrame`
- Canvas-based rendering for bird, pipes, and environment
- Collision detection system
- Keyboard, mouse, and touch controls
- Responsive gameplay for desktop and mobile
- Score tracking during gameplay

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- HTML5 Canvas API

## Screenshots



![Gameplay](<flappy 2.png>)

![Game Screen](<flappy.png>)

## Controls

| Action | Control |
|-------:|---------|
| Flap | Space |
| Flap | Up Arrow |
| Flap | Mouse Click |
| Flap | Touch Tap |

## Running Locally

### Python Server (Recommended)

From the project folder run:

```bash
py -m http.server 8080
# or
python -m http.server 8080
```

Then open:

- http://localhost:8080

## Project Structure

```text
Flappy Wings/
├── index.html
├── style.css
├── script.js
└── README.md
```

### `index.html`
Application entry point and canvas container.

### `style.css`
Layout styling, responsive behavior, and visual theme.

### `script.js`
Core game logic including:
- game loop
- rendering
- collision detection
- input handling
- score system

## Architecture Overview

The game follows a lightweight interactive application architecture.

### Initialization
Canvas and UI elements load from `index.html`.

### Game State Management
Bird state, pipe list, score, and game status are tracked in `script.js`.

### Game Loop
`requestAnimationFrame` updates physics and rendering.

### Rendering
Bird and pipe classes render to the canvas each frame.

### Input Handling
Keyboard, mouse, and touch inputs route through a unified flap action.

## Future Improvements

Possible extensions for future development:
- Persistent high score using `localStorage`
- Pause / resume functionality
- Dynamic difficulty scaling
- Additional visual themes or weather effects
- Sound and animation polish

## Skills Demonstrated

This project showcases:
- Canvas-based graphics rendering
- Real-time game loop architecture
- JavaScript event handling
- Collision detection logic
- Responsive UX design

## License

This project is licensed under the MIT License.

Responsive UX design

License

This project is licensed under the MIT License.

## Author

Daniel Dziewit
