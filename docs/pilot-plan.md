# Eco Town: plan for a one-hour pilot

**Draft 3, 14 November 2026.** Written in answer to the implementation brief of the same date (section 22: audit, target design, work plan, questions). Nothing has been changed in the game yet. Treat this file as a proposal until the user has revised the brief.

**Decided by the user after draft 1:**
- This repository (`ai-lab-v3-full-day`) is where the work happens. It is a **new live build**, deployed from here to a **new address** that the user will provide.
- The brief's section on keeping a frozen test copy beside a development copy does not apply: it assumed work in the original repository. The original site is left alone and is not part of this plan.
- The AI Lab as it stands (the town and its six missions) is taken to be **one hour**. Nothing is cut to fit.
- The two Google documents will be pasted by the user. **Not yet received**; A6 and the P1 items will be checked against them.
- Hosting and security are **out of this plan** (removed in draft 3 at the user's request). That covers where and how the site is deployed and the admin login.
- The lockout after ten wrong passcodes has been **removed from the game** (14 Nov 2026). Wrong guesses are no longer counted or limited.

**What was inspected:** all the code in `games/ecotown/` (copy of `bakshilabs/ai-lab-v3` at `a5fd92c`). **What was not:** the two Google documents named in the brief (this session cannot open them) and the original repository.

---

## In short

1. **The game has no version number anywhere,** so feedback cannot be tied to a build.
2. **A login today is one passcode for one device.** The server knows the code and nothing else. All progress lives in the browser. The server has no idea of an organisation, a group or a learner.
3. **Progress survives a refresh,** because it is in the browser's storage. It does not survive a change of device, cleared storage or a private window, and two children on one browser share one town.
4. **No child data leaves the device.** Florence's model runs in the browser. Nothing typed is sent anywhere. This is a strength to keep.
5. **The pass/fail defects are real and specific.** Eleven are listed in A6. The cause is that rules are checked in five different places.
6. **Scale looks light but is unmeasured.** The game is static files plus one small request a minute per learner. Nothing has been load-tested.

---

## A. What exists today

### A1. Logging in and sessions (`worker/codes.js`, `worker/worker.js`)

- **A login is a passcode** such as `OTTER-1234`. The company makes codes in batches at `/admin`. A batch has a free-text "school" name, a note, a start date, an end date and up to 500 codes.
- **One code, one device.** A new login with the same code replaces the earlier one ("newest login wins"). The earlier device sees a lock card within a minute. A code cannot be shared by a class.
- **Session:** a cookie lasting 30 days. The game asks the server once a minute whether the session is still good. There is no log-out button except on the lock card.
- **Dates** are whole days in UTC. An expired or switched-off batch shows a message and nothing else.
- **No passwords, no reset, no email.** A lost code means asking the company.

### A2. Roles

Two exist: the company (admin) and a player holding a code. There is no facilitator role and no organisation admin. The admin sees every batch of every customer on one page, with counts of codes used and active now.

### A3. Where progress lives

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

### A4. Separation between customers

There is none in the data. A batch's "school" is a label. Every code of every customer sits in one store, and code names are drawn from one pool. No learner can see another's data, but only because no learner data reaches the server at all.

### A5. Facilitator and sharing features

- **Leader's page** (`game/leader.html`): a static printable page. It shows no learners.
- **"Class mode":** a start-screen switch that puts the missions in order. It does not connect devices.
- **Classroom:** a room inside the game where the child asks Florence questions. Answers come from a fixed list on the device.
- **Town codes, QR, postcard, visit:** a town is packed into a code on the device and typed or scanned on another. No server, no free text, no typed names. The code does appear in the page address when a visit is opened by link.
- **Club wall:** a list kept on one device. Not shared, not scoped, not on the server.
- **No live view of learners exists** in any form.

### A6. Pass/fail rules

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

### A7. Finding the next step

- A "next step" line and bar exist. For carbon and walking the bar's numbers quietly switch to "goals met out of 8", and for some challenges they are an invented figure. The bar has no visible label.
- The star count is stars left to spend, not stars earned.
- Several buttons reload the page (challenge towns, another island, start again).
- A recap exists (`game/finale.js`) but appears only once, after all six missions and a complete town. A one-hour session will rarely reach it.

### A8. Load

- The game is static files. Florence runs on the device. There are no model or outside API calls.
- Per learner the server sees: one login, about a hundred file requests at first load (files with fixed names are then kept by the browser for a week), and one check a minute.
- Every check goes through the single passcode store. At 1,000 learners that is about 17 requests a second, far below what one store handles.
- **Likely first limit as numbers grow:** admin pages read every code on each view, which slows once codes number in the tens of thousands.
- **Nothing has been load-tested.** The figures above are reasoning from the design, not measurements.

### A9. Privacy and data

| | Finding |
|---|---|
| Sent to the server | The passcode at login; a cookie on each request. Nothing else. |
| Typed by the child | Town name, mission instructions, questions to Florence, a comment, a reflection. All stay on the device. |
| Stored on the server | Per code: batch, last login time, login count. |
| Outside services | None. |
| Link to a real child | Only if the company or facilitator keeps a list of who had which code. |
| Shared towns | Carry tiles, score and a preset name only. |

---

## B. Proposed design

Kept as small as the brief's questions allow.

### B1. A version label

The build writes a version, the commit and the date into the game, shown small in the menu. Each release is recorded in `docs/RELEASES.md` with its fixes and known issues, so feedback can be tied to a build.

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

**Roles**

| Role | How they get in | Can see |
|---|---|---|
| Platform admin | The admin page (as now) | All organisations, groups, seat use, technical counts. |
| Facilitator | A leader code for their organisation | Their own groups: join code, list of badges with stage and status. Nothing from another organisation. |
| Learner | Join code | Their own town only. |

An organisation admin separate from the facilitator is not needed for a pilot; the leader code covers both.

**Storage:** one small directory (join code → organisation) and one store per organisation holding its groups, learners and progress. Customers' data are then physically separate, and no single store carries everyone's traffic. This replaces the single `main` store. The new site starts empty, so nothing has to be moved.

### B3. Saving and resuming

- **The device stays the main copy.** The game keeps saving to the browser, now under a key that includes the learner id, so two children on one browser no longer share a town.
- **A copy goes to the server** shortly after each save and when the page is hidden or closed. On start the game takes whichever copy is newer.
- **What the copy holds:** organisation, group, learner id, module, stage, the town's tiles, stars, mission progress, times. **Not** the child's typed text or town name: those stay on the device, so the server holds nothing a child wrote.
- **A mission in progress** is saved at each step, so a refresh returns to the same mission step and not to the town.
- **Save version:** each save carries the build version, and the game refuses to load a save from a newer build than itself.
- **Another device:** join code plus badge restores the server copy (typed text excepted). Built in the pilot phase only if needed; the design allows it without rework.
- **Retention:** learner records are deleted 30 days after the group's end date, and at once when the company deletes a group.

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

In the brief's order, without its first item (a frozen copy beside a development copy), which no longer applies.

### P0: now

| # | Change | Files | Smallest version | Risk | Done when |
|---|---|---|---|---|---|
| 1 | **Version label.** Version stamp and release log. | `build.mjs`, `main.js` (menu line), new `docs/RELEASES.md` | As B1. | Low. | The built game shows its version, commit and date in the menu. |
| 2 | **Fix the rules.** | new `js/game/criteria.js`; `levels.js`, `progress.js`, `challenges.js`, `report.js`, `game.js`, `sim/sim.js`, `ai/targets.js`, `content.js` | As B4, covering all eleven defects in A6. | Medium. Stricter rules could make a mission impossible; the existing recipe tests that build every mission and challenge guard against that. | New tests: walk 15 passes and 16 fails through the real rule; carbon 160.0 passes, 160.4 fails; a child's 10-minute target with a 12-minute plan is "partly met" with no star; a meeting that breaks 70 t blocks completion until fixed; two limits at once; a fix turns "not met" into "met" and the saved state agrees. All 250 present tests still pass. |
| 3 | **Refresh safety.** | `game.js` (save points, learner-scoped key), `main.js` | Save on page hide; save mission step; version in the save. | Low. Saves made before this change must still load. | Refresh at any of the main steps of a mission returns to that step. A save made by today's build opens unchanged. |
| 4 | **Groups and learners.** | `worker/codes.js`, `worker/store.js`, `worker/worker.js`, `worker/admin.html`, `tests/codes.test.mjs` | As B2, without the facilitator page. | Medium to high: this replaces the store's layout. The new site starts with an empty store, so there is no live data to move. | Twenty learners on one join code get twenty ids and twenty separate towns. A learner of one organisation cannot read anything of another (tested by trying). A 21st learner on a 20-seat group is refused with a clear message. |
| 5 | **Server copy of progress.** | `worker/worker.js`, `worker/store.js`, `game.js` | As B3. | Medium. A bad merge could overwrite a newer town: newest-wins by save time, and the device copy is never deleted. | Storage cleared on a device, then join code and badge: the town returns. Typed text is absent from every server record (checked by reading the store). |
| 6 | **Load test.** | new `tests/load/` | A script that plays the server's part of N learners against a test copy of the site, before any group uses it: join, load files, check in each minute, save every 30 seconds. Run at 20, 100 and 1,000. | Low. Never pointed at the original site. | A table in `docs/LOAD.md`: success rate, errors, response times, store behaviour, and cost from Cloudflare's own figures. A claim about 1,000 is made only if the run supports it. |

### P1: before children use it

| # | Change | Files | Smallest version | Done when |
|---|---|---|---|---|
| 7 | **Next step is always plain.** | `game.js` (`nextStep`), `ui/ui.js`, `content.js`, `css/game.css` | One next-step line with a number that always means "this goal: now / needed". The next button to press pulses. Buttons that reload the page say where they go and return to the same town. Stars shown as earned. | A no-context play-through never stops for more than 20 seconds without a marked next action, on laptop and tablet. |
| 8 | **Weak choices show.** | `game.js`, `advisor.js`, `criteria.js` | For each important choice: the consequence appears in the town (flooded homes, dark windows, a long walk shown on the street), the failed condition is named, one tap opens the revise step, and the result changes. | Each of the six missions has a tested "wrong choice → named failure → fix → met" path. |
| 9 | **One-hour session.** | `game.js`, `main.js`, `content.js` | The lab as it stands is the hour: the town and its six missions. Added: two natural pause points and a clear finish that leads to the recap. No timers that block. A child who has not finished when time is up still gets a recap of what they did. | The pause points and the finish appear at the same places in every play-through, and can be skipped. |
| 10 | **Facilitator cues and run sheet.** | `game/leader.html`, `LAB-GUIDE.md`, `game.js` | The leader's page rewritten as a one-hour run sheet: aim, timings, the question for each pause, common mistakes, where Florence is wrong on purpose, what a good answer sounds like, how to help without telling. In the game, two skippable "pause and talk" cards, off in self-directed use. | A facilitator who has never seen the code can run the hour from one printed page. |
| 11 | **Group status list.** | `worker/worker.js`, new `worker/leader.html` | One page behind the leader code: each badge with stage, minutes since last change, "needs help" (no progress for five minutes, or the same check failed three times), "a limit is missed", "finished". Refreshes each minute. No charts. | With five test learners the list matches what each screen shows within a minute, and shows nothing from another organisation. |
| 12 | **Recap at the finish.** | `game/finale.js`, `ui/rewards.js` | "You practised" built from the learner's own record (mistakes caught, plans fixed, a missed limit put right), then key choices, consequences and the final result from the rules in B4. Available whenever the session finishes, not only at a complete town. No claims of measured learning. | Two different play-throughs produce two different, accurate recaps. |
| 13 | **Full regression and load run** on the build proposed for the first group. | | | The checklist in section 23 of the brief (less its two items about a frozen test address), ticked item by item in `docs/RELEASES.md`. |

### P2: after the pilot blockers

Accessibility checks with a screen reader; fuller cross-device resume; licence management by the organisation itself; a short outline of modules 2 to 6 (one page, seven headings each, as section 19 of the brief asks); analytics only if the pilot shows a need.

### Not proposed

No new look, no change to the word-tile instruction builder, no accounts or emails for children, no per-customer copies of the code, no dashboards beyond the status list, no work on modules 2 to 6 beyond the outline.

---

## D. Still open

1. **The two Google documents,** to be pasted by the user.
