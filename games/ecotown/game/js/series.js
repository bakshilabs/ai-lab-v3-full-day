// The AI Lab series: one welcome and four parts. The start page (start.html, js/hub.js), the welcome film
// (js/welcome.js) and the tests all read this one list. Pure: no page, no 3D. tests/series.test.mjs.
export const WELCOME_KEY = 'ecotown.welcome'; export const SAVE_KEY = 'ecotown.save.v3';

// how: three short lines on getting around in that part (shown in the welcome's guide and on the start page)
export const PARTS = [
  { id: 'town', n: 1, icon: '🏡', title: 'Eco Town', time: 'about an hour', query: '?part=town',
    blurb: 'Build your own town with Florence, your AI helper. She is clever, and sometimes wrong. Check her plans before you trust them.',
    how: ['Pick a build at the bottom, then tap a tile on the island.', 'The line at the top left always says your next step.', 'The AI Lab button opens a mission when its number shows.'] },
  { id: 'drone', n: 2, icon: '🚁', title: 'Drone delivery', time: 'about 10 minutes', query: '?module=drone',
    blurb: 'Fly a parcel across your town by hand. Then write the steps so the drone can fly the route itself.',
    how: ['Hold the arrow keys, or the arrows on the screen, to fly.', 'Follow the tall red marker to the drop-off.', 'Tap the step tiles to write the drone’s route, then press Fly.'] },
  { id: 'robots', n: 3, icon: '🤖', title: 'Robot training', time: 'about 10 minutes', query: '?module=robots',
    blurb: 'Teach a recycling robot by showing it examples. Test it, see what it has not been shown yet, and show it more.',
    how: ['Tap a thing, then tap the bin it belongs in. You can also drag it.', 'Press Next to watch the robot sort each test thing.', 'Starred things are the ones it has not been shown yet.'] },
  { id: 'roads', n: 4, icon: '🚗', title: 'Roads for self-driving cars', time: 'about 10 minutes', query: '?module=roads',
    blurb: 'Redesign a street for shared self-driving cars. Then choose what to do with the car park the town no longer needs.',
    how: ['Pick a piece, then tap a place on the street to put it there.', 'Press Run the morning to see the numbers for your street.', 'Choose what each empty plot becomes. There is no single right answer.'] },
];
export const EVERYWHERE = ['“Back to my town” at the top left always takes you back.', 'The speaker button reads the words aloud.', 'Stuck? Tell your leader your badge name.'];

// The welcome film: seven short scenes. say: the line spoken and shown. view: which camera move (js/welcome.js).
export const SCENES = [
  { id: 'hello', view: 'wide', icon: '👋', title: 'Welcome to the AI Lab', say: 'Welcome to the AI Lab. Today you will plan a town, and then work with the machines of its future.' },
  { id: 'florence', view: 'florence', icon: '🤖', title: 'Meet Florence', say: 'This is Florence, your AI helper. She is clever and she works fast. She is not always right.' },
  { id: 'town', view: 'town', part: 'town', icon: '🏡', title: 'Part 1: Eco Town', say: 'First, build your own town. Florence makes plans. You check them with evidence before you trust them.' },
  { id: 'drone', view: 'low', part: 'drone', icon: '🚁', title: 'Part 2: Drone delivery', say: 'Next, fly a delivery drone across your town. Then write the steps so it can fly the route itself.' },
  { id: 'robots', view: 'street', part: 'robots', icon: '🤖', title: 'Part 3: Robot training', say: 'Then train a robot. Show it examples, test it, and show it what it has not seen yet.' },
  { id: 'roads', view: 'road', part: 'roads', icon: '🚗', title: 'Part 4: Roads for self-driving cars', say: 'Last, redesign a street for self-driving cars, and decide what the old car park becomes.' },
  { id: 'page', view: 'high', icon: '📄', title: 'Take it home', say: 'At the end you take home a page that shows what you made. Ready? Let us see how to get around.' },
];

// What has been done, from the saved town (or null): for the ticks on the start page.
export function progress(save, welcomeSeen = false) {
  const labs = save?.labs ? Object.values(save.labs).filter(Boolean).length : 0; const mods = save?.modules || {};
  const state = (done, started) => (done ? 'done' : started ? 'started' : 'new');
  return {
    welcome: welcomeSeen ? 'done' : 'new', hasTown: !!(save && save.cells && save.band),
    town: state(labs >= 6 || !!save?.sessionDone || !!save?.completeShown, !!(save && save.cells && (save.cells.length || labs))),
    townNote: labs ? `${labs} of 6 missions done` : '',
    drone: state(!!mods.drone?.done, !!mods.drone), robots: state(!!mods.robots?.done, !!mods.robots), roads: state(!!mods.roads?.done, !!mods.roads),
    // what to do next: the welcome, then the parts in order
    next: !welcomeSeen ? 'welcome' : (PARTS.find((p) => state(p.id === 'town' ? (labs >= 6 || !!save?.sessionDone || !!save?.completeShown) : !!mods[p.id]?.done, false) !== 'done')?.id || null),
  };
}
export const LABEL = { done: '✓ Done', started: '▶ Carry on', new: 'Not started yet' };
