// The AI Lab series: one welcome and four parts. The start page (start.html, js/hub.js), the welcome film
// (js/welcome.js) and the tests all read this one list. Pure: no page, no 3D. tests/series.test.mjs.
export const WELCOME_KEY = 'ecotown.welcome'; export const SAVE_KEY = 'ecotown.save.v3';

// how: three short lines on getting around in that part (shown in the welcome's guide and on the start page)
export const PARTS = [
  { id: 'town', n: 1, icon: '🏡', title: 'Eco Town', time: 'about an hour', query: '?part=town',
    blurb: 'Build your own town with Florence, your AI helper. She is clever, and sometimes wrong. Check her plans before you trust them.',
    how: ['Pick a build at the bottom, then tap a tile on the island.', 'The line at the top left always says your next step.', 'The AI Lab button opens a mission when its number shows.'] },
  { id: 'drone', n: 2, icon: '🚁', title: 'Drones at work', query: '?module=drone',
    blurb: 'Six jobs drones do: safety checks, flying by hand, deliveries, farm maps, inspecting a turbine and a bridge, and search and rescue.',
    how: ['Pick a mission on the map. They open one after another.', 'Hold the arrow keys, or the arrows on the screen, to fly.', 'Every mission says the real job first, and what you can now do at the end.'] },
  { id: 'robots', n: 3, icon: '🤖', title: 'Robots at work', query: '?module=robots',
    blurb: 'Six jobs robots do: sensing, a greenhouse arm, hospital deliveries, recycling, farm weeding and flood rescue. Program them, teach them and test them.',
    how: ['Pick a mission on the map. They open one after another.', 'Tap tiles to build a program or rules, then press Run to test it.', 'Every mission says the real job first, and what you can now do at the end.'] },
  { id: 'roads', n: 4, icon: '🚗', title: 'Self-driving cars', query: '?module=roads',
    blurb: 'Six jobs behind a self-driving car: its sensors, labelling pictures, rules of the road, testing, a shared fleet and redesigning the street.',
    how: ['Pick a mission on the map. They open one after another.', 'Choose, label or set things, then press Run or Test to see what the car does.', 'Every mission says the real job first, and what you can now do at the end.'] },
];
export const EVERYWHERE = ['“Back to my town” at the top left always takes you back.', 'The speaker button reads the words aloud.', 'Stuck? Tell your leader your badge name.'];

