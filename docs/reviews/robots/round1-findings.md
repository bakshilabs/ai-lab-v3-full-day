# Robots at work: one-hour review (round 1)

Branch `claude/jolly-goldberg-e9txp9`, module `games/ecotown/game/js/modules/robots/`. Reviewed 16 Nov 2026. No code edited.

**How it was played.** Served `games/ecotown/game` on port 8872 and drove it in headless Chromium. I used a copy of `tests/playwright/robots.mjs` (`play.mjs`, with a `TO=` limit added) and my own scripts: `bypass.mjs` (mission 3), `m5bypass.mjs` (mission 5), `kb.mjs` (keyboard only) and `logic.mjs` (pure logic). Screenshots are in `shots/` in this folder.

| Run | Route | Screen | Settings | Town | Missions | Result |
|---|---|---|---|---|---|---|
| a, a2 | 8–12 | 1280×800 | motion on | small | 1–3 | no errors (the browser was killed from outside once; re-run) |
| b, b4 | 13–17 | 768×1024 | touch, reduced motion | small | 1–2, 4 | all checks passed |
| c | 8–12 | 1280×800 | large text, reduced motion | **empty** | 4 (street scene) | all checks passed |
| d | 13–17 | 1280×800 | reduced motion | **fully built** | 5, 6, record, talk, break, replay | all checks passed |
| e | 8–12 | 768×1024 | touch, motion on | small | 6 to the end | all checks passed |
| f | 13–17 | 768×1024 | large text | small | 2–3, with a leave and resume in 3 | all checks passed |
| x | 8–12 | 1280×800 | keyboard only; shortcut checks | small | 1, 3, 5 | see the must-fix list |

Unit tests: `node --test tests/robots*.test.mjs`, 20 out of 20 pass. No console errors and no outside requests in any run.

## Scores

| Aspect | Score | Why, in one line |
|---|---|---|
| First minute | 8 | A clear map of six jobs, "Start with mission 1", a brief that opens with the real job and how to play, all read aloud. |
| Visual quality | 8 | A clean, consistent workshop style and good diagrams (arm, hospital plan, street simulation). Small slips: the robot drawn over the "Ward" label, empty space on the tablet bench. |
| Controls and feel | 7 | Taps and keys work everywhere. At 1280×800 the arm program runs under the scroll fade, hiding step 8 and the Repeat control. The "Watch the loop" part takes 10 taps of Next. With motion on, things jump step by step. |
| Engagement and pacing | 6 | Missions 2, 4 and 6 are strong. Mission 1 "Set the rule" is trivial: the right rule was just shown. Mission 3 trip 1 is one choice. Mission 5 can be finished in four taps. |
| The skill is real (and accurate) | 7 | Six real jobs and real skills (sense, think, act; sequences, debugging and loops; ordered "if" rules; training and unseen tests; thresholds; design trade-offs). But the mission 3 ordering lesson and the mission 5 cost trade-off can both be skipped. Two small accuracy slips (see the nice-to-haves). |
| Feedback and honesty | 6 | The mission 3 closing card and record say "safely … put safety first" while the child's own "someone steps in front" rule is "Beep and keep going". In mission 5, the most cautious setting gets a green box and "You can now set how sure a robot must be…". |
| Wording | 8 | Plain British English and short sentences. In mission 5, the ages 8–12 setting labels are out of order: "Half sure" (50) then "A bit sure" (60). |
| Age fit (both routes) | 7 | Ages 13–17 get metres, cm, m/s, Wh, kg, %, a confusion table and farmer flags: good. But ages 13–17 finish in about 30–36 minutes, and missions 1 and 3 are thin for them. |
| Access | 8 | Focus moves to the next control after each page change, with a visible ring. Radio and pressed states are set; large text works; reduced motion cuts every animation. On an upright tablet the verdict after a test run is below the fold. |
| Robustness | 8 | Leaving mid-mission and coming back resumes at the trip (checked). Replay works, as do the empty town (street scene still shown) and the built town. One gap: replaying an earlier mission discards a later mission's progress. |
| Record and town | 7 | The record is good: six true lines, four practised lines and a picture. But the curriculum's **"Jobs that use this"** screen does not exist. The record line for mission 3 counts any rule as "safe". The robot left in a built town is hard to spot. |
| **Fills the hour** | **6** | See the estimate below: about 40–48 minutes for ages 8–12 but about 30–36 for ages 13–17, and shorter still with the two shortcuts. The six missions vary well. The ramp inside each mission is good, but across the hour mission 5 is the easiest and comes fifth. |

**Module score: 6** (the lowest: engagement and pacing, feedback and honesty, fills the hour).

### Minutes per mission (estimated for a typical player, at classroom pace with read-aloud)

