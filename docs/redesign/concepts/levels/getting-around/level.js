// A playable trial of level 2 of Eco Town, "Getting around". The child asks Florence to suggest plans for the paths and streets, presses "Open the shops"
// to test them on three spring mornings, chooses a plan, and then fits path pieces together on the ground between the homes and the shops.
// One idea runs through the level: the shape of the paths decides how far people have to walk, and a path can bend round a tree.
// The page, Florence's band, the order of the steps, the result cards and the block style come from the shared kit in ../../level-kit/.
// This file holds the words, the plans and the results. place.js holds the place, and board.js the rules of the board.
// Every word below is a placeholder written for this trial. Nothing here is part of the game.
import { meter, btn, esc, $, setTray } from '../../level-kit/shell.js';
import { runLevel } from '../../level-kit/flow.js';
import { makePlace } from './place.js';

// ---- the words (placeholders) -----------------------------------------------------------------------------------------------------------
const W = {
  level: 'The way to the shops',
  job: ['Your family is meeting Gran at the shops.', 'Can everyone walk there, and can the old blossom trees stay?'], start: 'Start',
  askT: 'Your sentence', askHow: 'Tap a word for each gap. Then ask Florence to suggest plans.', ask: 'Ask Florence',
  sentence: ['Plan the streets so people can reach the shops on foot and leave space for nature. Make the paths', ['long and winding', 'short and direct', 'beside the busy road'], 'and put the park', ['at the far edge of the town', 'on the other side of the river', 'in the middle of the town'], '.'],
  plansSay: ([a, b]) => [`Here are three plans, with paths ${a} and the park ${b}.`, 'Press the button to test them.'], test: 'Open the shops',
  testT: 'The shops open', watch: 'The shutters go up and the bells ring.', take: 'Take the postcard', takeHow: 'Everyone is here. Take a postcard of this morning.',
  short: ['The grid of streets', 'The winding loop', 'The paths through the park'],
  morning: ['First morning: a grid of streets. Who walks to the shops?', 'Second morning: one winding loop. Who walks to the shops?', 'Third morning: paths through the middle. Who walks to the shops?'],
  choose: 'People or cars at the shops? Blossom or stumps? Choose a plan.', again: 'Ask again', use: 'Use this plan',
  checks: ['Promote walking', 'Nature'], walked: (n) => `${n} of 10 homes walked`, kept: (n) => `${n} of 10 old trees stayed`,
  walkAll: ['Everyone walked to the shops.', 'Everyone walked to the shops.', 'Everyone walked across the middle to the shops.'], walkSome: 'People from the far homes took their cars.',
  nature: { cut: 'Most of the old trees were cut down.', half: 'Half of the old trees were cut down. The new park has only young trees.', loop: 'The wide park stayed in the middle.', park: 'The park stayed in the middle.', bend: 'Every old tree stayed. The paths bend round them.' },
  playT: 'Fit the paths together', next: 'Next',
  piece: { straight: 'Straight', bend: 'Bend', fork: 'Fork', bridge: 'Bridge', lift: 'Take back' }, left: (n) => `${n} left`, colour: 'Paving colour', colours: ['Cream', 'Clay', 'Slate'],
  joined: (n) => (n ? `${n} of 10 homes are joined to the shops.` : 'Join every home to the shops.'),
  pieceHow: { straight: 'Tap a yellow square to lay a straight piece.', bend: 'Tap a yellow square to lay a bend.', fork: 'Tap a yellow square to lay a fork. A fork serves two homes.', bridge: 'There is only one bridge. Tap a yellow square on the stream.' },
  firstPiece: 'This piece does not fit beside the shops. Try another kind of piece.', noPlace: 'This piece fits nowhere now. Try another kind, or tap a piece on the board to swap it for this one.', noneLeft: 'You have none of these left. Choose another kind, or take a piece back.',
  liftHow: 'Tap a piece on the board to take it back.', oneWay: 'This piece only fits one way here.', noFit: 'That piece does not fit there.',
  homeWalks: 'A home is joined. Off they go to the shops.', granWalks: 'Gran’s home is joined. Here she comes.', tooFar: 'This way is long, so they will take the car. A shorter way would let them walk.',
  doneAll: 'Every home is joined, and everyone walks to the shops.', doneSome: 'Every home is joined. For some homes the way is long, so they still take the car.', doneHow: 'Press Next when you are ready.',
  showMe: 'Show me one way', shown: 'Here is one way to do it. You can still change it.',
  townT: 'The neighbourhood is built', townHow: 'The streets and paths are being built.', built: 'The neighbourhood is built with the plan you chose.', yours: 'Your paths',
  afterWalk: (n) => (n === 10 ? 'Everyone has a short walk to the shops.' : `People from ${10 - n} homes take their cars to the shops.`), afterTrees: (n) => (n >= 9 ? 'The old trees are still there.' : n >= 4 ? 'Half of the old trees are gone.' : 'Most of the old trees are gone.'),
  tryOther: 'Try another plan', chooseOther: 'Choose a different plan to see it in the town.', first: 'Your first plan', what: 'What changed?', keepFirst: 'Go back to my first plan', keepThis: 'Keep this plan',
  recapT: 'One more question', recapQ: 'Point to a plan where everyone walked to the shops.', recapYes: '', recapNo: '',
  recapYesOf: (p) => `Yes. With ${p.toLowerCase()}, everyone walked to the shops.`, recapNoOf: (ps) => `Look again at the postcards. Everyone walked with ${ps.map((p) => p.toLowerCase()).join(' and with ')}.`, recapNone: 'In this test, no plan let everyone walk. Short and direct paths make the walk easier.',
  endT: 'The walk to the shops', endSay: ['Your family walks the path to the shops, under the blossom.'], end: 'This is the end of the trial level. Thank you for playing.', replay: 'Play again',
  gran: 'Gran', granCar: 'Gran, in her car', granHome: 'Gran’s home', family: 'Your family', parkHere: 'The park',
  postcard: 'Postcard' };

