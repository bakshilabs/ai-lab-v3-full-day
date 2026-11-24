// Eco Town, level 4, "Food", as a playable trial on the level kit. The place is the market square (place.js). This file holds the words,
// the three plans and their results, the test ("Take the food to market"), the play break ("Fill your stall for the whole year") and the other hooks
// that the order of the steps calls. Every word below is a placeholder, written for the owner to judge. No outside service wrote any of them.
import { THREE, B, blk, group, frame, place, soft, hash } from '../../level-kit/blocks.js';
import { tw, wait, ease, back, run, plate, hitBox, glowMarks, glide, hot } from '../../level-kit/stage.js';
import { meter, btn } from '../../level-kit/shell.js';
import { beep, chime } from '../../level-kit/sound.js';
import { runLevel } from '../../level-kit/flow.js';
import { buildPlace, mkPlant, CROPS, WINTER, FIELD, crop, MAIN, STALLX, STALLZ } from './place.js';

// ---- 1. the words (placeholders) -------------------------------------------------------------------------------------------------------
const WHERE = ['far away, where there is lots of land', 'at the edge of the town', 'inside the town'], HOW = ['outdoors in the soil', 'under glass', 'indoors under lights'];
const words = {
  level: 'Fresh food all year',
  job: ['The town needs fresh fruit and vegetables all year, and the winters here are cold.', 'Ask Florence to suggest plans. Then test her plans, so that you can make a good decision.'], start: 'Start',
  askT: 'Your sentence', askHow: 'The winters are cold, and fresh food does not keep for long. Tap a word for each gap.', ask: 'Ask Florence',
  sentence: ['Plan how to grow fresh fruit and vegetables that reach the market quickly, all year round. Grow them', WHERE, 'and grow them', HOW, '.'],
  plansSay: () => ['The plan nearest to your words has the yellow sign. Here are two more to compare.', 'Press the button to test all three.'],
  test: 'Take the food to market', testT: 'Summer at the market', watch: 'Food sets off from all three places. Which stall is filled first?',
  choose: 'Each stall has a summer side and a winter side. Which plan will you use?', again: 'Ask again', use: 'Use this plan',
  playT: 'Fill your stall for the whole year', next: 'Next', townT: 'A year in the town', townHow: 'The town grows its food with the plan you chose.',
  built: 'The town now grows its food with the plan you chose.', tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see it in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  recapT: 'One more question', recapQ: 'It is winter again. Point to the place where the most fresh food is growing in the snow.', recapYes: 'Yes. The indoor farm is warm and light inside, so its shelves are full in every season.', recapNo: 'The indoor farm is warm and light inside, so its shelves are full in every season.',
  end: 'This is the end of the trial level. Thank you for playing.', endInGame: 'This is the end of the Food level.', replay: 'Play again' };
// Inside the whole game the level is held in a frame and its address has "?next=". The closing words then do not speak of a trial level
const IN_GAME = window.parent !== window && !!new URLSearchParams(location.search).get('next');
const T = { nearest: 'Nearest to your words', autumnT: 'Autumn comes', winterT: 'Winter at the market', lorry: 'The lorry',
  autumn: 'The year moves on.', winter: 'Snow falls. Food sets off again.',
  early: ['The handcart and the cargo bike are here already. Tap a crate to see when it was picked.', 'The cargo bike is full again. The handcart has one small basket.'],
  late: ['The lorry is here at last, with cold boxes. Tap a box.', 'The lorry brings plenty of cold boxes in winter too.'],
  pick3: ['Choose three crops to grow.'], pickField: ['The big farm grows food that keeps for months in the cold. Choose three crops to grow.'], growThese: 'Grow these', tall: 'A tall plant', low: 'A low plant', left: (n) => (n === 1 ? '1 left' : `${n} left`), placed: 'All placed', here: 'Here',
  put: [(c) => [`Tap a yellow bed to plant ${c.name.toLowerCase()}.`, c.tall ? 'Tall plants go in the back row, so that they do not shade the others.' : ''],
    (c) => [`Tap a yellow field to sow ${c.name.toLowerCase()}.`],
    (c) => [`Tap a yellow shelf for a tray of ${c.name.toLowerCase()}.`, c.tall ? 'Tall plants only fit the tall shelves on the ground floor.' : '']],
  spring: 'Spring has come to the gardens.', cleared: 'It is summer. The shelves of the indoor farm are ready for you.', farmGo: 'It is spring at the big farm, far from the town.',
  note: { crate: 'Picked this morning', cold: 'Picked days ago', basket: 'The last carrots of the year', cover: 'Picked in the snow, from under the winter cover', lorry: 'It has come a long way.' },
  a: ['Water', 'Start the harvester', 'Water'], aSay: [['Tap the rain barrel to water the beds.'], ['Tap the harvester to bring the crops in.'], ['These plants grow with no soil. They need water from the tank and electric growing lights. Tap the tank and the switch.']],
  b: ['', 'Pack the boxes', 'Lights'], bSay: [[], ['The food has a long way to go. Tap the shed to pack it in cold boxes.'], []], onlyW: ['Water runs past the white roots. Now the plants need light.'], onlyL: ['The growing lights are on. Now the plants need water.'],
  // the second half of the play break: the winter side of the stall
  day: (n) => `Day ${n}`, store: 'The cold store',
  pack: ['The food is packed in cold boxes. The band on each box is the colour of its crop.', 'Three boxes go to market now. Three wait in the cold store for the winter.'], packLeft: (n) => `Tap ${['', 'one more box', 'two more boxes', 'three boxes'][n]} for the cold store.`,
  turn: [['Autumn has come to the gardens. The frost will soon stop the plants growing.'], ['The year moves on at the big farm.'], ['Now snow is falling outside. Inside, the water and the lights are still on, so your plants are growing again.']],
  coverSay: (c) => ['The gardens have one winter cover. It keeps one bed warm enough to grow food in the snow.', `Tap a yellow bed to sow ${c.name.toLowerCase()} under the cover.`], snowG: ['The snow is coming.'],
  extra: (c, n) => [n === 3 ? 'Three shelves are still empty, and winter is when the town has the least fresh food.' : '', `Tap a yellow shelf for a tray of ${c.name.toLowerCase()}. You can choose a different crop for each shelf.`],
  c: ['Pick', 'Open the cold store', 'Pick and send'], cSay: [['Snow lies on every bed but one. Tap the winter cover to pick the food.'], ['Snow covers the fields now, and nothing grows there. Tap the cold store to send the boxes that you kept.'], ['Every shelf is ripe, and it is snowing. Tap the lift to pick the food and send it.']],
  off2: [['The handcart takes one small basket across the square.'], ['The lorry sets off again on the long road.'], ['The cargo bike takes the winter crates across the square.']],
  wave: 'Hello!', glow: 'Warm and light inside',
  ripe: [['Tap each bed to pick the food.'], [], ['The plants are ripe, with no soil and no sunshine. Tap each shelf to pick the food.']],
  off: [['The handcart takes the food across the square.'], ['The lorry sets off on the long road to the town.'], ['The grower loads the cargo bike.']],
  done: [['Your stall had full crates in summer. In winter it has one small basket, which you grew under the cover.'], ['Both sides of your stall have cold boxes. All of the food came a long way, and the lorry caused pollution.'], ['Both sides of your stall are full. You grew fresh food in the summer and in the snow.']],
  endT: 'A summer evening', endSay: [['The gardens are full, and the neighbours are picking food for supper.'], ['The lorry from the big farm is on its way with tomorrow\'s food.'], ['The indoor farm glows across the square, with your crops on its shelves.']] };

