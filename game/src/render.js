// Paints the game into the page: the two picture panels, the markers on found
// differences, the heads-up display (counter, clock, score, hints) and the screens
// (title, pause, level done, game done, time up). The pictures themselves are drawn
// by scene.js; this file only arranges them and the chrome around them.
import { LEVELS_META, PANEL } from './config.js';
import { LEVELS } from './levels.js';
import { drawScene, hintMarkup, markerMarkup, missMarkup } from './scene.js';
import { SCREEN_GAME_DONE, SCREEN_LEVEL_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE, currentDiffs, remaining } from './state.js';

function el(id) {
  return document.getElementById(id);
}

/** Build the static page pieces once: panels, buttons, overlay hooks. */
export function createRenderer() {
  return {
    panelA: el('panelA'),
    panelB: el('panelB'),
    counter: el('counter'),
    remain: el('remain'),
    timerText: el('timerText'),
    timerBar: el('timerBar'),
    scoreText: el('scoreText'),
    levelText: el('levelText'),
    hintText: el('hintText'),
    foundList: el('foundList'),
    message: el('message'),
    overlay: el('overlay'),
    overlayCard: el('overlayCard'),
    status: el('status'),
  };
}

/** Draw both panels of the current level, wiping old markers. */
export function drawPanels(renderer, state) {
  renderer.panelA.innerHTML = drawScene(state.level, 'left');
  renderer.panelB.innerHTML = drawScene(state.level, 'right');
  // The keyboard reticle lives inside each panel, so it is re-added after every redraw.
  renderer.panelA.insertAdjacentHTML('beforeend',
    '<circle id="reticleA" cx="280" cy="210" r="16" fill="none" stroke="#23283b" stroke-width="3" style="display:none"/>'
    + '<circle id="reticleA2" cx="280" cy="210" r="4" fill="#23283b" style="display:none"/>');
  renderer.panelB.insertAdjacentHTML('beforeend',
    '<circle id="reticleB" cx="280" cy="210" r="16" fill="none" stroke="#23283b" stroke-width="3" style="display:none"/>'
    + '<circle id="reticleB2" cx="280" cy="210" r="4" fill="#23283b" style="display:none"/>');
  paintMarkers(renderer, state);
}

/** Rebuild the marker layer: a gold ring + check on every found difference, on both panels. */
export function paintMarkers(renderer, state) {
  for (const panel of [renderer.panelA, renderer.panelB]) {
    const old = panel.querySelectorAll('.marker, .hint-ring, .miss-mark');
    old.forEach((node) => node.remove());
  }
  for (const diff of currentDiffs(state)) {
    if (!state.found.includes(diff.id)) continue;
    const mark = markerMarkup(diff.x, diff.y, diff.r);
    renderer.panelA.insertAdjacentHTML('beforeend', mark);
    renderer.panelB.insertAdjacentHTML('beforeend', mark);
  }
  if (state.hintTarget) {
    const hint = hintMarkup(state.hintTarget.x, state.hintTarget.y, state.hintTarget.r);
    renderer.panelA.insertAdjacentHTML('beforeend', hint);
    renderer.panelB.insertAdjacentHTML('beforeend', hint);
  }
  if (state.lastMiss) {
    const miss = missMarkup(state.lastMiss.x, state.lastMiss.y);
    renderer.panelA.insertAdjacentHTML('beforeend', miss);
    renderer.panelB.insertAdjacentHTML('beforeend', miss);
  }
}

/** Refresh the counter, clock, score and found list. */
export function drawHud(renderer, state) {
  const found = state.found.length;
  const total = currentDiffs(state).length;
  renderer.counter.textContent = `${found} of ${total} found`;
  renderer.remain.textContent = `${remaining(state)} to go`;
  const seconds = Math.ceil(state.timeLeft);
  renderer.timerText.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const full = LEVELS_META[state.level].seconds;
  renderer.timerBar.style.width = `${Math.max(0, (state.timeLeft / full) * 100)}%`;
  renderer.timerBar.classList.toggle('low', state.timeLeft <= 10);
  renderer.scoreText.textContent = `Score ${state.score}`;
  renderer.levelText.textContent = `Level ${state.level + 1} of ${LEVELS.length} · ${LEVELS[state.level].title}`;
  renderer.hintText.textContent = `Hints ${state.hintsLeft}`;
  const names = currentDiffs(state)
    .filter((d) => state.found.includes(d.id))
    .map((d) => d.label);
  renderer.foundList.innerHTML = names.length === 0
    ? '<li class="empty">Nothing found yet — look closely!</li>'
    : names.map((name) => `<li>✓ ${name}</li>`).join('');
  if (state.lastFound) {
    renderer.message.textContent = `Found it! ${state.lastFound.label}`;
    renderer.message.className = 'message good';
  } else if (state.lastMiss) {
    renderer.message.textContent = 'Not quite — that spot matches. Try again!';
    renderer.message.className = 'message bad';
  } else {
    renderer.message.textContent = 'Click a difference on either picture — or move with the arrow keys and press Enter.';
    renderer.message.className = 'message';
  }
  renderer.status.textContent = `${found} of ${total} differences found, ${remaining(state)} remain, ${seconds} seconds left.`;
}

