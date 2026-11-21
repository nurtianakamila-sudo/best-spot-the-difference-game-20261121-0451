// Boot and the one loop: input is read on every event, the clock advances in real time,
// and the renderer paints what is there. The game moves between title, play, paused,
// level-done, game-done and time-up screens.
//
// ?shot=start|play|win|garden (with &demo=N) stages that scene instead of running the
// loop, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY } from './config.js';
import { LEVELS } from './levels.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_NEXT, ACTION_PAUSE, ACTION_RESTART, attachInput } from './input.js';
import { createRenderer, drawHud, drawPanels, drawReticle, paintMarkers, renderAll } from './render.js';
import { SCREEN_GAME_DONE, SCREEN_LEVEL_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE, clickAt, createState, startLevel, tick, useHint } from './state.js';
import { playClick, playFind, playMiss, playTick, playWin, setMuted } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const demoParam = Number.parseInt(params.get('demo') ?? '', 10);
const demoFound = Number.isInteger(demoParam) ? demoParam : null;

const renderer = createRenderer();
const state = createState();
let reticleVisible = false;
let lastTickSecond = -1;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

state.best = readBest();

function refresh() {
  renderAll(renderer, state, state.best);
}

function startGame() {
  playClick();
  startLevel(state, 0);
  drawPanels(renderer, state);
  refresh();
}

function onPanelClick(panel, x, y) {
  if (state.screen !== SCREEN_PLAY) return;
  const result = clickAt(state, x, y);
  if (result === 'found') {
    playFind();
    if (state.screen === SCREEN_LEVEL_DONE || state.screen === SCREEN_GAME_DONE) {
      playWin();
      if (state.score > state.best) {
        state.best = state.score;
        saveBest(state.best);
      }
    }
  } else if (result === 'miss') {
    playMiss();
  }
  paintMarkers(renderer, state);
  drawHud(renderer, state);
  if (state.screen !== SCREEN_PLAY) refresh();
  window.setTimeout(() => {
    if (state.lastMiss) {
      state.lastMiss = null;
      paintMarkers(renderer, state);
    }
  }, 900);
}

function onKey(action) {
  if (action === ACTION_MUTE) {
    state.muted = !state.muted;
    setMuted(state.muted);
    document.getElementById('muteBtn').textContent = state.muted ? '🔇 Muted' : '🔊 Sound';
    return;
  }
  if (action === ACTION_HINT) {
    if (state.screen !== SCREEN_PLAY) return;
    const target = useHint(state);
    if (target) {
      playClick();
      paintMarkers(renderer, state);
      drawHud(renderer, state);
      window.setTimeout(() => {
        state.hintTarget = null;
        paintMarkers(renderer, state);
      }, 2500);
    }
    return;
  }
  if (action === ACTION_PAUSE) {
    if (state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      refresh();
    } else if (state.screen === SCREEN_PAUSED) {
      state.screen = SCREEN_PLAY;
      refresh();
    }
    return;
  }
  if (action === ACTION_RESTART) {
    startLevel(state, state.level);
    drawPanels(renderer, state);
    refresh();
    return;
  }
  if (action === ACTION_NEXT) {
    if (state.screen === SCREEN_LEVEL_DONE) {
      playClick();
      startLevel(state, state.level + 1);
      drawPanels(renderer, state);
      refresh();
    }
  }
}

function onReticleMove(x, y) {
  reticleVisible = true;
  drawReticle(renderer, x, y, true);
}

function onReticleClick(x, y) {
  reticleVisible = true;
  drawReticle(renderer, x, y, true);
  onPanelClick(null, x, y);
}

attachInput([renderer.panelA, renderer.panelB], {
  onPanelClick,
  onKey,
  onReticleMove,
  onReticleClick,
});

document.getElementById('overlay').addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.getAttribute('data-action');
  if (action === 'start' || action === 'again') {
    startGame();
  } else if (action === 'resume') {
    state.screen = SCREEN_PLAY;
    refresh();
  } else if (action === 'restart' || action === 'retry') {
    startLevel(state, state.level);
    drawPanels(renderer, state);
    refresh();
  } else if (action === 'next') {
    startLevel(state, state.level + 1);
    drawPanels(renderer, state);
    refresh();
  } else if (action === 'title') {
    state.screen = SCREEN_TITLE;
    startLevel(state, 0);
    state.screen = SCREEN_TITLE;
    drawPanels(renderer, state);
    refresh();
  }
});

document.getElementById('hintBtn').addEventListener('click', () => onKey(ACTION_HINT));
document.getElementById('pauseBtn').addEventListener('click', () => onKey(ACTION_PAUSE));
document.getElementById('muteBtn').addEventListener('click', () => onKey(ACTION_MUTE));
document.getElementById('restartBtn').addEventListener('click', () => onKey(ACTION_RESTART));

function runShot(name) {
  const screen = stageShot(name, state, demoFound);
  state.screen = screen;
  drawPanels(renderer, state);
  renderAll(renderer, state, state.best);
  let painted = 0;
  function paint() {
    drawHud(renderer, state);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

if (shot) {
  runShot(shot);
} else {
  drawPanels(renderer, state);
  refresh();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (state.screen === SCREEN_PLAY) {
      const second = Math.ceil(state.timeLeft);
      if (tick(state, dt)) {
        playMiss();
        refresh();
      } else if (second !== lastTickSecond && second <= 10 && second > 0) {
        lastTickSecond = second;
        playTick();
      }
      drawHud(renderer, state);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

void SCREEN_GAME_DONE;
void SCREEN_TIMEOUT;
void ACTION_CONFIRM;
void LEVELS;