// ---- 2. the plans, in the order in which they stand in the square from left to right, and what the checks find ----------------------
const INK = '#1f2a44', svg = (inner) => `<svg class="tagpic" viewBox="0 0 44 36" aria-hidden="true">${inner}</svg>`;
const ICON = [svg(`<rect x="4" y="22" width="36" height="10" rx="2" fill="#a8743f" stroke="${INK}" stroke-width="2.5"/><path d="M12 22v-7m0 3l-4-4m4 4l4-4M22 22v-10m0 4l-5-5m5 5l5-5M32 22v-7m0 3l-4-4m4 4l4-4" stroke="#2e9b5a" stroke-width="3" stroke-linecap="round" fill="none"/>`),
  svg(`<rect x="3" y="8" width="24" height="18" rx="2" fill="#dfe3e8" stroke="${INK}" stroke-width="2.5"/><path d="M27 14h8l6 6v6H27z" fill="#7f8b99" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="11" cy="28" r="4" fill="${INK}"/><circle cx="33" cy="28" r="4" fill="${INK}"/>`),
  svg(`<rect x="5" y="3" width="34" height="30" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M5 18h34" stroke="${INK}" stroke-width="2.5"/><rect x="9" y="6" width="26" height="3" fill="#ff5fd0"/><rect x="9" y="21" width="26" height="3" fill="#ff5fd0"/><path d="M12 16v-3m6 3v-4m6 4v-3m6 3v-4M12 31v-3m6 3v-4m6 4v-3m6 3v-4" stroke="#2e9b5a" stroke-width="3" stroke-linecap="round"/>`)];
const plans = [{ name: 'Community gardens in the town', lines: ['Community gardens', 'In the town'] }, { name: 'A big farm far away', lines: ['A big farm', 'Far away'] }, { name: 'An indoor farm in the town', lines: ['An indoor farm', 'In the town'] }].map((p, i) => ({ ...p, icon: ICON[i] }));
// the evidence that stands before each sentence: how long the journey was, and how much food each stall had in summer (beside the sun) and in winter (beside the snowflake)
const SUN = `<svg viewBox="0 0 16 16" width="15" height="15" style="vertical-align:-2px" aria-hidden="true"><circle cx="8" cy="8" r="4" fill="#f08a2a"/><path d="M8 0v3M8 13v3M0 8h3M13 8h3" stroke="#f08a2a" stroke-width="2"/></svg>`, SNOW = `<svg viewBox="0 0 16 16" width="15" height="15" style="vertical-align:-2px" aria-hidden="true"><path d="M8 1v14M1 8h14M3 3l10 10M13 3L3 13" stroke="#3f78b5" stroke-width="2"/></svg>`;
const year = (su, wi) => `<span style="white-space:nowrap">${SUN}${meter(su, `${su} of 3 in summer`, 3)} ${SNOW}${meter(wi, `${wi} of 3 in winter`, 3)}</span>`;
// how far the food travelled: a plant, the way, and the stall. A short way is a short green line; a long way is a long grey line with a lorry on it
const journey = (long) => `<svg viewBox="0 0 ${long ? 112 : 46} 16" width="${long ? 154 : 63}" height="22" role="img" aria-label="${long ? 'a very long journey' : 'a very short journey'}" style="vertical-align:-3px"><path d="M6 14V7m0 3L2 6m4 4l4-4" stroke="#2e9b5a" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M13 12H${long ? 96 : 30}" stroke="${long ? '#7f8b99' : '#2e9b5a'}" stroke-width="3" stroke-linecap="round" ${long ? 'stroke-dasharray="7 5"' : ''}/>${long ? `<rect x="46" y="4" width="13" height="8" fill="#dfe3e8" stroke="${INK}" stroke-width="1.5"/><rect x="59" y="7" width="6" height="5" fill="#7f8b99" stroke="${INK}" stroke-width="1.5"/>` : ''}<rect x="${long ? 99 : 33}" y="5" width="11" height="9" rx="1.5" fill="#ffd257" stroke="${INK}" stroke-width="2"/></svg>`;
const RES = [
  [{ check: 'Short journey', evidence: journey(false), text: 'The food was picked this morning and walked to the market on a handcart.', mark: 'g' }, { check: 'Food all year', evidence: year(3, 1), text: 'The gardens were full in summer and autumn. In winter there was little to pick.', mark: 'f' }],
  [{ check: 'Short journey', evidence: journey(true), text: 'The food was picked days ago, kept cold and driven a long way. The lorries caused pollution.', mark: 'p' }, { check: 'Food all year', evidence: year(3, 3), text: 'The big farm sent plenty of food in every season, from its huge fields and its cold stores.', mark: 'g' }],
  [{ check: 'Short journey', evidence: journey(false), text: 'The food was picked this morning and came across the square by cargo bike.', mark: 'g' }, { check: 'Food all year', evidence: year(3, 3), text: 'The indoor farm grew salad, tomatoes and strawberries in every season.', mark: 'g' }]];
const AFTER = ['The food is picked in the morning and walked to the market. In winter there is little to pick.', 'The big farm sends plenty of food all year. It travels a long way, and the lorries cause pollution.', 'The food is picked in the morning, in every season, and comes by cargo bike.'];
// what stands on each side of each stall after a year: [summer, winter]
const STALL = [['crate', 'basket'], ['cold', 'cold'], ['crate', 'crate']];
// the plan that is nearest to the child's words: far away is the big farm; otherwise soil is the gardens, and glass or lights is the indoor farm
const nearest = (w) => (w[0] === 0 ? 1 : w[1] === 0 ? 0 : 2);

// ---- 3. views -----------------------------------------------------------------------------------------------------------------------------
const RESULTS = { eye: [0, 8.2, 23.5], at: [0, -3.3, 8], fov: 40 };
const VIEW = [{ eye: [-13.8, 5.6, 3.6], at: [-13.8, 0.2, -8.6], fov: 40 }, { eye: [0, 15, -18], at: [0, 25, -112], fov: 46 }, { eye: [15.4, 5.5, 6.5], at: [15.4, 5.35, -14], fov: 39 }];
const only = (i) => [0, 1, 2].map((k) => k === i || i < 0);
const colsOf = (list) => list.map((c) => ({ tomato: '#ea3d2d', lettuce: '#8fd86c', strawberry: '#e8284c', pepper: '#f6b81e', herbs: '#37b061' }[c.id] || c.col));
const DEFCOLS = ['#ea3d2d', '#8fd86c', '#f6b81e'];

