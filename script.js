// Flappy Wings - Upgraded Flappy Bird-style game
// Features: Start/Restart screens, futuristic graphics, sound, modular code, DOM safety

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const body = document.body;
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalScore = document.getElementById('finalScore');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const ui = document.getElementById('ui');
  if (!ctx || !startBtn || !restartBtn || !gameOverScreen || !finalScore || !scoreDisplay || !ui) {
    return;
  }

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
  const LOW_END_DEVICE =
    window.matchMedia('(max-width: 768px)').matches ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const SKY_REFRESH_INTERVAL = LOW_END_DEVICE ? 2 : 1;

  // --- Render Caches ---
  let skyBufferCanvas;
  let skyBufferCtx;
  let hasSkyFrame = false;
  let pipeSprite;

  function createPipeSprite(width) {
    const body = document.createElement('canvas');
    body.width = width;
    body.height = 96;
    const bodyCtx = body.getContext('2d');

    const bodyGradient = bodyCtx.createLinearGradient(0, 0, width, 0);
    bodyGradient.addColorStop(0, '#2f7d33');
    bodyGradient.addColorStop(0.38, '#54ad4f');
    bodyGradient.addColorStop(0.65, '#3e8f3c');
    bodyGradient.addColorStop(1, '#245a28');
    bodyCtx.fillStyle = bodyGradient;
    bodyCtx.fillRect(0, 0, width, body.height);

    const glossGradient = bodyCtx.createLinearGradient(0, 0, width * 0.45, 0);
    glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
    glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    bodyCtx.fillStyle = glossGradient;
    bodyCtx.fillRect(4, 2, width * 0.35, body.height - 4);

    bodyCtx.fillStyle = 'rgba(0, 0, 0, 0.09)';
    for (let i = 1; i <= 2; i++) {
      const seamX = (width * i) / 3;
      bodyCtx.fillRect(seamX, 0, 1.5, body.height);
    }

    bodyCtx.strokeStyle = 'rgba(13, 42, 15, 0.35)';
    bodyCtx.lineWidth = 2.4;
    bodyCtx.strokeRect(0.8, 0.8, width - 1.6, body.height - 1.6);

    const capHeight = 14;
    const capInset = 7;
    const cap = document.createElement('canvas');
    cap.width = width + capInset * 2;
    cap.height = capHeight;
    const capCtx = cap.getContext('2d');

    const capGradient = capCtx.createLinearGradient(0, 0, cap.width, 0);
    capGradient.addColorStop(0, '#1f5f24');
    capGradient.addColorStop(0.5, '#69c65f');
    capGradient.addColorStop(1, '#1f5f24');
    capCtx.fillStyle = capGradient;
    capCtx.fillRect(0, 0, cap.width, cap.height);

    capCtx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    capCtx.lineWidth = 2;
    capCtx.strokeRect(1, 1, cap.width - 2, cap.height - 2);

    return {
      body,
      cap,
      capHeight,
      capInset
    };
  }

  function initRenderCaches() {
    skyBufferCanvas = document.createElement('canvas');
    skyBufferCanvas.width = canvas.width;
    skyBufferCanvas.height = canvas.height;
    skyBufferCtx = skyBufferCanvas.getContext('2d');
    pipeSprite = createPipeSprite(PIPE_WIDTH);
  }

  initRenderCaches();

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
      ctx.rotate(Math.max(-Math.PI / 10, Math.min(Math.PI / 8, this.velocity / 12)));

      // Body gradient
      const bodyGradient = ctx.createLinearGradient(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
      bodyGradient.addColorStop(0, '#ffd46e');
      bodyGradient.addColorStop(0.55, '#ff9f1c');
      bodyGradient.addColorStop(1, '#ef6c00');
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width * 0.49, this.height * 0.52, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Body highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-6, -7, 10, 6, -0.4, 0, 2 * Math.PI);
      ctx.fill();

      // Wing with subtle flap animation tied to time and vertical speed
      const flapPhase = Math.sin(performance.now() * 0.022 + this.y * 0.06);
      const wingTilt = -0.58 + flapPhase * 0.28 + Math.max(-0.14, Math.min(0.14, this.velocity * 0.016));
      ctx.save();
      ctx.rotate(wingTilt);
      const wingGradient = ctx.createLinearGradient(-18, 0, 8, 14);
      wingGradient.addColorStop(0, '#ffb347');
      wingGradient.addColorStop(1, '#f57c00');
      ctx.fillStyle = wingGradient;
      ctx.beginPath();
      ctx.ellipse(-9, 7, 12, 8, 0, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-10, 8, 7, -0.5, 2.2);
      ctx.stroke();
      ctx.restore();

      // Beak
      const beakGradient = ctx.createLinearGradient(this.width / 2 - 8, -2, this.width / 2 + 10, 3);
      beakGradient.addColorStop(0, '#ffd166');
      beakGradient.addColorStop(1, '#ff9f1c');
      ctx.fillStyle = beakGradient;
      ctx.beginPath();
      ctx.moveTo(this.width / 2 - 6, -3.4);
      ctx.quadraticCurveTo(this.width / 2 + 4, -2.8, this.width / 2 + 7, 0);
      ctx.quadraticCurveTo(this.width / 2 + 4, 2.8, this.width / 2 - 6, 3.4);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, -7, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#151515';
      ctx.beginPath();
      ctx.arc(11.8, -7, 2.2, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(12.5, -8, 0.9, 0, 2 * Math.PI);
      ctx.fill();

      // Outline to improve contrast over clouds
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width * 0.49, this.height * 0.52, 0, 0, 2 * Math.PI);
      ctx.stroke();
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
      this.drawPipeSegment(this.x, 0, this.width, this.gapY, true);
      this.drawPipeSegment(this.x, this.gapY + PIPE_GAP, this.width, canvas.height - (this.gapY + PIPE_GAP), false);
    }

    drawPipeSegment(x, y, width, height, capAtBottom) {
      if (!pipeSprite) return;

      ctx.drawImage(pipeSprite.body, x, y, width, height);
      const capY = capAtBottom ? y + height - pipeSprite.capHeight : y;
      ctx.drawImage(
        pipeSprite.cap,
        x - pipeSprite.capInset,
        capY,
        width + pipeSprite.capInset * 2,
        pipeSprite.capHeight
      );
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
    body.classList.remove('is-playing');
    scoreDisplay.textContent = '';
    hideGameOver();
    showStart();
    cancelAnimationFrame(animationId);
    drawStartScreen();
  }

  function startGame() {
    if (started) return;
    started = true;
    gameOver = false;
    pipes = [];
    frameCount = 0;
    score = 0;
    scoreDisplay.textContent = '0';
    body.classList.add('is-playing');
    hideStart();
    hideGameOver();
    gameLoop();
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
      }
    }

    // Draw and update bird
    bird.draw();
    if (!gameOver) bird.update();

    // Collision detection
    if (!gameOver && checkCollision()) {
      gameOver = true;
      setTimeout(() => {
        showGameOver();
      }, 100);
    }

    if (!gameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function checkCollision() {
    const birdBox = bird.getBounds();
    // Collide with ground
    if (birdBox.bottom >= canvas.height) {
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
    body.classList.remove('is-playing');
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
    if (!skyBufferCtx) return;

    const t = frameCount || 0;
    const needsRefresh = !hasSkyFrame || !started || t % SKY_REFRESH_INTERVAL === 0;
    if (needsRefresh) {
      redrawSkyFrame(t);
      hasSkyFrame = true;
    }

    ctx.drawImage(skyBufferCanvas, 0, 0);
  }

  function redrawSkyFrame(t) {
    const targetCtx = skyBufferCtx;

    // Dynamic sky gradient
    const skyGradient = targetCtx.createLinearGradient(0, 0, 0, canvas.height);
    const topTone = 178 + Math.sin(t * 0.006) * 10;
    skyGradient.addColorStop(0, `rgb(120, ${Math.round(topTone)}, 255)`);
    skyGradient.addColorStop(0.55, 'rgb(132, 216, 255)');
    skyGradient.addColorStop(1, 'rgb(239, 252, 255)');
    targetCtx.fillStyle = skyGradient;
    targetCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun glow
    const sunX = canvas.width - 78;
    const sunY = 82;
    const sunGlow = targetCtx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 108);
    sunGlow.addColorStop(0, 'rgba(255, 249, 192, 0.95)');
    sunGlow.addColorStop(0.45, 'rgba(255, 221, 132, 0.46)');
    sunGlow.addColorStop(1, 'rgba(255, 215, 120, 0)');
    targetCtx.fillStyle = sunGlow;
    targetCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Haze near horizon for depth
    const hazeGradient = targetCtx.createLinearGradient(0, canvas.height * 0.45, 0, canvas.height);
    hazeGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    hazeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.36)');
    targetCtx.fillStyle = hazeGradient;
    targetCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Distant hills
    drawHillBand(targetCtx, canvas.height - 130, 26, 'rgba(120, 186, 157, 0.42)', t * 0.18);
    drawHillBand(targetCtx, canvas.height - 95, 20, 'rgba(97, 165, 133, 0.55)', t * 0.28);

    // Layered moving clouds
    drawCloud(targetCtx, (60 - t * 0.16 + canvas.width) % (canvas.width + 120) - 60, 82, 44, 18, 0.6);
    drawCloud(targetCtx, (210 - t * 0.13 + canvas.width) % (canvas.width + 130) - 65, 62, 56, 24, 0.58);
    drawCloud(targetCtx, (350 - t * 0.15 + canvas.width) % (canvas.width + 130) - 65, 112, 38, 16, 0.62);
    if (!LOW_END_DEVICE) {
      drawCloud(targetCtx, (130 - t * 0.1 + canvas.width) % (canvas.width + 130) - 65, 182, 34, 13, 0.55);
      drawCloud(targetCtx, (300 - t * 0.08 + canvas.width) % (canvas.width + 130) - 65, 156, 49, 21, 0.52);
    }

    // Foreground soft light band
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    targetCtx.fillRect(0, canvas.height * 0.72, canvas.width, canvas.height * 0.28);
  }

  function drawHillBand(targetCtx, baseY, amplitude, color, phaseShift) {
    targetCtx.save();
    targetCtx.fillStyle = color;
    targetCtx.beginPath();
    targetCtx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 8) {
      const y = baseY + Math.sin((x + phaseShift) * 0.026) * amplitude;
      targetCtx.lineTo(x, y);
    }
    targetCtx.lineTo(canvas.width, canvas.height);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.restore();
  }

  function drawCloud(targetCtx, x, y, w, h, alpha = 0.7) {
    targetCtx.save();
    targetCtx.globalAlpha = alpha;
    targetCtx.fillStyle = '#fff';
    targetCtx.beginPath();
    targetCtx.ellipse(x, y, w, h, 0, 0, 2 * Math.PI);
    targetCtx.ellipse(x + w * 0.5, y + h * 0.2, w * 0.6, h * 0.6, 0, 0, 2 * Math.PI);
    targetCtx.ellipse(x - w * 0.4, y + h * 0.3, w * 0.5, h * 0.5, 0, 0, 2 * Math.PI);
    targetCtx.fill();
    targetCtx.globalAlpha = 1.0;
    targetCtx.restore();
  }

  // --- Input Handling ---
  function handleFlap() {
    if (!started || gameOver) return;
    bird.flap();
  }

  function handlePrimaryAction() {
    if (!started) {
      startGame();
      // Flap immediately on first input so the bird doesn't drop before second press.
      bird.flap();
      return;
    }
    if (!gameOver) {
      handleFlap();
    }
  }

  window.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (e.repeat) return;
      handlePrimaryAction();
    }
  });

  canvas.addEventListener('mousedown', function() {
    handlePrimaryAction();
  });
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    handlePrimaryAction();
  }, { passive: false });

  startBtn.addEventListener('click', () => {
    handlePrimaryAction();
  });
  restartBtn.addEventListener('click', () => {
    resetGame();
    startGame();
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