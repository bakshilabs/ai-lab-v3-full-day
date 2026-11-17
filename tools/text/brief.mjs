// Step 0: OpenAI reads the real material about the game and writes its own game brief, before it writes any text.
// The material is sent in full, split by area; OpenAI writes notes for each area, then combines them into one brief
// with a short summary for each area of text it will rewrite. Nothing here is summarised by hand.
// Writes tools/text/game-brief.md and tools/text/area-summaries.json.
// Usage: node tools/text/brief.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, GAME } from './lib.mjs';
import { chat, pool, usage, tokenTotals } from './openai.mjs';

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const doc = (f, text = read(f)) => `===== FILE: ${f} =====\n${text}\n===== END OF ${f} =====`;

// games/ecotown/CLAUDE.md: the game sections only (not live setup, deploying, tests, open items or gotchas)
function gameSections() {
  const t = read('games/ecotown/CLAUDE.md');
  const parts = t.split(/^(?=## )/m);
  return parts.filter((p) => !/^## (Live setup|Deploying from a cloud session|Tests|Open items|Gotchas)\b/.test(p)).join('');
}
// content.js: the mission parts (the AI Lab missions, free building, mission text, town meetings); not the name filters
function contentMissions() {
  const t = read(`${GAME}/js/game/content.js`);
  return t.slice(0, t.indexOf('export const NAME_IDEAS'));
}
const MOD = { drone: 'missions.js', robots: 'missions.js', roads: 'missions.js', film: 'hour.js', power: 'missions.js' };
const MODULE_NAME = { drone: 'Drone delivery', robots: 'Robot training', roads: 'Roads for self-driving cars', film: 'Town film studio', power: 'Power control room' };

const AREAS = [
  { id: 'day', title: 'The full day, the curriculum and the module contract', docs: [doc('docs/curriculum.md'), doc('docs/full-day-plan.md'), doc('docs/MODULES.md')] },
  { id: 'ecotown-design', title: 'Eco Town (part 1): how the game was designed, playtested and is meant to be run', docs: [doc('games/ecotown/CLAUDE.md', gameSections()), ...(fs.existsSync(path.join(ROOT, 'games/ecotown/LAB-GUIDE.md')) ? [doc('games/ecotown/LAB-GUIDE.md')] : [])] },
  { id: 'ecotown-missions', title: 'Eco Town (part 1): its levels, missions and story films', docs: [doc(`${GAME}/js/game/levels.js`), doc(`${GAME}/js/game/content.js`, contentMissions()), doc(`${GAME}/js/game/episodes.js`)] },
  ...Object.entries(MOD).map(([id, f]) => ({ id: `module-${id}`, title: `Module: ${MODULE_NAME[id]}: its mission list and briefs`, docs: [doc(`${GAME}/js/modules/${id}/${f}`), doc(`${GAME}/js/modules/${id}/index.js`)] })),
];

const SYSTEM = `You are going to write every word that children and their club leaders read or hear in an educational game: buttons, instructions, the AI helper's lines, mission text, story-film scripts and the web pages around it. Before you write anything, you must understand the game properly. You will be given the real design documents and source files. Read them closely. Code files are included because they hold the game's actual text and mission structure: read the strings and comments, not the programming.`;

const NOTES_SCHEMA = { name: 'area_notes', schema: { type: 'object', additionalProperties: false, required: ['notes'], properties: { notes: { type: 'string', description: 'Your notes in Markdown' } } } };
const BRIEF_SCHEMA = { name: 'game_brief', schema: { type: 'object', additionalProperties: false, required: ['brief', 'areas'], properties: {
  brief: { type: 'string', description: 'The game brief in Markdown, starting with a level-1 heading' },
  areas: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['area', 'summary'], properties: { area: { type: 'string' }, summary: { type: 'string' } } } },
} } };

// the areas of text the rewrite works on (the sheet's Area column)
export const TEXT_AREAS = ['Game screens', 'Game words (content.js)', 'Story cartoons (voiced)', 'Pages', 'Leader page', ...Object.values(MODULE_NAME).map((n) => `Module: ${n}`)];

async function main() {
  const notes = await pool(AREAS, 4, async (a) => {
    const r = await chat(`brief-notes:${a.id}`, [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Area: ${a.title}\n\nHere is the material for this area, in full.\n\n${a.docs.join('\n\n')}\n\nWrite your own notes on this area, in your own words, as someone who will soon write the text for it. Cover whatever the material says about: who plays and how a teacher runs it; what it teaches; who Florence (the AI helper) is here and how she behaves; any lenses, checks or tests the children use; what children actually do on each screen or in each mission, step by step; how the 8–12 and 13–17 versions differ; the rules about money, names, typing and privacy; and the tone and wording the designers want. Be specific and concrete: name the missions, buttons, builds and steps as the material names them. Say clearly when the material does not cover something rather than guessing.` },
    ], NOTES_SCHEMA, { effort: 'medium' });
    console.log(`notes: ${a.id} (${r.notes.length} characters)`);
    return { ...a, notes: r.notes };
  });
  const combined = await chat('brief-combine', [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `You read the material area by area and wrote these notes:\n\n${notes.map((n) => `## Notes: ${n.title}\n\n${n.notes}`).join('\n\n')}\n\nNow combine them into one game brief, in your own words, that you will keep in front of you while writing every line of the game's text. It must cover:\n- who plays, and how the day runs with a teacher;\n- what each part teaches;\n- who Florence is in Eco Town (she can be confidently wrong, and children check her) versus in the modules (a capable partner);\n- the lenses and checks;\n- what children actually do on each screen;\n- the differences between the 8–12 and 13–17 versions;\n- the rules (no money for 8–12, no names, nothing typed leaves the device);\n- the tone.\nKeep the facts exactly as the material gives them. Then, separately, write a short summary (about 80–150 words) for each of these areas of text, saying what that text is for, who reads or hears it, and what a writer must know to word it well: ${TEXT_AREAS.map((t) => `"${t}"`).join(', ')}. Use those area names exactly.` },
  ], BRIEF_SCHEMA, { effort: 'high' });
  const missing = TEXT_AREAS.filter((t) => !combined.areas.some((a) => a.area === t));
  if (missing.length) throw new Error(`brief has no summary for: ${missing.join(', ')}`);
  const md = `<!-- Written by OpenAI (${process.env.TEXT_MODEL || 'gpt-5.5'}) from the real material, by tools/text/brief.mjs. Do not edit by hand: re-run the script. -->\n\n${combined.brief.trim()}\n\n## Area summaries\n\n${TEXT_AREAS.map((t) => `### ${t}\n\n${combined.areas.find((a) => a.area === t).summary.trim()}`).join('\n\n')}\n`;
  fs.writeFileSync(path.join(ROOT, 'tools/text/game-brief.md'), md);
  fs.writeFileSync(path.join(ROOT, 'tools/text/area-summaries.json'), JSON.stringify(Object.fromEntries(TEXT_AREAS.map((t) => [t, combined.areas.find((a) => a.area === t).summary.trim()])), null, 2) + '\n');
  fs.mkdirSync(path.join(ROOT, 'tools/text/brief-notes'), { recursive: true });
  for (const n of notes) fs.writeFileSync(path.join(ROOT, `tools/text/brief-notes/${n.id}.md`), `<!-- Written by OpenAI from: ${n.title}. -->\n\n${n.notes.trim()}\n`);
  console.log('this run:', usage, '\nall runs:', tokenTotals());
}
if (import.meta.url === `file://${process.argv[1]}`) await main();
