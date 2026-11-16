// The AI Lab series: one welcome and four parts. The start page (start.html, js/hub.js), the welcome film
// (js/welcome.js) and the tests all read this one list. Pure: no page, no 3D. tests/series.test.mjs.
export const WELCOME_KEY = 'ecotown.welcome'; export const SAVE_KEY = 'ecotown.save.v3';

// how: three short lines on getting around in that part (shown in the welcome's guide and on the start page)
export const PARTS = [
  { id: 'town', n: 1, icon: '🏡', title: 'Eco Town', time: 'about an hour', query: '?part=town',
    blurb: 'Build your own town with Florence, your AI helper. She is clever, and sometimes wrong. Check her plans before you trust them.',
    how: ['Pick a build at the bottom, then tap a tile on the island.', 'The line at the top left always says your next step.', 'The AI Lab button opens a mission when its number shows.'] },
  { id: 'drone', n: 2, icon: '🚁', title: 'Drone delivery', query: '?module=drone',
    blurb: 'Fly a parcel across your town by hand. Then write the steps so the drone can fly the route itself.',
    how: ['Hold the arrow keys, or the arrows on the screen, to fly.', 'Follow the tall red marker to the drop-off.', 'Tap the step tiles to write the drone’s route, then press Fly.'] },
  { id: 'robots', n: 3, icon: '🤖', title: 'Robots at work', query: '?module=robots',
    blurb: 'Six jobs robots do: sensing, a greenhouse arm, hospital deliveries, recycling, farm weeding and flood rescue. Program them, teach them and test them.',
    how: ['Pick a mission on the map. They open one after another.', 'Tap tiles to build a program or rules, then press Run to test it.', 'Every mission says the real job first, and what you can now do at the end.'] },
  { id: 'roads', n: 4, icon: '🚗', title: 'Roads for self-driving cars', query: '?module=roads',
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
  { id: 'robots', view: 'street', part: 'robots', icon: '🤖', title: 'Part 3: Robots at work', say: 'Then put robots to work. Choose their sensors, program an arm, write safety rules, teach them, and design a rescue robot.' },
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

// The discussion section that ends every part (docs/full-day-plan.md): screens down, the teacher leads, the game shows
// these questions large and waits. j: ages 8–12, s: ages 13–17. The take-home page and the leader's page use them too.
export const TALK = {
  town: { j: ['Florence sounded sure. When was she wrong, and how did you find out?', 'Which check changed your mind about a plan?', 'Where else could you check before you trust a computer helper?'],
    s: ['Which piece of evidence changed your decision?', 'What did Florence assume because you did not tell her?', 'Where else would you test an AI’s answer before relying on it?'] },
  drone: { j: ['What was harder: flying by hand, or writing the steps? Why?', 'What did the drone need from you to fly the route by itself?', 'Where could a delivery drone help in a real town, and where should it not fly?'],
    s: ['What did your steps have to make exact that you judged by eye when you flew?', 'How did you find and fix a mistake in the route?', 'Who should decide where delivery drones may fly, and why?'] },
  robots: { j: ['Which sensor would you give a robot that has to work in the dark, and why?', 'When your program or rules went wrong, how did you find the mistake?', 'Why should a farm robot be very sure before it pulls a plant?', 'What did testing teach you about your rescue robot?'],
    s: ['How did the order of your rules change what the hospital robot did?', 'Where did you set the weeding robot’s threshold, and what did you trade off?', 'What made the robot sorter get new things wrong, and how did you fix it?', 'Which design trade-off in the rescue robot was hardest, and why?'] },
  roads: { j: ['What changed when the street had self-driving cars?', 'Who did your street work well for, and who did it not?', 'What would you build on the old car park, and why?'],
    s: ['Which number did you give up some of to get more of another?', 'Who gains and who loses from your street?', 'Should a town plan for self-driving cars before it knows how people will use them?'] },
  film: { j: ['How did your feedback change Florence’s film?', 'Which feedback worked best, and why?', 'What could Florence not do, and why?'],
    s: ['What made your feedback useful to Florence?', 'Who made the film: you, Florence, or both?', 'What should a person check before sharing something an AI helped to make?'] },
  power: { j: ['When did homes go dark, and why?', 'How did you change your rules to fix it?', 'What should people decide, and not the machine?'],
    s: ['Where did your rules have a gap, and how did the data show it?', 'How did the days run by rules compare with the day you ran by hand?', 'What should a person still decide when a system runs by itself?'] },
};
// The part after this one in the day, or null at the end (for the break screen).
export const nextPart = (id) => { const i = PARTS.findIndex((p) => p.id === id); return i >= 0 ? PARTS[i + 1] || null : null; };
