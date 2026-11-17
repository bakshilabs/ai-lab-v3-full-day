// OpenAI client for the text pipeline: Chat Completions with a strict JSON schema, a request -> response cache
// (so re-runs cost nothing) and a token log. The key is never handled here: the network proxy adds it, so the
// header carries a dummy value. Cache folder: $TEXT_CACHE, or <os tmp>/ai-lab-text-cache.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1, and then the request would miss the proxy that adds
// the key: start the script again with the proxy switched on (and the proxy's CA bundle, when there is one).
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const ca = process.env.NODE_EXTRA_CA_CERTS || (fs.existsSync('/root/.ccr/ca-bundle.crt') ? '/root/.ccr/ca-bundle.crt' : undefined);
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.execArgv, ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', ...(ca ? { NODE_EXTRA_CA_CERTS: ca } : {}) } });
  process.exit(r.status ?? 1);
}

export const MODEL = process.env.TEXT_MODEL || 'gpt-5.5';
export const CACHE = process.env.TEXT_CACHE || path.join(os.tmpdir(), 'ai-lab-text-cache');
fs.mkdirSync(CACHE, { recursive: true });
const LOG = path.join(CACHE, 'tokens.jsonl');
export const usage = { requests: 0, cached: 0, prompt: 0, completion: 0, reasoning: 0 };

// chat(label, messages, schema, opts) -> parsed JSON object
export async function chat(label, messages, schema, { effort = 'medium', retries = 4 } = {}) {
  const body = { model: MODEL, messages, reasoning_effort: effort, response_format: { type: 'json_schema', json_schema: { name: schema.name, strict: true, schema: schema.schema } } };
  const hash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  const file = path.join(CACHE, `${hash}.json`);
  if (fs.existsSync(file)) { usage.cached++; return JSON.parse(fs.readFileSync(file, 'utf8')).parsed; }
  let lastErr;
  for (let a = 0; a <= retries; a++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer dummy', 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(600000) });
      const json = await res.json();
      if (!res.ok) throw new Error(`${res.status} ${json?.error?.message || ''}`.trim());
      const msg = json.choices?.[0]?.message;
      if (msg?.refusal) throw new Error(`refused: ${msg.refusal}`);
      const parsed = JSON.parse(msg.content);
      const u = json.usage || {};
      usage.requests++; usage.prompt += u.prompt_tokens || 0; usage.completion += u.completion_tokens || 0; usage.reasoning += u.completion_tokens_details?.reasoning_tokens || 0;
      fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), label, model: json.model, prompt: u.prompt_tokens, completion: u.completion_tokens, reasoning: u.completion_tokens_details?.reasoning_tokens, hash }) + '\n');
      fs.writeFileSync(file, JSON.stringify({ label, request: body, response: json, parsed }));
      return parsed;
    } catch (e) { lastErr = e; if (/^4(00|01|03|04)/.test(e.message)) break; await new Promise((r) => setTimeout(r, 2000 * 2 ** a)); }
  }
  throw new Error(`${label}: ${lastErr.message}`);
}

// all tokens ever logged in this cache folder (including earlier runs)
export function tokenTotals() {
  const t = { requests: 0, prompt: 0, completion: 0, reasoning: 0 };
  if (!fs.existsSync(LOG)) return t;
  for (const l of fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean)) { const x = JSON.parse(l); t.requests++; t.prompt += x.prompt || 0; t.completion += x.completion || 0; t.reasoning += x.reasoning || 0; }
  return t;
}

// run jobs with at most n at a time
export async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } })); return out; }