| Mission | Ages 8–12 | Ages 13–17 | Notes |
|---|---|---|---|
| 1 Sensors and the loop | 7–8 | 5 | 8 sensor jobs (about 3.5 min), 10 loop steps with 4 predictions, then 3 fixed rules. "Set the rule" takes under a minute: rule 1 was just demonstrated. |
| 2 Robot arm | 8–10 | 6–7 | The best-paced mission: one seedling, then fix the bug, then a repeat. The first runs usually fail, which is good. |
| 3 Hospital rules | 5–6 | 4–5 | Trip 1 is a single choice. Trip 3 can be passed without ordering anything. |
| 4 Recycling sorter | 9–11 | 8–9 | Strong: test, read why, fill the gaps, test again, then the 3D street. |
| 5 Weeding robot | 4–5 | 5–6 | 4 checks, then two rows. Picking "Very, very sure" passes both rows at once. |
| 6 Flood rescue | 6–8 | 5–7 | Good trade-offs: street 2 has exactly one passing design (tracks, heat camera, floats, big battery: 25 kg on 25 kg floats). |
| **Play in total** | **about 40–48** | **about 33–39** (30 or less with the shortcuts) | The target is about 45 minutes of play before the 10–15 minute talk. |

## Must-fix

### 1. Mission 3, trip 3: the ordering lesson can be skipped, and an unsafe rule passes as "safe"
- **Reproduce:** 8–12, `FROM=3`. In trip 1 choose "Stop and wait" for "A person is near"; it passes. Trip 2: "Stop, wait, then go round" and "Call the lift". Trip 3: set the new rule "If someone steps right in front" to **"Beep and keep going"** and do not move any rule. Press Test run.
- **What happens:** "Safe all the way…" and Carry on. The closing card reads "Wrote 4 rules for a hospital robot. It took the medicine safely on every trip… You can now write 'if … then' rules for a robot, and put safety first." The robot never used the beep rule: the "person is near → stop" rule above it caught the child. The same happens with "Slow down".
- **Logic check:** `trip()` with `[person:stop, block:wait, lift:call, step:beep]` returns `passed = true` (`logic.mjs`).
- **Screenshots:** `shots/x/bypass-junior-02-m3-r3-beep-rule-passes.png`, `shots/x/bypass-junior-03-m3-done.png`, `shots/x/bypass-junior-01-m3-r1-stop-passes.png`.
- **Fix (in `m3-rules.js` and `m3-ui.js`):**
  - (a) A trip passes only if every rule's own action is safe for its own condition, whether or not the trip used it: `rules.every(r => OUT[r.cond][r.act] !== 'unsafe')`. Name the unused unsafe rule in the log: "Rule 4 was never used on this trip, but a real robot will meet a child one day: 'Beep and keep going' would not stop it."
  - (b) Make the order matter. From trip 2 on, give the delivery a time limit that stopping for every nurse breaks (for example, the medicine is due within 150 s), so "Stop and wait" for people fails as "too late". That forces "slow" for people, and then "someone steps in front" must be moved above it.
  - (c) In `record.js` `missionLine(3)`, count rules whose action is safe, not rules that have an action.

### 2. Mission 5: the threshold trade-off can be skipped by choosing the most cautious setting
- **Reproduce:** 8–12, `FROM=5`. Answer the four checks, choose **"Very, very sure"** in the lettuce row and press Weed the row, then do the same in the carrot row.
- **What happens:** Both rows show a **green** verdict ("3 weeds were left… No crop was lost. A different setting could leave fewer weeds.") and Carry on. The closing card says "You can now set how sure a robot must be before it acts, when some mistakes are worse than others." The child never weighed the two costs; "always the highest" is the opposite of the curriculum's lesson. `logic.mjs` confirms that 80 and 90 pass the lettuce row and 90 passes the carrot row.
- **Screenshots:** `shots/x/m5-junior-05-m5-row-90.png`, `shots/x/m5-junior-06-m5-carrot-90.png`, `shots/x/m5-junior-07-m5-done-90.png`.
- **Also:** the ages 8–12 labels run "Half sure" (50), "A bit sure" (60), "Quite sure" (70), so "a bit" reads as less sure than "half" (`shots/x/m5-junior-04-m5-row-before.png`). And the row's words (`sureWords`: "fairly sure" from 75) do not match the setting words ("Very sure" = 80).
- **Fix (in `m5-ui.js` and `m5-weeds.js`):**
  - Show Next only once the row has no lost crop **and** the weeds left equal `best(field, withAsk).weedsLeft`, or allow one more weed than best after three tries, with a hint.
  - Style a no-loss but sub-optimal result amber ("ask"), with a line on the other cost: "No lettuce lost, but 3 weeds stay and steal water and light for a week. Can it pull more weeds and still keep every lettuce?"
  - Rename the ages 8–12 levels so they rise: "A little sure", "Fairly sure", "Quite sure", "Very sure", "Totally sure". Use the same words in `sureWords`.

