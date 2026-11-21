// The game's state and its rules: finding differences, the clock, hints, streaks and
// scoring. This file knows nothing about the DOM; render.js paints what it holds.
import { DIFF_COUNT, HINTS_PER_LEVEL, LEVELS_META, POINTS_PER_FIND, STREAK_BONUS, TIME_BONUS_PER_SECOND, WRONG_POINTS_PENALTY, WRONG_TIME_PENALTY } from './config.js';
import { LEVELS } from './levels.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_GAME_DONE = 'game-done';
export const SCREEN_TIMEOUT = 'timeout';

/** A fresh game: level 1, nothing found, the clock full. */
export function createState() {
  return {
    screen: SCREEN_TITLE,
    level: 0,
    found: [],
    timeLeft: LEVELS_META[0].seconds,
    score: 0,
    streak: 0,
    misses: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintTarget: null,
    lastFound: null,
    lastMiss: null,
    levelBonus: 0,
    stars: 0,
    best: 0,
    muted: false,
  };
}

/** Start (or restart) a level from scratch. */
export function startLevel(state, levelIndex) {
  state.level = levelIndex;
  state.found = [];
  state.timeLeft = LEVELS_META[levelIndex].seconds;
  state.streak = 0;
  state.misses = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintTarget = null;
  state.lastFound = null;
  state.lastMiss = null;
  state.levelBonus = 0;
  state.stars = 0;
  state.screen = SCREEN_PLAY;
}

/** The differences of the current level. */
export function currentDiffs(state) {
  return LEVELS[state.level].diffs;
}

/** How many differences are still hiding. */
export function remaining(state) {
  return DIFF_COUNT - state.found.length;
}

/**
 * A click at panel coordinates (x, y). Returns 'found', 'already' or 'miss'.
 * A find scores points (more with a streak); a miss costs time and points.
 */
export function clickAt(state, x, y) {
  const diffs = currentDiffs(state);
  for (const diff of diffs) {
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy > diff.r * diff.r) continue;
    if (state.found.includes(diff.id)) return 'already';
    state.found.push(diff.id);
    state.streak += 1;
    state.score += POINTS_PER_FIND + STREAK_BONUS * (state.streak - 1);
    state.lastFound = diff;
    state.lastMiss = null;
    state.hintTarget = null;
    if (state.found.length === DIFF_COUNT) finishLevel(state);
    return 'found';
  }
  state.streak = 0;
  state.misses += 1;
  state.score = Math.max(0, state.score - WRONG_POINTS_PENALTY);
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
  state.lastMiss = { x, y };
  state.lastFound = null;
  if (state.timeLeft <= 0) state.screen = SCREEN_TIMEOUT;
  return 'miss';
}

/** A level is cleared: time bonus, stars, and the next screen. */
function finishLevel(state) {
  state.levelBonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
  state.score += state.levelBonus;
  const timeShare = state.timeLeft / LEVELS_META[state.level].seconds;
  state.stars = state.misses === 0 && timeShare > 0.5 ? 3 : timeShare > 0.25 ? 2 : 1;
  state.screen = state.level === LEVELS.length - 1 ? SCREEN_GAME_DONE : SCREEN_LEVEL_DONE;
}

/** Spend a hint: returns the difference it rings, or null when none is left. */
export function useHint(state) {
  if (state.hintsLeft <= 0 || state.screen !== SCREEN_PLAY) return null;
  const hidden = currentDiffs(state).filter((d) => !state.found.includes(d.id));
  if (hidden.length === 0) return null;
  const pick = hidden[Math.floor(Math.random() * hidden.length)];
  state.hintsLeft -= 1;
  state.hintTarget = pick;
  return pick;
}

/** Advance the clock; returns true when time just ran out. */
export function tick(state, dt) {
  if (state.screen !== SCREEN_PLAY) return false;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREEN_TIMEOUT;
    return true;
  }
  return false;
}
