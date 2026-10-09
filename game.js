/* The optional outlier game is independent of the portfolio interactions. */
(() => {
  'use strict';

  const panel = document.getElementById('game-panel');
  const note = document.getElementById('play-note');
  const grid = document.getElementById('game-grid');
  const overlay = document.getElementById('game-overlay');
  const title = document.getElementById('game-overlay-title');
  const description = document.getElementById('game-overlay-text');
  const start = document.getElementById('game-start');
  const pauseButton = document.getElementById('game-pause');
  const scoreLabel = document.getElementById('game-score');
  const bestLabel = document.getElementById('game-best');
  const livesLabel = document.getElementById('game-lives');
  const timerBar = document.getElementById('game-timer-bar');
  const status = document.getElementById('game-status');
  const storageKey = 'thuy.portfolio.outlier.best';
  const narrow = window.matchMedia('(max-width: 600px)');

  let score = 0;
  let lives = 3;
  let round = 0;
  let best = 0;
  let playing = false;
  let paused = false;
  let frame = null;
  let deadline = 0;
  let duration = 0;
  let remaining = 0;

  // Privacy modes and direct file previews may disable local storage.
  try {
    const stored = Number(localStorage.getItem(storageKey));
    if (Number.isSafeInteger(stored) && stored >= 0) best = stored;
  } catch { /* Playing does not depend on storage being available. */ }
  bestLabel.textContent = best;
  panel.hidden = false;
  document.getElementById('game-no-script').hidden = true;

  function announce() {
    status.textContent = `Score ${score}. ${lives} ${lives === 1 ? 'life' : 'lives'} remaining.`;
    scoreLabel.textContent = score;
    livesLabel.textContent = '●'.repeat(lives) + '○'.repeat(3 - lives);
    livesLabel.setAttribute('aria-label', `${lives} ${lives === 1 ? 'life' : 'lives'}`);
  }

  function cancelTimer() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function tick(now) {
    if (!playing || paused) return;
    remaining = Math.max(0, deadline - now);
    timerBar.style.width = `${(remaining / duration) * 100}%`;
    if (remaining <= 0) loseLife('Time ran out on that round.');
    else frame = requestAnimationFrame(tick);
  }

  function beginTimer() {
    cancelTimer();
    deadline = performance.now() + remaining;
    frame = requestAnimationFrame(tick);
  }

  function buildRound() {
    cancelTimer();
    round++;
    const count = Math.min(11 + round * 3, 36);
    const shadeDifference = Math.max(17 - round * 1.05, 4);
    const outlier = Math.floor(Math.random() * count);
    duration = Math.max(10000 - round * 400, 4000);
    remaining = duration;
    const focusedDot = grid.contains(document.activeElement);
    const previousIndex = [...grid.children].indexOf(document.activeElement);
    grid.replaceChildren();
    const columns = Math.min(narrow.matches ? 6 : 7, Math.ceil(Math.sqrt(count)));
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    for (let index = 0; index < count; index++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'game-dot';
      dot.setAttribute('aria-label', `Dot ${index + 1}`);
      dot.style.backgroundColor = `hsl(60, 16%, ${index === outlier ? 57 + shadeDifference : 57}%)`;
      dot.addEventListener('click', () => {
        if (!playing || paused) return;
        if (performance.now() >= deadline) {
          loseLife('Time ran out on that round.');
          return;
        }
        if (index === outlier) {
          score++;
          announce();
          buildRound();
        } else loseLife('That one matched the other dots.');
      });
      grid.append(dot);
    }
    timerBar.style.width = '100%';
    if (focusedDot) grid.children[Math.max(0, Math.min(previousIndex, count - 1))].focus({ preventScroll: true });
    beginTimer();
  }

  function endGame(message) {
    playing = false;
    paused = false;
    cancelTimer();
    best = Math.max(best, score);
    bestLabel.textContent = best;
    try { localStorage.setItem(storageKey, String(best)); } catch { /* Optional persistence. */ }
    pauseButton.hidden = true;
    title.textContent = `You found ${score} ${score === 1 ? 'outlier' : 'outliers'}.`;
    description.textContent = `${message} Try again?`;
    start.textContent = 'Play again →';
    overlay.hidden = false;
    start.focus({ preventScroll: true });
  }

  function loseLife(message) {
    cancelTimer();
    lives--;
    announce();
    if (lives <= 0) endGame(message);
    else buildRound();
  }

  function pauseGame() {
    if (!playing || paused) return;
    remaining = Math.max(0, deadline - performance.now());
    paused = true;
    cancelTimer();
    title.textContent = 'Take your time.';
    description.textContent = 'Your round is paused. Resume whenever you’re ready.';
    start.textContent = 'Resume →';
    pauseButton.textContent = 'Resume';
    overlay.hidden = false;
  }

  function resumeGame() {
    if (!playing || !paused) return;
    paused = false;
    overlay.hidden = true;
    pauseButton.textContent = 'Pause';
    if (remaining <= 0) loseLife('Time ran out on that round.');
    else beginTimer();
    grid.querySelector('button')?.focus({ preventScroll: true });
  }

  function startGame() {
    cancelTimer();
    score = 0;
    lives = 3;
    round = 0;
    paused = false;
    playing = true;
    overlay.hidden = true;
    pauseButton.hidden = false;
    pauseButton.textContent = 'Pause';
    announce();
    buildRound();
    grid.querySelector('button')?.focus({ preventScroll: true });
  }

  start.addEventListener('click', () => {
    if (paused) resumeGame();
    else startGame();
  });
  pauseButton.addEventListener('click', () => {
    if (paused) resumeGame();
    else {
      pauseGame();
      start.focus({ preventScroll: true });
    }
  });
  note.addEventListener('toggle', () => {
    if (!note.open) pauseGame();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame();
  });
  // Scrolling on to the portfolio should not cost someone a game life.
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) pauseGame();
    });
    visibility.observe(panel);
  }
})();
