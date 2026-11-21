// The three scenes and where their differences hide. Each difference is a spot on the
// picture (panel coordinates, 560x420) with a radius a click must land inside and a short
// label the game shows when it is found. The scene painter in scene.js draws each of these
// spots differently on the right-hand panel; the coordinates here must match the drawing.

export const LEVELS = [
  {
    id: 'harbour',
    title: 'Sunset Harbour Market',
    diffs: [
      { id: 'gull', label: 'A seagull vanished', x: 150, y: 78, r: 20 },
      { id: 'stripe', label: 'The awning stripe changed colour', x: 280, y: 132, r: 24 },
      { id: 'fish', label: 'One fish is missing from the stall', x: 318, y: 285, r: 20 },
      { id: 'cat', label: 'The cat slipped off the crate', x: 472, y: 292, r: 26 },
      { id: 'rays', label: 'The sun lost its rays', x: 468, y: 72, r: 30 },
      { id: 'lantern', label: 'The lantern went out', x: 92, y: 211, r: 24 },
      { id: 'flag', label: 'The little boat lost its flag', x: 202, y: 258, r: 18 },
      { id: 'apple', label: 'An apple sneaked into the oranges', x: 392, y: 288, r: 22 },
    ],
  },
  {
    id: 'garden',
    title: 'Garden Tea Party',
    diffs: [
      { id: 'steam', label: 'The teapot stopped steaming', x: 283, y: 168, r: 20 },
      { id: 'butterfly', label: 'The butterfly flew away', x: 118, y: 306, r: 22 },
      { id: 'flower', label: 'The big flower changed colour', x: 438, y: 318, r: 24 },
      { id: 'cup', label: 'A teacup is missing', x: 352, y: 238, r: 20 },
      { id: 'bird', label: 'The bird left the fence', x: 88, y: 128, r: 20 },
      { id: 'bunting', label: 'A bunting flag is gone', x: 242, y: 73, r: 22 },
      { id: 'hat', label: 'The gnome changed his hat', x: 505, y: 296, r: 24 },
      { id: 'bee', label: 'The bee buzzed off', x: 205, y: 148, r: 18 },
    ],
  },
  {
    id: 'festival',
    title: 'Lantern Night Festival',
    diffs: [
      { id: 'lantern', label: 'An extra lantern is glowing', x: 150, y: 108, r: 22 },
      { id: 'moon', label: 'The moon turned into a crescent', x: 468, y: 62, r: 30 },
      { id: 'star', label: 'A star went out', x: 302, y: 52, r: 18 },
      { id: 'firework', label: 'The firework changed colour', x: 205, y: 118, r: 28 },
      { id: 'kite', label: 'The kite is gone from the sky', x: 425, y: 178, r: 24 },
      { id: 'window', label: 'A window went dark', x: 442, y: 287, r: 22 },
      { id: 'banner', label: 'The banner emblem changed', x: 280, y: 196, r: 22 },
      { id: 'roofcat', label: 'The cat left the roof', x: 498, y: 238, r: 24 },
    ],
  },
];
