// Town film studio, the hour (docs/curriculum.md section 5): six missions, each a different real job in film and TV.
// Pure: the mission list, the saved progress (which missions are done, and a few facts from each for the record)
// and the take-home record. No page, no 3D.

// use: the real job, as the map names it. job: one line on the job and why it matters. how: what to tap.
// can: what the child can now do. j / s: ages 8–12 / 13–17 where the words differ.
export const MISSIONS = [
  { id: 'crew', n: 1, icon: '🎥', use: 'The film crew’s language',
    job: 'Film crews use the same words for every shot, so everyone knows what the camera will do.',
    how: { j: 'Watch the camera in your town. Tap the name of the shot or the move.', s: 'Watch the camera in your town and name each shot size and camera move.' },
    can: 'You can name wide, medium and close-up shots, and pan, tilt and track moves.' },
  { id: 'story', n: 2, icon: '🗂️', use: 'Storyboarding',
    job: 'Before anyone films, the director draws a storyboard: every shot in order, like a comic. Then the crew knows the plan.',
    how: { j: 'Tap the cards to put them in order. Every story needs a beginning, a middle and an end.', s: 'Put the shot cards in order: a beginning, a middle and an end. Leave out any card the story does not need.' },
    can: 'You can plan a story in shots, with a beginning, a middle and an end.' },
  { id: 'direct', n: 3, icon: '🤖', use: 'Directing an AI helper',
    job: 'Directors and producers brief their helpers, and now AI helpers too. Then they improve the first draft with clear feedback.',
    how: { j: 'Pick a place, who is in it and a mood. Watch Florence’s first cut, then tell her what to change.', s: 'Brief Florence: a place, who is in it and a mood. Watch her first cut and give her feedback.' },
    can: 'You can brief a helper clearly and make a draft better with feedback.' },
  { id: 'edit', n: 4, icon: '✂️', use: 'Editing',
    job: 'Video editors choose the best takes, set the pace and pick the music. The same shots can feel calm or exciting.',
    how: { j: 'Pick the best takes, choose how long each shot lasts, then choose the music.', s: 'Choose the best takes, set the shot lengths for the pace you want, then choose the music and where it changes.' },
    can: 'You can pick good takes, set the pace of a film and use music to set the mood.' },
  { id: 'access', n: 5, icon: '💬', use: 'Making it for everyone',
    job: 'Access producers add captions for people who cannot hear the sound, and a described version for people who cannot see the screen.',
    how: { j: 'Choose the best caption for each sound, then the best words to describe each shot.', s: 'Choose captions that are clear and quick to read, then descriptions that fit the gaps.' },
    can: 'You can write captions with speakers and sounds, and describe a shot for someone who cannot see it.' },
  { id: 'truth', n: 6, icon: '🔍', use: 'True or made up?',
    job: 'News teams check whether a picture is real or changed before they use it, and they ask people before filming them.',
    how: { j: 'Look closely at each picture. Decide if it was changed or made by a machine. Then decide what to do about filming people.', s: 'Check each picture for changes and machine-made clues, judge whether a change misleads, and decide when to ask permission.' },
    can: 'You can check pictures for changes and clues, and ask before you film people.' },
];
export const MISSION_IDS = MISSIONS.map((m) => m.id);
export const missionOf = (id) => MISSIONS.find((m) => m.id === id) || null;

