# Eco Town: plan for a one-hour pilot

**Draft 1, 14 November 2026.** Written in answer to the implementation brief of the same date (section 22: audit, target design, work plan, questions). Nothing has been changed in the game or on the live site. The user will revise the brief after reading this; treat this file as a proposal until then.

**What was inspected:** all the code in `games/ecotown/` (copy of `bakshilabs/ai-lab-v3` at `a5fd92c`) and the live Cloudflare account, read-only. **What was not:** the two Google documents named in the brief (this session cannot open them) and the original repository.

---

## In short

1. **The live site has one environment.** Every deploy overwrites the worker `ecotown` at the existing address. There is no development copy and no version number anywhere in the game.
2. **A login today is one passcode for one device.** The server knows the code and nothing else. All progress lives in the browser. The server has no idea of an organisation, a group or a learner.
3. **Progress survives a refresh,** because it is in the browser's storage. It does not survive a change of device, cleared storage or a private window, and two children on one browser share one town.
4. **No child data leaves the device.** Florence's model runs in the browser. Nothing typed is sent anywhere. This is a strength to keep.
5. **The pass/fail defects are real and specific.** Eleven are listed in A7. The cause is that rules are checked in five different places.
6. **Scale is not the problem; one rule is.** The game is static files plus one small request a minute, so 1,000 learners is a light load. But ten wrong passcodes from one school's shared internet address lock the whole school out for ten minutes.

---

## A. What exists today

### A1. Deployments and addresses

| | Finding |
|---|---|
| Live address | `ecotown.deltaops.workers.dev`, one Cloudflare Worker named `ecotown`. |
| How it deploys | `worker/deploy.mjs` uploads the built game straight over that worker with one API call. No branch or environment is involved. Preview addresses are off. |
| Last deploy | 11 Nov 2026, 23:55 UTC (Cloudflare version `0faf2936`). Ten earlier versions are kept by Cloudflare and can be rolled back to. |
| Storage | One passcode store (Durable Object `CodeStore`, a single instance called `main`) and one media store (KV `ecotown-voice`: voices, pictures, films). Both are tied to the one worker. |
| Second site | `bakshilabs.github.io/ai-lab-v3`: public, no login, republished from the original repository on every push to `main`. It is a live development build that anyone can open. |
| Version label | None in the game, the page or the server. Feedback cannot be tied to a build. |
| This repository | A copy made for the full-day club. Its deploy script is switched off and its rules forbid deploying to the live address. See question D1. |
| Leftover | An empty Pages project `ecotown.pages.dev`. |

### A2. Logging in and sessions (`worker/codes.js`, `worker/worker.js`)

- **A login is a passcode** such as `OTTER-1234`. The company makes codes in batches at `/admin`. A batch has a free-text "school" name, a note, a start date, an end date and up to 500 codes.
- **One code, one device.** A new login with the same code replaces the earlier one ("newest login wins"). The earlier device sees a lock card within a minute. A code cannot be shared by a class.
- **Session:** a cookie lasting 30 days. The game asks the server once a minute whether the session is still good. There is no log-out button except on the lock card.
- **Dates** are whole days in UTC. An expired or switched-off batch shows a message and nothing else.
- **No passwords, no reset, no email.** A lost code means asking the company.
- **Wrong-code limit:** ten failures in ten minutes per internet address, after which every attempt from that address is refused, correct codes included. A school or club normally shares one address. This is the most likely thing to spoil a pilot session.
- **Limit records are never deleted,** so internet addresses are kept for ever.
- **A test back door is in the code** (`X-Admin-Test-Key`). It is inactive: the live worker has no such secret. It should be removed.

### A3. Roles

Two exist: the company (admin, behind Cloudflare Access, one named person) and a player holding a code. There is no facilitator role and no organisation admin. The admin sees every batch of every customer on one page, with counts of codes used and active now.

### A4. Where progress lives

Everything is in the browser's `localStorage`. The server stores no progress.

| Key | Holds |
|---|---|
| `ecotown.save.v3` | The town, stars, badges, town name, the child's typed instructions, diary, reflection, mission progress. |
| `ecotown.save.v3.<id>` | One save per challenge town or island town. |
| `ecotown.best.v1` | The device's record: best score, passport points, medals. |
| `ecotown.wall.v1` | The club wall: up to 60 town codes. |
| `ecotown.prefs` | Settings. |