### 3. The "Jobs that use this" screen is missing
- **Reproduce:** finish all six, press Finish on the map. You go from the record straight to "Talk it over" (`shots/d/senior-built-1280x800-13-record.png`, then `-14-talk.png`). `grep -ri "jobs that" js/` finds nothing.
- **Why it matters:** `docs/curriculum.md` ("How every hour is shaped") says: "The last screen before the talk is **'Jobs that use this'**: three or four real jobs, each with one line on what the person does". Section 3 names robotics engineer, robot technician, agricultural engineer and test engineer.
- **Fix:** add `showJobs(ctx, sh, j)` in `hour.js`, shown in `index.js` after `pickd.finish && allDone` and before `return`. It needs four cards, each with one line and the missions that used it:
  - Robotics engineer: designs robots and chooses their sensors (missions 1, 6).
  - Robot technician: programs, tests and fixes robot arms on the factory floor (mission 2).
  - Agricultural engineer: builds machines that farm with less weedkiller (mission 5).
  - Test engineer: tests robots on things they have not seen before they go out (missions 3, 4, 6).
  
  Add a "Carry on" button and read the screen aloud. This stays inside the module; nothing shared changes.

### 4. Ages 13–17 do not fill the hour, and two parts are thin
- **Evidence:** the estimate above gives about 33–39 minutes of play for ages 13–17. Mission 1 "Set the rule" offers three fixed rules, and the right one is the rule just shown in "Watch the loop" (`shots/b/senior-touch-small-768x1024-06-m1-bump.png`). Mission 3 trip 1 is one choice of three (`shots/a2/junior-motion-small-1280x800-07-m3-unsafe.png`). The curriculum also asks for "coordinates for the arm" for ages 13–17, which mission 2 only uses as labels.
- **Fix (pick enough to add about 8–10 minutes for ages 13–17 and about 3–5 for ages 8–12):**
  - Mission 1: a second room for "Set the rule", where the demonstrated rule fails (a dead end needing a left turn, or a gap where 50 cm turns too late). For ages 13–17, a distance stepper of 25–150 cm instead of three fixed rules.
  - Mission 2, ages 13–17: a fourth task with two trays (x and y, or two box positions), so the coordinates matter.
  - Mission 3: give trip 1 two events of different kinds, and add the time limit from must-fix 1.
  - Mission 5: must-fix 2 already adds tuning.

### 5. Mission 2 on a 1280×800 laptop: the program and the Repeat control are under the scroll fade
- **Reproduce:** 8–12, 1280×800, mission 2, task 3. Write the 8-step program and set Repeat.
- **What happens:** Step 8 and the **Repeat − 4 times +** row, the one new control of this task, sit half-hidden under the fade at the bottom of the panel. The arm drawing on the left has spare height. During a run, the highlighted step scrolls out of view.
- **Screenshots:** `shots/a2/junior-motion-small-1280x800-06-m2-tray.png`, `shots/a/junior-motion-small-1280x800-08-m2-program.png`, `shots/f/senior-large-small-768x1024-06-m2-tray.png`.
- **Fix (in `m2-ui.js` and `css.js`):** put the Repeat row beside the "Program" heading. On wide screens, use a two-column program list from 7 steps up, or shorten the arm panel and give the program its height. During a run, `scrollIntoView({ block: 'nearest' })` on the running step.

## Nice-to-haves
- **Accuracy (mission 6):** "The heat camera saw someone warm **upstairs**" and "picked up a warm body upstairs" suggest a thermal camera can see through floors. It cannot. Say "in the dark back room". The heat camera's icon is 🌡️, the thermometer from mission 1 (which measures air temperature): use a camera with a warm glow.
- **Upright tablet:** after Test run (mission 3) or Test (mission 6), the verdict and log are below the fold, and only the footer says "It worked!" (`shots/e/junior-motion-touch-small-768x1024-06-m6-two.png`, `shots/f/senior-large-small-768x1024-11-m3-r3.png`). Scroll the verdict into view when a run ends.
- **Mission 3 plan:** at the end of trip 1 the robot is drawn over the "Ward" label (`shots/a2/…-07-m3-unsafe.png`). Stop it short, or move the label.
- **Mission 5, ages 13–17:** a carrot that was flagged but not checked shows red "Flag: no time", but it stayed in the ground, which is not a loss. Use a neutral style. For ages 13–17, consider hiding plant names until after the row is weeded, so the threshold is set on the robot's numbers, not on the answer.
- **Mission 1 "Watch the loop":** 10 taps of Next, 6 of them passive. Add "Skip to my next turn".
- **Motion on:** the CSS transitions on `.rb-bot` and `.rb-armg` never play, because the SVG is rebuilt with `innerHTML` each step, so the robot and the arm jump. Update the `transform` attribute in place instead of redrawing.
- **Progress:** replaying an earlier mission while a later one is half done overwrites `prog.cur`, so the later mission restarts from its first part. Keep one in-progress record per mission.
- **Talk it over (ages 8–12):** "Why should a farm robot be very sure before it pulls a plant?" pushes towards "always the highest". Try: "How sure did you make the weeding robot, and what did that cost?"
- **Take-home question** (`takehome.js` `ASK.robots`) is only about the sorter. One about the six jobs would fit the hour better (shared file: raise it with the main session).
- **Town result:** in a fully built town the sorting robot and its sign are hard to find (`shots/d/senior-built-1280x800-15-town-after.png`). Add a pin, or frame the camera on it once.
- **Mission 1:** the job text appears twice, in Florence's line and in the job card. Florence could say "Which sensor can do this job?" instead.
