// Flappy Wings - Upgraded Flappy Bird-style game
// Features: Start/Restart screens, futuristic graphics, sound, modular code, DOM safety

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalScore = document.getElementById('finalScore');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const ui = document.getElementById('ui');

  // --- Sound Effects ---
  // Place 'flap.mp3' and 'coin.mp3' in a 'sounds' folder next to these files
  let flapSound, coinSound;
  function loadSounds() {
    try {
      flapSound = new Audio('sounds/flap.mp3');
      coinSound = new Audio('sounds/coin.mp3');
      flapSound.load();
      coinSound.load();
    } catch (e) {
      console.warn('Sound files not found or failed to load.');
    }
  }
  loadSounds();

  // --- Game Constants ---
  const BIRD_WIDTH = 40;
  const BIRD_HEIGHT = 32;
  const BIRD_X = 80;
  const GRAVITY = 0.5;
  const LIFT = -8.5;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 150;
  const PIPE_SPEED = 2.7;
  const PIPE_INTERVAL = 90; // frames between pipes

  // --- Game State ---
  let bird, pipes, frameCount, score, highScore = 0, gameOver, started, animationId;

  // --- Bird Class ---
  class Bird {
    constructor() {
      this.x = BIRD_X;
      this.y = canvas.height / 2;
      this.width = BIRD_WIDTH;
      this.height = BIRD_HEIGHT;
      this.velocity = 0;
      this.gravity = GRAVITY;
      this.lift = LIFT;
    }

    update() {
      this.velocity += this.gravity;
      this.y += this.velocity;
      if (this.y + this.height > canvas.height) {
        this.y = canvas.height - this.height;
        this.velocity = 0;
      }
      if (this.y < 0) {
        this.y = 0;
        this.velocity = 0;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(Math.min(Math.PI / 6, this.velocity / 12));
      // Body
      ctx.fillStyle = "#ff9800"; // orange
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
      ctx.fill();
      // Wing (same orange)
      ctx.save();
      ctx.rotate(-0.5);
      ctx.fillStyle = "#ff9800";
      ctx.beginPath();
      ctx.ellipse(-8, 8, 12, 7, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      // Beak
      ctx.fillStyle = "#ffb300";
      ctx.beginPath();
      ctx.moveTo(this.width / 2 - 6, -4);
      ctx.lineTo(this.width / 2 + 8, 0);
      ctx.lineTo(this.width / 2 - 6, 4);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(10, -7, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(12, -7, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    flap() {
      this.velocity = this.lift;
      if (flapSound && flapSound.play) {
        try { flapSound.currentTime = 0; flapSound.play(); } catch (e) {}
      }
    }

    getBounds() {
      return {
        left: this.x,
        right: this.x + this.width,
        top: this.y,
        bottom: this.y + this.height
      };
    }
  }

  // --- Pipe Class ---
  class Pipe {
    constructor() {
      this.x = canvas.width;
      this.width = PIPE_WIDTH;
      const minGapY = 60;
      const maxGapY = canvas.height - PIPE_GAP - 60;
      this.gapY = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
      this.passed = false;
    }

    update() {
      this.x -= PIPE_SPEED;
    }

    draw() {
      // Solid green pipes
      ctx.fillStyle = "#1b5e20"; // solid green
      // Top pipe
      ctx.beginPath();
      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x + this.width, 0);
      ctx.lineTo(this.x + this.width, this.gapY);
      ctx.lineTo(this.x, this.gapY);
      ctx.closePath();
      ctx.fill();
      // Bottom pipe
      ctx.beginPath();
      ctx.moveTo(this.x, this.gapY + PIPE_GAP);
      ctx.lineTo(this.x + this.width, this.gapY + PIPE_GAP);
      ctx.lineTo(this.x + this.width, canvas.height);
      ctx.lineTo(this.x, canvas.height);
      ctx.closePath();
      ctx.fill();
      // Pipe edge highlight
      ctx.strokeStyle = "#1b5e20";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, 0, this.width, this.gapY);
      ctx.strokeRect(this.x, this.gapY + PIPE_GAP, this.width, canvas.height - (this.gapY + PIPE_GAP));
    }

    getBounds() {
      return [
        { left: this.x, right: this.x + this.width, top: 0, bottom: this.gapY },
        { left: this.x, right: this.x + this.width, top: this.gapY + PIPE_GAP, bottom: canvas.height }
      ];
    }
  }

  // --- Game Functions ---
  function resetGame() {
    bird = new Bird();
    pipes = [];
    frameCount = 0;
    score = 0;
    gameOver = false;
    started = false;
    scoreDisplay.textContent = '';
    hideGameOver();
    showStart();
    cancelAnimationFrame(animationId);
    drawStartScreen();
    console.log('Game reset.');
  }

  function startGame() {
    if (started) return;
    started = true;
    gameOver = false;
    pipes = [];
    frameCount = 0;
    score = 0;
    scoreDisplay.textContent = '';
    hideStart();
    hideGameOver();
    gameLoop();
    console.log('Game started.');
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSkyWithClouds();

    // Draw and update pipes
    if (!gameOver) {
      if (frameCount % PIPE_INTERVAL === 0) {
        pipes.push(new Pipe());
      }
      frameCount++;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].draw();
      if (!gameOver) pipes[i].update();

      // Remove pipes that have left the screen
      if (pipes[i].x + pipes[i].width < 0) {
        pipes.splice(i, 1);
        continue;
      }

      // Scoring: if bird passes pipe
      if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
        pipes[i].passed = true;
        score++;
        if (score > highScore) highScore = score;
        scoreDisplay.textContent = score;
        if (coinSound && coinSound.play) {
          try { coinSound.currentTime = 0; coinSound.play(); } catch (e) {}
        }
        console.log('Score:', score);
      }
    }

    // Draw and update bird
    bird.draw();
    if (!gameOver) bird.update();

    // Draw score
    scoreDisplay.textContent = score;

    // Collision detection
    if (!gameOver && checkCollision()) {
      gameOver = true;
      setTimeout(() => {
        showGameOver();
      }, 100);
      console.log('Game over. Final score:', score);
    }

    if (!gameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function checkCollision() {
    const birdBox = bird.getBounds();
    // Collide with ground or ceiling
    if (birdBox.bottom >= canvas.height || birdBox.top <= 0) {
      return true;
    }
    // Collide with pipes
    for (let pipe of pipes) {
      for (let box of pipe.getBounds()) {
        if (
          birdBox.right > box.left &&
          birdBox.left < box.right &&
          birdBox.bottom > box.top &&
          birdBox.top < box.bottom
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // --- UI Functions ---
  function showStart() {
    startBtn.classList.remove('hidden');
    ui.style.pointerEvents = 'auto';
  }
  function hideStart() {
    startBtn.classList.add('hidden');
    ui.style.pointerEvents = 'none';
  }
  function showGameOver() {
    finalScore.textContent = `Score: ${score} | High Score: ${highScore}`;
    gameOverScreen.classList.remove('hidden');
    ui.style.pointerEvents = 'auto';
  }
  function hideGameOver() {
    gameOverScreen.classList.add('hidden');
    ui.style.pointerEvents = 'none';
  }

  // --- Drawing Start Screen ---
  function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSkyWithClouds();
    // Draw title
    ctx.font = "bold 48px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#00c6ff";
    ctx.textAlign = "center";
    ctx.fillText("Flappy Wings", canvas.width / 2, 180);
    // Draw bird
    let tempBird = new Bird();
    tempBird.x = canvas.width / 2 - 20;
    tempBird.y = 260;
    tempBird.draw();
    // Draw instructions
    ctx.font = "24px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("Press Space or Click to Flap", canvas.width / 2, 340);
    ctx.font = "18px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.fillText("Avoid the pipes. Get the highest score!", canvas.width / 2, 370);
  }

  // --- Draw sky and clouds ---
  function drawSkyWithClouds() {
    // Sky fill (redundant, but ensures canvas is blue if CSS fails)
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw clouds
    drawCloud(60, 80, 40, 18);
    drawCloud(200, 60, 50, 22);
    drawCloud(320, 100, 35, 15);
    drawCloud(120, 180, 30, 12);
    drawCloud(280, 160, 45, 20);
  }
  function drawCloud(x, y, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, 2 * Math.PI);
    ctx.ellipse(x + w * 0.5, y + h * 0.2, w * 0.6, h * 0.6, 0, 0, 2 * Math.PI);
    ctx.ellipse(x - w * 0.4, y + h * 0.3, w * 0.5, h * 0.5, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  // --- Input Handling ---
  function handleFlap() {
    if (!started || gameOver) return;
    bird.flap();
    console.log('Bird flapped');
  }

  window.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      if (!started) {
        startGame();
      } else if (!gameOver) {
        handleFlap();
      }
    }
  });

  canvas.addEventListener('mousedown', function() {
    if (!started) {
      startGame();
    } else if (!gameOver) {
      handleFlap();
    }
  });
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!started) {
      startGame();
    } else if (!gameOver) {
      handleFlap();
    }
  }, { passive: false });

  startBtn.addEventListener('click', () => {
    startGame();
  });
  restartBtn.addEventListener('click', () => {
    resetGame();
  });

  // --- Initialization ---
  resetGame();

  // --- Comments for maintainability ---
  // - Initialization: DOMContentLoaded, resetGame, drawStartScreen
  // - Input: Spacebar, click/tap, Start/Restart buttons
  // - Update: gameLoop, update/draw bird and pipes, score
  // - Draw: canvas clear, backgrounds, bird, pipes, score, UI
  // - Collision: checkCollision
  // - Start/Restart: show/hide UI, reset state, draw screens
  // - Sounds: loadSounds, play on flap/score, safe fallback
  // - Debug: console.log for key events
});