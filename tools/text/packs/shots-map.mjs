// Which play-through pictures go in the packs, and the moment(s) each one shows. run: the folder the play-through wrote
// (see collect-shots.mjs); pic: part of the picture's file name; ver: j (ages 8–12) or s (13–17).
const S = (part, run, ver, list) => list.map(([pic, ids, name]) => ({ part, run, ver, pic, ids: [].concat(ids), name }));
export default [
  ...S('drone', 'drone-j', 'j', [
    ['-01-mission-map', 'DR-M003', 'mission-map'],
    ['-02-ground-opening', ['DR-M041', 'DR-M004'], 'ground-school-opening-card'],
    ['-04-ground-checked', ['DR-M006', 'DR-M008'], 'pre-flight-check'],
    ['-07-ground-map', 'DR-M010', 'airspace-map'],
    ['-08-ground-airfield', 'DR-M011', 'flight-plan-reply'],
    ['-10-ground-done', ['DR-M012', 'DR-M035'], 'mission-done-card'],
    ['-15-hand-hover1-flying', 'DR-M015', 'hover-in-gusts'],
    ['-22-delivery-planner', 'DR-M022', 'step-planner'],
    ['-23-delivery-first-compare', 'DR-M024', 'compare-routes'],
    ['-27-survey-plan-gaps', 'DR-M027', 'survey-lines'],
    ['-33-survey-health-view', 'DR-M029', 'farm-map-health-view'],
    ['-38-inspect-turbine-flying', 'DR-M030', 'turbine-photo-frames'],
    ['-40-inspect-turbine-found', 'DR-M031', 'photo-review'],
    ['-50-rescue-0-warm-person', 'DR-M033', 'warm-spot-check'],
    ['-52-rescue-0-guide', 'DR-M034', 'guide-the-team'],
    ['-56-jobs-that-use-this', 'DR-M037', 'jobs-that-use-this'],
  ]),
];
// the break card is the same for every part (ui/talk.js): one picture, from the end of the drone hour
export const EXTRA = S('ecotown', 'drone-j', 'j', [['-57-talk-it-over-done', 'ET-M062', 'break-time-after-part-2']]);
