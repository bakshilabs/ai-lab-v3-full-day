// The page shell that every level shares, and the small pieces of interface that go in it: Florence's band under the
// picture, the pills along the top, buttons, the sentence with word buttons, the tags of the plans, the result cards,
// the meter and the sign that keeps the first result in view. It was taken from the Homes trial (23 Nov 2026).
// Nothing here knows what a level is about. A level gives the words and the pictures; this file only lays them out.
// The page needs docs/redesign/ui/tokens.css and kit.css. This file puts the page together as soon as it is loaded.
export const $ = (id) => document.getElementById(id);
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// The label in the top right corner says that the words are placeholders. Every level keeps it until the owner's words are in.
export const PLACEHOLDER = 'This is a trial level. Its words are placeholders.';
if (!$('view')) document.body.insertAdjacentHTML('afterbegin', `<div class="app ui">
  <div class="view" id="view">
    <canvas id="c"></canvas>
    <div class="plates" id="plates"></div>
    <div class="top"><div class="chip"><b id="chipN">1</b><span id="chipT">Eco Town</span> <strong id="chipL"></strong></div><div class="step" id="step"></div><div class="trial" id="label">${esc(PLACEHOLDER)}</div></div>
    <div class="first" id="first" hidden></div>
    <div class="over" id="over"></div>
    <div class="fps" id="fps" hidden></div>
  </div>
  <div class="band"><div class="flo" id="flo"></div><div class="right"><div class="say" id="say" aria-live="polite"></div><div class="tray" id="tray"></div></div></div>
</div>`);
// the pill in the top left corner: the number of the town, the town and the level. label replaces the words of the placeholder label, but the label itself always stays
export function setPlace({ number = 1, town = 'Eco Town', level = '', label = PLACEHOLDER } = {}) { $('chipN').textContent = number; $('chipT').textContent = town; $('chipL').textContent = level; $('label').textContent = label; }
// Florence breathes: frames 0 to 3 of her sheet, three each second
{ let n = 0; setInterval(() => { n = (n + 1) % 4; $('flo').style.setProperty('--col', n); }, 333); }

// ---- the band: the title of the step, Florence's words, and the buttons beside them -------------------------------------
// cls: 'sun' is the yellow button for the one thing to do next, 'sun big' is the test button, and '' is a quiet button
export const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = `btn ${cls}`; b.textContent = label; b.onclick = fn; return b; };
export const says = (ps) => { $('say').innerHTML = [].concat(ps).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join(''); };
export const setStep = (text) => { $('step').textContent = text; };
export const setTray = (els, wide = false) => { const t = $('tray'); t.className = `tray${wide ? ' wide' : ''}`; t.replaceChildren(...els); };
// One call sets a whole step. step is the title in the yellow pill (stepHtml is used instead when it is given), say is one or more
// short paragraphs for Florence, tray is the buttons, and over is what lies over the bottom of the picture (the result cards); over: null leaves it as it is
export function ui({ step = '', stepHtml = null, say = [], tray = [], wide = false, over = '' }) { if (stepHtml !== null) $('step').innerHTML = stepHtml; else setStep(step); says(say); setTray(tray, wide); if (over !== null) $('over').innerHTML = over; }

// ---- the sentence with gaps, and the word buttons ---------------------------------------------------------------------------
// sentence is a list of pieces: a string is fixed words, and a list of strings is a gap with its options. words holds the option chosen for each gap (undefined for an empty gap),
// now is the gap that the word buttons are for, onGap is called when the child taps a gap and onWord when the child taps a word. It gives back the two things to put in the tray
export function sentenceRow(sentence, words, now, onGap, onWord) { const sen = document.createElement('div'), gaps = sentence.filter((p) => Array.isArray(p)); sen.className = 'sentence'; let gi = 0;
  for (const p of sentence) { if (typeof p === 'string') sen.append(p === '.' ? p : `${p} `); else { const i = gi++, sp = document.createElement('span'); sp.className = `gap${words[i] !== undefined ? ' full' : ''}${i === now ? ' now' : ''}`; sp.textContent = words[i] !== undefined ? p[words[i]] : '…'; sp.onclick = () => onGap(i); sen.append(sp, ' '); } }
  const row = document.createElement('div'); row.className = 'words'; gaps[now].forEach((w, k) => { const b = document.createElement('button'); b.className = 'word'; b.textContent = w; b.onclick = () => onWord(now, k); row.append(b); });
  return [sen, row]; }

