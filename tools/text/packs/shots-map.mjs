// Which play-through pictures go in the packs, and the moment(s) each one shows. run: the folder the play-through wrote
// (see collect-shots.mjs); pic: part of the picture's file name; ver: j (ages 8–12) or s (13–17).
const S = (part, run, ver, list) => list.map(([pic, ids, name]) => ({ part, run, ver, pic, ids: [].concat(ids), name }));
export default [
  ...S('drone', 'drone-j', 'j', [
    ['-01-mission-map', 'DR-M003', 'mission-map'],
    ['-02-ground-opening', ['DR-M041', 'DR-M004'], 'ground-school-opening-card'],
    ['-04-ground-checked', ['DR-M006', 'DR-M008'], 'pre-flight-check'],
    ['-06-ground-gale', 'DR-M009', 'fly-or-not'],
    ['-07-ground-map', 'DR-M010', 'airspace-map'],
    ['-08-ground-airfield', 'DR-M011', 'flight-plan-reply'],
    ['-10-ground-done', ['DR-M012', 'DR-M035'], 'mission-done-card'],
    ['-13-hand-takeoff-flying', ['DR-M014', 'DR-M013'], 'take-off'],
    ['-15-hand-hover1-flying', 'DR-M015', 'hover-in-gusts'],
    ['-17-hand-landing-flying', 'DR-M017', 'landing'],
    ['-21-delivery-free-flying', ['DR-M020', 'DR-M021'], 'hand-delivery'],
    ['-22-delivery-planner', 'DR-M022', 'step-planner'],
    ['-23-delivery-first-compare', 'DR-M024', 'compare-routes'],
    ['-27-survey-plan-gaps', 'DR-M027', 'survey-lines'],
    ['-28-survey-flown-gaps', 'DR-M028', 'survey-result'],
    ['-33-survey-health-view', 'DR-M029', 'farm-map-health-view'],
    ['-38-inspect-turbine-flying', 'DR-M030', 'turbine-photo-frames'],
    ['-40-inspect-turbine-found', 'DR-M031', 'photo-review'],
  ]),
];