/** Show or hide the keyboard reticle on both panels. */
export function drawReticle(renderer, x, y, visible) {
  for (const id of ['reticleA', 'reticleA2', 'reticleB', 'reticleB2']) {
    const reticle = document.getElementById(id);
    if (!reticle) continue;
    reticle.setAttribute('cx', String(x));
    reticle.setAttribute('cy', String(y));
    reticle.style.display = visible ? 'block' : 'none';
  }
  void renderer;
  void PANEL;
}

/** Fill and show an overlay card, or hide the overlay entirely. */
export function showOverlay(renderer, html) {
  if (!html) {
    renderer.overlay.classList.add('hidden');
    renderer.overlayCard.innerHTML = '';
    return;
  }
  renderer.overlayCard.innerHTML = html;
  renderer.overlay.classList.remove('hidden');
}

/** The overlay for the current screen, or null when the game is in play. */
export function overlayFor(state, best) {
  const total = currentDiffs(state).length;
  if (state.screen === SCREEN_TITLE) {
    return `<h1>🔍 Harbour Lights</h1>
      <p class="tagline">A spot-the-difference hunt in three hand-drawn scenes.</p>
      <p>Two pictures sit side by side — but <b>8 little things</b> changed between them.
      Click a difference on either picture to ring it. Find them all before the clock runs out!</p>
      <ul class="rules">
        <li>🖱️ Click or tap a difference · ⌨️ Arrow keys + Enter work too</li>
        <li>💡 <b>H</b> spends a hint (3 per level) · <b>P</b> pauses · <b>M</b> mutes</li>
        <li>⚠️ A wrong click costs 3 seconds and 10 points — look before you tap!</li>
        <li>🏆 Three scenes: the harbour, the garden tea party, the lantern festival</li>
      </ul>
      <button data-action="start" class="big">Start the hunt</button>
      <p class="best">Best score: ${best}</p>`;
  }
  if (state.screen === SCREEN_PAUSED) {
    return `<h1>Paused</h1><p>Take a breath — the clock is waiting.</p>
      <button data-action="resume" class="big">Keep hunting</button>
      <button data-action="restart">Restart level</button>`;
  }
  if (state.screen === SCREEN_LEVEL_DONE) {
    const stars = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
    return `<h1>Level cleared! 🎉</h1>
      <p class="stars">${stars}</p>
      <p>You found all ${total} differences in <b>${LEVELS[state.level].title}</b>.</p>
      <p>Time bonus: <b>+${state.levelBonus}</b> · Score: <b>${state.score}</b></p>
      <button data-action="next" class="big">Next scene →</button>`;
  }
  if (state.screen === SCREEN_GAME_DONE) {
    return `<h1>🏆 You found them all!</h1>
      <p class="stars">★★★</p>
      <p>All three scenes cleared — ${total * LEVELS.length} differences spotted.</p>
      <p>Final score: <b>${state.score}</b> · Best: <b>${Math.max(best, state.score)}</b></p>
      <button data-action="again" class="big">Play again</button>`;
  }
  if (state.screen === SCREEN_TIMEOUT) {
    return `<h1>Time's up! ⏰</h1>
      <p>You found ${state.found.length} of ${total} differences in <b>${LEVELS[state.level].title}</b>.</p>
      <p>Score: <b>${state.score}</b></p>
      <button data-action="retry" class="big">Try this scene again</button>
      <button data-action="title">Back to title</button>`;
  }
  return null;
}

/** Paint everything for the current state. */
export function renderAll(renderer, state, best) {
  drawHud(renderer, state);
  showOverlay(renderer, state.screen === SCREEN_PLAY ? null : overlayFor(state, best));
}
