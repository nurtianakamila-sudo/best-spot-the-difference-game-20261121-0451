// Paints the pictures. Each scene is drawn twice — once for the left panel, once for the
// right — from the same code; `variant` is 'left' or 'right', and the right panel applies
// that scene's eight differences (see levels.js for where each one hides). Everything is
// inline SVG built from shapes: no image files, no network, the same bytes every run.

// ---- tiny SVG helpers -------------------------------------------------------
function circle(x, y, r, fill, attrs = '') {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attrs}/>`;
}
function ellipse(cx, cy, rx, ry, fill, attrs = '') {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${attrs}/>`;
}
function rect(x, y, w, h, fill, attrs = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${heightFix(h)}" fill="${fill}" ${attrs}/>`;
}
function heightFix(h) { return h; }
function path(d, fill, attrs = '') {
  return `<path d="${d}" fill="${fill}" ${attrs}/>`;
}
function line(x1, y1, x2, y2, stroke, w, attrs = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" ${attrs}/>`;
}
function poly(points, fill, attrs = '') {
  return `<polygon points="${points}" fill="${fill}" ${attrs}/>`;
}
function text(x, y, str, size, fill, attrs = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="system-ui, sans-serif" ${attrs}>${str}</text>`;
}
function gull(x, y) {
  return path(`M${x} ${y} q9 -11 18 0 q9 -11 18 0`, 'none', 'stroke="#3a3a3a" stroke-width="2.5" stroke-linecap="round"');
}
function fish(x, y, flip = 1) {
  const tail = flip > 0 ? `M${x + 12} ${y} l10 -7 v14 Z` : `M${x - 12} ${y} l-10 -7 v14 Z`;
  return ellipse(x, y, 13, 7, '#7fb3d5') + path(tail, '#7fb3d5') + circle(x + (flip > 0 ? 5 : -5), y - 1, 1.6, '#1c2438');
}
function flower(x, y, petal, size = 9) {
  let s = '';
  for (let i = 0; i < 5; i += 1) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    s += circle(x + Math.cos(a) * size * 0.85, y + Math.sin(a) * size * 0.85, size * 0.62, petal);
  }
  return s + circle(x, y, size * 0.55, '#ffd76a');
}

// ---- scene 1: Sunset Harbour Market ----------------------------------------
function drawHarbour(variant) {
  const right = variant === 'right';
  const g = right ? 'R' : 'L';
  let s = `<defs><linearGradient id="sky${g}" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#ff9a5c"/><stop offset="0.6" stop-color="#ffc98a"/>`
    + `<stop offset="1" stop-color="#ffe3b3"/></linearGradient>`
    + `<linearGradient id="sea${g}" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#3a7ca5"/><stop offset="1" stop-color="#2b5f7e"/></linearGradient></defs>`;
  s += rect(0, 0, 560, 300, `url(#sky${g})`);
  // Sun: on the right it has lost its rays and shrunk a little.
  if (!right) {
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      s += line(468 + Math.cos(a) * 42, 72 + Math.sin(a) * 42, 468 + Math.cos(a) * 54, 72 + Math.sin(a) * 54, '#ffdf8a', 4, 'stroke-linecap="round"');
    }
  }
  s += circle(468, 72, right ? 28 : 34, '#ffd76a');
  s += ellipse(120, 70, 55, 15, '#ffffff', 'opacity="0.85"')
    + ellipse(300, 45, 45, 12, '#ffffff', 'opacity="0.8"')
    + ellipse(430, 145, 38, 11, '#ffffff', 'opacity="0.7"');
  // Seagulls: the right panel is missing the second one.
  s += gull(100, 58);
  if (!right) s += gull(140, 78);
  // Sea and waves.
  s += rect(0, 300, 560, 120, `url(#sea${g})`);
  s += path('M0 318 q40 -8 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0', 'none', 'stroke="#ffffff" stroke-width="2" opacity="0.25"')
    + path('M0 348 q40 -8 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0', 'none', 'stroke="#ffffff" stroke-width="2" opacity="0.18"');
  // Little boat with a sail; the right panel lost its flag.
  s += path('M150 302 L232 302 L216 320 L166 320 Z', '#7a4a2b')
    + line(191, 302, 191, 254, '#5d3a20', 4)
    + path('M191 254 L191 296 L230 296 Z', '#fff8e7');
  if (!right) s += poly('191,254 215,259 191,265', '#e5534b');
  // Cobbles.
  s += rect(0, 320, 560, 100, '#c99a68');
  for (let i = 0; i < 14; i += 1) s += ellipse(30 + i * 40, 335 + (i % 3) * 22, 16, 6, '#b98a5a', 'opacity="0.6"');
  // Market stall: posts, striped awning, counter.
  s += rect(215, 150, 10, 172, '#6b4226') + rect(345, 150, 10, 172, '#6b4226');
  s += rect(200, 300, 160, 22, '#8a5a2b') + rect(196, 296, 168, 8, '#a9743f');
  const stripes = ['#e5534b', '#f5ead6', '#e5534b', '#f5ead6', '#e5534b'];
  for (let i = 0; i < 5; i += 1) {
    // The middle stripe is teal on the right panel.
    const fill = right && i === 2 ? '#2a9d8f' : stripes[i];
    s += rect(205 + i * 30, 112, 30, 40, fill);
  }
  s += poly('205,112 355,112 365,152 195,152', 'none', 'stroke="#8a5a2b" stroke-width="2"');
  // Fish on the counter: three on the left, two on the right.
  s += fish(250, 285) + fish(285, 285);
  if (!right) s += fish(318, 285);
  // Basket of oranges; on the right a green apple sneaked in.
  s += rect(370, 296, 52, 24, '#9c6b30', 'rx="4"');
  s += circle(380, 290, 8, '#ff8c1a') + circle(406, 290, 8, '#ff8c1a') + circle(385, 300, 8, '#ff8c1a') + circle(400, 300, 8, '#ff8c1a');
  s += right ? circle(392, 288, 8, '#6ab04c') + line(392, 280, 392, 274, '#4e9b47', 2) : circle(392, 288, 8, '#ff8c1a');
  // Jars on the counter.
  s += rect(222, 276, 16, 20, '#f2c94c', 'rx="3"') + rect(240, 272, 14, 24, '#e26d5a', 'rx="3"');
  // Lantern post: lit warm on the left, cold and dark on the right.
  s += rect(88, 180, 6, 142, '#3a3a3a') + line(88, 182, 104, 182, '#3a3a3a', 4);
  if (!right) s += circle(92, 211, 30, '#ffd76a', 'opacity="0.3"');
  s += rect(80, 196, 24, 30, right ? '#8b93a3' : '#ffd76a', 'rx="6"')
    + line(92, 196, 92, 192, '#3a3a3a', 3) + line(80, 211, 104, 211, '#3a3a3a', 2);
  // Crates with a cat on top — the cat is gone on the right.
  s += rect(440, 330, 62, 40, '#a9743f') + rect(452, 296, 44, 34, '#b98a4a');
  s += line(440, 350, 502, 350, '#8a5a2b', 2) + line(452, 313, 496, 313, '#8a5a2b', 2);
  if (!right) {
    s += ellipse(472, 288, 15, 11, '#4a4a4a') + circle(472, 272, 10, '#4a4a4a')
      + poly('464,265 466,256 470,264', '#4a4a4a') + poly('476,264 480,256 481,265', '#4a4a4a')
      + path('M484 292 q12 -2 10 -14', 'none', 'stroke="#4a4a4a" stroke-width="4" stroke-linecap="round"');
  }
  // Sign on the stall.
  s += rect(248, 158, 64, 26, '#fff8e7', 'rx="4"') + text(280, 176, 'FISH', 13, '#7a4a2b', 'text-anchor="middle" font-weight="bold"');
  return s;
}