| If the learner… | What happens |
|---|---|
| refreshes | The town is kept. Lost: anything since the last save (there is no save on leaving the page) and a mission in progress on the practice island. |
| closes the browser | Same as a refresh. |
| is logged out or locked | Progress stays on the device. |
| moves to another device | Starts from nothing. The first device is locked out. |
| shares a browser with another child | One shared town. "Start a new town" deletes the other child's. |
| comes back tomorrow, same device | The town is there, if storage was not cleared. |
| has storage cleared or blocked | Everything is gone, silently. |
| plays across a new deploy | The save is read as it is. There is no version check or upgrade step; only a change of key name would drop old saves. |

### A5. Separation between customers

There is none in the data. A batch's "school" is a label. Every code of every customer sits in one store, and code names are drawn from one pool. No learner can see another's data, but only because no learner data reaches the server at all.

### A6. Facilitator and sharing features

- **Leader's page** (`game/leader.html`): a static printable page. It shows no learners.
- **"Class mode":** a start-screen switch that puts the missions in order. It does not connect devices.
- **Classroom:** a room inside the game where the child asks Florence questions. Answers come from a fixed list on the device.
- **Town codes, QR, postcard, visit:** a town is packed into a code on the device and typed or scanned on another. No server, no free text, no typed names. The code does appear in the page address when a visit is opened by link.
- **Club wall:** a list kept on one device. Not shared, not scoped, not on the server.
- **Camera scan** is blocked by the site's own security header, so that button cannot work on the live site.
- **No live view of learners exists** in any form.

### A7. Pass/fail rules

Rules are decided in five places: mission `pass` functions (`game/levels.js`), the check and retry flow (`game/game.js`), town goals (`game/progress.js`), challenges (`game/challenges.js`) and the report (`game/report.js`). They disagree in these ways.

| # | Defect | Where |
|---|---|---|
| 1 | **A walk target the child wrote is not enforced.** Ask for 10 minutes, get 12: the lens says "not met", yet the mission passes with its "clear first time" star. Only the town's 15 is checked. | `levels.js` school mission; `game.js` `checkAct` |
| 2 | **A carbon or number target the child wrote is display-only.** "Below 50 t" with 60 t still passes. | `ai/targets.js` `checkTargets`; `game.js` |
| 3 | **A town-meeting choice can break the 70 t homes limit** and the mission still completes with its stars after a warning card. | `game.js`, meeting then reward |
| 4 | **Carbon is rounded before it is compared:** 160.4 t passes a 160 t limit. | `sim/sim.js` |
| 5 | **"Under 160 t"** in the junior text is checked as "160 or less". | `content.js`, `sim.js` |
| 6 | **The homes mission counts flooded homes** towards 40 families; the town goal does not. | `levels.js` |
| 7 | **The 70 t homes limit is not a town goal.** A town over it still reaches "Town complete"; only the report marks it. | `progress.js` |
| 8 | **Success never goes back.** Town complete, badges and medals stay when a later build breaks the rule, with nothing saying so. | `game.js` |
| 9 | **A passed challenge earns bronze even below the bronze score.** | `challenges.js` |
| 10 | **The report disagrees with the goals:** nature shows a tick without the bees and deer the goal needs; families are shown including flooded ones. | `report.js` |
| 11 | **The school mission passes with no homes** (the longest walk is then 0), and only the first school is ever measured. | `levels.js`, `sim.js` |

Tests cover the 15/16-minute and 160/161 t edges, but several test a copy of the rule, not the rule itself, and none covers items 1–3, 6, 8 or 11.

### A8. Finding the next step

- A "next step" line and bar exist. For carbon and walking the bar's numbers quietly switch to "goals met out of 8", and for some challenges they are an invented figure. The bar has no visible label.
- The star count is stars left to spend, not stars earned.
- Several buttons reload the page (challenge towns, another island, start again).
- A recap exists (`game/finale.js`) but appears only once, after all six missions and a complete town. A one-hour session will rarely reach it.

