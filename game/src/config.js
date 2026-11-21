// Every tuning number and colour in one place. Each picture is a fixed 560x420 panel;
// the page scales the panels to the window, so no rule below depends on the screen size.

/** The logical size of one picture panel, in SVG units. */
export const PANEL = { width: 560, height: 420 };

/** How many differences hide in every scene. */
export const DIFF_COUNT = 8;

/** Hints a player gets per level; a hint briefly rings one difference they missed. */
export const HINTS_PER_LEVEL = 3;

/** Seconds a wrong click costs, and points a wrong click costs. */
export const WRONG_TIME_PENALTY = 3;
export const WRONG_POINTS_PENALTY = 10;

/** Points for a find, plus this much per find in the current streak. */
export const POINTS_PER_FIND = 100;
export const STREAK_BONUS = 25;

/** Points per second left when a level is cleared. */
export const TIME_BONUS_PER_SECOND = 5;

/** Seconds on the clock for each level, easiest first. */
export const LEVELS_META = [
  { name: 'Sunset Harbour Market', seconds: 120, blurb: 'A market stall by the water at sunset.' },
  { name: 'Garden Tea Party', seconds: 100, blurb: 'Tea, cake and butterflies on the lawn.' },
  { name: 'Lantern Night Festival', seconds: 90, blurb: 'Lanterns, fireworks and a night sky.' },
];

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'harbour-lights.best';

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE = {
  page: '#1c2438',
  panel: '#f7f1e3',
  ink: '#23283b',
  muted: '#6b7280',
  accent: '#ffb703',
  accentDark: '#e07b00',
  found: '#ffd700',
  foundRing: '#b8860b',
  wrong: '#e5534b',
  timerGood: '#4caf7d',
  timerLow: '#e5534b',
  hint: '#7c5cff',
};