// The welcome film: seven short scenes. say: the line spoken and shown. view: which camera move (js/welcome.js).
export const SCENES = [
  { id: 'hello', view: 'wide', icon: '👋', title: 'Welcome to the AI Lab', say: 'Welcome to the AI Lab. Today you will plan a town, and then work with the machines of its future.' },
  { id: 'florence', view: 'florence', icon: '🤖', title: 'Meet Florence', say: 'This is Florence, your AI helper. She is clever and she works fast. She is not always right.' },
  { id: 'town', view: 'town', part: 'town', icon: '🏡', title: 'Part 1: Eco Town', say: 'First, build your own town. Florence makes plans. You check them with evidence before you trust them.' },
  { id: 'drone', view: 'low', part: 'drone', icon: '🚁', title: 'Part 2: Drones at work', say: 'Next, put drones to work. Check them, fly them, deliver, map a farm, inspect a turbine, and search for someone lost.' },
  { id: 'robots', view: 'street', part: 'robots', icon: '🤖', title: 'Part 3: Robots at work', say: 'Then put robots to work. Choose their sensors, program an arm, write safety rules, teach them, and design a rescue robot.' },
  { id: 'roads', view: 'road', part: 'roads', icon: '🚗', title: 'Part 4: Self-driving cars', say: 'Then work on self-driving cars. Give them sensors, teach them, set their rules, test them, plan a fleet and redesign the street.' },
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
  drone: { j: ['Why should a pilot sometimes decide not to fly?', 'What was hardest about flying in the wind, and how did you fix it?', 'Why did the heat camera find the walker when the normal camera could not?', 'Which drone job would you most like to do, and why?'],
    s: ['Which Drone Code rule surprised you, and who is it there to protect?', 'Why do survey photos need to overlap, and what happens if they do not?', 'How did you keep a safe distance while still getting a clear inspection photo?', 'Where should drones be used, and where should they not, even if they could help?'] },
  robots: { j: ['Which sensor would you give a robot that has to work in the dark, and why?', 'When your program or rules went wrong, how did you find the mistake?', 'How sure did you make the weeding robot, and what did that cost?', 'What did testing teach you about your rescue robot?'],
    s: ['How did the order of your rules change what the hospital robot did?', 'Where did you set the weeding robot’s threshold, and what did you trade off?', 'What made the robot sorter get new things wrong, and how did you fix it?', 'Which design trade-off in the rescue robot was hardest, and why?'] },
  roads: { j: ['Which sensor would you trust in fog, and why does a car need more than one?', 'Which pictures were hardest to label, and why did they matter?', 'Which rule of the road did you set, and who does it keep safe?', 'Who did your street work well for, and who did it not?'],
    s: ['What did the car get wrong before you labelled the hard cases?', 'In testing, why change only one setting at a time?', 'How many cars did your fleet need, and what did you trade off?', 'Should a town plan for self-driving cars before it knows how people will use them?'] },
  film: { j: ['Which shot would you use to show how someone feels: wide or close-up? Why?', 'Why does a story need a beginning, a middle and an end?', 'How did your feedback change Florence’s film?', 'How do captions help someone watch your film?', 'How can you tell if a picture is true or made up, and why must you ask before filming someone?'],
    s: ['How did the length of your shots change the mood of the edit?', 'What made your feedback to Florence useful?', 'Who are captions and audio description for, and what makes them good?', 'When does changing a picture become misleading?', 'Who made the film: you, Florence, or both? What should you say in the credits?'] },
  power: { j: ['Why must the power made always match the power used?', 'How did the forecast help you plan for a short spell?', 'Which jobs did you move to a windy or sunny time, and did people still get what they needed?', 'On storm night, who got power first, and why?'],
    s: ['What is the difference between kW and kWh, and where did it matter today?', 'Where did your automation rules have a gap, and how did testing show it?', 'How did moving demand compare with storing power in the battery?', 'Who should decide the order power comes back after a storm: people or the machine?'] },
};
// The part after this one in the day, or null at the end (for the break screen).
// "Jobs that use this" (docs/curriculum.md): the last screen before the talk. [icon, job, what the person does (8–12), (13–17)].
export const JOBS = {
  town: [['🏘️', 'Town planner', 'Decides where homes, schools and parks go.', 'Plans where homes, schools, parks and roads go, using data and what people need.'],
    ['🌿', 'Environmental scientist', 'Checks how a place affects nature, water and air.', 'Measures how building affects nature, flooding and pollution, and advises on it.'],
    ['📊', 'Data analyst', 'Reads numbers to find out what is really going on.', 'Checks data and models, and finds where a confident answer is wrong.']],
  drone: [['🚁', 'Drone pilot', 'Flies drones safely for deliveries, films and farms.', 'Plans and flies missions within the rules, checking weather, battery and airspace.'],
    ['🗺️', 'Survey and mapping technician', 'Makes maps from photos taken by drones.', 'Plans survey flights and turns overlapping photos into maps and measurements.'],
    ['🌉', 'Infrastructure inspector', 'Checks bridges and wind turbines for damage.', 'Inspects bridges, turbines and power lines close up, and reports cracks and wear.'],
    ['🆘', 'Search and rescue drone operator', 'Helps find people who are lost.', 'Flies heat cameras on search patterns and guides the rescue team on the ground.']],
  robots: [['🤖', 'Robotics engineer', 'Designs robots and what they can sense and do.', 'Designs robots: the body, the sensors, the power and the program.'],
    ['🔧', 'Robot technician', 'Sets up robots, programs them and fixes them.', 'Installs, programs, maintains and repairs robots in factories, hospitals and farms.'],
    ['🌱', 'Agricultural engineer', 'Builds machines that help farms grow food.', 'Builds farm machines and robots that plant, weed and harvest with less waste.'],
    ['🧪', 'Test engineer', 'Tests robots to find mistakes before people use them.', 'Designs tests that find where a machine fails, before it is used for real.']],
  roads: [['🚗', 'Autonomous vehicle engineer', 'Builds the parts of a car that let it drive itself.', 'Works on the sensors and software that let a car see, decide and drive.'],
    ['🚌', 'Transport planner', 'Plans how people get around a town.', 'Plans streets, buses and shared cars so everyone can get where they need to go.'],
    ['🛑', 'Safety test driver', 'Rides in test cars and takes over if needed.', 'Supervises self-driving cars on test drives and reports where they went wrong.'],
    ['📈', 'Traffic data analyst', 'Studies traffic numbers to make streets work better.', 'Analyses journeys, waits and crashes to show what would make streets safer.']],
  film: [['🎬', 'Director', 'Decides how the story is told and filmed.', 'Leads the crew and decides the shots, the pace and the feeling of the film.'],
    ['✂️', 'Video editor', 'Puts the shots together and chooses the music.', 'Cuts and orders the shots and sets the rhythm, sound and music.'],
    ['📱', 'Content producer', 'Plans and makes videos for websites and channels.', 'Plans, makes and checks videos, including what AI tools helped to make.'],
    ['♿', 'Accessibility producer', 'Adds captions and descriptions so everyone can enjoy it.', 'Makes media work for everyone, with captions, audio description and clear design.']],
  power: [['⚡', 'Grid control engineer', 'Keeps the power on by matching what is made to what is used.', 'Balances supply and demand minute by minute and handles faults on the network.'],
    ['📉', 'Energy analyst', 'Reads forecasts and numbers about power.', 'Forecasts demand and wind and sun, and finds ways to use clean power better.'],
    ['☀️', 'Renewable energy technician', 'Looks after wind turbines, solar panels and batteries.', 'Installs and maintains turbines, solar panels and batteries.'],
    ['🌩️', 'Emergency planner', 'Plans what to do when storms or floods hit.', 'Plans who gets help first in an emergency and how to restore services safely.']],
};
// The whole day in order (docs/full-day-plan.md). Parts not on the start page yet are still named on the break screen,
// so the break after Self-driving cars never says the day is over.
const LATER = [{ id: 'film', icon: '🎬', title: 'Town film studio' }, { id: 'power', icon: '⚡', title: 'Power control room' }];
export const dayParts = () => [...PARTS, ...LATER.filter((l) => !PARTS.some((p) => p.id === l.id))].map((p, i) => ({ ...p, n: i + 1 }));
export const nextPart = (id) => { const d = dayParts(); const i = d.findIndex((p) => p.id === id); return i >= 0 ? d[i + 1] || null : null; };
