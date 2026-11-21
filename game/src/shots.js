// The screenshot scenes behind ?shot=start|play|win|garden (and ?demo=N). Each one sets
// the game to a fixed, real state — the same rules, the same pictures, the same markers a
// player would see — so a screenshot is a genuine render of the shipped game.
import { DIFF_COUNT, LEVELS_META } from './config.js';
import { LEVELS } from './levels.js';
import { SCREEN_GAME_DONE, SCREEN_LEVEL_DONE, SCREEN_PLAY, SCREEN_TITLE, currentDiffs, startLevel } from './state.js';

/**
 * Stage the named scene on a fresh state and return the screen to show.
 * start: the title card over the harbour, nothing found yet.
 * play: mid-game, the first three differences found, five still hiding.
 * win: every difference found, the level-cleared card showing.
 * garden: the second scene mid-game, four found, timer running low.
 */
export function stageShot(name, state, demoFound) {
  const foundCount = Number.isInteger(demoFound) ? demoFound : null;
  if (name === 'garden') {
    startLevel(state, 1);
    state.found = currentDiffs(state).slice(0, 4).map((d) => d.id);
    state.score = 450;
    state.streak = 2;
    state.timeLeft = 64;
    state.hintsLeft = 2;
    state.lastFound = currentDiffs(state)[3];
    return SCREEN_PLAY;
  }
  if (name === 'win') {
    startLevel(state, 0);
    state.found = currentDiffs(state).map((d) => d.id);
    state.score = 940;
    state.timeLeft = 87;
    state.lastFound = currentDiffs(state)[DIFF_COUNT - 1];
    state.levelBonus = 87 * 5;
    state.score += state.levelBonus;
    state.stars = 3;
    state.screen = SCREEN_LEVEL_DONE;
    return SCREEN_LEVEL_DONE;
  }
  if (name === 'play') {
    startLevel(state, 0);
    const count = foundCount ?? 3;
    state.found = currentDiffs(state).slice(0, count).map((d) => d.id);
    state.score = 100 * count + 25 * ((count * (count - 1)) / 2);
    state.streak = count;
    state.timeLeft = 87;
    state.lastFound = currentDiffs(state)[count - 1];
    return SCREEN_PLAY;
  }
  // start (and anything else): title over a fresh harbour.
  startLevel(state, 0);
  state.screen = SCREEN_TITLE;
  state.timeLeft = LEVELS_META[0].seconds;
  if (foundCount !== null) {
    state.found = LEVELS[0].diffs.slice(0, Math.min(foundCount, DIFF_COUNT)).map((d) => d.id);
  }
  return SCREEN_TITLE;
}

export { SCREEN_GAME_DONE };