// ---- scene 2: Garden Tea Party ---------------------------------------------
function drawGarden(variant) {
  const right = variant === 'right';
  let s = rect(0, 0, 560, 180, '#bfe6ff');
  s += circle(70, 60, 30, '#ffd76a');
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    s += line(70 + Math.cos(a) * 38, 60 + Math.sin(a) * 38, 70 + Math.cos(a) * 48, 60 + Math.sin(a) * 48, '#ffdf8a', 4, 'stroke-linecap="round"');
  }
  s += ellipse(200, 55, 50, 13, '#ffffff', 'opacity="0.9"') + ellipse(430, 40, 45, 12, '#ffffff', 'opacity="0.85"');
  // Bunting across the top; one flag is missing on the right.
  s += path('M40 40 Q280 95 520 40', 'none', 'stroke="#8a5a2b" stroke-width="2"');
  const flagColours = ['#e5534b', '#f2c94c', '#2a9d8f', '#e26d5a', '#7c5cff', '#4caf7d'];
  for (let i = 0; i < 6; i += 1) {
    if (right && i === 2) continue;
    const fx = 90 + i * 76;
    const fy = 52 + Math.sin((fx - 40) / 480 * Math.PI) * 22;
    s += poly(`${fx - 11},${fy} ${fx + 11},${fy} ${fx},${fy + 24}`, flagColours[i]);
  }
  // Lawn and fence.
  s += rect(0, 180, 560, 240, '#7ec850') + rect(0, 180, 560, 26, '#6db344');
  s += rect(0, 150, 560, 10, '#ffffff');
  for (let x = 10; x < 560; x += 42) s += poly(`${x},150 ${x + 12},138 ${x + 24},150 ${x + 24},168 ${x},168`, '#f7f3e8');
  // Bird on the fence — gone on the right.
  if (!right) {
    s += ellipse(88, 126, 12, 9, '#5b7fa6') + circle(98, 120, 7, '#5b7fa6')
      + poly('104,120 111,122 104,124', '#f2a541') + line(84, 134, 84, 140, '#3a3a3a', 2) + line(92, 134, 92, 140, '#3a3a3a', 2);
  }
  // Tree on the right.
  s += rect(492, 150, 18, 96, '#6b4226')
    + circle(480, 132, 42, '#4e9b47') + circle(522, 122, 46, '#57ab4e') + circle(501, 92, 42, '#4e9b47')
    + circle(486, 118, 8, '#e5534b') + circle(516, 138, 8, '#e5534b') + circle(500, 100, 8, '#f2c94c');
  // Bee near the tree — gone on the right.
  if (!right) {
    s += ellipse(205, 148, 9, 6, '#f2c94c') + line(202, 142, 202, 154, '#3a3a3a', 2) + line(208, 142, 208, 154, '#3a3a3a', 2)
      + ellipse(200, 140, 6, 4, '#ffffff', 'opacity="0.8"') + ellipse(209, 140, 6, 4, '#ffffff', 'opacity="0.8"');
  }
  // Table with a cloth, teapot and cups.
  s += rect(232, 306, 10, 70, '#7a4a2b') + rect(338, 306, 10, 70, '#7a4a2b');
  s += rect(220, 220, 140, 92, '#fff8e7') + ellipse(290, 220, 72, 14, '#f2e6c9');
  s += path('M220 312 q10 10 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0', 'none', 'stroke="#f2e6c9" stroke-width="3"');
  // Teapot; the steam above it is missing on the right.
  s += circle(283, 196, 18, '#e26d5a') + path('M268 192 q-14 -4 -12 -14 q8 2 14 6', '#e26d5a')
    + path('M299 188 q12 2 10 14 q-8 -2 -12 -8', 'none', 'stroke="#e26d5a" stroke-width="4" fill="none"')
    + rect(278, 174, 10, 6, '#c95a48', 'rx="3"');
  if (!right) {
    s += path('M276 168 q-5 -8 0 -14 q5 -6 0 -12', 'none', 'stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.85"')
      + path('M290 168 q-5 -8 0 -14 q5 -6 0 -12', 'none', 'stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.85"');
  }
  // Teacups: three on the left, two on the right.
  const cup = (x, y) => rect(x - 9, y - 8, 18, 14, '#7fb3d5', 'rx="3"')
    + path(`M${x + 9} ${y - 5} q8 2 0 9`, 'none', 'stroke="#7fb3d5" stroke-width="3" fill="none"')
    + ellipse(x, y - 8, 9, 3, '#a9743f');
  s += cup(252, 240) + cup(300, 246);
  if (!right) s += cup(352, 238);
  // Plate of cake.
  s += ellipse(290, 262, 22, 5, '#ffffff') + rect(280, 250, 20, 10, '#f2a7c3', 'rx="2"') + circle(290, 248, 3, '#e5534b');
  // Flowers along the bottom; the big one changes colour on the right.
  s += line(60, 360, 60, 330, '#4e9b47', 3) + flower(60, 322, '#ff9ecf');
  s += line(150, 380, 150, 352, '#4e9b47', 3) + flower(150, 344, '#f2c94c');
  s += line(438, 360, 438, 330, '#4e9b47', 4) + flower(438, 318, right ? '#e5534b' : '#9b5de5', 13);
  s += line(330, 385, 330, 360, '#4e9b47', 3) + flower(330, 352, '#ff9ecf');
  // Butterfly on a flower — gone on the right.
  if (!right) {
    s += ellipse(112, 300, 10, 14, '#ff9ecf', 'transform="rotate(-25 112 300)"')
      + ellipse(126, 300, 10, 14, '#ff9ecf', 'transform="rotate(25 126 300)"')
      + line(119, 296, 119, 312, '#3a3a3a', 2);
  }
  // Garden gnome; his hat changes colour on the right.
  s += poly('495,340 515,340 505,306', '#3a6fd8')
    + poly('493,306 517,306 505,282', right ? '#3a6fd8' : '#e5534b')
    + circle(505, 310, 7, '#f2c9a0') + ellipse(505, 322, 9, 8, '#ffffff');
  // Grass tufts and daisies.
  for (let i = 0; i < 8; i += 1) {
    const gx = 30 + i * 68;
    s += path(`M${gx} 400 q3 -12 6 0 M${gx + 8} 400 q3 -10 6 0`, 'none', 'stroke="#4e9b47" stroke-width="2" stroke-linecap="round"');
  }
  s += flower(210, 395, '#ffffff', 6) + flower(400, 400, '#ffffff', 6);
  return s;
}

