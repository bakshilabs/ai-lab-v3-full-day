// "Jobs that use this" (docs/curriculum.md): every part has three or four real jobs, with a line for each age route.
import test from 'node:test'; import assert from 'node:assert/strict';
import { JOBS, TALK, PARTS } from '../js/series.js';
test('every part has jobs and talk questions', () => {
  for (const id of ['town', 'drone', 'robots', 'roads', 'film', 'power']) {
    const jobs = JOBS[id]; assert.ok(jobs && jobs.length >= 3 && jobs.length <= 4, id);
    for (const j of jobs) { assert.equal(j.length, 4, id); for (const s of j) assert.ok(typeof s === 'string' && s.length > 0, id); assert.ok(j[2].split(' ').length <= 14, `${id} junior line is short: ${j[2]}`); }
    assert.ok(TALK[id]?.j?.length >= 3 && TALK[id]?.s?.length >= 3, id);
  }
  assert.ok(PARTS.length >= 4);
});

test('the break screen names the next part for every part but the last of the day', async () => {
  const { nextPart } = await import('../js/series.js');
  assert.equal(nextPart('roads')?.title, 'Town film studio');
  assert.equal(nextPart('film')?.title, 'Power control room');
  assert.equal(nextPart('power'), null);
});

test('every part has three or four talk-it-over questions for each age (docs/full-day-plan.md)', () => {
  for (const [id, t] of Object.entries(TALK)) for (const k of ['j', 's']) assert.ok(t[k].length >= 3 && t[k].length <= 4, `${id}.${k} has ${t[k].length}`);
});
