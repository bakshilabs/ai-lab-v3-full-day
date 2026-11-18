// Shared parts of the text pipeline (extract -> rewrite with OpenAI -> check -> sheet -> apply).
// A "segment" is one piece of text a child or leader reads or hears: a JS string, a run of text inside a template
// or an HTML string, an HTML text run in a page, or a text attribute (title, aria-label, alt, placeholder).
// Each has a range in its file, a display text with named placeholders ({s.food}, {…1}, <b>, <span#1>) and the
// source each placeholder stands for, so a rewrite can be put back exactly.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
function loadAcorn() {
  for (const p of ['acorn', '/opt/node-tools/node_modules/acorn']) { try { return require(p); } catch { /* next */ } }
  throw new Error('acorn not found: run `npm i -g acorn` or set NODE_PATH to a folder that has it');
}
export const acorn = loadAcorn();
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const GAME = 'games/ecotown/game';
export const SHEET_OWNER = 'docs/feedback/2026-11-17-ecotown-text-rewrites.csv';
export const SHEET_OUT = 'docs/text/openai-rewrite.csv';

// ---- scope -------------------------------------------------------------------------------------------------------
// Another agent is changing these Eco Town files: their rewrites are generated but applied only after that merge.
export const HELD = ['js/game/game.js', 'js/game/content.js', 'js/game/twotowns.js', 'js/game/passport.js', 'js/game/spots.js', 'js/ui/passcard.js'].map((f) => `${GAME}/${f}`);
// Whole files that hold no player text, or only what Florence's word model trains on or matches against.
const SKIP_FILES = {
  'js/ai/model.js': 'Florence’s word model', 'js/ai/tokenizer.js': 'Florence’s word model', 'js/ai/brief.js': 'keyword lists Florence matches against',
  'js/ai/schema.js': 'hint words fed back into Florence’s reader', 'js/version.js': 'build id',
  'js/modules/contract.js': 'module contract: not to be edited (docs/MODULES.md)', 'js/modules/loader.js': 'module contract: not to be edited (docs/MODULES.md)',
};
// Key paths whose strings are matching inputs (trained on, matched against, or used as fixed button names).
const SKIP_KEYS = [
  [/js\/ai\/teach\.js$/, /^(DRIVER|WALKER)\b/, 'training examples for Florence’s comment sorter'],
  [/js\/ai\/plotter\.js$/, /^(KW|KEEP_W|KEEP|NO_CARS|IMPORTED|AVOIDABLE)\b/, 'keyword lists Florence matches against'],
  [/js\/ai\/targets\.js$/, /^(NUM|RULES)\b/, 'number patterns Florence matches against'],
  [/js\/game\/qa\.js$/, /^(TOPICS\.keys|SUGGEST)\b/, 'question keywords and suggested questions that Florence’s Q&A matches against'],
  [/js\/world\/catalog\.js$/, /^ITEMS\.[\w$]+\.(label|short)$/, 'build name: a button name, and matched by Florence’s Q&A'],
  [/js\/game\/content\.js$/, /\.cats\./, 'category button name'],
];
export function scopeFiles() {
  const out = [];
  const walk = (d) => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const p = `${d}/${e.name}`; if (e.isDirectory()) walk(p); else if (/\.js$/.test(e.name)) out.push(p); } };
  walk(`${GAME}/js`);
  for (const p of ['index.html', 'start.html', 'leader.html', 'trailer.html']) out.push(`${GAME}/${p}`);
  return out.sort();
}
export const rel = (f) => f.replace(`${GAME}/`, '');
export const skipFileReason = (f) => SKIP_FILES[rel(f)] || null;
export function skipKeyReason(file, keypath) { for (const [fr, kr, why] of SKIP_KEYS) if (fr.test(file) && kr.test(keypath)) return why; return null; }
export const isHeld = (f) => HELD.includes(f);