// ---- scene 3: Lantern Night Festival ---------------------------------------
function drawFestival(variant) {
  const right = variant === 'right';
  let s = rect(0, 0, 560, 420, '#141a3a');
  // Stars; one goes out on the right.
  const stars = [[60, 60], [140, 40], [220, 70], [302, 52], [360, 36], [520, 90], [90, 130], [260, 30], [420, 44]];
  for (const [sx, sy] of stars) {
    if (right && sx === 302) continue;
    s += circle(sx, sy, 2.5, '#ffffff') + path(`M${sx - 6} ${sy} h12 M${sx} ${sy - 6} v12`, 'none', 'stroke="#ffffff" stroke-width="1" opacity="0.5"');
  }
  // Moon: full on the left, a crescent on the right.
  s += circle(468, 62, 26, '#fff3c4');
  if (right) s += circle(478, 56, 22, '#141a3a');
  s += circle(460, 56, 3, '#e8d9a0') + circle(474, 68, 2.5, '#e8d9a0');
  // Firework burst: gold on the left, pink on the right.
  const fw = right ? '#ff7eb9' : '#ffd76a';
  for (let i = 0; i < 10; i += 1) {
    const a = (i * Math.PI) / 5;
    s += line(205 + Math.cos(a) * 8, 118 + Math.sin(a) * 8, 205 + Math.cos(a) * 30, 118 + Math.sin(a) * 30, fw, 2.5, 'stroke-linecap="round"');
    s += circle(205 + Math.cos(a) * 34, 118 + Math.sin(a) * 34, 2.5, fw);
  }
  s += circle(205, 118, 5, '#ffffff');
  // Kite in the sky — gone on the right.
  if (!right) {
    s += poly('425,156 447,178 425,200 403,178', '#ff7eb9')
      + line(425, 200, 418, 236, '#ffffff', 1.5) + circle(418, 240, 3, '#f2c94c');
  }
  // Lantern strings across the sky; the left panel has one extra lantern.
  s += path('M0 90 Q140 130 280 92 T560 88', 'none', 'stroke="#8a5a2b" stroke-width="2"');
  const lanternSpots = [[70, 104], [150, 108], [230, 100], [310, 96], [390, 92], [470, 90]];
  for (const [lx, ly] of lanternSpots) {
    if (right && lx === 150) continue;
    s += circle(lx, ly + 14, 12, '#ffd76a', 'opacity="0.25"');
    s += rect(lx - 8, ly + 4, 16, 22, '#ff9f1c', 'rx="7"') + line(lx, ly, lx, ly + 4, '#8a5a2b', 2);
  }
  // Houses with roofs.
  s += rect(40, 260, 120, 110, '#2b3a5e') + poly('30,262 100,210 170,262', '#7a4a2b');
  s += rect(400, 250, 120, 120, '#2b3a5e') + poly('390,252 460,200 530,252', '#7a4a2b');
  // Windows; one goes dark on the right.
  s += rect(70, 280, 24, 30, '#ffd76a') + rect(116, 280, 24, 30, '#ffd76a');
  s += rect(430, 272, 24, 30, right ? '#1c2438' : '#ffd76a') + rect(476, 272, 24, 30, '#ffd76a');
  s += line(82, 280, 82, 310, '#2b3a5e', 2) + line(70, 295, 94, 295, '#2b3a5e', 2);
  s += line(442, 272, 442, 302, '#2b3a5e', 2) + line(430, 287, 454, 287, '#2b3a5e', 2);
  // Doors.
  s += rect(92, 330, 20, 40, '#7a4a2b') + rect(452, 330, 20, 40, '#7a4a2b');
  // Festival banner between the houses; its emblem changes on the right.
  s += rect(230, 186, 100, 22, '#e5534b', 'rx="4"') + line(230, 186, 230, 210, '#8a5a2b', 3) + line(330, 186, 330, 210, '#8a5a2b', 3);
  if (!right) {
    s += poly('280,188 282,194 288,194 283,198 285,204 280,200 275,204 277,198 272,194 278,194', '#ffd76a');
  } else {
    s += circle(280, 196, 6, '#ffd76a');
  }
  // Cat on the roof — gone on the right.
  if (!right) {
    s += ellipse(498, 234, 14, 10, '#0d0d17') + circle(498, 220, 9, '#0d0d17')
      + poly('491,214 493,205 497,213', '#0d0d17') + poly('501,213 505,205 506,214', '#0d0d17')
      + path('M510 238 q12 -2 10 -14', 'none', 'stroke="#0d0d17" stroke-width="4" stroke-linecap="round"');
  }
  // Street, lantern posts and a few festival-goers.
  s += rect(0, 370, 560, 50, '#232a4a');
  for (const px of [200, 360]) {
    s += rect(px, 300, 5, 70, '#3a3a3a') + circle(px + 2, 292, 14, '#ffd76a', 'opacity="0.3"')
      + rect(px - 6, 282, 16, 20, '#ffd76a', 'rx="6"');
  }
  const person = (x, y, shirt) => circle(x, y - 26, 8, '#f2c9a0') + rect(x - 9, y - 18, 18, 26, shirt, 'rx="6"');
  s += person(250, 400, '#e5534b') + person(300, 402, '#2a9d8f') + person(340, 398, '#7c5cff');
  return s;
}

