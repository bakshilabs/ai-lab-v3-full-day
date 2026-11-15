// Mission 5, the farm weeding robot: a confidence threshold when mistakes have different costs. Pure: no page.
// The robot's camera has already been trained on many photos. For each plant it says how sure it is that the plant is
// a weed (0–100). It pulls a plant only when it is at least as sure as the setting the child chooses. Pulling a crop
// loses it for good; a weed left behind can be pulled next week. So the costly mistake is pulling a crop.

// pic: which drawing. hid: partly hidden (why the robot is less sure). p: how sure it is that this is a weed.
const P = (id, pic, weed, p, o = {}) => ({ id, pic, weed, p, ...o });
export const FIELDS = [
  { id: 'lettuce', crop: { j: 'lettuce', s: 'lettuce' }, plants: [
    P('l1', 'lettuce', false, 4), P('w1', 'dandelion', true, 96), P('l2', 'lettuce', false, 18), P('w2', 'thistle', true, 92), P('l3', 'lettuce', false, 66, { hid: 'chewed' }),
    P('w3', 'clover', true, 84), P('l4', 'lettuce', false, 9), P('w4', 'grass', true, 58, { hid: 'hidden' }), P('w5', 'chickweed', true, 74), P('l5', 'lettuce', false, 33, { hid: 'small' })] },
  { id: 'carrot', crop: { j: 'carrot', s: 'carrot' }, plants: [
    P('c1', 'carrot', false, 6), P('x1', 'dandelion', true, 97), P('c2', 'carrot', false, 52, { hid: 'small' }), P('x2', 'cowparsley', true, 64), P('c3', 'carrot', false, 22),
    P('x3', 'thistle', true, 88), P('c4', 'carrot', false, 71, { hid: 'feathery' }), P('x4', 'grass', true, 55, { hid: 'hidden' }), P('x5', 'clover', true, 81), P('x6', 'chickweed', true, 45, { hid: 'hidden' }), P('c5', 'carrot', false, 35)] },
];
export const NAMES = { lettuce: 'lettuce', carrot: 'carrot', dandelion: 'dandelion', thistle: 'thistle', clover: 'clover', grass: 'couch grass', chickweed: 'chickweed', cowparsley: 'cow parsley' };
export const SETTINGS = [50, 60, 70, 80, 90];
export const SURE = { 50: 'Half sure', 60: 'A bit sure', 70: 'Quite sure', 80: 'Very sure', 90: 'Very, very sure' };
export const FARMER_TIME = 3; // flags the farmer has time to check in a morning (ages 13–17, second field)
// How sure, in words (ages 8–12 see words and a bar, never the number)
export function sureWords(p) {
  if (p >= 90) return 'very sure it is a weed'; if (p >= 75) return 'fairly sure it is a weed'; if (p >= 60) return 'thinks it is a weed';
  if (p >= 40) return 'not sure'; if (p >= 20) return 'thinks it is a crop'; return 'very sure it is a crop';
}
export const whyUnsure = { chewed: 'Its leaves are chewed by slugs, so it looks ragged, like a weed.', hidden: 'It is half hidden under leaves, so the camera sees only part of it.', small: 'It is tiny, so the camera sees few leaves.', feathery: 'Its feathery leaves look a lot like cow parsley, a weed.' };

// Weed a row. pull: the robot pulls at or above this. ask (ages 13–17, second field): plants from ask up to pull get a
// flag for the farmer, who checks the most likely weeds first, FARMER_TIME of them, and pulls only the weeds.
export function weed(field, pull, ask = null) {
  const rows = field.plants.map((pl) => ({ ...pl, did: pl.p >= pull ? 'pull' : ask !== null && pl.p >= ask ? 'flag' : 'leave' }));
  const flags = rows.filter((r) => r.did === 'flag').sort((a, b) => b.p - a.p); flags.forEach((r, i) => { r.checked = i < FARMER_TIME; });
  const n = (f) => rows.filter(f).length;
  return { rows, weedsPulled: n((r) => r.weed && r.did === 'pull'), cropsPulled: n((r) => !r.weed && r.did === 'pull'),
    weedsByFarmer: n((r) => r.weed && r.did === 'flag' && r.checked), unchecked: n((r) => r.did === 'flag' && !r.checked),
    weedsLeft: n((r) => r.weed && (r.did === 'leave' || (r.did === 'flag' && !r.checked))), weeds: n((r) => r.weed), crops: n((r) => !r.weed), flags: flags.length };
}
// The best any setting can do: no crop pulled, then fewest weeds left.
export function best(field, withAsk = false) {
  let out = null;
  for (const pull of SETTINGS) for (const ask of withAsk ? [null, ...SETTINGS.filter((a) => a < pull)] : [null]) {
    const r = weed(field, pull, ask); if (r.cropsPulled) continue;
    if (!out || r.weedsLeft < out.weedsLeft || (r.weedsLeft === out.weedsLeft && r.flags < out.flags)) out = { pull, ask, weedsLeft: r.weedsLeft, flags: r.flags };
  }
  return out;
}
// One true line about a row's result. j: ages 8–12.
export function resultLine(field, r, junior, withAsk = false) {
  const crop = field.crop[junior ? 'j' : 's']; const b = best(field, withAsk);
  const lost = r.cropsPulled ? (junior ? `It pulled up ${r.cropsPulled === 1 ? `a ${crop}` : `${r.cropsPulled} ${crop}s`}. ${r.cropsPulled === 1 ? 'That one is' : 'Those are'} lost for good.` : `${r.cropsPulled} ${crop} plant${r.cropsPulled === 1 ? '' : 's'} pulled: a lost crop.`) : '';
  const left = r.weedsLeft ? (junior ? `${r.weedsLeft} weed${r.weedsLeft === 1 ? ' was' : 's were'} left for next week.` : `${r.weedsLeft} of ${r.weeds} weeds left for next week.`) : (junior ? 'Every weed is gone.' : `All ${r.weeds} weeds removed.`);
  const farmer = withAsk && r.flags ? ` ${r.flags} flagged; the farmer checked ${Math.min(r.flags, FARMER_TIME)}${r.unchecked ? ` and had no time for ${r.unchecked}` : ''}.` : '';
  if (r.cropsPulled) return `${lost} ${left}${farmer} ${junior ? 'It needs to be more sure before it pulls.' : 'Raise the pull setting.'}`;
  const better = b && r.weedsLeft > b.weedsLeft ? (junior ? ' No crop was lost. A different setting could leave fewer weeds.' : ` No crop lost. A different setting can leave ${b.weedsLeft}.`) : (junior ? ' And no crop was lost. That is the best this row allows.' : ' No crop lost: the best this row allows.');
  return `${left}${farmer}${better}`;
}
export const okRow = (r) => r.cropsPulled === 0;
// Ages 13–17: the table of what happened. Rows: weed / crop. Columns: pulled / flagged / left.
export function table(r) {
  const c = (weed, did) => r.rows.filter((x) => x.weed === weed && x.did === did).length;
  return { weed: [c(true, 'pull'), c(true, 'flag'), c(true, 'leave')], crop: [c(false, 'pull'), c(false, 'flag'), c(false, 'leave')] };
}
export const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
// Part A: plants to label first (easy, then the two the robot is least sure about)
export const CHECK = ['w1', 'l1', 'w4', 'l3'];
export const plant = (id) => FIELDS.flatMap((f) => f.plants).find((p) => p.id === id) || null;