// ---- areas -------------------------------------------------------------------------------------------------------
const MODULE_NAME = { drone: 'Drone delivery', robots: 'Robot training', roads: 'Roads for self-driving cars', film: 'Town film studio', power: 'Power control room' };
export function areaOf(file) {
  const m = file.match(/js\/modules\/(\w+)\//); if (m) return `Module: ${MODULE_NAME[m[1]] || m[1]}`;
  if (/content\.js$/.test(file)) return 'Game words (content.js)';
  if (/episodes\.js$/.test(file)) return 'Story cartoons (voiced)';
  if (/leader\.html$/.test(file)) return 'Leader page';
  if (/\.html$/.test(file)) return 'Pages';
  return 'Game screens';
}
export const VERSION_LABEL = { j: 'Ages 8–12', s: 'Ages 13–17', b: 'Both or not marked' };
export const VERSION_CODE = Object.fromEntries(Object.entries(VERSION_LABEL).map(([k, v]) => [v, k]));

// ---- token streams -----------------------------------------------------------------------------------------------
// A literal's body as tokens: { c: cooked text, s, e } for characters and escapes, { x: source, s, e } for ${…}.
function cookChars(src, from, to, out) {
  let i = from;
  while (i < to) {
    if (src[i] === '\\') {
      const n = src[i + 1]; let c, len = 2;
      if (n === 'n') c = '\n'; else if (n === 't') c = '\t'; else if (n === 'r') c = '\r'; else if (n === 'b') c = '\b'; else if (n === 'f') c = '\f'; else if (n === 'v') c = '\v';
      else if (n === '0' && !/[0-9]/.test(src[i + 2])) c = '\0';
      else if (n === 'x') { c = String.fromCharCode(parseInt(src.slice(i + 2, i + 4), 16)); len = 4; }
      else if (n === 'u' && src[i + 2] === '{') { const j = src.indexOf('}', i); c = String.fromCodePoint(parseInt(src.slice(i + 3, j), 16)); len = j - i + 1; }
      else if (n === 'u') { c = String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16)); len = 6; }
      else if (n === '\r' && src[i + 2] === '\n') { c = ''; len = 3; } else if (n === '\n' || n === '\r' || n === ' ' || n === ' ') c = '';
      else c = String.fromCodePoint(src.codePointAt(i + 1)), len = 1 + c.length;
      out.push({ c, s: i, e: i + len }); i += len;
    } else { const cp = src.codePointAt(i); const ch = String.fromCodePoint(cp); out.push({ c: ch, s: i, e: i + ch.length }); i += ch.length; }
  }
}
function htmlChars(src, from, to, out) { for (let i = from; i < to;) { const ch = String.fromCodePoint(src.codePointAt(i)); out.push({ c: ch, s: i, e: i + ch.length }); i += ch.length; } }

// ---- runs: split a token stream into pieces of text --------------------------------------------------------------
const INLINE = new Set(['b', 'i', 'em', 'strong', 'span', 'br', 'kbd', 'a', 'small', 'u', 'mark', 'code', 'abbr', 'sup', 'sub', 'q', 'cite', 'bdi', 's', 'wbr']);
const RAWTEXT = new Set(['script', 'style']);
export const TEXT_ATTRS = new Set(['title', 'aria-label', 'alt', 'placeholder', 'aria-description', 'aria-roledescription', 'aria-valuetext', 'label']);
const looksHtml = (toks) => { const t = toks.map((k) => k.c ?? ' ').join(''); return /<\/?[a-zA-Z][\w-]*[\s>/]|<!--|<[a-zA-Z][\w-]*$/.test(t) && /<\/?[a-zA-Z]/.test(t); };