// ---- the plans, and what the checks find ---------------------------------------------------------------------------------------------------
// Each plan's tag carries a small map of its shape, so that the three are told apart at a glance: squares, one loop, and paths that fan out between trees.
const INK = '#1f2a44', svg = (inner) => `<svg class="tagpic" viewBox="0 0 44 36" aria-hidden="true"><rect x="1.5" y="1.5" width="41" height="33" rx="5" fill="#c4ea9c" stroke="${INK}" stroke-width="3"/>${inner}</svg>`;
const ICON = [
  svg(`<path d="M3 13h38M3 24h38M15 3v30M29 3v30" stroke="${INK}" stroke-width="5.5"/><path d="M3 13h38M3 24h38M15 3v30M29 3v30" stroke="#fff3d0" stroke-width="2.5"/>`),
  svg(`<rect x="8" y="7" width="28" height="22" rx="7" fill="none" stroke="${INK}" stroke-width="6"/><rect x="8" y="7" width="28" height="22" rx="7" fill="none" stroke="#fff3d0" stroke-width="3"/><circle cx="22" cy="18" r="4.5" fill="#ff8fbe" stroke="${INK}" stroke-width="2"/>`),
  svg(`<path d="M22 33V20M22 20L8 6M22 20L36 6M22 20V4" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><path d="M22 33V20M22 20L8 6M22 20L36 6M22 20V4" fill="none" stroke="#fff3d0" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="22" r="4.5" fill="#ff8fbe" stroke="${INK}" stroke-width="2"/><circle cx="32" cy="22" r="4.5" fill="#ff8fbe" stroke="${INK}" stroke-width="2"/>`)];
const plans = [{ name: 'A grid of streets', lines: ['A grid of streets', 'A path by every street'] }, { name: 'One winding loop', lines: ['One winding loop', 'One long street'] }, { name: 'Paths through a park', lines: ['Paths through a park', 'Cars go round outside'] }].map((p, i) => ({ ...p, icon: ICON[i] }));
// The child's words change the result. Paths that wind or that run beside the busy road make the walk harder, so more families take the car.
// A park that is not in the middle leaves the old trees there without protection, so half of them are cut down.
const walkMark = (n) => (n === 10 ? 'g' : n >= 8 ? 'f' : 'p'), treeMark = (n) => (n >= 9 ? 'g' : n >= 4 ? 'f' : 'p');
const results = (i, s) => { const m = s.model(i);
  return [{ check: W.checks[0], evidence: meter(m.walkers, W.walked(m.walkers)), text: m.walkers === 10 ? W.walkAll[i] : W.walkSome, mark: walkMark(m.walkers) },
    { check: W.checks[1], evidence: meter(m.kept, W.kept(m.kept)), text: m.kept >= 9 ? (i === 1 ? W.nature.loop : s.park === 2 ? W.nature.park : W.nature.bend) : m.kept >= 4 ? W.nature.half : W.nature.cut, mark: treeMark(m.kept) }]; };