### A9. Load

- The game is static files. Florence runs on the device. There are no model or outside API calls.
- Per learner the server sees: one login, about a hundred file requests at first load (files with fixed names are then kept by the browser for a week), and one check a minute.
- Every check goes through the single passcode store. At 1,000 learners that is about 17 requests a second, far below what one store handles.
- **What would fail first, in order:** the shared-address lockout (A2); the account's daily request allowance if it is on Cloudflare's free plan (not confirmed, see D4); admin pages that read every code on each view, once codes number in the tens of thousands.
- **Nothing has been load-tested.** The figures above are reasoning from the design, not measurements.

### A10. Privacy and data

| | Finding |
|---|---|
| Sent to the server | The passcode at login; a cookie on each request. Nothing else. |
| Typed by the child | Town name, mission instructions, questions to Florence, a comment, a reflection. All stay on the device. |
| Stored on the server | Per code: batch, last login time, login count. Per internet address: failed-login count, kept for ever. |
| Outside services | None. The site's security header forbids them. |
| Link to a real child | Only if the company or facilitator keeps a list of who had which code. |
| Shared towns | Carry tiles, score and a preset name only. |

---

## B. Proposed design

Kept as small as the brief's questions allow, on the Cloudflare set-up already in use.

### B1. Two environments, one code base

| | External test | Development |
|---|---|---|
| Address | `ecotown.deltaops.workers.dev` (unchanged) | new worker `ecotown-dev` at `ecotown-dev.deltaops.workers.dev` |
| Changes | Only by an agreed promotion | Freely |
| Passcode store and media store | Its own (as now) | Its own, separate |
| Deploy | `deploy.mjs --env test`, which demands a typed confirmation and a version number | `deploy.mjs --env dev` |

- **Version stamp:** the build writes a version, the commit and the date into the game. Shown small in the menu and at `/version`. Recorded with each release in `docs/RELEASES.md` with fixes and known issues.
- **Freeze now:** record the live build as version 1.0 (Cloudflare version `0faf2936`, 11 Nov). Rollback is already possible through Cloudflare.
- **Public test site:** it republishes on every push, so it is a second moving target. Either stop the automatic publishing or tell testers not to use it (D3).

### B2. Organisation, group, learner

```
Platform (the company)
└── Organisation        a paying customer: name, licence dates, seat limit
    └── Group           a class, club session or camp day: join code, dates
        └── Learner     one child's place in a group: random id, progress
```

- **Join code** (for example `OTTER-1234`): shared by the whole group. Typed once per device.
- **Learner:** on first entry the server makes a random learner id and gives the device a session for it. Twenty children typing the same join code become twenty separate learners.
- **Badge:** each learner is shown a made-up label ("Heron 7"). It is how a facilitator refers to them and how a child gets back in on another device. No real name is asked for or stored.
- **Seats:** a group stops accepting new learners at the organisation's limit. The limit counts learners, not devices.
- **Licence end:** the group's join code stops working and learners see the existing "access has ended" message. Progress is kept for the retention period, then deleted.
- **Today's test codes keep working.** Each becomes a group of one seat, so nothing is taken away from current testers.

**Roles**

| Role | How they get in | Can see |
|---|---|---|
| Platform admin | Cloudflare Access (as now) | All organisations, groups, seat use, technical counts. |
| Facilitator | A leader code for their organisation | Their own groups: join code, list of badges with stage and status. Nothing from another organisation. |
| Learner | Join code | Their own town only. |

An organisation admin separate from the facilitator is not needed for a pilot; the leader code covers both.

**Storage:** one small directory (join code → organisation) and one store per organisation holding its groups, learners and progress. Customers' data are then physically separate, and no single store carries everyone's traffic. This replaces the single `main` store; existing batches are copied across once.

### B3. Saving and resuming

