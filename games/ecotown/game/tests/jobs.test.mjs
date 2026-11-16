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
