// CodeStore: a SQLite-backed Durable Object. The same class is used two ways (see codes.js):
//  - one object named "main" is the directory: which organisation a join code or a leader code belongs to;
//  - one object named "org:<id>" per organisation holds its groups, learners and progress, and nothing else.
// Every request for an organisation goes through its one object, so seats and "one device per badge" are exact.
import { DurableObject } from 'cloudflare:workers';
import { createCodeStore } from './codes.js';

export class CodeStore extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.s = createCodeStore(ctx.storage); }
  // RPC: call('dir' | 'org', method, ...args) from the Worker
  async call(kind, method, ...args) {
    const r = await this.s.call(kind, method, ...args);
    // retention also runs once a day by alarm, for an organisation that nobody visits after it ends
    if (kind === 'org' && (method === 'init' || method === 'join') && (await this.ctx.storage.getAlarm()) === null) await this.ctx.storage.setAlarm(Date.now() + 86400e3);
    return r;
  }
  async alarm() {
    await this.s.purge(Date.now());
    if (await this.ctx.storage.get('org')) await this.ctx.storage.setAlarm(Date.now() + 86400e3);
  }
}
