// One place that decides whether a target is met. Missions, the town goals, the report, the reward card and the
// leader's list all read these results; none of them compares numbers itself. Pure module (tests/criteria.test.mjs).
//   rule  = a limit the game sets (the mission's needs, the town's eight goals)
//   brief = a target the player wrote into their own instruction ("within 10 minutes", "under 50 tonnes")
// Verdict: 'met' (every rule and every brief target), 'partly' (the rules hold, the player's own target does not),
// 'missed' (a rule fails).
import { LEVELS } from './levels.js';
import { townGoals } from './progress.js';
import { TARGETS } from '../world/catalog.js';
import { targetLine } from '../ai/targets.js';

const plain = (label) => String(label).replace(/^\P{L}+/u, ''); // a label without its leading emoji

// the player's own walking target, when it is stricter than the town's rule
export function walkTarget(minutes, sim, junior) {
  if (!minutes || minutes >= TARGETS.walkMinutes) return null;
  const ok = sim.homes.length > 0 && sim.walkMax <= minutes;
  return { kind: 'brief', id: 'minutes', ok, value: sim.walkMax, limit: minutes,
    label: junior ? `Your own target: every home within ${minutes} minutes of school (longest walk ${sim.walkMax} min)` : `Brief target: every home ≤ ${minutes} min from school (longest ${sim.walkMax} min)` };
}

// every condition of a mission for one plan. brief = { targets: checkTargets(...) results, minutes: number|null }
export function missionCriteria(id, sim, ctx, { junior = true, targets = [], minutes = null } = {}) {
  const list = LEVELS[id].needs(sim, ctx, junior).map((n, i) => ({ kind: 'rule', id: `${id}-${i}`, ok: !!n.ok, label: plain(n.label) }));
  for (const t of targets) list.push({ kind: 'brief', id: t.id, ok: !!t.met, value: t.got, limit: t.asked, label: targetLine(t, junior) });
  const w = id === 'heart' ? walkTarget(minutes, sim, junior) : null; if (w) list.push(w);
  return list;
}

export function verdict(list) {
  const failed = list.filter((c) => c.kind === 'rule' && !c.ok); const brief = list.filter((c) => c.kind === 'brief' && !c.ok);
  return { status: failed.length ? 'missed' : brief.length ? 'partly' : 'met', failed, brief, all: list };
}
export const missionVerdict = (id, sim, ctx, opts) => verdict(missionCriteria(id, sim, ctx, opts));

// which of a mission's rules a change broke (a town-meeting choice): labels that held before and fail after
export function brokenBy(id, before, after, ctx, junior = true) {
  const b = LEVELS[id].needs(before, ctx, junior); const a = LEVELS[id].needs(after, ctx, junior);
  return a.filter((n, i) => !n.ok && b[i]?.ok).map((n) => plain(n.label));
}

// the town now: its eight goals, live. `was` = it was once celebrated as complete; a town that has slipped says so.
export function townVerdict(sim, ctx, { was = false, labs = 6 } = {}) {
  const goals = townGoals(sim, ctx); const failed = goals.filter((g) => !g.ok);
  const complete = !failed.length && labs >= 6;
  return { goals, failed, met: goals.length - failed.length, complete, slipped: was && !complete };
}

// a medal needs the score that medal stands for; a passed challenge with a lower score has no medal yet
export const earnedMedal = (score) => score?.medal || null;