// ---- saved progress. done: one flag a mission. res: a few numbers from each finished mission (for the record).
// m3: mission 3's own progress (cut.js). Never anything typed. Well under the contract's 8 KB.
export function freshHour() { return { v: 2, done: MISSIONS.map(() => false), res: {}, m3: null }; }
const clean = (r) => { const out = {}; for (const [k, v] of Object.entries(r && typeof r === 'object' ? r : {})) { if (Number.isFinite(v)) out[k] = Math.max(0, Math.min(999, Math.round(v))); else if (typeof v === 'string' && /^[a-z0-9 ,'’-]{0,60}$/i.test(v)) out[k] = v; else if (typeof v === 'boolean') out[k] = v; } return out; };
export function restoreHour(saved) {
  const st = freshHour(); if (!saved || typeof saved !== 'object') return st;
  if (saved.v === 1) { st.m3 = saved.done ? null : saved; return st; } // the ten-minute version kept only mission 3's progress
  if (saved.v !== 2) return st;
  st.done = MISSIONS.map((_, i) => !!(Array.isArray(saved.done) && saved.done[i]));
  // missions open in order: a mission counts as done only if every one before it is done too
  for (let i = 1; i < st.done.length; i++) if (!st.done[i - 1]) st.done[i] = false;
  for (const id of MISSION_IDS) if (saved.res?.[id] && st.done[MISSION_IDS.indexOf(id)]) st.res[id] = clean(saved.res[id]);
  st.m3 = saved.m3 && typeof saved.m3 === 'object' ? saved.m3 : null;
  st.m4 = Array.isArray(saved.m4) ? saved.m4.filter((p) => ['takes', 'trim', 'pace', 'music'].includes(p)) : null; // mission 4's finished parts
  return st;
}
export const isOpen = (st, i) => i === 0 || !!st.done[i - 1];
export const nextMission = (st) => { const i = st.done.findIndex((d) => !d); return i < 0 ? null : i; };
export const doneCount = (st) => st.done.filter(Boolean).length;
export const allDone = (st) => st.done.every(Boolean);
export function finishMission(st, i, res) { st.done[i] = true; st.res[MISSIONS[i].id] = clean(res); return st; }

// ---- the map's words
export const mapLine = (st, j) => {
  const n = doneCount(st);
  if (n === 0) return j ? 'Welcome to the film studio. Six jobs, one at a time. Start with the first.' : 'Six missions, six real jobs in film and TV. Start with the first.';
  if (n === MISSIONS.length) return 'All six missions done. Replay any of them, or see what you made.';
  return `${num(n).charAt(0).toUpperCase() + num(n).slice(1)} of six done. Next: ${MISSIONS[n].use}.`;
};
export const lockedLine = (i) => `Finish mission ${i} first. The missions open in order.`;

// ---- the record. One line a mission, from what the child did. res keys are set by each mission's play file.
export const num = (n) => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four'][n] ?? String(n);
export function hourLines(st, m3Line) {
  const r = st.res; const out = [];
  if (r.crew) out.push(`Crew words: named ${num(r.crew.of)} shots and moves${r.crew.seq ? `, and planned ${num(r.crew.seq)} two-shot sequences` : ''}.`);
  if (r.story) out.push(`Storyboards: put ${num(r.story.stories)} stories in order${r.story.spare ? ', and left out the cards that did not belong' : ''}.`);
  if (m3Line) out.push(m3Line);
  if (r.edit) out.push(`Editing: picked ${num(r.edit.takes)} best takes, cut a quick film and a calm one, and changed the music at the turn.`);
  if (r.access) out.push(`For everyone: chose ${num(r.access.caps)} captions, built ${r.access.built > 1 ? num(r.access.built) + ' more' : 'one more'} from tiles, and chose ${num(r.access.descs)} spoken descriptions.`);
  if (r.truth) out.push(`Checking: looked at ${num(r.truth.pics)} pictures for clues and where they came from, and chose to ask before filming people.`);
  return out.slice(0, 6).map((l) => l.slice(0, 120));
}
export function hourPractised(st) {
  const d = st.done; const out = [];
  if (d[0] || d[1]) out.push(d[0] && d[1] ? 'using a film crew’s words and planning a story shot by shot' : d[0] ? 'using a film crew’s words for shots and camera moves' : 'planning a story shot by shot');
  if (d[2]) out.push('briefing an AI helper and improving its first cut with feedback');
  if (d[3] || d[4]) out.push(d[3] && d[4] ? 'editing for pace and mood, and adding captions and a described version' : d[3] ? 'editing for pace and mood' : 'adding captions and a described version');
  if (d[5]) out.push('checking pictures for changes, and asking before filming people');
  return out.slice(0, 4);
}
