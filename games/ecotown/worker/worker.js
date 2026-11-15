// Eco Town on Cloudflare Workers. The routes are in router.js; this file only joins them to the game files and pages.
//  - Learners: join page at "/", then the protected game (only with a valid session cookie).
//  - Leaders: /leader, with the organisation's leader code.
//  - Admin (the company): /admin, behind Cloudflare Access AND verified in router.js (Access login token).
import FILES from './files.js';
import ADMIN_HTML from './admin.html';
import LEADER_HTML from './leader.html';
import { makeHandler } from './router.js';
export { CodeStore } from './store.js';

export default { fetch: makeHandler({ files: FILES, adminHtml: ADMIN_HTML, leaderHtml: LEADER_HTML }) };