// ---- the tags of the plans ------------------------------------------------------------------------------------------------------
// A plan is { name, lines: [first line, second line], icon }. The icon is a small picture as SVG text with class="tagpic", and it is optional.
// Wherever a plan is named, its picture stands beside two lines of the same size, so that two plans are never told apart by small words alone
export const planTag = (plan) => `${plan.icon || ''}<span><b>${esc(plan.lines[0])}</b>${plan.lines[1] ? `<b>${esc(plan.lines[1])}</b>` : ''}</span>`;
export const stepPlanHtml = (plan) => `${plan.icon || ''}${esc(plan.name)}`;

// ---- the meter ----------------------------------------------------------------------------------------------------------------------
// A row of boxes filled from the left. The difference between two meters is one of length and of words, never of colour alone. label is what a screen reader says
export const meter = (v, label = '', outOf = 10) => `<span class="mbar" role="img" aria-label="${esc(label)}">${Array.from({ length: outOf }, (_, k) => `<i${k < Math.round(v) ? ' class="on"' : ''}></i>`).join('')}</span>`;
// A box of meters for the band, which can rise while the test runs. set({ title, rows: [{ name, value, outOf, label, note, now }], caption }) draws it again:
// note is the words under a meter, now marks the row that is rising, and caption is one line under the rows. The box covers nothing in the picture
export function meterBox() { const el = document.createElement('div'); el.className = 'meterbox'; el.setAttribute('aria-live', 'polite');
  return { el, set({ title = '', rows = [], caption = '' }) { el.innerHTML = `<b>${esc(title)}</b>${rows.map((r) => `<div class="mrow${r.now ? ' now' : ''}"><span>${esc(r.name)}</span>${meter(r.value, r.label, r.outOf)}<em>${esc(r.note || '')}</em></div>`).join('')}<small>${esc(caption)}</small>`; } }; }

// ---- the result cards -------------------------------------------------------------------------------------------------------------
// The evidence comes before the mark: each row is a sentence about what happened (with a meter or another small picture in front of it if the level gives one), and only then a tick, a dash or a cross.
// The mark is a shape as well as a colour. rows is a list of { check, text, mark, evidence }: mark is 'g' (tick), 'f' (dash) or 'p' (cross), and evidence is optional HTML
export const MARK = { g: '✓', f: '–', p: '✕' };
const rowHtml = (r) => `<span><b>${esc(r.check)}.</b> ${r.evidence ? `${r.evidence} ` : ''}${esc(r.text)}</span><i class="mark ${r.mark}">${MARK[r.mark]}</i>`;
// One card for each plan. rowsOf(i) gives the rows of plan i. mine is the plan the child chose first (it gets the words in firstWords and no button), and only is a set of the plans to show
export const resultCards = (plans, rowsOf, { use, firstWords = '', mine = -1, only = null }) => plans.map((p, i) => { if (only && !only.has(i)) return ''; return `<div class="card"><h3 class="pl">${planTag(p)}</h3>${rowsOf(i).map((r) => `<div class="res">${rowHtml(r)}</div>`).join('')}${i === mine ? `<p><b>${esc(firstWords)}</b></p>` : `<button class="btn sun" data-plan="${i}">${esc(use)}</button>`}</div>`; }).join('');
// the small sign that keeps the first result in view while the child looks at a second plan; firstSign(null) takes it away
export function firstSign(title, plan, rows) { const el = $('first'); if (!title) { el.hidden = true; return; } el.innerHTML = `<b>${esc(title)}</b><span class="pl">${planTag(plan)}</span>${rows.map((r) => `<span>${esc(r.check)}. ${r.evidence ? `${r.evidence} ` : ''}${esc(r.text)}<i class="mark ${r.mark}">${MARK[r.mark]}</i></span>`).join('')}`; el.hidden = false; }