function square() { const s = buildPlace(), g = s.g; s.crops = null; s.words0 = [];
  // the default crops of the gardens and of the indoor farm, as Florence's plans show them
  const DEF = ['tomato', 'lettuce', 'pepper', 'strawberry', 'herbs', 'lettuce', 'strawberry', 'pepper', 'herbs'];
  s.beds.forEach((q, i) => { q.plant = mkPlant(q.pg, 0, 0, 0, crop(i < 4 ? ['tomato', 'pepper', 'tomato', 'herbs'][i] : ['lettuce', 'strawberry', 'herbs', 'lettuce'][i - 4])); });
  s.shelves.forEach((q, i) => { q.plant = mkPlant(q.pg, 0, 0, 0, crop(i < 3 ? 'tomato' : DEF[i]), { roots: true }); });
  s.water(1); s.show([false, false, false]); s.season(0, 0); s.lorryAt(-128, false);
  // every bed, shelf and field can be tapped when the play break says so
  for (const q of s.beds) hitBox(s, g, q.x, 0, q.z, 2.9, q.tall ? 2.4 : 1.3, 2.1,   /* the front beds only hold low plants, and a low box does not take a tap meant for the bed behind it */ () => !!(q.can && q.can()), () => q.on());
  for (const q of s.shelves) hitBox(s, g, q.x, q.y - 0.3, -13.4, 2.8, q.tall ? 2.8 : 1.9, 2.4, () => !!(q.can && q.can()), () => q.on());
  for (const q of s.fields) hitBox(s, g, q.x, q.y, q.z - 3.5, q.w, 6.4, 9, () => !!(q.can && q.can()), () => q.on());
  // the tags of the plans stand over their places; at the results they move to the stalls
  const TAGPOS = [[-13.8, 4.4, -8], [0, 39.5, -128], [15.5, 12.6, -12]];
  s.tags = plans.map((p, i) => { const t = plate(s, '', TAGPOS[i], 'pl'); t.hide = true; return t; });
  const tagHtml = (i, near) => { s.tags[i].el.className = `plate pl${near ? ' on' : ''}`; s.tags[i].el.innerHTML = `${plans[i].icon}<span><b>${plans[i].lines[0]}</b><b>${plans[i].lines[1]}</b>${near ? `<small style="font-size:14px;color:#1f2a44">${T.nearest}</small>` : ''}</span>`; };
  const tagsAt = (stalls) => s.tags.forEach((t, i) => { t.pos.set(...(stalls ? [STALLX[i], 2.5, STALLZ] : TAGPOS[i])); });
  // what the child put on each side of the stall in the play break ({ kind, cols }); the stall of the child's own plan keeps it from then on
  s.made = [null, null]; const sideOf = (i, side) => (i === s.pick && s.made[side]) || { kind: STALL[i][side], cols: STALL[i][side] === 'crate' ? DEFCOLS : null };
  const stallsFor = (pick) => s.stalls.forEach((st, i) => [0, 1].forEach((side) => { const m = sideOf(i, side); st.set(side, i === pick || pick < 0 ? m.kind : null, m.cols); }));
  const clearStalls = () => s.stalls.forEach((st) => { st.set(0, null); st.set(1, null); });
  const pop = (objs) => Promise.all(objs.map((o, j) => { const k = o.scale.x || 1; o.scale.setScalar(0.01); return wait(j * 0.12).then(() => { beep(520 + j * 90, 0.07); return tw(0.35, (t) => o.scale.setScalar(Math.max(0.01, k * back(t)))); }); }));
  const move = (o, a, b, sec, bob = 0.05) => { o.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); return tw(sec, (t) => { const e = ease(t); o.position.set(a[0] + (b[0] - a[0]) * e, Math.abs(Math.sin(t * sec * 6)) * bob, a[1] + (b[1] - a[1]) * e); }); };
  const CART = [[-8.6, -4.4], [-7.2, 8.1]], BIKE = [[7.6, -9.6], [7.2, 8.1]];
  const home = () => { s.cart.position.set(CART[0][0], 0, CART[0][1]); s.cart.rotation.y = 0; s.bike.position.set(BIKE[0][0], 0, BIKE[0][1]); s.bike.rotation.y = 0; };
  const cartLoad = (kind, cols) => { s.cartLoad.crates.forEach((c) => { c.visible = kind === 'crate'; c.fill(6, cols || DEFCOLS); }); s.cartLoad.basket.visible = kind === 'basket'; };
  const bikeLoad = (on, cols) => s.bikeLoad.forEach((c) => { c.visible = on; c.fill(6, cols || DEFCOLS); });
  cartLoad(null); bikeLoad(false);
  // the lorry comes down the long road with grey pollution behind it; the carriers then bring its cold boxes to the middle stall
  const lorryRun = (sec, from = -128, to = -19, days = false) => { s.lorryRun = true; s.lorryPlate.el.textContent = days ? T.day(1) : T.lorry; return tw(sec, (t) => { s.lorryAt(from + (to - from) * (t * (0.6 + 0.4 * t))); if (days) s.lorryPlate.el.textContent = T.day(1 + Math.min(2, Math.floor(t * 3))); }).then(() => { s.lorryRun = false; }); };   /* in the play break the sign over the lorry counts the days of its journey */
  const carry = async (side, cols) => { s.carriers.forEach((c) => { c.visible = true; }); await Promise.all(s.carriers.map((c, i) => move(c, [i ? 1.2 : -1.2, -15], [i ? 1 : -1, 9], 3.4))); s.carriers.forEach((c) => { c.visible = false; }); await pop(s.stalls[1].set(side, 'cold', cols)); };

  // ---- the child's words are drawn in the town at once: a yellow place where the food would grow, and a small sample of how -----------
  const marker = group(g), mplace = glowMarks(place(marker, 0, 0, 5.4, 3.6, 0.06)), mback = glowMarks(blk(marker, 0, -1.9, 5.4, 0.2, 0, 3.2, '', { mat: soft('#ffdf3d', 0.5), shadow: false })); marker.visible = false;
  const samples = [0, 1, 2].map((k) => { const p = group(marker); texBoxless(p); if (k < 2) { for (let r = 0; r < 3; r++) B(p, 0, -0.9 + r * 0.9, 3.8, 0.4, 0.45, 0.5, r % 2 ? '#58b85a' : '#3f9a4a'); }
    if (k === 1) { blk(p, 0, 0, 4.4, 3, 0.45, 1.9, '', { mat: soft('#cfefff', 0.38), shadow: false }); for (const [x, z] of [[-2.2, -1.5], [2.2, -1.5], [-2.2, 1.5], [2.2, 1.5]]) B(p, x, z, 0.14, 0.14, 0.45, 1.9, '#ffffff'); B(p, 0, 1.5, 4.5, 0.14, 2.3, 0.12, '#ffffff'); B(p, 0, -1.5, 4.5, 0.14, 2.3, 0.12, '#ffffff'); }
    if (k === 2) { for (const y of [0.9, 2]) { B(p, 0, 0, 4.2, 1.5, y, 0.14, '#ffffff'); B(p, 0, 0, 3.8, 0.5, y + 0.14, 0.4, '#58b85a'); } for (const x of [-2.05, 2.05]) B(p, x, 0, 0.14, 1.5, 0.45, 2.7, '#cfd6dc'); blk(p, 0, 0, 4.2, 0.6, 3.05, 0.16, '', { mat: new THREE.MeshBasicMaterial({ color: hot('#ff5fd0', 2.2) }), shadow: false }); }
    p.visible = false; return p; });
  function texBoxless(p) { B(p, 0, 0, 4.6, 3.2, 0, 0.45, '#a8743f'); B(p, 0, 0, 4.2, 2.8, 0.4, 0.08, '#6b4a2e'); }
  const ANCHOR = [[-25, s.roadY(-102) - 0.25, -103, 5], [-7.6, 0, -20.5, 1.25], [-3, 0, 1.5, 1]], mplate = plate(s, '', [0, 0, 0], 'on'); mplate.hide = true;
  s.words = (list) => { s.words0 = [...list]; const [a, b] = list, on = a !== undefined || b !== undefined; marker.visible = on; mplate.hide = !on; if (!on) return; const [x, y, z, k] = ANCHOR[a ?? 2]; marker.position.set(x, y, z); marker.scale.setScalar(k);
    samples.forEach((p, i) => { p.visible = b === i; }); mplace.visible = a !== undefined; mback.visible = a === 0; mplate.pos.set(x, y + (b === undefined ? 1.2 : 3.9) * k, z); mplate.el.innerHTML = [a !== undefined ? WHERE[a] : '', b !== undefined ? HOW[b] : ''].filter(Boolean).join('<br>'); mplate.el.style.textAlign = 'center'; mplate.el.style.lineHeight = '1.25'; };
  s.asking = () => { s.tags.forEach((t) => { t.hide = true; }); s.show([false, false, false]); clearStalls(); glide(MAIN, 1); };

  // ---- Florence's plans appear in the place: the one nearest to the child's words first, with a yellow sign ----------------------------
  s.showPlans = async (list) => { const me = run, near = nearest(list), order = [near, ...[0, 1, 2].filter((i) => i !== near)], on = [false, false, false]; marker.visible = false; mplate.hide = true; tagsAt(false); home(); s.lights(1);
    for (const i of order) { on[i] = true; s.show(on); tagHtml(i, i === near); s.tags[i].hide = false; beep(360 + i * 70, 0.09);
      const part = [s.parts.gardenOn, s.parts.farmOn, s.parts.inOn][i]; if (i === 2) { s.lights(0); await tw(0.9, (t) => s.lights(ease(t))); } else if (i === 0) await tw(0.6, (t) => { part.scale.y = Math.max(0.01, back(t)); }); else await tw(0.7, (t) => s.fields.forEach((f) => { f.g.position.y = -8 * (1 - ease(t)); }));
      if (me !== run) return; await wait(i === near ? 1.1 : 0.35); if (me !== run) return; } };

  // ---- the test: food sets off from all three places at the same moment, once in summer and once in winter ---------------------------
  s.test = async (api) => { const me = run;
    for (const side of [0, 1]) {
      if (side) { api.step(T.autumnT); api.say(T.autumn); s.phase = 'autumn'; cartLoad(null); bikeLoad(false); const a = s.cart.position, b = s.bike.position;
        move(s.cart, [a.x, a.z], CART[0], 2.6); move(s.bike, [b.x, b.z], BIKE[0], 2.6); tw(3, (t) => s.lorryAt(-19 - 109 * t, true, true)).then(() => { s.lorry.visible = false; });
        await tw(3, (t) => s.season(ease(t), 0)); if (me !== run) return false; api.step(T.winterT); api.say(T.winter); s.phase = 'winter'; await tw(3.5, (t) => s.season(1 - ease(t), ease(t))); if (me !== run) return false; home(); await wait(0.4); }
      cartLoad(side ? 'basket' : 'crate'); bikeLoad(true); s.phase = `go${side}`; const lor = lorryRun(side ? 8 : 10);
      await Promise.all([move(s.cart, ...CART, side ? 5.4 : 4.6), move(s.bike, ...BIKE, 4.2, 0)]); if (me !== run) return false;
      cartLoad(null); bikeLoad(false); pop(s.stalls[0].set(side, STALL[0][side])); await pop(s.stalls[2].set(side, 'crate')); api.say(T.early[side]); s.phase = `first${side}`;
      await lor; if (me !== run) return false; await carry(side); api.say(T.late[side]); s.phase = `boxes${side}`; await wait(1.3); if (me !== run) return false; }
    s.tags.forEach((t) => { t.hide = true; }); await glide(RESULTS, 2.2); return me === run; };

  // ---- the play break: grow a crate of food with the plan the child chose ------------------------------------------------------------
  const tok = (c, small) => { const b = document.createElement('button'); b.className = 'tok'; b.dataset.crop = c.id; b.innerHTML = `<svg viewBox="0 0 44 40" aria-hidden="true"><circle cx="22" cy="${c.tall ? 12 : 22}" r="9" fill="${c.col}" stroke="${INK}" stroke-width="2.5"/><path d="M22 ${c.tall ? 21 : 31}v${c.tall ? 16 : 6}" stroke="#2e9b5a" stroke-width="4" stroke-linecap="round"/></svg><span>${c.name}<small>${small}</small></span>`; return b; };
  const chooseCrops = (api, list = CROPS, say = T.pick3) => new Promise((res) => { const on = new Set(), go = btn(T.growThese, 'sun', () => res(list.filter((c) => on.has(c.id)))); go.disabled = true;
    const toks = list.map((c) => { const b = tok(c, list === FIELD ? '' : c.tall ? T.tall : T.low); b.onclick = () => { if (on.has(c.id)) on.delete(c.id); else if (on.size < 3) on.add(c.id); else return; beep(480 + on.size * 80, 0.07); b.classList.toggle('on', on.has(c.id)); go.disabled = on.size !== 3; }; return b; }); api.say(say); api.tray([...toks, go]); });
  // The child chooses a crop and taps a yellow place for it. There are two of each crop and more places than that. Tall plants only fit the tall places,
  // and a low plant is never offered the last tall place that a tall plant still needs, so the child can never get stuck
  const putAll = (slots, crops, api, say, put, tallRule) => new Promise((res) => { const left = Object.fromEntries(crops.map((c) => [c.id, 2])), toks = {}; let sel = crops[0], open = true;
    const freeTall = () => slots.filter((q) => q.tall && !q.used).length, tallLeft = () => crops.filter((c) => c.tall).reduce((n, c) => n + left[c.id], 0);
    const fits = (q) => open && !q.used && left[sel.id] > 0 && (!tallRule || (sel.tall ? q.tall : !q.tall || freeTall() - 1 >= tallLeft()));
    const draw = () => { slots.forEach((q) => { q.mark.visible = fits(q); }); crops.forEach((c) => { toks[c.id].className = `tok${c === sel && left[c.id] ? ' on' : left[c.id] ? '' : ' used'}`; toks[c.id].querySelector('small').textContent = left[c.id] ? T.left(left[c.id]) : T.placed; }); api.say(say(sel)); };
    crops.forEach((c) => { const b = tok(c, ''); b.onclick = () => { if (left[c.id]) { sel = c; draw(); } }; toks[c.id] = b; }); api.tray(Object.values(toks));
    slots.forEach((q) => { q.used = false; q.can = () => fits(q); q.on = () => { q.used = true; put(q, sel); left[sel.id]--; beep(440 + CROPS.indexOf(sel) * 70, 0.1); if (!crops.some((c) => left[c.id])) { open = false; draw(); api.tray([]); return res(); } if (!left[sel.id]) sel = crops.find((c) => left[c.id]); draw(); }; }); draw(); });
  // one big yellow thing to tap, with a sign that nods
  const tapOne = ([x, y, z], w, h, label, name) => new Promise((res) => { let open = true; const m = glowMarks(frame(g, x, y, z, w, h, true, { fill: 0.35, t: Math.max(0.12, w * 0.04), d: Math.max(0.1, w * 0.03) })), pl = plate(s, label, [x, y + h * 1.12, z], 'tap'), go = () => { if (!open) return; open = false; m.visible = false; pl.hide = true; beep(700, 0.12); res(); };
    pl.el.onclick = go; hitBox(s, g, x, y - h * 0.1, z, w * 1.3, h * 1.3, Math.max(1.6, w * 0.3), () => open, go); s.spots[name] = [x, y + h / 2, z]; });
  const pickAll = (slots, onPick) => new Promise((res) => { let n = slots.filter((q) => q.used).length; slots.forEach((q) => { q.mark.visible = !!q.used; q.can = () => q.used && !q.plant.picked; q.on = () => { q.plant.pick(); q.mark.visible = false; beep(440 + CROPS.indexOf(q.plant.crop) * 70, 0.1); const last = --n === 0; onPick(q).then(() => { if (last) res(); }); }; }); });
  s.spots = {}; s.spot = (name, i) => (name === 'slot' ? (s.pick === 1 ? [s.fields[i].x, s.fields[i].y + 1.5, s.fields[i].z + 0.6] : s.pick === 0 ? [s.beds[i].x, s.beds[i].tall ? 1.1 : 0.7, s.beds[i].z] : [s.shelves[i].x, s.shelves[i].y + 0.6, -13.3]) : name === 'box' ? [s.coldPile.position.x + (i % 3) * 2.6, s.coldPile.position.y + Math.floor(i / 3) * 1.7 + 0.8, s.coldPile.position.z + 1] : name === 'answer' ? s.answers[i] : name === 'stall' ? [STALLX[i] - 1.33, 1.25, STALLZ] : name === 'family' ? [3.6, 1.3, 8.7] : name === 'garden' ? [-13.8, 1.2, -6.4] : s.spots[name]);

  const fly = (a, b, col) => { const f = blk(g, 0, 0, 0.34, 0.34, 0, 0.34, '', { mat: new THREE.MeshBasicMaterial({ color: col }), shadow: false }); return tw(0.45, (t) => f.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 1.3, a[2] + (b[2] - a[2]) * t)).then(() => { g.remove(f); }); };
  s.liftAt = [21.3, -13.75];
  // ---- the second half of the play break fills the winter side of the stall, and each plan does it in its own way ---------------------
  // The child chooses a crop in the band and taps a yellow place for it, count times. There is no limit on any crop, so the mix is the child's own
  const fillFree = (slots, crops, count, api, say, put) => new Promise((res) => { let sel = crops[0], n = count; const toks = crops.map((c) => { const b = tok(c, ''); b.onclick = () => { sel = c; beep(480, 0.06); draw(); }; return b; });
    const draw = () => { toks.forEach((b, i) => { b.className = `tok${crops[i] === sel ? ' on' : ''}`; }); slots.forEach((q) => { q.mark.visible = n > 0 && !q.used; }); if (n > 0) api.say(say(sel, n)); };
    slots.forEach((q) => { q.can = () => n > 0 && !q.used; q.on = () => { n--; q.used = true; put(q, sel); beep(440 + crops.indexOf(sel) * 70, 0.1); draw(); if (n === 0) { api.tray([]); res(); } }; }); api.tray(toks); draw(); });
  // the year turns from summer through autumn to winter; extra(share) is called while the snow comes
  const yearTurn = async (extra = () => {}) => { await tw(1.8, (t) => s.season(ease(t), 0)); await tw(2.8, (t) => { s.season(1 - ease(t), ease(t)); extra(ease(t)); }); };
  // The big farm: six cold boxes stand beside the shed, two of each crop. The child taps three of them into the cold store for the winter. A box can be
  // taken when nothing stands on it. The camera stands close to the shed for this, so that the boxes are big
  const SHEDVIEW = { eye: [21.5, 37.4, -105], at: [21.5, 36.9, -131], fov: 40 }, FARMWINTER = { eye: [5, 27, -60], at: [5, 34.5, -131], fov: 42 }, DOOR = 11 - 27.4;
  const storePlate = plate(s, T.store, [11, s.shed[1] + 6.2, s.shed[2] + 0.4], 'on'); storePlate.hide = true;
  const storeThree = (boxes, api) => new Promise((res) => { const kept = [], cp = s.coldPile.position, cm = group(s.parts.farmOn, cp.x, cp.y, cp.z), free = (j) => !boxes[j].userData.stored && (j >= 3 || boxes[j + 3].userData.stored);
    const marks = boxes.map((b) => glowMarks(frame(cm, b.position.x, b.position.y, 1.0, 2.45, 1.62, true, { fill: 0.28, t: 0.14, d: 0.1 })));
    const draw = () => { marks.forEach((m, j) => { m.visible = kept.length < 3 && free(j); }); if (kept.length < 3) api.say([...T.pack, T.packLeft(3 - kept.length)]); }; storePlate.hide = false;
    boxes.forEach((b, j) => hitBox(s, cm, b.position.x, b.position.y, 0, 2.5, 1.66, 2.6, () => kept.length < 3 && free(j), () => { b.userData.stored = true; kept.push(j); beep(420 + kept.length * 90, 0.1); const x0 = b.position.x, y0 = b.position.y;
      tw(0.9, (t) => { const e = ease(t); b.position.set(x0 + (DOOR - x0) * e, y0 * (1 - Math.min(1, t * 3)), 2.4 * Math.sin(Math.min(1, t * 2) * Math.PI / 2)); b.scale.setScalar(2.6 * (1 - 0.5 * e)); }).then(() => { b.visible = false; });
      draw(); if (kept.length === 3) wait(1.2).then(() => { storePlate.hide = true; res(kept); }); })); draw(); });

  s.playBreak = async (pick, api) => { const me = run; s.pick = pick; s.made = [null, null]; s.inBreak = true; const done0 = api.done; api.done = (ps) => { s.inBreak = false; done0(ps); }; s.tags.forEach((t) => { t.hide = true; }); s.show(only(pick)); clearStalls(); home(); cartLoad(null); bikeLoad(false);
    const slots = [s.beds, s.fields, s.shelves][pick], w0 = s.w;
    if (pick === 1) { s.fields.forEach((f) => { f.sown = false; f.g.visible = false; }); s.coldPile.visible = false; } else slots.forEach((q) => { if (q.plant) { q.pg.remove(q.plant.g); q.plant = null; } });
    if (pick === 2) { s.water(0); tw(1.2, (t) => s.lights(1 - 0.92 * t)); } tw(2.4, (t) => s.season(0, w0 * (1 - ease(t))));   // every play break starts in the warm half of the year and ends in the snow
    api.say([[T.spring], [T.farmGo], [T.cleared]][pick]); await glide(VIEW[pick], 2.4); if (me !== run) return;
    s.stage = 'crops'; const crops = await chooseCrops(api, pick === 1 ? FIELD : CROPS, pick === 1 ? T.pickField : T.pick3); s.crops = crops; const cols = colsOf(crops); s.stage = 'place';
    if (pick === 1) {   // the big farm: sow six of eight fields, start the harvester, choose three boxes for the cold store, and send the lorry twice
      await putAll(slots, crops, api, T.put[1], (f, c) => { f.sown = true; f.crop = c; f.g.visible = true; f.mat.color.set(c.col).lerp(new THREE.Color('#7cc552'), 0.72); }, false);
      await tw(2.2, (t) => s.fields.forEach((f) => { if (f.sown) f.mat.color.set(f.crop.col).lerp(new THREE.Color('#7cc552'), 0.72 - 0.4 * ease(t)); })); if (me !== run) return;
      api.say(T.aSay[1]); s.stage = 'a'; const hv = s.harvester; await tapOne([hv.position.x, hv.position.y, hv.position.z + 3.2], 13, 7, T.a[1], 'a');
      for (const k of [8, 6, 4, 2]) { hv.position.set(32, 3 * (k + 1), -50 - 8 * k - 2.2); await tw(1.1, (t) => { hv.position.x = 32 - 80 * t; s.fields.forEach((f) => { if (f.sown && f.k === k && Math.abs(f.x - hv.position.x) < 6) f.mat.color.set('#d9c27a'); }); }); if (me !== run) return; }
      const boxes = [...s.coldPile.children], bc = boxes.map((b, j) => colsOf([crops[j % 3]])[0]); boxes.forEach((b, j) => { b.tint(bc[j]); b.visible = true; b.userData.stored = false; b.position.set((j % 3) * 2.6, Math.floor(j / 3) * 1.7, 0); b.scale.setScalar(2.6); });
      s.coldPile.visible = true; s.coldPile.scale.setScalar(1); glide(SHEDVIEW, 2.4); await pop(boxes); if (me !== run) return; s.stage = 'b';
      const kept = await storeThree(boxes, api), sent = [0, 1, 2, 3, 4, 5].filter((j) => !kept.includes(j)); if (me !== run) return;
      api.say(T.off[1]); chime(); s.stage = 'off'; await tw(0.7, (t) => sent.forEach((j) => boxes[j].scale.setScalar(Math.max(0.01, 2.6 * (1 - t))))); s.coldPile.visible = false;
      let lor = lorryRun(9, -128, -19, true); await wait(1.2); await glide(MAIN, 2.4); await lor; if (me !== run) return; s.made[0] = { kind: 'cold', cols: sent.map((j) => bc[j]) }; await carry(0, s.made[0].cols);
      s.fields.forEach((f) => { if (f.sown) f.mat.color.set(f.crop.col).lerp(new THREE.Color('#7cc552'), 0.32); }); if (me !== run) return; await wait(0.8);
      // winter: the fields are under snow, and the boxes that the child kept come out of the cold store
      api.say(T.turn[1]); s.stage = 'winter'; tw(2.6, (t) => s.lorryAt(-19 - 109 * t, true, true)).then(() => s.lorryAt(-128, true)); s.puffClear(); glide(FARMWINTER, 2.6); await yearTurn(); if (me !== run) return;
      api.say(T.cSay[1]); s.stage = 'c'; await tapOne([16, s.shed[1], s.shed[2] + 0.5], 20, 8, T.c[1], 'c');
      kept.forEach((j, n) => { const b = boxes[j]; b.visible = true; b.position.set(n * 2.6, 0, 0); b.scale.setScalar(2.6); }); s.coldPile.visible = true; const cg = glide({ eye: [25, 37.4, -106], at: [24, 36.9, -131], fov: 38 }, 1.6); await pop(kept.map((j) => boxes[j])); await cg; await wait(1.0); if (me !== run) return;   // close to the shed again, so the boxes that the child kept are big, with the waiting lorry out of the picture
      api.say(T.off2[1]); chime(); s.stage = 'off2'; await tw(0.7, (t) => kept.forEach((j) => boxes[j].scale.setScalar(Math.max(0.01, 2.6 * (1 - t))))); s.coldPile.visible = false;
      lor = lorryRun(8, -128, -19, true); await wait(1.2); await glide(MAIN, 2.4); await lor; if (me !== run) return; s.made[1] = { kind: 'cold', cols: kept.map((j) => bc[j]) }; await carry(1, s.made[1].cols); if (me !== run) return;
      return api.done(T.done[1]); }
    await putAll(slots, crops, api, T.put[pick], (q, c) => { q.plant = mkPlant(q.pg, 0, 0, 0, c, { roots: pick === 2, k: 0 }); const pg = q.plant.g; tw(0.4, (t) => pg.scale.setScalar(Math.max(0.01, back(t)))); }, true); if (me !== run) return;
    api.say(T.aSay[pick]); s.stage = 'a';
    if (pick === 0) { await tapOne([s.barrel[0], 0, s.barrel[2] + 0.75], 1.9, 2.1, T.a[0], 'a'); const drops = slots.filter((q) => q.used).map((q) => [0, 1, 2].map((j) => blk(g, q.x - 0.7 + j * 0.7, q.z, 0.12, 0.12, 3, 0.4, '', { mat: new THREE.MeshBasicMaterial({ color: hot('#39a8ff', 1.2) }), shadow: false }))).flat();
      await tw(2.6, (t) => { drops.forEach((d, j) => { d.position.y = 0.8 + 2.4 * (1 - ((t * 4 + j * 0.37) % 1)); }); slots.forEach((q) => { if (q.used) q.plant.set(ease(t)); }); }); drops.forEach((d) => g.remove(d)); }
    else {   // the indoor farm: the tank and the switch are both yellow, and the child taps them in either order. Each answers in its own way, and the plants are ripe only when they have both
      const st = { w: 0, l: 0 }, grown = () => (st.w && st.l ? 1 : st.w ? 0.45 : 0.1), one = async (which) => { const k0 = grown(); st[which] = 1; const k1 = grown(); if (which === 'l') s.lever.position.y += 0.5; if (!(st.w && st.l)) api.say(which === 'w' ? T.onlyW : T.onlyL);
        await tw(2.4, (t) => { if (which === 'w') s.water(t); else s.lights(0.08 + 0.92 * ease(t)); slots.forEach((q) => { if (q.used) q.plant.set(k0 + (k1 - k0) * ease(t)); }); }); s.stage = 'b'; };
      await Promise.all([tapOne(s.tank, 1.9, 2.5, T.a[2], 'a').then(() => one('w')), tapOne([s.switchAt[0], 0.9, s.switchAt[2] + 0.2], 1.8, 2, T.b[2], 'b').then(() => one('l'))]); slots.forEach((q) => { if (q.used) q.plant.set(1); }); }
    if (me !== run) return; api.say(T.ripe[pick]); s.stage = 'pick'; let n = 0; const crate = pick === 2 ? s.liftCrate : s.cartLoad.crates[0];
    if (pick === 2) { crate.visible = true; crate.fill(0, cols); } else { cartLoad('crate', cols); s.cartLoad.crates.forEach((c) => c.fill(0, cols)); }
    const got = [], to = pick === 2 ? [s.liftAt[0], s.lift.position.y + 1.4, s.liftAt[1]] : [CART[0][0], 1.2, CART[0][1] + 0.6];
    await pickAll(slots, (q) => fly([q.x, q.y + 0.6, q.z], to, q.plant.crop.col).then(() => { got.push(colsOf([q.plant.crop])[0]); n++; if (pick === 2) crate.fill(n, got); else { s.cartLoad.crates[0].fill(Math.min(6, n * 2), got.flatMap((c) => [c, c])); s.cartLoad.crates[1].fill(Math.max(0, n * 2 - 6), got.slice(3).flatMap((c) => [c, c])); } })); if (me !== run) return;
    chime(); api.say(T.off[pick]); s.stage = 'off';
    if (pick === 2) {
      // the lift brings the crate down, and the cargo bike takes it to one side of the stall
      const y0 = s.lift.position.y, sendBike = async (side, list) => { await tw(1.6, (t) => { s.lift.position.y = y0 + (s.fy(0) - y0) * ease(t); }); crate.visible = false; bikeLoad(true, list); await wait(0.5); glide(MAIN, 2.6); await move(s.bike, ...BIKE, 4.4, 0); tw(1.6, (t) => { s.lift.position.y = s.fy(0) + (y0 - s.fy(0)) * ease(t); }); bikeLoad(false); s.made[side] = { kind: 'crate', cols: list }; await pop(s.stalls[2].set(side, 'crate', list)); };
      await sendBike(0, cols); if (me !== run) return; await wait(0.8);
      // winter: snow falls outside and nothing changes inside. The picked trays grow again by themselves, and the child fills the three empty shelves for the winter
      api.say(T.turn[2]); s.stage = 'winter'; glide(VIEW[2], 2.6); move(s.bike, BIKE[1], BIKE[0], 3, 0).then(() => { s.bike.rotation.y = 0; });
      await yearTurn((e) => slots.forEach((q) => { if (q.used) { q.plant.picked = false; q.plant.set(0.1 + 0.9 * e); } })); if (me !== run) return;
      slots.forEach((q) => { q.can = () => false; if (!q.used) q.mark.traverse((m) => { if (m.material && m.material.transparent) { m.material = m.material.clone(); m.material.opacity = 0.66; } }); });   /* the lights are on now, so the yellow of the empty shelves is made stronger against the pink wall */
      s.stage = 'w-place'; await fillFree(slots.filter((q) => !q.used), CROPS.filter((c) => !c.tall), 3, api, T.extra, (q, c) => { q.plant = mkPlant(q.pg, 0, 0, 0, c, { roots: true, k: 0 }); const pl = q.plant; tw(0.4, (t) => pl.g.scale.setScalar(Math.max(0.01, back(t)))).then(() => tw(1.6, (t) => pl.set(ease(t)))); });
      await wait(2.3); if (me !== run) return; api.say(T.cSay[2]); s.stage = 'c'; await tapOne([s.liftAt[0], s.lift.position.y, s.liftAt[1] + 0.7], 2.4, 3, T.c[2], 'c');
      crate.visible = true; crate.fill(0, cols); const got2 = [];
      await Promise.all(slots.map((q, j) => wait(j * 0.17).then(() => { q.plant.pick(); beep(440 + CROPS.indexOf(q.plant.crop) * 70, 0.08); return fly([q.x, q.y + 0.6, q.z], to, q.plant.crop.col); }).then(() => { got2.push(colsOf([q.plant.crop])[0]); crate.fill(Math.min(6, got2.length), got2); }))); if (me !== run) return;
      chime(); api.say(T.off2[2]); s.stage = 'off2'; await sendBike(1, got2); if (me !== run) return; return api.done(T.done[2]); }
    await wait(0.5); glide(MAIN, 2.6); await move(s.cart, ...CART, 4.8); cartLoad(null); s.made[0] = { kind: 'crate', cols }; await pop(s.stalls[0].set(0, 'crate', cols)); if (me !== run) return; await wait(0.8);
    // autumn in the gardens: the summer plants are over. The child sows one winter crop under the one winter cover, and then the snow comes
    api.say(T.turn[0]); s.stage = 'winter'; glide(VIEW[0], 2.6); move(s.cart, CART[1], CART[0], 3).then(() => { s.cart.rotation.y = 0; });
    await tw(2.8, (t) => { s.season(ease(t), 0); slots.forEach((q) => { if (q.plant) q.plant.g.scale.setScalar(Math.max(0.02, 1 - ease(t))); }); }); slots.forEach((q) => { if (q.plant) { q.pg.remove(q.plant.g); q.plant = null; } q.used = false; }); if (me !== run) return;
    s.stage = 'w-place'; let bed = null, wc = null; await fillFree(slots, WINTER, 1, api, T.coverSay, (q, c) => { bed = q; wc = c; q.cover = s.mkCover(q); q.plant = mkPlant(q.pg, 0, 0, 0, c, { k: 0.1 }); const cg = q.cover; tw(0.45, (t) => cg.scale.setScalar(Math.max(0.01, back(t)))); });
    api.say(T.snowG); await wait(0.6); await tw(3.2, (t) => { s.season(1 - ease(t), ease(t)); bed.plant.set(0.1 + 0.9 * ease(t)); }); if (me !== run) return;
    api.say(T.cSay[0]); s.stage = 'c'; await tapOne([bed.x, 0.5, bed.z + 1.05], 2.8, 1.2, T.c[0], 'c'); bed.plant.pick(); await fly([bed.x, 1.1, bed.z], [CART[0][0], 1.3, CART[0][1] + 0.6], wc.col); cartLoad('basket'); s.cartLoad.basket.fill(wc.basket); if (me !== run) return;
    chime(); api.say(T.off2[0]); s.stage = 'off2'; await wait(0.5); glide(MAIN, 2.6); await move(s.cart, ...CART, 5.2); cartLoad(null); s.made[1] = { kind: 'basket', cols: wc.basket }; await pop(s.stalls[0].set(1, 'basket', wc.basket)); if (me !== run) return;
    api.done(T.done[0]); };

  // ---- the plan is carried out in the town; another plan can be shown at once ---------------------------------------------------------
  const settle = (pick) => { s.pick2 = pick; s.show(only(pick)); s.lights(1); s.water(1); home(); cartLoad(null); bikeLoad(false); tagsAt(false); s.tags.forEach((t, i) => { tagHtml(i, false); t.hide = i !== pick; }); };
  // after the play break the plants grow again, and the growers fill the places that the child left empty with the child's own crops
  const regrow = (pick) => { if (pick === 1 || !s.crops) return; const slots = pick === 0 ? s.beds : s.shelves, low = s.crops.filter((c) => !c.tall), tall = s.crops.find((c) => c.tall); let n = 0;
    slots.forEach((q) => { if (q.plant) q.plant.regrow(); else q.plant = mkPlant(q.pg, 0, 0, 0, q.tall && tall ? tall : low[n++ % low.length], { roots: pick === 2 }); }); };
  // the year comes round to summer again, and the stall keeps on both of its sides what the child put there
  s.town = async (pick) => { const me = run, w0 = s.w, a0 = s.a; settle(pick); regrow(pick); stallsFor(pick); glide(MAIN, 1.4); if (w0 > 0.01 || a0 > 0.01) await tw(3, (t) => s.season(a0 * (1 - ease(t)), w0 * (1 - ease(t)))); if (me !== run) return; await wait(0.6); };
  s.swap = (pick) => { document.getElementById('first').classList.toggle('right', pick === 0); settle(pick); s.season(0, 0); glide(MAIN, 1); stallsFor(pick); pop(s.stalls[pick].sides.flatMap((o) => [...o.crates, ...o.colds, o.basket].filter((c) => c.visible))); };
  s.showResults = () => { s.tags.forEach((t) => { t.hide = true; }); };   // the cards stand under the stalls and carry the tags of the plans

  // ---- the recap: winter again, all three places in the town, and a tap on one of them ----------------------------------------------
  s.answers = [[-13.8, 1.6, -8], [-10, 30, -120], [15.5, 5.5, -12.5]];
  s.recap = (answer) => { s.recapOn = true; let open = true; const signs = []; s.show([true, true, true]); s.lights(1); s.tags.forEach((t) => { t.hide = true; }); clearStalls(); glide(MAIN, 1.2); tw(3, (t) => s.season(0, ease(t)));
    [[-13.8, 4, -8, 13, 5, 8, 0], [-10, 46, -128, 90, 46, 40, 0], [15.5, 12.4, -12, 14.5, 11.5, 8, 0]].forEach(([x, y, z, w, h, d], i) => { const pl = plate(s, T.here, [x, y, z], 'tap'), go = () => { if (!open) return; open = false; for (const q of signs) q.hide = true; beep(i === 2 ? 880 : 300, 0.15); answer(i === 2); }; signs.push(pl); pl.el.onclick = go; hitBox(s, g, x, i === 1 ? 6 : 0, i === 1 ? z + 30 : z + 2, w, h, d, () => open, go); }); };
  // the closing picture: a summer evening in the square, with the plan the child chose
  s.evening = (pick) => { const w0 = s.w; settle(pick); s.tags.forEach((t) => { t.hide = true; }); stallsFor(pick);
    tw(1.6, (t) => s.season(0, w0 * (1 - t))).then(() => tw(3, (t) => s.season(0, 0, 0.82 * ease(t)))); if (pick === 1) { s.lorryPlate.el.textContent = T.lorry; s.lorryAt(-128, true); tw(16, (t) => s.lorryAt(-128 + 100 * t)); s.lorryRun = true; }
    glide({ eye: [[5, 3, 25.5], [0, 3.1, 26], [-5, 3, 25.5]][pick], at: [[-7, 4.2, -12], [0, 6.4, -14], [8, 5.2, -12]][pick], fov: 43 }, 4); };

  // ---- things that answer a tap, for a child to find by accident. They rest during the play break, so that they never take a tap meant for a yellow place ----
  const now = () => performance.now() / 1000, hopOf = (o, t) => { const d = t - (o.userData.hop ?? -9); return d < 0.5 ? Math.sin(d / 0.5 * Math.PI) * 0.6 : 0; }, poke = (x, y, z, w, h, d, fn, can = () => true) => hitBox(s, g, x, y, z, w, h, d, () => !s.inBreak && can(), fn);
  const note = plate(s, '', [0, 0, 0], 'on'); note.hide = true; let noteN = 0; const say = (text, pos) => { const n = ++noteN; note.el.textContent = text; note.pos.set(...pos); note.hide = false; wait(2.6).then(() => { if (n === noteN) note.hide = true; }); };
  poke(3.6, 0, 8.3, 4.6, 2.7, 2, () => { s.family.userData.hop = now(); chime(); });
  s.walkers.forEach((w, i) => poke(w.position.x, 0, w.position.z, 1.6, 2.6, 1.6, () => { w.userData.hop = now(); w.rotation.y += 0.9; beep(500 + i * 110, 0.12); }));
  s.trees.forEach((tr, i) => poke(tr.at[0], 0, tr.at[1], 4 * tr.at[2], 6.5 * tr.at[2], 4 * tr.at[2], () => { beep(240 + i * 30, 0.2, 'sine'); tw(0.7, (t) => { tr.rotation.z = Math.sin(t * 20) * 0.07 * (1 - t); }); }));
  s.stalls.forEach((st, i) => [0, 1].forEach((side) => poke(st.x + (side ? 1.33 : -1.33), 0.9, STALLZ, 2.6, 1.3, 1.9, () => { beep(660, 0.1); say(T.note[st.kind[side] === 'basket' && i === s.pick && s.made[1] ? 'cover' : st.kind[side]], [st.x + (side ? 1.33 : -1.33), 2.3, STALLZ]); }, () => !!st.kind[side])));
  poke(-13.8, 0, -8, 12, 3, 5, () => { const n = now(); s.neighbours.forEach((p) => { p.userData.hop = n; }); beep(620, 0.1); say(T.wave, [-11.5, 2.3, -5.5]); }, () => s.shown[0] && !s.recapOn && s.w < 0.5);
  poke(15.5, 0.3, -12.4, 13, 10, 1, () => { beep(520, 0.25, 'sine'); say(T.glow, [15.5, 6, -12]); tw(0.9, (t) => s.lights(1 - 0.55 * Math.sin(t * Math.PI))); }, () => s.shown[2] && !s.recapOn && s.lightsOn > 0.95);
  const lorryHit = poke(0, 0, 0, 4, 4.5, 7, () => { beep(150, 0.35, 'square', 0.06); s.puff(); s.puff(); say(T.note.lorry, [0, s.lorry.position.y + 6 * s.lorry.scale.x, s.lorry.position.z]); }, () => s.lorry.visible);
  let puffT = 0; s.tick = (t, dt) => { lorryHit.mesh.position.set(0, s.lorry.position.y + 2.2 * s.lorry.scale.x, s.lorry.position.z); lorryHit.mesh.scale.setScalar(s.lorry.scale.x); s.flakes(dt); s.puffs(dt); s.lorryPlate.hide = !(s.lorryRun && s.lorry.visible); if (s.lorryRun && s.lorry.visible) { puffT -= dt; if (puffT < 0) { s.puff(); puffT = 0.28; } }
    const n = now(); s.family.position.y = Math.abs(Math.sin(t * 2)) * 0.04 + hopOf(s.family, n); s.neighbours.forEach((p) => { p.position.y = 0.06 + hopOf(p, n); }); s.walkers.forEach((w, i) => { w.position.y = 0.06 + Math.abs(Math.sin(t * 2.4 + i)) * 0.05 + hopOf(w, n); }); if (s.pick !== 1) s.harvester.position.x = 17 + Math.sin(t * 0.25) * 9; };
  return s; }

// ---- 4. hand it all to the kit ---------------------------------------------------------------------------------------------------------
runLevel({ place: { number: 4, town: 'Eco Town', level: 'Food' }, words, plans, scene: square,
  results: (i) => RES[i], after: (i) => AFTER[i],
  ends: (pick, s) => [{ step: T.endT, say: [...T.endSay[pick], IN_GAME ? words.endInGame : words.end], go: () => s.evening(pick) }] });
