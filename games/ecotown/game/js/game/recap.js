// "You practised…": what the player actually did, said back in plain words. One recap after each mission and one for
// the whole session. Built only from what happened (no claims about what was learned). Pure: tests/recap.test.mjs.
//   rec (kept per mission as G.labs[id]): { path: 'clean'|'flawed'|'missed', lens, late, tries, short: 'partly'|'broke'|null, bias }
const LENS = { flood: 'flood', nature: 'nature', street: 'street view', access: 'step-free route', carbon: 'carbon', inside: 'inside view', winter: 'winter night', walk: 'walking' };
const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;

export function missionRecap(rec = {}, junior = true) {
  const out = []; const lens = LENS[rec.lens] || rec.lens;
  if (rec.path === 'flawed') {
    out.push(rec.late ? (junior ? `seeing how the ${lens} check shows what Florence got wrong` : `reading a ${lens} test that exposed the plan’s flaw`)
      : (junior ? `checking Florence’s plan with evidence: your ${lens} check found the problem` : `testing an AI plan against evidence: your ${lens} test found the flaw`));
    out.push(junior ? 'working out why the plan went wrong' : 'diagnosing why the plan failed');
    out.push(rec.tries > 1 ? (junior ? `fixing your instruction (${n(rec.tries, 'try', 'tries')})` : `revising the brief until it passed (${n(rec.tries, 'attempt', 'attempts')})`) : (junior ? 'writing a clearer instruction that fixed it' : 'rewriting the brief so the plan passed'));
  } else if (rec.path === 'missed') {
    out.push(junior ? 'spotting what the plan left out' : 'identifying what the plan omitted');
    out.push(junior ? 'telling Florence exactly what was missing' : 'specifying the missing requirement');
  } else {
    out.push(junior ? 'writing a clear instruction' : 'writing a well-specified brief');
    out.push(junior ? 'checking the plan before you trusted it' : 'testing the plan before accepting it');
    out.push(junior ? 'spotting something Florence guessed without being told' : 'identifying an unstated assumption');
  }
  if (rec.short === 'partly') out.push(junior ? 'noticing that a plan can keep the rules and still miss your own target' : 'recognising a plan that met the rules but not your own target');
  if (rec.short === 'broke') out.push(junior ? 'seeing a trade-off: one choice broke a rule the plan had kept' : 'weighing a trade-off: one choice broke a limit the plan had met');
  if (rec.bias) out.push(junior ? 'asking who Florence forgot to count' : 'checking whose answers were left out of the data');
  return out.slice(0, 4);
}

// the whole session so far. labs: G.labs; extra: { catches, trusted, goalsMet, complete, score, medal, families }
export function sessionRecap(labs = {}, extra = {}, junior = true) {
  const recs = Object.values(labs).filter((r) => r && typeof r === 'object'); const done = recs.length;
  const caught = recs.filter((r) => r.path === 'flawed' && !r.late).length; const shown = recs.filter((r) => r.path === 'flawed' && r.late).length;
  const fixed = recs.filter((r) => r.path === 'flawed' || r.path === 'missed').length; const clean = recs.filter((r) => r.path === 'clean').length;
  const partly = recs.filter((r) => r.short === 'partly').length; const broke = recs.filter((r) => r.short === 'broke').length; const bias = recs.some((r) => r.bias);
  const practised = [];
  if (caught) practised.push(junior ? `checking an AI’s plan against evidence: you found ${n(caught, 'mistake', 'mistakes')} yourself` : `testing AI plans against evidence: you found ${n(caught, 'flaw', 'flaws')} yourself`);
  else if (shown) practised.push(junior ? 'seeing how a check can show a mistake the AI was sure about' : 'reading evidence that contradicted a confident AI plan');
  if (extra.catches) practised.push(junior ? `catching Florence’s wrong ideas for your own town (${extra.catches})` : `rejecting flawed suggestions for your own town (${extra.catches})`);
  if (fixed) practised.push(junior ? `fixing a plan by writing a clearer instruction (${n(fixed, 'time', 'times')})` : `correcting a plan by revising the brief (${n(fixed, 'time', 'times')})`);
  if (clean) practised.push(junior ? `writing a clear instruction first time (${n(clean, 'time', 'times')})` : `writing a well-specified brief first time (${n(clean, 'time', 'times')})`);
  if (partly || broke) practised.push(junior ? 'spotting a trade-off: a plan that missed a target or broke a rule' : 'spotting a trade-off: a plan that missed a target or broke a limit');
  if (bias) practised.push(junior ? 'asking who was not counted' : 'checking whose answers were missing from the data');
  if (extra.families) practised.push(junior ? 'making planning decisions for a whole town' : 'making planning decisions across a whole town');
  if (!practised.length) practised.push(junior ? 'planning and building the start of a town' : 'planning and starting a town');
  const choices = [];
  if (done) choices.push(junior ? `${n(done, 'mission', 'missions')} done out of 6` : `${done} of 6 missions done`);
  if (extra.trusted) choices.push(junior ? `${n(extra.trusted, 'idea', 'ideas')} of Florence’s used without checking` : `${n(extra.trusted, 'suggestion', 'suggestions')} accepted unchecked`);
  if (partly) choices.push(junior ? `${n(partly, 'mission', 'missions')} ended with your own target missed` : `${n(partly, 'mission', 'missions')} ended with a brief target missed`);
  if (broke) choices.push(junior ? `${n(broke, 'mission', 'missions')} ended with a rule broken by a town-meeting choice` : `${n(broke, 'mission', 'missions')} ended with a limit broken by a town-meeting choice`);
  const result = [];
  if (extra.families != null) result.push(junior ? `${n(extra.families, 'family', 'families')} safely housed` : `${n(extra.families, 'household', 'households')} housed safely`);
  if (extra.goalsMet != null) result.push(junior ? `${extra.goalsMet} of 8 town goals met` : `${extra.goalsMet} of 8 town goals met`);
  if (extra.score != null && extra.families) result.push(`town score ${extra.score} out of 100${extra.medal ? ` (${extra.medal})` : ''}`);
  result.push(extra.complete ? (junior ? 'your town is complete' : 'the town is complete') : (junior ? 'your town is not finished yet, and that is fine' : 'the town is not complete yet'));
  return { practised: practised.slice(0, 5), choices, result, done, talk: junior ? ['What changed your mind today?', 'Where else could you check before you trust a computer helper?'] : ['Which piece of evidence changed your decision?', 'Where else would you test an AI’s answer before relying on it?'] };
}
