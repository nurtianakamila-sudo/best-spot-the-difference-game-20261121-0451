// Mouse and keyboard input. A click on either panel is translated into picture
// coordinates (the 560x420 panel space) and handed to the game; arrow keys move a
// crosshair reticle and Enter or Space "clicks" where it stands, so the whole game is
// playable without a mouse.

export const ACTION_HINT = 'hint';
export const ACTION_PAUSE = 'pause';
export const ACTION_CONFIRM = 'confirm';
export const ACTION_RESTART = 'restart';
export const ACTION_NEXT = 'next';
export const ACTION_MUTE = 'mute';

/** Convert a pointer event on an SVG panel into panel coordinates. */
export function eventToPanelPoint(svg, event) {
  const box = svg.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * 560;
  const y = ((event.clientY - box.top) / box.height) * 420;
  return { x, y };
}

/**
 * Wire the two panels and the keyboard. `handlers` gets:
 * onPanelClick(panel, x, y), onKey(action), onReticleMove(x, y), onReticleClick(x, y).
 */
export function attachInput(panels, handlers) {
  for (const panel of panels) {
    panel.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const point = eventToPanelPoint(panel, event);
      handlers.onPanelClick(panel, point.x, point.y);
    });
  }

  const reticle = { x: 280, y: 210 };
  const STEP = 24;

  function moveReticle(dx, dy) {
    reticle.x = Math.min(556, Math.max(4, reticle.x + dx));
    reticle.y = Math.min(416, Math.max(4, reticle.y + dy));
    handlers.onReticleMove(reticle.x, reticle.y);
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight'
      && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    switch (event.key) {
      case 'ArrowLeft': event.preventDefault(); moveReticle(-STEP, 0); break;
      case 'ArrowRight': event.preventDefault(); moveReticle(STEP, 0); break;
      case 'ArrowUp': event.preventDefault(); moveReticle(0, -STEP); break;
      case 'ArrowDown': event.preventDefault(); moveReticle(0, STEP); break;
      case 'Enter':
      case ' ': event.preventDefault(); handlers.onReticleClick(reticle.x, reticle.y); break;
      case 'h': case 'H': handlers.onKey(ACTION_HINT); break;
      case 'p': case 'P': case 'Escape': handlers.onKey(ACTION_PAUSE); break;
      case 'r': case 'R': handlers.onKey(ACTION_RESTART); break;
      case 'n': case 'N': handlers.onKey(ACTION_NEXT); break;
      case 'm': case 'M': handlers.onKey(ACTION_MUTE); break;
      default: break;
    }
  });

  return reticle;
}