- **The device stays the main copy.** The game keeps saving to the browser, now under a key that includes the learner id, so two children on one browser no longer share a town.
- **A copy goes to the server** shortly after each save and when the page is hidden or closed. On start the game takes whichever copy is newer.
- **What the copy holds:** organisation, group, learner id, module, stage, the town's tiles, stars, mission progress, times. **Not** the child's typed text or town name: those stay on the device, so the server holds nothing a child wrote.
- **A mission in progress** is saved at each step, so a refresh returns to the same mission step and not to the town.
- **Save version:** each save carries the build version, and the game refuses to load a save from a newer build than itself.
- **Another device:** join code plus badge restores the server copy (typed text excepted). Built in the pilot phase only if needed; the design allows it without rework.
- **Retention:** learner records are deleted 30 days after the group's end date, and at once when the company deletes a group. Failed-login records are deleted after a day.

### B4. One set of rules

A single module, `js/game/criteria.js`, owns every target.

- Each mission, town goal and challenge lists its conditions as data: what is measured, the limit, and whether "under" or "at most".
- One function returns, for each condition, the true value, the limit and met or not, and an overall result of **met**, **partly met** or **not met**.
- Missions, the goals list, the report, badges, medals and the facilitator's list all read that result. None does its own comparison.
- Values are compared unrounded and shown to the precision that was compared.
- **A target the child wrote counts.** Missing it is "partly met": the town's rule holds, the child's own target does not. No first-time star, and the revise step is offered.
- **Every limit shown to a child is checked,** and every checked limit is shown.
- **Results are live.** If a later build breaks a goal, the town shows "was complete; now over on carbon". Badges already earned are kept.

---

## C. Work plan

In the brief's order. Each step is deployed to development only.

### P0: now

| # | Change | Files | Smallest version | Risk | Done when |
|---|---|---|---|---|---|
| 1 | **Freeze and split.** Development worker, separate stores, version stamp, release log. | `worker/deploy.mjs`, `build.mjs`, `main.js` (menu line), `worker/worker.js` (`/version`), new `docs/RELEASES.md` | As B1. | Low. The live worker is not touched. A wrong `--env` is the one danger, hence the typed confirmation. | Development address serves the game with its own codes. Live address still reports version 1.0 and its Cloudflare version is unchanged. |
| 2 | **Fix the rules.** | new `js/game/criteria.js`; `levels.js`, `progress.js`, `challenges.js`, `report.js`, `game.js`, `sim/sim.js`, `ai/targets.js`, `content.js` | As B4, covering all eleven defects in A7. | Medium. Stricter rules could make a mission impossible; the existing recipe tests that build every mission and challenge guard against that. | New tests: walk 15 passes and 16 fails through the real rule; carbon 160.0 passes, 160.4 fails; a child's 10-minute target with a 12-minute plan is "partly met" with no star; a meeting that breaks 70 t blocks completion until fixed; two limits at once; a fix turns "not met" into "met" and the saved state agrees. All 250 present tests still pass. |
| 3 | **Refresh safety.** | `game.js` (save points, learner-scoped key), `main.js` | Save on page hide; save mission step; version in the save. | Low. Old saves must still load: tested with saves from version 1.0. | Refresh at any of the main steps of a mission returns to that step. A version 1.0 save opens unchanged. |
| 4 | **Groups and learners.** | `worker/codes.js`, `worker/store.js`, `worker/worker.js`, `worker/admin.html`, `tests/codes.test.mjs` | As B2, without the facilitator page. Wrong-code limit moved from "per address" to "per address and code", with a higher ceiling per address. Back door removed. | Medium to high: this replaces the store's layout. Built and proven on development first; live data is copied only at promotion, with the old store kept. | Twenty learners on one join code get twenty ids and twenty separate towns. A learner of one organisation cannot read anything of another (tested by trying). A 21st learner on a 20-seat group is refused with a clear message. Thirty wrong codes from one address do not block a correct one. Old single codes still work. |
| 5 | **Server copy of progress.** | `worker/worker.js`, `worker/store.js`, `game.js` | As B3. | Medium. A bad merge could overwrite a newer town: newest-wins by save time, and the device copy is never deleted. | Storage cleared on a device, then join code and badge: the town returns. Typed text is absent from every server record (checked by reading the store). |
| 6 | **Load test.** | new `tests/load/` | A script that plays the server's part of N learners against development: join, load files, check in each minute, save every 30 seconds. Run at 20, 100 and 1,000. | Low. Never pointed at the live address. | A table in `docs/LOAD.md`: success rate, errors, response times, store behaviour, and cost from Cloudflare's own figures. A claim about 1,000 is made only if the run supports it. |

