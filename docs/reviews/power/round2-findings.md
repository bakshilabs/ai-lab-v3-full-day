# Power control room (`power`): one-hour review 2

Branch `claude/jolly-goldberg-e9txp9` (head `0de9a3f`, "Merge Power control room round-1 review fixes"). No code edited.

How it was checked:
- Read every file in `js/modules/power/`, `docs/curriculum.md` §6, `docs/full-day-plan.md`, `docs/MODULES.md`. The 25 power unit tests pass.
- **Full runs** with `tests/playwright/power.mjs`:
  - `a-jr1280/`: ages 8–12, 1280×800, reduced motion, **empty town**. `ok: true`, no errors, no outside requests, nothing clipped, no button under 40 px. Leaving in mission 3 and resuming worked, and so did the replay.
  - `b-sr390/`: ages 13–17 on a **phone (390×844)**, built town, reduced motion. Played all six missions to the record card and "Talk it over" (screenshots 01–43). The JSON summary was lost when the machine-wide stop cut the run at its very end.
- **Targeted runs** with `jump2.mjs`, in `j/`:
  - ages 8–12, 768×1024, **motion on, large text, full town of 30 homes**, mission 1;
  - ages 8–12 on a phone **by touch**, mission 5, all four days to the done card;
  - ages 13–17, 1280×800, **keyboard only**, mission 2.
- Pure facts with `facts.mjs`: storage goals against simple plans, and the forecast spells.

## Scores

