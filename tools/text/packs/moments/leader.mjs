// Leader pages: the Eco Town run sheet (leader.html). One page for a leader, read before and during the hour, often
// printed. Notes ABOUT the page for the writer: what each section is for and when it is read. No wording.
const P = 'leader.html';
export default [
  { id: 'LD-M001', t: 'Run sheet: title and aim', m: [[P, '', { l: [1, 32] }]],
    d: 'The top of the leader’s run sheet for the Eco Town hour, opened from the start page (“Open the leader’s page”) or the trailer page. A leader reads it before the session, often printed on one page. The browser tab title, the page heading and one paragraph on what children do and what the hour aims for.' },
  { id: 'LD-M002', t: 'Run sheet: the hour, minute by minute', m: [[P, '', { l: [33, 43] }]],
    d: 'A two-column table of the hour (about / what happens): start (the group code, the badge name, the age version), building and the first two missions, pause 1, missions three and four, pause 2, missions five and six and finishing the session. A note under it says the times are a guide and nothing in the game waits for a clock. A leader glances at it during the session.' },
  { id: 'LD-M003', t: 'Run sheet: before the children arrive', m: [[P, '', { l: [44, 50] }]],
    d: 'A checklist for setting up: open the game on every device, headphones or sound off, write the group code up, choose the age version and the mission order for the group, and open the leader’s live page on the leader’s own device (with the leader code) to see each badge and the step it is on.' },
  { id: 'LD-M004', t: 'Run sheet: where the game makes a child wait', m: [[P, '', { l: [51, 58] }]],
    d: 'Three notes on where a child may have to wait or repeat things: when builds open, builds that must be repeated, and that a refresh is safe. The first note gives the older order in which builds opened as the town grew; from the design note (docs/ecotown-florence-first.md), each level now opens in the child’s town after Florence’s mission for it, and the next mission after a small “your turn” step.' },
  { id: 'LD-M005', t: 'Run sheet: where Florence is wrong on purpose', m: [[P, '', { l: [59, 69] }]],
    d: 'A table of the six missions: what a vague instruction makes Florence do in each, and which lens or test shows it. For the leader to know the answers in advance and to steer a stuck child towards the right check without giving it away. The mission and lens names must match the game’s buttons.' },
  { id: 'LD-M006', t: 'Run sheet: questions to ask', m: [[P, '', { l: [70, 77] }]],
    d: 'The questions for the two pause cards (the same as the game shows), one to ask any time, and one for a child who finishes early. Read out by the leader with screens down.' },
  { id: 'LD-M007', t: 'Run sheet: common mistakes and how to help', m: [[P, '', { l: [78, 87] }]],
    d: 'Four common situations (accepting a plan without checking it, rewriting the same instruction, a “partly right” result, a town-meeting choice that broke a limit for 13–17) with what the leader can ask or point at without telling the answer, and an example of a strong answer from a child.' },
  { id: 'LD-M008', t: 'Run sheet: if a child types something worrying', m: [[P, '', { l: [88, 91] }]],
    d: 'A safeguarding note: what Florence does if a child types something worrying (a fixed reply suggesting a trusted adult), and that nothing typed is sent anywhere, so the leader will not see it and must watch and ask in the room.' },
  { id: 'LD-M009', t: 'Run sheet: links', m: [[P, '', { l: [92, 200] }]],
    d: 'Links at the foot of the page: the AI Lab start page, the game, and the one-minute film.' },
];