### P1: before children use it

| # | Change | Files | Smallest version | Done when |
|---|---|---|---|---|
| 7 | **Next step is always plain.** | `game.js` (`nextStep`), `ui/ui.js`, `content.js`, `css/game.css` | One next-step line with a number that always means "this goal: now / needed". The next button to press pulses. Buttons that reload the page say where they go and return to the same town. Stars shown as earned. | A no-context play-through never stops for more than 20 seconds without a marked next action, on laptop and tablet. |
| 8 | **Weak choices show.** | `game.js`, `advisor.js`, `criteria.js` | For each important choice: the consequence appears in the town (flooded homes, dark windows, a long walk shown on the street), the failed condition is named, one tap opens the revise step, and the result changes. | Each of the six missions has a tested "wrong choice → named failure → fix → met" path. |
| 9 | **One-hour session.** | `game.js`, `main.js`, `content.js` | A "session" setting chosen by the facilitator: the town plus a set of missions sized for an hour (proposed: three; see D5), two natural pause points, and a finish. No timers that block. Faster children carry on into the remaining missions. | A hint-following play-through reaches the finish in 45 to 60 minutes. |
| 10 | **Facilitator cues and run sheet.** | `game/leader.html`, `LAB-GUIDE.md`, `game.js` | The leader's page rewritten as a one-hour run sheet: aim, timings, the question for each pause, common mistakes, where Florence is wrong on purpose, what a good answer sounds like, how to help without telling. In the game, two skippable "pause and talk" cards, off in self-directed use. | A facilitator who has never seen the code can run the hour from one printed page. |
| 11 | **Group status list.** | `worker/worker.js`, new `worker/leader.html` | One page behind the leader code: each badge with stage, minutes since last change, "needs help" (no progress for five minutes, or the same check failed three times), "a limit is missed", "finished". Refreshes each minute. No charts. | With five test learners the list matches what each screen shows within a minute, and shows nothing from another organisation. |
| 12 | **Recap at the finish.** | `game/finale.js`, `ui/rewards.js` | "You practised" built from the learner's own record (mistakes caught, plans fixed, a missed limit put right), then key choices, consequences and the final result from the rules in B4. Available whenever the session finishes, not only at a complete town. No claims of measured learning. | Two different play-throughs produce two different, accurate recaps. |
| 13 | **Full regression and load run** on the build proposed for promotion. | | | The checklist in section 23 of the brief, ticked item by item in `docs/RELEASES.md`. |

### P2: after the pilot blockers

Accessibility checks with a screen reader; fuller cross-device resume; licence management by the organisation itself; a short outline of modules 2 to 6 (one page, seven headings each, as section 19 of the brief asks); analytics only if the pilot shows a need.

### Not proposed

No new look, no change to the word-tile instruction builder, no accounts or emails for children, no per-customer copies of the code, no dashboards beyond the status list, no work on modules 2 to 6 beyond the outline.

---

## D. Questions the code cannot answer

1. **Which repository is this work done in?** The live address is deployed from `bakshilabs/ai-lab-v3`. This repository is a copy whose rules forbid deploying there. Proposed: do the work here, deploy development from here, and treat promotion to the live address as a separate step you approve each time. The alternative is to move the work to the original repository.
2. **Is the live build the same as this copy?** The live worker was last deployed on 11 Nov; this copy was taken on 14 Nov. If the original repository changed in between, version 1.0 should be tagged there, not here.
3. **The public test site** (`bakshilabs.github.io/ai-lab-v3`): are outside testers using it? If so it needs freezing too.
4. **Which Cloudflare plan is the account on?** The free plan's daily allowance would be the first limit a large group meets. This is visible in the dashboard under Workers & Pages → Plans.
5. **Which missions make up the hour?** The game has six. With two discussion pauses, three fit an hour. The playtest document may already answer this; it could not be opened from here.
6. **The two Google documents.** Please export or paste them (or connect Google Drive), so the defects in A7 can be checked against what testers actually reported.