| Aspect | Score | Why, in a line |
|---|---|---|
| First minute | 8 | Clear map of six missions. Every briefing gives "the real job" and "what to do", and Florence reads it aloud. |
| Visual quality | 8 | Scale, charts, dials (now in words for 8–12), network diagram, night town with pools of light. Phone charts are small but readable. |
| Controls and feel | 8 | Big targets. Arrows and 1/2/3 keys work. There is a Pause button, and with reduced motion a "Keep this until the next part of the day" button (new, and good). Touch works on the phone. |
| Engagement and pacing | 8 | Mission 5 now has four days (the nurse's car), mission 6 four rounds (storm preparation added). Each mission gets harder inside. |
| The skill is real (and accurate) | **7** | Round-1 errors fixed: 48.8 Hz, Priority Services Register note, "protection tripped the breaker", cold load "after a while". **The permit to work is in the wrong place in the crew order** (must-fix 2). |
| Feedback and honesty | **7** | The graded hints are still excellent. Two statements do not match the screen: mission 1 "faster each time" is untrue, and the mission 2 reveal gives a start hour and a "go dark" hour that differ from the marks (must-fix 3, 4). |
| Wording | 8 | Plain and short. Small slips: "1 rules", "dark hours" next to "dark squares". |
| Age fit (both routes) | **6** | **Ages 8–12 see a percentage on the mission 4 done card: "4 rules. Homes lit on the test days: 98%."** (must-fix 1). Otherwise clean: battery dial in words, no kW, kWh, money or budget, and the record is clean. The ages 13–17 route is good. |
| Access | 8 | Keyboard focus is visible and moves to the main control. Read-aloud and large text work. On a phone the desk scrolls (see nice-to-haves). |
| Robustness | 8 | Leave mid-mission, resume at the same mission, replay and finish again: all fine. No page errors in any run. Progress is still saved per mission, not per round. |
| Record and town | **7** | The record is good for both ages: a picture plus six and four lines, accurate and with no percentages for 8–12. **In an empty town (the default for a fresh class) the only result in the town is a small hut**: no lanterns (`nightLamps {lit:0, dark:0}`), as in round 1 (must-fix 5). |
| Fills the hour | 8 | About 40–47 min for ages 8–12 and 36–43 min for ages 13–17 (table below). Varied, with a real ramp inside each mission. |
| **Module score** | **6** | Lowest: age fit. Must-fixes 1–5 are each a few lines and would lift the module to 8. |

### Minutes per mission (typical child, play only, ignoring the slow machine)

| Mission | 8–12 | 13–17 | Notes |
|---|---|---|---|
| 1 Balance | 6 | 5 | 3 rounds × 8 steps × 10 s (8 s for 13–17), plus a likely retry. |
| 2 Forecasting | 6 | 7 | 3 charts; 13–17 add two kWh questions with a good kW/kWh distractor. |
| 3 Storage | 8–10 | 7–9 | ~1 min per day. The naive "charge at midday, use in the evening" plan leaves 3/4/6 dark against a goal of 3, so days 2 and 3 usually need a retry. |
| 4 Rules | 8–10 | 8–10 | Write, test, find the gap, change, compare. |
| 5 Smart demand | 6–7 | 5–6 | Four days; day 4 (the nurse) is a good twist. |
| 6 Storm night | 7–8 | 6–7 | Prepare, isolate, prioritise, crew order, cold load pickup. |
| **Total** | **~41–47** | **~38–44** | Plus briefing and done cards (~3 min). |

## Must-fix

### 1. Ages 8–12 see a percentage on the mission 4 done card
- **Reproduce:** ages 8–12, finish mission 4. The done card reads "4 rules. Homes lit on the test days: 98%."
- **Screenshot:** `a-jr1280/24-m4-done.png`.
- **Cause:** `index.js` line 27 (`PLAY.rules`): the junior branch prints `${r.share}%`.
- **Fix:** `playRules` already returns `cmp`. For ages 8–12 use `` `${n} ${n === 1 ? 'rule' : 'rules'}. On the test days: ${r.cmp.test.litHours} of ${r.cmp.test.total} lit hours.` `` The same plural fix is needed in the 13–17 branch ("1 rules" today). Add a unit test asserting that no junior `lines` or record text matches `/%|kW|£/`.

### 2. The crew order has the permit to work before the earths (ages 13–17, mission 6, round 4)
- **Reproduce:** ages 13–17, storm night, round 4. Step 2 is "Prove the line dead with a tester; the crew is issued a permit to work", and step 3 is "Fit safety earths at both ends".
- **Screenshot:** `b-sr390/38-m6-crew.png`.
- **Truth:** under GB distribution safety rules the order is: isolate and lock off (with caution notices), prove dead, apply the circuit main earths, **then** issue the permit to work. At the end the permit is cancelled (crew withdrawn, all clear) **before** the earths come off.
- **Fix (`m6-storm.js` `CREW_WORD`):**
  - `dead.s`: "Prove the line dead with a tester".
  - `earth.s`: "Fit safety earths at both ends; then the crew is issued a permit to work".
  - `unearth.s`: "The crew stands clear and hands back the permit; remove the earths".
  - Update `crewSay` for `done` to match: "isolate, prove dead, earth, permit, repair, clear, remove earths, re-energise".

### 3. Mission 1 tells ages 8–12 "Three rounds, faster each time" (untrue)
- **Reproduce:** ages 8–12, mission 1 briefing (`a-jr1280/02-m1-brief.png`).
- **What actually happens:** `STEP_MS` is the same 10 s in every round, and in reduced motion there is no clock at all. Only the wind and sun change more in round 3.
- **Fix:** either change `MISSIONS[0].how.j` to "Three rounds, each one harder." or make it true. To make it true, use a per-round step time such as `[10000, 8500, 7000]` for 8–12 (and 8000, 7000, 6000 for 13–17).

### 4. Mission 2's "right" screen gives a start hour and a "go dark" hour that differ from the marks
- **Reproduce:** ages 8–12, forecast 1 marked correctly.
  - Florence says "short from 4 pm to midnight", but the correct marks start at 5 pm. The 4 pm hour is a "close" hour that the child rightly left unmarked; `spells()` includes close hours.
  - The note under the chart says "Without a battery, homes would go dark at 7 pm". That is the worst hour; homes go dark from 5 pm.
- **Screenshot:** `a-jr1280/09-m2-right.png`.
- **Fix (`m2-forecast.js` `spellWords`):** start and end each spell at its first and last **short** hour, not its close hours. In `m2-play.js` say "...homes would start going dark at 5 pm, and it is worst at 7 pm" (13–17: "shortfall from 17:00, worst at 19:00, gap N kW").

### 5. An empty town gets almost nothing in the town (the default for a fresh class)
- **Reproduce:** a brand-new town (practice homes are lent), finish all six missions, then look at the town by day and at night.
- **What you see:** `nightLamps {lit:0, dark:0}`; only the small hut appears (`a-jr1280/42-town-day.png`, `a-jr1280/43-town-night.png`).
- **Cause:** `town.js` skips practice homes (`h.practice ? null`), but `kitFrom` gives them real tile keys `k`.
- **Fix:** use `top(h.k)` for practice homes too: a lantern on an empty plot is honest scenery. Or put a row of six lanterns beside the hut, one per practice home, each lit or dark by the rules at that hour.

## Nice-to-have
- **Phone (390×844):**
  - The desk is taller than the screen. In mission 1 the scale and the Hz reading scroll away while you press More/Less (`b-sr390/05-m1-turbines-cut-out.png`).
  - In mission 5 the slots and Run button sit below the job list, so the child must scroll after every job tap (`j/jr390T-m5-03-start.png`).
  - Suggested fix: under 560 px, put the controls right under the scale (mission 1), and collapse the job list to icon chips above the slots (mission 5).
  - Senior mission 5 slots on the phone now fit well (`b-sr390/29-m5-solved.png`); the "10ar" clipping from round 1 is gone.
- **"S" in the Lights row** (school dark, no homes dark) is not in the key (`a-jr1280/14-m3-day-missed.png`). Add "S = school dark" to `legend()`.
- **Mission 3 done card for 8–12** says "Day 1: 0 dark hours." The mission called them "dark squares adding up to…"; use one name throughout.
- **Mission 5 side panel at 1280×800:** on day 3 and day 4, six or seven jobs scroll the day title out of view (`a-jr1280/27-m5-solved.png`). Shorten the job "need" lines, or stick the heading to the top.
- **`d.report('Smart demand: day N of 3')`** should say "of 4" (it is only seen in the leader view).
- **Storm round 3 message:** "The health centre, the shelter and the medical homes have power, and nothing more fits" while Mill Lane is also on (`a-jr1280/35-m6-priority.png`). Say "…, Mill Lane too, and nothing more fits", or build the line from what is on.
- **Phone keyboard in mission 2:** ArrowDown/Up jump 12 hours, but on a phone the grid is six columns. Read the column count from CSS, or move by 6 there.
- **Progress per round:** leaving in round 3 of a mission still restarts it from round 1. The full-day plan says "saved after every stage".
- **The town's grid frequency** is a simplification: a small town on the national grid does not move 50 Hz. One line for 13–17 ("our town's own small grid, made simple") would be fully honest.
- **No leader run-sheet section for this hour** (`leader.html` has none for power). `docs/full-day-plan.md` asks for one, with stages, where children get stuck, and questions. Outside the module folder, but needed before the day.

## Round-1 must-fixes: status
1. Battery percentages for 8–12: **fixed**. The dial reads "Low / Half full / Nearly full ▼".
2. Frequency and disconnection: **fixed**. Ages 13–17 see the 49.8–50.2 Hz band, reserve, and 48.8 Hz; ages 8–12 see "back-up power had to rush in", with the game's own warning explained.
3. Priority Services Register and "the breaker refused": **fixed**. The PSR note appears, the label reads "Homes with medical equipment", and "the protection tripped the breaker".
4. Mission 5 habit wording: **fixed**. It now says "afternoon and evening".
5. Lit and dark hours for 8–12: **fixed**. The screen shows "6 homes × 24 hours = 144" and "numbers in the dark squares add up to 3 or less".

Also fixed since round 1: plate capitals, "a winter day", the record's kWh counts moved jobs only, the substation battery icon appears only in the battery round, and the tree is removed once the line is mended. The senior crew steps now include lock-off and the permit (but see must-fix 2).

## Checked and correct
- **Frequency:** 49.8–50.2 Hz normal band; reserve below it; automatic demand disconnection from 48.8 Hz; surplus makes frequency rise.
- **kW against kWh:** "gap in kW for one hour is that many kWh", with the peak-kW distractor. Mission 5 shows "5 kW × 4 h = 20 kWh", and its gas and renewables totals are in kWh.
- **Fault passage indicators:** the fault lies beyond the last lit one; open the nearest switch upstream; reclosing onto the fault trips again.
- **Turbines:** they cut out in too-strong wind and restart when it eases. Overriding the cut-out is offered as a wrong choice in storm preparation.
- **Storm order:** priority sites first on the limited battery; cold load pickup at 1.5×; one area at a time.
- **No banned content for 8–12:** no kW, kWh, Hz, money or budget anywhere for ages 8–12 (apart from must-fix 1), including the record and its picture.
- **Privacy:** no typing, no names, no outside requests.
