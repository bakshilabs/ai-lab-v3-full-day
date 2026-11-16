# Power control room (`power`): one-hour review 1

Branch `claude/jolly-goldberg-e9txp9` (head `7fd997c`). Reviewed by reading every file in `js/modules/power/`, running the 25 unit tests (all pass), and playing in Chromium:
- full runs with `tests/playwright/power.mjs`: ages 8–12 at 1280×800, reduced motion, empty town (`a-jr1280/`); ages 13–17 at 768×1024, reduced motion, full town of 30 homes (`b-sr768/`); ages 8–12 at 768×1024, **motion on, large text**, built town (`c-jr768-motion-large/`). All three: `ok: true`, no page errors, no outside requests, desk always fits, no buttons under 40 px, leave mid-mission 3 → resume at mission 3 → replay all work.
- targeted runs with `jump.mjs` (in `j/`): phone 390×844 by touch (mission 5), 1280×800 ages 8–12 (mission 5 slot labels), 768×1024 large text (mission 3), 1280×800 ages 13–17 **keyboard only** (mission 4), 768×1024 by touch (mission 6).

Screenshot paths below are relative to this folder.

## Scores

| Aspect | Score | Why, in a line |
|---|---|---|
| First minute | 8 | Clear six-mission map, "the real job" and "what to do" on every briefing, Florence speaks it. |
| Visual quality | 8 | Clean desk, good charts, balance scale, network diagram; the 3D town follows each hour. |
| Controls and feel | 8 | Large targets, arrow/number keys, Pause, Next in reduced motion; tiles for rules, no typing. |
| Engagement and pacing | 7 | Good variety, but every mission is "three rounds of the same"; mission 5 day 1 is trivial; reduced motion means 72 Next presses in mission 3. |
| The skill is real (and accurate) | **6** | Strong core skills, but the frequency/disconnection claim, the Priority Services Register treatment and "the breaker refused" are not true to practice. |
| Feedback and honesty | 7 | Graded hints (nudge → where → Florence's plan) are excellent; mission 5 tells children something the screen contradicts. |
| Wording | 7 | Mostly plain and short; "lit hours out of 144" / "dark hours" unexplained for 8–12; small slips. |
| Age fit (both routes) | **6** | Ages 8–12 see battery percentages on the dials in missions 3 and 4 (25%, 92%, 100%). Ages 13–17 route is good (kW, kWh, Hz, thresholds). |
| Access | 8 | Keyboard focus ring visible, focus moved to the main control, read-aloud everywhere, reduced motion cuts, large text works. |
| Robustness | 8 | Leave, resume, replay all fine; progress is kept per mission, not per round (leaving in round 3 of a mission restarts the mission). |
| Record and town | 7 | Record card with picture, six lines and four practised lines; control hut appears; lanterns follow the rules at night in a built town (11 lit / 13 dark in the full town). In an empty town only the small hut appears (no lanterns: practice homes are skipped). |
| Fills the hour | 7 | Estimate below: about 38–45 min for 8–12, about 30–36 min for 13–17. Juniors fill it; seniors are a little short. |
| **Module score** | **6** | |

### Minutes per mission (estimate for a typical child, play only)

| Mission | 8–12 | 13–17 | Notes |
|---|---|---|---|
| 1 Balance | 6–7 | 5 | 3 rounds × 8 steps × 10 s (8 s seniors) + one retry is typical. |
| 2 Forecasting | 6–7 | 7 | 3 charts × 24 hours to mark; seniors add two kW→kWh questions. |
| 3 Storage | 8–10 | 6–8 | ~1 min per day with motion on; days 2 and 3 usually need a retry (goal is best possible + 2%). |
| 4 Automation rules | 8–10 | 7–9 | Write, test (3 × 24 h), find the gap, change, test again, compare. The richest mission. |
| 5 Smart demand | 4–5 | 3–4 | Day 1 is three jobs and one obvious sunny block. Shortest and easiest. |
| 6 Storm night | 5–6 | 4–5 | Isolate, prioritise, crew order, cold load pickup. |
| **Total** | **~38–45** | **~32–38** | Plus briefings/debriefs (~3 min). Difficulty does ramp inside each mission; across missions it dips at mission 5. |

## Must-fix

### 1. Ages 8–12 see percentages (battery dial, missions 3 and 4)
- **Reproduce:** ages 8–12, open mission 3 (or 4). The Battery dial reads "25%", then "100%" by midday; in mission 4 results "92%".
- **Screenshots:** `j/jr768L-m3-04-m3-midday.png` ("Battery 100%"), `a-jr1280/21-m4-results.png` ("Battery 92%"), `c-jr768-motion-large/15-m3-evening.png` ("75% ▼").
- **Cause:** `shell.js` `setDials`: `val('battery', `${Math.round(...*100)}%...`)` has no junior branch.
- **Fix:** for `j`, show a word: `['Empty','Low','Half full','Nearly full','Full']` by level (0–5%, <35%, <65%, <95%, else), keeping the ▲/▼ arrow. Also check `STORE_DAY.today.j` (already "a quarter full", fine).

### 2. Mission 1 says homes are cut off as soon as frequency leaves 49.8–50.2 Hz (untrue)
- **Reproduce:** ages 13–17, mission 1, leave a step 3 blocks short: "Short: frequency fell to 49.70 Hz, and some homes were disconnected to protect the grid." Ages 8–12, any step even 1 block short: "Short of power. Some homes were switched off to keep the grid safe." and homes go dark in the town (`a-jr1280/03-m1-round-missed.png`).
- **Truth:** 49.8–50.2 Hz is the normal operating band (correct in the module). Below it, frequency response and reserve generators/batteries are called; automatic low-frequency demand disconnection in Great Britain starts only at 48.8 Hz (statutory limits are 49.5–50.5 Hz). Homes are not switched off at 49.7 Hz.
- **Fix (`m1-balance.js` `stepSay`):** seniors: "Short: frequency fell to 49.70 Hz, outside the normal 49.8–50.2 Hz band. Reserve power had to be called in. (In a real grid, homes are only switched off automatically if it falls to 48.8 Hz.)" Juniors: "Short of power. Back-up power had to rush in. If the grid stays short, homes go dark." Keep the dark homes as the game's warning, but say once in `BAL.how`/round note: "In this game, homes go dark when you are short, so you can see it."

### 3. Storm night: Priority Services Register and "the breaker refused"
- **Reproduce:** ages 13–17, mission 6 round 2: section 2B is "Priority Services Register homes", switched on first as a block (`b-sr768/35-m6-priority.png`). Round 3, "Close both together": "Cold load pickup: 160 kW surge against 150 kW. The breaker refused." (`b-sr768/37-m6-surge.png`).
- **Truth:** PSR homes are spread through ordinary streets; network operators generally cannot reconnect them individually first and say so. PSR gives priority contact, updates and welfare help (sometimes a generator). Restoring the feeders that serve a hospital or shelter first is real practice. A circuit breaker does not "refuse": protection trips it.
- **Fix:** senior label 2B "Homes with medical equipment"; add a note line after round 2 for seniors: "Real networks can rarely switch single homes. Homes on the Priority Services Register get early calls, updates and sometimes a generator." Change the surge line to "...against 150 kW: the protection tripped the breaker. Restore one area at a time." (and keep both on in the model as off, as now).

### 4. Mission 5 tells children something the screen contradicts
- **Reproduce:** mission 5 day 1. Florence: "Everyone usually runs jobs at 6 pm." The job list shows washing at **4 pm**, hot water at **4 pm**, dishwashers at **8 pm** (`j/jr1280-m5-04-m5-moved.png`). Seniors: "habit puts every job at the 18:00 peak" is equally untrue (day 3 heat pumps start at 14:00, night water at 22:00).
- **Fix:** either put the habit slots at 6 pm (slot 6) where the window allows, or change `DEM.note` to "People usually run these jobs in the late afternoon and evening, when the sun has gone." / "Habit puts most jobs in the late afternoon and evening peak."

### 5. "Lit hours" / "dark hours" are not explained for ages 8–12 (mission 3's goal)
- **Reproduce:** ages 8–12, mission 3 day 1 missed: "Your homes had 122 lit hours out of 144." / "Goal: 3 dark hours at most, all day and all night." (`a-jr1280/14-m3-day-missed.png`). A day has 24 hours; 144 is 6 homes × 24, never said. The chart shows a "4" in one square, which counts as 4 of the 3 allowed: a child reading "3 dark hours" will think one dark hour is fine.
- **Fix:** juniors: say the count the chart shows. Goal line: "Goal: the dark numbers in the Lights row add up to 3 or less." Summary: "6 homes × 24 hours = 144 lit hours if every home stays lit. You had 122." Use the same words in mission 4 tabs ("135 / 144 lit").

## Nice-to-have
- **Phone 390×844:** Florence's bubble covers the top of the desk ("Day 1 of 3: a sunny Saturday" heading hidden), and mission 5 slot labels clip ("10ar", "12pm") at 25 px columns (`j/phone-m5-04-m5-moved.png`). Not a stated target, but a 6-column wrap like `.pw-hours` would fix the labels.
- **Units differ between missions for seniors:** mission 1 and 5 and 6 use 10 kW blocks with town demand 40–100 kW; missions 2–4 use 5 kW units with demand ~34 kW for the same small town. Use one block size or say "a bigger town" in mission 1.
- **Substation drawn with a battery 🔋** in mission 6 even in rounds 1 and 3 when the grid feeds it; show 🔋 only in round 2. After the line is mended the tree and dashed line stay on 3B (`b-sr768/37-m6-surge.png`).
- **Empty town result is thin:** practice homes get no lantern, so an empty town shows only the small hut (`a-jr1280/41-town-night.png`). Put lanterns at the practice homes' tiles (they have `k`) or a lantern row by the hut.
- **Mission 5 day 1 is too easy** (three jobs, one sunny block). Add one job with a tight window, or a car, so the first round teaches the window rule.
- **Mission 3 with reduced motion** is 24 Next presses per day (72+ for the mission): add "Keep this choice until it changes ➜" (skip to the next hour where the forecast block changes).
- **Progress per round:** leaving in round 3 of a mission restarts it from round 1. The full-day plan asks for saving after every stage.
- **Crew order (seniors):** add "lock off and post a warning notice" to isolate, and mention the permit to work; it is the step real crews name.
- **Cold load pickup "settles after a few minutes":** with heating it can take tens of minutes; "settles after a while" is safer.
- **Small wording:** "a 86 kW gap" → "an 86 kW gap" (`m2-play.js`); plate shows lower-case "a sunny Saturday" (`showSlot` strips "Day 1 of 3: "); "Day 3 of 3: a winter night" for a whole day from 6 am (say "a winter day"); plate "A grey morning · 9 pm".
- **Senior record line 5:** `kwh` counts every job's energy, not only the moved ones; say "13 jobs (360 kWh of flexible demand) on surplus renewables" or count moved jobs only.

## Checked and correct
- 49.8–50.2 Hz as the normal band; supply above demand raises frequency, below lowers it.
- kW versus kWh: "the gap in kW for one hour is that many kWh"; the distractor (peak kW written as kWh) and its feedback are good (`b-sr768/11-m2-kwh.png`).
- Fault passage indicators: lit where fault current passed, fault beyond the last lit one; open the nearest switch upstream; reclosing onto the fault trips again.
- Turbines cutting out in too-strong wind and restarting when it drops.
- Crew safety order: isolate, prove dead, earth, repair, remove earths/all clear, re-energise (juniors: off, test, mend, stand clear and switch on).
- Cold load pickup: restore one area at a time.
- Ages 8–12 see no kW, kWh, money or budget anywhere (only the battery percentage, item 1). No typing, no names, no outside requests.
- The 1280×800 ages 8–12 "midnight" slot label in mission 5 now fits ("12am", `j/jr1280-m5-04-m5-moved.png`); no clipping found at 1280 or 768.
- Town result: control hut appears by day; lanterns lit/dark by the rules at night in built towns.