// -> [{ toks:[...], attr: null | quote }] ; a token in a run is a char, an expr or a tag { tag: display-key, s, e }
function splitRuns(toks, html) {
  if (!html) return [{ items: toks, attr: null }];
  const runs = []; let cur = [];
  const close = () => { if (cur.length) runs.push({ items: cur, attr: null }); cur = []; };
  let i = 0;
  while (i < toks.length) {
    const t = toks[i];
    if (t.c === '<' && toks[i + 1] && (toks[i + 1].c === '!' && toks[i + 2]?.c === '-')) { // comment
      let j = i + 1; while (j < toks.length && !(toks[j].c === '>' && toks[j - 1]?.c === '-' && toks[j - 2]?.c === '-')) j++;
      close(); i = j + 1; continue;
    }
    if (t.c === '<' && toks[i + 1] && /[a-zA-Z/!]/.test(toks[i + 1].c ?? '')) {
      // a tag: up to the matching '>' outside quotes
      let j = i + 1, q = null;
      for (; j < toks.length; j++) { const c = toks[j].c; if (c == null) continue; if (q) { if (c === q) q = null; } else if (c === '"' || c === '\'') q = c; else if (c === '>') break; }
      const tagToks = toks.slice(i, j + 1);
      const flat = tagToks.map((k) => k.c ?? '\u0001').join('');
      const m = flat.match(/^<\s*(\/?)\s*([a-zA-Z][\w-]*)/); const name = m ? m[2].toLowerCase() : '!'; const closing = !!m?.[1];
      // text attributes inside the tag become runs of their own
      const re = /([a-zA-Z-:]+)\s*=\s*(["'])/g; let am;
      let k = 0; const offs = []; for (const tk of tagToks) { offs.push(k); k += (tk.c ?? '\u0001').length; }
      const tokAt = (pos) => { let lo = 0; while (lo + 1 < offs.length && offs[lo + 1] <= pos) lo++; return lo; };
      while ((am = re.exec(flat))) {
        const q2 = am[2]; const vs = am.index + am[0].length; const ve = flat.indexOf(q2, vs); if (ve < 0) break;
        if (TEXT_ATTRS.has(am[1].toLowerCase())) { const a = tokAt(vs), b = tokAt(ve); runs.push({ items: tagToks.slice(a, b), attr: q2, attrName: am[1].toLowerCase() }); }
        re.lastIndex = ve + 1;
      }
      if (!closing && RAWTEXT.has(name)) { // skip to </script> or </style>
        close(); let e = j + 1; const want = `</${name}`;
        for (; e < toks.length; e++) { let s = ''; for (let z = e; z < Math.min(toks.length, e + want.length); z++) s += toks[z].c ?? '\u0001'; if (s.toLowerCase() === want) break; }
        i = e; continue;
      }
      if (INLINE.has(name)) cur.push({ tag: true, name, closing, toks: tagToks, s: tagToks[0].s, e: tagToks[tagToks.length - 1].e });
      else close();
      i = j + 1; continue;
    }
    cur.push(t); i++;
  }
  close();
  return runs;
}

// a run -> { display, ph:{name: source}, s, e } (trimmed), or null when it holds no letters
function runToSegment(run, src, collapse) {
  let items = run.items;
  const isSpace = (t) => t.c != null && !t.tag && /^[\s ]*$/.test(t.c) && !(collapse && false);
  let a = 0, b = items.length; while (a < b && isSpace(items[a])) a++; while (b > a && isSpace(items[b - 1])) b--;
  // a run that is only tags and spaces has nothing to say
  items = items.slice(a, b);
  // drop tags at either end that are not closed (or opened) inside the run: they belong to the page around it
  const pairOk = (arr, i) => { const t = arr[i]; let d = 0; if (t.closing) { for (let j = i - 1; j >= 0; j--) if (arr[j].tag && arr[j].name === t.name) { if (arr[j].closing) d++; else if (d-- === 0) return true; } return false; }
    for (let j = i + 1; j < arr.length; j++) if (arr[j].tag && arr[j].name === t.name) { if (!arr[j].closing) d++; else if (d-- === 0) return true; } return t.name === 'br' || t.name === 'wbr'; };
  for (let changed = true; changed && items.length;) {
    changed = false;
    if (items[0].tag && (items[0].closing || !pairOk(items, 0))) { items = items.slice(1); changed = true; }
    else if (items[items.length - 1].tag && (!items[items.length - 1].closing || !pairOk(items, items.length - 1))) { items = items.slice(0, -1); changed = true; }
    while (items.length && isSpace(items[0])) { items = items.slice(1); changed = true; }
    while (items.length && isSpace(items[items.length - 1])) { items = items.slice(0, -1); changed = true; }
  }
  if (!items.length) return null;
  const ph = {}; const bySrc = new Map(); let nx = 0; const tagN = new Map();
  let display = '';
  for (const t of items) {
    if (t.x != null) {
      const srcx = src.slice(t.s, t.e); const inner = srcx.slice(2, -1).trim();
      let name = bySrc.get(srcx);
      if (!name) { name = /^[\w$]+(\??\.[\w$]+)*$/.test(inner) && inner.length <= 28 ? inner : `…${++nx}`; if (ph[name] && ph[name] !== srcx) name = `…${++nx}`; bySrc.set(srcx, name); ph[name] = srcx; }
      display += `{${name}}`;
    } else if (t.tag) {
      const srcx = src.slice(t.s, t.e); const bare = /^<\/?\s*[a-zA-Z][\w-]*\s*\/?>$/.test(srcx);
      let key = bySrc.get(srcx);
      if (!key) { if (bare) key = t.closing ? `</${t.name}>` : `<${t.name}>`; else { const n = (tagN.get(t.name) || 0) + 1; tagN.set(t.name, n); key = t.closing ? `</${t.name}#${n}>` : `<${t.name}#${n}>`; } bySrc.set(srcx, key); ph[key] = srcx; }
      display += key;
    } else display += t.c;
  }
  if (collapse) display = display.replace(/\s+/g, ' ');
  return { display, ph, s: items[0].s, e: items[items.length - 1].e };
}

// ---- is this player text? ---------------------------------------------------------------------------------------
const STOPWORDS = new Set(['Enter', 'Escape', 'Esc', 'Tab', 'Shift', 'Space', 'Backspace', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'Control', 'Alt', 'Meta', 'Arial', 'Helvetica', 'Nunito', 'Fredoka', 'Inter', 'Georgia', 'Verdana', 'Promise', 'Array', 'Object', 'String', 'Number', 'Error', 'Map', 'Set', 'GET', 'POST', 'PUT', 'DELETE', 'Content-Type', 'Authorization', 'Mesh', 'Group', 'Isabella', 'Bella', 'Florence']);
export function isText(display) {
  const lit = display.replace(/\{[^{}]*\}/g, ' ').replace(/<\/?[a-z]+(#\d+)?>/g, ' ');
  const t = lit.replace(/\s+/g, ' ').trim();
  if (!/[A-Za-z]{2}/.test(t.replace(/&#?\w+;/g, ''))) return false; // no words (entities such as &gt; are not words)
  if (/\b(void main|uniform |varying |gl_|vec[234]\(|texture2D|#include|precision (high|medium|low)p)/.test(t)) return false; // GLSL
  if (/[{};]/.test(t) && /[a-z-]+\s*:\s*[^ ]/.test(t)) return false; // CSS
  if (/^[@.#[:*>]/.test(t) && /[{}\[\]=:#.]/.test(t) && !/ [a-z]+ [a-z]+ /.test(t)) return false; // selectors
  if (/https?:\/\/|\b[\w-]+\.(js|mjs|png|jpe?g|mp4|webm|json|svg|bin|css|mp3|glb|vtt|html|webp|wav|ogg)\b/.test(t) && !/ [a-z]+ [a-z]+ [a-z]+ /.test(t)) return false;
  if (/^[a-z-]+\(.*\)$/.test(t)) return false; // CSS functions
  if (/\b\d+(\.\d+)?(px|rem|vh|vw|deg|ms)\b/.test(t) && !/[a-z]{3,} [a-z]{3,} [a-z]{3,}/i.test(t)) return false;
  if (!/\s/.test(t)) {
    if (STOPWORDS.has(t)) return false;
    if (/^[a-z0-9_$.\-\/:#@]+$/.test(t)) return false; // identifiers, single lowercase words
    if (/[a-z][A-Z]|_|^[A-Z0-9-]+$/.test(t) && !/^[A-Z][a-z]+[!.?…:]?$/.test(t)) return false; // camelCase, CONSTANTS
    if (/[=\[\](){}\/\\]/.test(t)) return false;
  }
  if (/^[\w-]+(\s+[\w-]+)*$/.test(t) && /^(?:[a-z]+-)+[a-z]+(?:\s+(?:[a-z]+-)+[a-z]+)+$/.test(t)) return false; // class lists
  if (/^(?:[a-z][\w-]*\s+)+[a-z][\w-]*$/.test(t) && t.split(/\s+/).every((w) => /-|\d/.test(w))) return false;
  if (/^[MLHVCSQTAZmlhvcsqtaz0-9.,\s-]+$/.test(t)) return false; // SVG paths
  return true;
}

// ---- JS ----------------------------------------------------------------------------------------------------------
const SKIP_CALLS = new Set(['querySelector', 'querySelectorAll', 'getElementById', 'getElementsByClassName', 'getElementsByTagName', 'closest', 'matches', 'add', 'remove', 'toggle', 'contains', 'replace', 'addEventListener', 'removeEventListener', 'getAttribute', 'removeAttribute', 'hasAttribute', 'toggleAttribute', 'createElement', 'createElementNS', 'getItem', 'setItem', 'removeItem', 'fetch', 'log', 'warn', 'error', 'info', 'debug', 'getContext', 'dispatchEvent', 'CustomEvent', 'Event', 'postMessage', 'setProperty', 'getPropertyValue', 'removeProperty', 'require', 'Error', 'TypeError', 'RangeError', 'RegExp', 'startsWith', 'endsWith', 'includes', 'indexOf', 'lastIndexOf', 'split', 'replaceAll', 'join', 'padStart', 'padEnd', 'Audio', 'Image', 'URL', 'Worker', 'URLSearchParams', 'canPlayType', 'getByName', 'getObjectByName', 'matchMedia', 'has', 'delete', 'load', 'loadAsync', 'import', 'mark', 'measure', 'createLinearGradient', 'insertAdjacentElement', 'scrollIntoView', 'Blob', 'File', 'atob', 'btoa', 'encodeURIComponent', 'decodeURIComponent', 'setPointerCapture', 'focus', 'animate', 'Intl', 'NumberFormat', 'DateTimeFormat', 'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString', 'localeCompare', 'open', 'execCommand', 'getElementsByName', 'cssVar', 'css', 'el$', '$', '$$', 'q', 'qa', 'on', 'off', 'emit', 'track', 'beacon', 'sendBeacon', 'set', 'get', 'setMusic', 'sfx', 'play', 'tone', 'beep', 'cue', 'clip', 'video', 'Color', 'color', 'colour', 'tex', 'mat', 'material', 'font', 'go', 'gotoScene', 'scene', 'anim', 'pose', 'mood', 'face', 'gesture', 'act', 'icon']);
const SKIP_PROPS = /^(css|style|styles|svg|icon|icons|cls|className|class|classes|id|ids|key|keys|selector|sel|font|fill|stroke|path|d|src|href|url|file|files|mood|anim|ease|color|colour|colours|colors|bg|background|shadow|transform|filter|viewBox|points|type|kind|mode|dir|lang|role|zone|mark|item|pic|shape|feel|sub|state|bin|mod|mods|tag|tags|el|event|events|music|sound|sounds|video|videos|voice|clip|clips|gesture|pose|face|act|action|data|slot|slots|field|name|ns|attr|attrs|aria|tex|texture|material|mat|cursor|easing|unit)$/;
const LIVE_PROPS = /^(textContent|innerHTML|innerText|outerHTML|title|placeholder|alt|ariaLabel|value|label|text)$/;
const calleeName = (c) => c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && !c.computed ? c.property.name : c.type === 'Super' ? 'super' : null;
const keyName = (p) => p.key.type === 'Identifier' ? p.key.name : p.key.type === 'Literal' ? String(p.key.value) : p.key.type === 'PrivateIdentifier' ? p.key.name : null;
const JUNIOR_TEST = (src) => { let t = src.replace(/\s+/g, ''); let neg = false; while (/^!|^\(.*\)$/.test(t)) { if (t[0] === '!') { neg = !neg; t = t.slice(1); } else t = t.slice(1, -1); }
  if (/^([\w$]+\.)*(j|junior|isJunior|jr|J|young|kid|kids)$/.test(t) || /band===['"]junior['"]|['"]junior['"]===band/.test(t)) return neg ? 's' : 'j';
  if (/^([\w$]+\.)*(senior|isSenior|S)$/.test(t) || /band===['"]senior['"]|['"]senior['"]===band/.test(t)) return neg ? 'j' : 's';
  return null; };

function visit(node, anc, fn) {
  if (!node || typeof node.type !== 'string') return;
  if (fn(node, anc) === false) return;
  anc.push(node);
  for (const k of Object.keys(node)) { if (k === 'loc' || k === 'start' || k === 'end') continue; const v = node[k];
    if (Array.isArray(v)) { for (const x of v) if (x && typeof x.type === 'string') visit(x, anc, fn); } else if (v && typeof v.type === 'string') visit(v, anc, fn); }
  anc.pop();
}

// context of a literal: { skip: reason | null, keypath, version, litStart, litEnd }
function contextOf(node, anc, src, aliases = {}) {
  const parent = anc[anc.length - 1];
  let skip = null;
  if (parent) {
    if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].includes(parent.type) && parent.source === node) skip = 'code';
    else if (parent.type === 'Property' && parent.key === node) skip = 'code';
    else if (parent.type === 'MemberExpression' && parent.property === node) skip = 'code';
    else if (parent.type === 'BinaryExpression' && ['===', '!==', '==', '!=', 'in', 'instanceof'].includes(parent.operator)) skip = 'code';
    else if (parent.type === 'SwitchCase' && parent.test === node) skip = 'code';
    else if ((parent.type === 'CallExpression' || parent.type === 'NewExpression') && parent.arguments.includes(node)) {
      const n = calleeName(parent.callee); const ix = parent.arguments.indexOf(node);
      if (n === 'setAttribute') { const a0 = parent.arguments[0]; if (ix === 0 || !(a0?.type === 'Literal' && TEXT_ATTRS.has(String(a0.value)))) skip = 'code'; }
      else if (n && SKIP_CALLS.has(n)) skip = 'code';
    } else if (parent.type === 'AssignmentExpression' && parent.right === node && parent.left.type === 'MemberExpression') {
      const p = parent.left.property; const pn = !parent.left.computed && p.type === 'Identifier' ? p.name : null;
      if (pn && !LIVE_PROPS.test(pn) && (SKIP_PROPS.test(pn) || /style/.test(src.slice(parent.left.start, parent.left.end)))) skip = 'code';
    }
  }
  // key path and age version
  const names = []; let version = null;
  for (let i = 0; i < anc.length; i++) {
    const a = anc[i]; const c = anc[i + 1] || node;
    if (a.type === 'VariableDeclarator' && a.init === c && a.id.type === 'Identifier') names.push(a.id.name);
    else if (a.type === 'FunctionDeclaration' && a.id) names.push(`${a.id.name}()`);
    else if ((a.type === 'Property' || a.type === 'MethodDefinition' || a.type === 'PropertyDefinition') && a.value === c) { const k = keyName(a); if (k != null && !/^\d+$/.test(k)) names.push(k); if (k === 'j' || k === 'junior') version = 'j'; else if (k === 's' || k === 'senior') version = 's'; }
    else if ((a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression') && names.length && !names[names.length - 1].endsWith('()')) names[names.length - 1] += '()';
    else if (a.type === 'CallExpression' && a.arguments.indexOf(c) >= 1 && src.slice(a.callee.start, a.callee.end) === 'Object.assign') {
      // Object.assign(J, { … }) with const J = SANDBOX.junior: the keys belong to SANDBOX.junior (and to that age band)
      let t = src.slice(a.arguments[0].start, a.arguments[0].end).replace(/\s+/g, ''); const head = t.split('.')[0]; if (aliases[head]) t = aliases[head] + t.slice(head.length);
      names.push(t); const parts = t.split('.'); if (parts.includes('junior') || parts.includes('j')) version = 'j'; else if (parts.includes('senior') || parts.includes('s')) version = 's';
    }
    else if (a.type === 'AssignmentExpression' && a.right === c) names.push(src.slice(a.left.start, a.left.end).replace(/\s+/g, '').slice(0, 40));
    else if (a.type === 'ConditionalExpression' && (a.consequent === c || a.alternate === c)) { const v = JUNIOR_TEST(src.slice(a.test.start, a.test.end)); if (v) version = a.consequent === c ? v : (v === 'j' ? 's' : 'j'); }
    else if (a.type === 'LogicalExpression' && a.right === c && a.operator === '&&') { const v = JUNIOR_TEST(src.slice(a.left.start, a.left.end)); if (v) version = v; }
    else if (a.type === 'IfStatement' && (a.consequent === c || a.alternate === c)) { const v = JUNIOR_TEST(src.slice(a.test.start, a.test.end)); if (v) version = a.consequent === c ? v : (v === 'j' ? 's' : 'j'); }
    if ((a.type === 'Property') && a.value === c) { const k = keyName(a); if (k && SKIP_PROPS.test(k) && !skip) skip = 'code'; }
  }
  const keypath = names.join('.').replace(/\.\(\)/g, '()') || '(top)';
  return { skip, keypath, version: version || 'b' };
}

export function lineAt(src, pos) { let n = 1; for (let i = 0; i < pos; i++) if (src.charCodeAt(i) === 10) n++; return n; }

// All segments in JS source (base: offset of this code inside its file, for inline scripts)
export function jsSegments(code, base = 0, fileSrc = code) {
  const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true, allowReturnOutsideFunction: true });
  const segs = []; const regexWords = [];
  // const J = SANDBOX.junior: names that stand for an object path (used to name Object.assign targets)
  const aliases = {};
  visit(ast, [], (node) => { if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && node.init?.type === 'MemberExpression' && !node.init.computed) aliases[node.id.name] = code.slice(node.init.start, node.init.end).replace(/\s+/g, ''); });
  visit(ast, [], (node, anc) => {
    if (node.type === 'Literal' && node.regex) { if (/^[A-Za-z’' ,]+$/.test(node.regex.pattern) && / /.test(node.regex.pattern)) regexWords.push(new RegExp(node.regex.pattern, node.regex.flags.replace('g', ''))); return; }
    const isStr = node.type === 'Literal' && typeof node.value === 'string';
    const isTpl = node.type === 'TemplateLiteral' && anc[anc.length - 1]?.type !== 'TaggedTemplateExpression';
    if (!isStr && !isTpl) return;
    const toks = [];
    if (isStr) cookChars(code, node.start + 1, node.end - 1, toks);
    else node.quasis.forEach((q, i) => { cookChars(code, q.start, q.end, toks); if (i < node.expressions.length) toks.push({ x: true, s: q.end, e: node.quasis[i + 1].start }); });
    const ctx = contextOf(node, anc, code, aliases);
    const js = isStr ? (code[node.start] === '"' ? 'dq' : 'sq') : 'tpl';
    const html = looksHtml(toks);
    for (const run of splitRuns(toks, html)) {
      const seg = runToSegment(run, code, html);
      if (!seg || !isText(seg.display)) continue;
      segs.push({ ...seg, s: seg.s + base, e: seg.e + base, litStart: node.start + base, litEnd: node.end + base, js, html, attr: run.attr || null, attrName: run.attrName || null,
        keypath: run.attr ? `${ctx.keypath}[${run.attrName}]` : ctx.keypath, version: ctx.version, skip: ctx.skip, ph: Object.fromEntries(Object.entries(seg.ph).map(([k, v]) => [k, v])) });
    }
  });
  for (const sg of segs) if (!sg.skip && regexWords.some((re) => re.test(sg.display))) sg.skip = 'matched by code (a regular expression in this file tests this wording)';
  return segs;
}

// All segments in an HTML page (text runs, text attributes, <title>, and strings in inline scripts)
export function htmlSegments(src) {
  const toks = []; htmlChars(src, 0, src.length, toks);
  // splitRuns skips <script>/<style>; <title> text is a run because title is a block tag here
  const segs = [];
  for (const run of splitRuns(toks, true)) {
    const seg = runToSegment(run, src, true);
    if (!seg || !isText(seg.display)) continue;
    segs.push({ ...seg, js: null, html: true, attr: run.attr || null, attrName: run.attrName || null, keypath: null, version: 'b', skip: null, litStart: seg.s, litEnd: seg.e });
  }
  // key path for page text: the nearest id or section heading before it
  for (const sg of segs) {
    const before = src.slice(0, sg.s); const id = [...before.matchAll(/<(\w+)[^>]*\sid="([^"]+)"/g)].pop();
    sg.keypath = `page${id ? `#${id[2]}` : ''}${sg.attr ? `[${sg.attrName}]` : ''}`;
  }
  for (const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc=|type="application\/(ld\+)?json"/.test(m[1])) continue;
    const base = m.index + m[0].indexOf('>') + 1;
    try { for (const sg of jsSegments(m[2], base, src)) segs.push({ ...sg, keypath: `script.${sg.keypath}` }); } catch (e) { segs.push({ error: `inline script: ${e.message}` }); }
  }
  return segs.filter((s) => !s.error).sort((a, b) => a.s - b.s);
}

export function segmentsOf(file, src = fs.readFileSync(path.join(ROOT, file), 'utf8')) {
  const segs = file.endsWith('.html') ? htmlSegments(src) : jsSegments(src);
  for (const s of segs) { s.file = file; s.line = lineAt(src, s.s); }
  return segs;
}

// ---- putting a rewrite back --------------------------------------------------------------------------------------
const TOKEN_RE = /<\/?[a-z]+(?:#\d+)?>|\{[^{}]+\}/g;
export const tokensOf = (text) => (text.match(TOKEN_RE) || []);
// display text -> source text for the segment's range, or throws with a reason
export function toSource(seg, text) {
  let out = ''; let last = 0;
  const lit = (piece) => {
    if (seg.html && /[<>]/.test(piece)) throw new Error('has a < or > outside the tags');
    if (seg.attr && piece.includes(seg.attr)) throw new Error(`has a ${seg.attr} inside an attribute`);
    if (/[{}]/.test(piece)) throw new Error('has a { or } that is not a placeholder');
    let p = piece;
    if (seg.js === 'sq') p = p.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n');
    else if (seg.js === 'dq') p = p.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    else if (seg.js === 'tpl') p = p.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    return p;
  };
  for (const m of text.matchAll(TOKEN_RE)) {
    const key = m[0].startsWith('{') ? m[0].slice(1, -1) : m[0];
    if (!(key in seg.ph)) { // a {name} written in a plain string, filled in later by the code (.replace('{n}', …))
      if (m[0].startsWith('{') && seg.display.includes(m[0])) { out += lit(text.slice(last, m.index)) + m[0]; last = m.index + m[0].length; continue; }
      throw new Error(`unknown placeholder ${m[0]}`);
    }
    out += lit(text.slice(last, m.index)) + seg.ph[key]; last = m.index + m[0].length;
  }
  return out + lit(text.slice(last));
}
// the literal with the new text in place parses as one JS expression (catches quote and escape mistakes)
export function validInJs(seg, fileSrc, text) {
  if (!seg.js) return true;
  const litSrc = fileSrc.slice(seg.litStart, seg.litEnd);
  const newLit = litSrc.slice(0, seg.s - seg.litStart) + toSource(seg, text) + litSrc.slice(seg.e - seg.litStart);
  const node = acorn.parseExpressionAt(newLit, 0, { ecmaVersion: 'latest', sourceType: 'module' });
  if (node.end !== newLit.length) throw new Error('the string ends early: a quote is not escaped');
  if (node.type === 'Literal' && seg.js !== 'tpl') { const want = text.replace(TOKEN_RE, (t) => seg.ph[t.startsWith('{') ? t.slice(1, -1) : t] ?? t); if (!seg.html && node.value.slice(seg.s - seg.litStart - 1, seg.s - seg.litStart - 1 + want.length) !== want) throw new Error('the string reads back differently'); }
  return true;
}

// ---- normalising for matching ------------------------------------------------------------------------------------
export const normText = (t) => String(t || '').replace(/\{[^{}]*\}/g, '{}').replace(/<\/?[a-z]+(#\d+)?>/g, '').replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

// ---- CSV ---------------------------------------------------------------------------------------------------------
export function parseCsv(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
export const csvLine = (cells) => cells.map((c) => { const s = String(c ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',');
export const COLS = ['ID', 'Area', 'Version', 'File', 'Line', 'Where in code', 'Current text', 'New text', 'Notes'];
export function readSheet(file) {
  const [head, ...rows] = parseCsv(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