// ---- public API -------------------------------------------------------------
/** The inner SVG markup for one panel of a scene. */
export function drawScene(levelIndex, variant) {
  if (levelIndex === 1) return drawGarden(variant);
  if (levelIndex === 2) return drawFestival(variant);
  return drawHarbour(variant);
}

/** A found-difference marker (gold ring + check) centred on (x, y). */
export function markerMarkup(x, y, r) {
  return `<g class="marker"><circle cx="${x}" cy="${y}" r="${r + 9}" fill="none" stroke="#ffd700" stroke-width="4"/>`
    + `<circle cx="${x}" cy="${y}" r="${r + 9}" fill="none" stroke="#b8860b" stroke-width="1.5" opacity="0.6"/>`
    + `<path d="M${x - 7} ${y} l5 5 l9 -10" fill="none" stroke="#ffd700" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M${x - 7} ${y} l5 5 l9 -10" fill="none" stroke="#7a5c00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

/** A pulsing hint ring centred on (x, y). */
export function hintMarkup(x, y, r) {
  return `<g class="hint-ring"><circle cx="${x}" cy="${y}" r="${r + 12}" fill="none" stroke="#7c5cff" stroke-width="4">`
    + `<animate attributeName="r" values="${r + 6};${r + 16};${r + 6}" dur="0.9s" repeatCount="indefinite"/>`
    + `<animate attributeName="opacity" values="1;0.4;1" dur="0.9s" repeatCount="indefinite"/></circle></g>`;
}

/** A gentle red X where a wrong click landed. */
export function missMarkup(x, y) {
  return `<g class="miss-mark"><path d="M${x - 9} ${y - 9} l18 18 M${x + 9} ${y - 9} l-18 18" stroke="#e5534b" stroke-width="4" stroke-linecap="round"/></g>`;
}