// ---- the postcards of the three mornings ---------------------------------------------------------------------------------------------------
// They stay in Florence's band from the test until a plan is chosen, and each result card carries its own. A tap on a postcard shows it large.
const cards = document.createElement('div'), shots = ['', '', '']; cards.className = 'postcards';
function drawCards(fresh = -1) { cards.replaceChildren(...shots.map((url, i) => { const b = document.createElement('button'); b.className = `pc${i === fresh ? ' new' : ''}`; b.disabled = !url; b.innerHTML = `${url ? `<img alt="" src="${url}">` : '<i></i>'}${esc(W.short[i])}`; b.onclick = () => big(i); return b; })); }
function big(i) { if (!shots[i]) return; const el = document.createElement('div'); el.className = 'pcbig'; el.innerHTML = `<figure><img alt="" src="${shots[i]}">${esc(W.short[i])}</figure>`; el.onclick = () => el.remove(); $('view').append(el); }
drawCards();
// the kit's result cards have no place for a picture, so the postcard is put on each card as soon as the cards are drawn
new MutationObserver(() => { for (const card of $('over').querySelectorAll('.card')) { if (card.querySelector('.pcimg')) continue; const i = plans.findIndex((p) => card.querySelector('h3').textContent.startsWith(p.lines[0])); if (i < 0 || !shots[i]) continue; const im = document.createElement('img'); im.className = 'pcimg'; im.alt = ''; im.src = shots[i]; im.onclick = () => big(i); card.querySelector('h3').after(im); } }).observe($('over'), { childList: true });

// ---- small pictures for the buttons of the path pieces ------------------------------------------------------------------------------------
const tile = (d, extra = '') => `<svg viewBox="0 0 44 40" aria-hidden="true"><rect x="5" y="3" width="34" height="34" rx="4" fill="#c4ea9c" stroke="${INK}" stroke-width="2.5"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="11"/><path d="${d}" fill="none" stroke="#fff3d0" stroke-width="6.5"/>${extra}</svg>`;
const PIECE = { straight: tile('M22 4V36'), bend: tile('M22 4V20H38'), fork: tile('M6 20H38M22 20V4'), bridge: tile('M22 4V36', `<path d="M6 15h32v10H6z" fill="#6cc3ee" opacity=".9"/><path d="M15 6v28M29 6v28" stroke="#d2553a" stroke-width="3"/><path d="M18.5 6h7v28h-7z" fill="#c9975a"/>`), lift: `<svg viewBox="0 0 44 40" aria-hidden="true"><path d="M22 34V12M12 20L22 9l10 11" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>` };

const hooks = { tag: (i) => `${plans[i].icon}<span><b>${esc(plans[i].lines[0])}</b></span>`, pieceIcon: (kd) => PIECE[kd], btn,
  postcard: (i, url) => { shots[i] = url; drawCards(i); setTray([cards]); },
  // the child takes each postcard: one yellow button, which the test waits for
  shutter: () => new Promise((res) => { const b = btn(W.take, 'sun', () => { b.disabled = true; res(); }); setTray([cards, b]); }), clear: () => { shots.fill(''); drawCards(); } };

runLevel({ place: { number: 1, town: 'Eco Town', level: 'Getting around' }, words: W, plans, results, evidence: cards, scene: () => makePlace(W, hooks),
  after: (i, s) => { const m = s.model(i); return `${W.afterWalk(m.walkers)} ${W.afterTrees(m.kept)}`; },
  ends: (pick, s) => [{ step: W.endT, say: [...W.endSay, W.end], go: () => s.walkHome(pick) }] });
