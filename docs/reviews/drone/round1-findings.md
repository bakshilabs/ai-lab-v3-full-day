# Drones at work (module `drone`): one-hour review, round 1

Reviewed on branch `claude/jolly-goldberg-e9txp9`, 16 Nov 2026. Code read in full (`games/ecotown/game/js/modules/drone/*`, `js/series.js` jobs and talk lines, `js/ui/talk.js`). Played in Chromium (Playwright, SwiftShader) on a very slow, shared machine; timings below are estimated for a normal device, not measured.

All paths below are under `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/drone/hour1/`.

## Runs
| Run | Folder | What | Result |
|---|---|---|---|
| Ages 8–12, 1280×800, motion on, small town, from mission 1 | `full-stuck-at-landing/` | the repo's own driver, all six | **Stuck at the mission 2 landing for 20 min; landing never registered** (see M1) |
| Same, with the bot's landing changed to come down a little faster (`run2.mjs`) | `full-run2-stalled/` | from mission 1 towards the end | landed this time; went through ground school, hand flying, delivery (both orders) and the survey, then timed out at the mission 5 opening on the overloaded machine (mission 5 with motion on then passed alone: `insM/`) |
| The same again after the worker restarted | `full-run3-stuck-at-landing/` | from mission 1 | **stuck on the pad again for 20 minutes** (`...-17-hand-landed.png`): a third reproduction of M1, even with the faster bot. Stopped there. |
| Ages 13–17, tablet 768×1024, large text, reduced motion, **fully built town** | `senA/` | missions 1–2 | **Stuck at the landing** (same bug) |
| Ages 13–17, 1280×800, reduced motion, **empty town** | `senB/` | missions 4–6, record, jobs, talk, break | all passed (`finished` false only because mission 3 was seeded, so no route in town) |
| Ages 8–12, tablet 768×1024, large text, reduced motion | `junC/` | missions 5–6, record, jobs, talk, break | all passed |
| Ages 8–12, 1280×800, motion on | `insM/` | mission 5 | passed |
| Keyboard only | `keys/` | map, opening, ground school day 1, hand-flying take-off | focus bug (M4) |
| Leave mid-flight, resume, replay | `leave/` | | all good: scene cleaned, keys released, progress kept, replay keeps `done` |
| Phone 390×844, touch | `phone/` | map, ground school, hand flying with the touch pad | works; pad and HUD fit |

**About the end-to-end run:** M1 stopped two of the three attempts from mission 1; the other got through missions 1–4 and timed out for load. The end of the hour (mission 5 → 6 → record → "Jobs that use this" → "Talk it over" → "Break time" → the town) was played end to end in `junC/` (ages 8–12) and `senB/` (ages 13–17), both passing. Together the runs cover every screen of the hour, but no single uninterrupted run reached the break; the next review should do one once M1 is fixed.

No page errors or outside requests in any run. No money, coins or budget anywhere in the module (checked by search too).

## Scores (1–10)
| Aspect | Score | Why, in one line |
|---|---|---|
| First minute | 8 | Clear mission map, "about seven minutes each", an opening card naming the real job; the Start button gets focus but shows no ring until a key is pressed. |
| Visual quality | 7 | The 3D flying is attractive and readable (plumb line, rings, hoops). The 2D panels are tidy but plain; the survey photo strips are almost invisible; the inspection camera hides what is being inspected; the landing pad can sit on the river. |
| Controls and feel | **5** | **Gentle landings are not detected (M1)**, which blocks mission 2 for exactly the careful child the game asks for. Controls change between missions (compass in 2 and 5, forward-and-turn in 3). Inspection camera framing (M5). Keys and touch otherwise work; reduced motion cuts camera moves and tilts properly. |
| Engagement and pacing | 7 | Good variety; missions 4 and 6 are short and have one obvious answer, and the easiest mission (6) comes last. |
| The skill is real (and accurate) | 6 | Most of the Drone Code content is right, but airports are never taught (M2), the nesting-bird line overstates the law (M3), and the 4 m inspection distance and 20 cm repair limit are made up but presented as rules (M6). |
| Feedback and honesty | 7 | "Look again" then "tell" is well judged throughout. But a stuck landing gives no feedback at all, Florence's top line goes stale in ground school, and the record can claim things the child never did (N7). |
| Wording | 8 | Plain British English, short sentences for 8–12, good numbers for 13–17. A few junior lines run to three or four sentences. |
| Age fit (both routes) | 7 | Two routes are well separated (numbers, sizing cracks, % of sick crop for 13–17; no numbers for 8–12). 13–17 runs short of the hour. |
| Access | 6 | Keyboard focus lands on the wrong button in ground school (M4); Hub Start has no visible focus; phone ground school puts the checks below the fold. Large text and reduced motion work; every instruction is spoken. |
| Robustness | 8 | Leaving mid-flight removes everything and keeps finished missions; replay works; no errors in nine runs. |
| Record and town | 7 | Good six-badge picture and lines; the 13–17 rescue line is cut off with "…" (M7); default lines invent results (N7); the route keeps flying in the town. |
| Fills the hour | 7 | About 45 minutes for 8–12, about 35 for 13–17 (table below). Good variety; uneven difficulty ramp. |
| **Module score (lowest)** | **5** | |

### Minutes per mission (estimate, normal device)
| Mission | 8–12 | 13–17 | Notes |
|---|---|---|---|
| 1 Ground school | 8–9 | 5–6 | 3 days × 4 checks, then 6 flight plans |
| 2 Hand flying | 6–9 | 4–6 | take-off, two hovers, 4 hoops, landing (longer with M1) |
| 3 Delivery | 10–13 | 8–10 | hand flight, free flight, two planned deliveries |
| 4 Farm survey | 5–7 | 4–5 | two fields, then reading the map |
| 5 Inspection | 7–9 | 5–7 | two 3D flights of three frames, two photo reviews |
| 6 Search and rescue | 4–6 | 3–4 | camera, pattern, 2–3 warm spots, 18 taps to guide |
| Cards between missions | 2–3 | 2 | |
| **Total play** | **42–56** | **31–40** | target about 45 |

Variety is good: a checklist and map judgement, hand flying, writing steps, a planning puzzle, precision flying, then a search. The ramp is uneven: missions 2, 3 and 5 are the hardest; 4 and 6 are the easiest, and 6 ends the hour. For 13–17 the hour is short by 5–15 minutes.

## Must-fix

### M1. A gentle landing is never detected: mission 2 can't be finished by a careful child
- **Reproduce:** mission 2, reach the landing, fly over the orange pad and come down slowly (tap Down, or let go well above the pad). The drone settles on the pad and nothing happens: the HUD still says "Now come down slowly", the drone cannot move sideways, and pressing Down does nothing. The repo's own browser bot, which comes down slowly, sat on the pad for 20 minutes in three separate runs (ages 8–12 motion on, twice; ages 13–17 reduced motion). One of those used a faster descent. Only one run in four landed.
- **Screenshots:** `full-stuck-at-landing/junior-1280x800-small-motion-17-hand-landed.png`, `full-run3-stuck-at-landing/junior-1280x800-small-motion-17-hand-landed.png`, `senA/senior-768x1024-built-large-17-hand-landed.png` (height 0, still "Now come down slowly"). A simulation of the same physics is in `landsim.mjs`: at 60 fps every descent slower than about 1.2 m/s gets stuck; only faster ("firm") descents register.
- **Cause:** `fly3d.js` `move()`: `onGround = S.y <= S.floor + 0.02` is taken at the start of the frame, and `touched` is reported only if `!onGround`. A slow descent enters the 2 cm band in one frame and crosses the floor in the next, while `onGround` is already true, so `touched` stays `null` for ever. While `onGround` is true, sideways input is also zeroed, so the child can't even slide off and retry.
- **Fix:** track an `airborne` flag instead: set it when `S.y > S.floor + 0.05`; when `S.y <= S.floor + 0.02` and `airborne`, report `touched = max(0, -S.vy)` and clear it. Or treat "resting within 2 cm of the floor with no up input" as a touchdown at the last descent speed. Add a unit test that drops at 0.3 m/s at 60 fps and expects a soft landing. If a child stays on the pad off-target for 3 s, say what to do ("Go up a little and try again").

### M2. Airports are never taught
- **Reproduce:** play mission 1 at either age. The spec (`docs/curriculum.md` §2: "keep away from people and airports") and the Drone Code put airports (flight restriction zones) first, but no plan, map label or line mentions them; `airport` appears only in a code comment in `m1-ground.js`.
- **Screenshot:** `full-run2-stalled/junior-1280x800-small-motion-07-ground-map.png` (no airfield on the map).
- **Fix:** add an airfield at the map edge with a shaded zone, and a seventh plan (or replace the wood plan): "Film the planes landing from the field next to the airfield" → Do not fly; rule: "Never fly in the zone round an airport or airfield without permission. Planes take off and land there, low down." For 13–17, add "Check the zone on a drone safety map before you fly." The curriculum also says "an airspace map with no-fly zones"; drawing the hospital helipad and cliffs as shaded zones as well would make it a real map-reading skill, not just a scene.

### M3. The nesting-bird rule overstates the law
- **Reproduce:** mission 1, plan 3: "Disturbing wild birds on their nests is against the law."
- **Screenshot:** `senA/senior-768x1024-built-large-07-ground-map.png` (plan screen; reply in `m1-ground.js` `PLANS[2].rule`).
- **What's true:** in the UK it is an offence to damage a wild bird's nest while it is in use, and to disturb *specially protected* (Schedule 1) birds while they nest; disturbance of other birds is not in itself an offence. The Drone Code says to keep away from wildlife and that disturbing some nesting birds is illegal.
- **Fix:** "Many nesting birds are protected by law, and a drone can scare them off their eggs. Keep well away from nests." Keep the answer "Do not fly".

### M4. Keyboard focus jumps to the wrong button in ground school
- **Reproduce:** keyboard only. In mission 1, check the fourth item with Enter. Focus goes back to the **Battery** button, not to "Fly today / Keep it on the ground". Pressing Enter (the natural next key) reopens Battery and hides the reply. The same happens after any wrong "Look again" mark: focus lands on Battery instead of the two mark buttons.
- **Screenshot:** `keys/05-ground-day1-keys.png`; focus log in `keys/log.json` (steps 8–29).
- **Cause:** `kit.focusFirst(box, '[data-mark], [data-fix], [data-day], [data-check]')` uses `querySelector`, which returns the first match in *document* order, and the `[data-check]` buttons come first. Also `:not(:disabled)` is appended only to the last selector in the list.
- **Fix:** try the selectors in priority order (split on commas and use the first one that matches, each with `:not(:disabled)`), or pass the single right selector at each step. Check the same helper in `m4-ui.js`, `m5-run.js` and `m6-ui.js`.

### M5. The inspection camera hides what is being inspected
- **Reproduce:** mission 5, start the turbine. The camera sits low behind the drone (`cam: { up: 5, back: 14 }`, looking north). The tower fills the middle, the blades and the blue frames are mostly above the top of the screen, and the child flies by the arrow alone. This is worst on the upright tablet.
- **Screenshots:** `insM/junior-1280x800-small-motion-04-inspect-turbine-start.png`, `insM/...-05-inspect-turbine-flying.png`, `junC/junior-768x1024-small-large-05-inspect-turbine-flying.png`.
- **Fix:** raise and pull the camera back for the turbine (for example `up: 10, back: 22`) and aim it at the nearest frame's height (`wantL.y` = the frame's `y`), or offset the camera to the side so the rotor and the frames are in view. Start the drone level with the hub, not 14 m below it. Check that on a 768×1024 screen the next frame is always in view.

### M6. Invented limits presented as real rules
- **Reproduce:** mission 5. "Keep at least 4 m from the turbine" (13–17 HUD: "keep over 4 m"), and for 13–17, "Repair before it is used again (over 20 cm)".
- **Screenshots:** `senB/senior-1280x800-empty-15-inspect-turbine-flying.png`, `senB/senior-1280x800-empty-17-inspect-turbine-found.png`.
- **What's true:** there is no fixed 4 m rule. Inspection companies set their own stand-off distances, usually several metres or more from blades, and real turbine inspections are flown by approved operators. Repair limits come from the maker's or owner's manual, not one number.
- **Fix:** say whose rule it is: "This company's safety rule: stay at least 5 m away", and "Your company's rule: cracks over 20 cm are repaired before use." A line on the opening card for 13–17 ("Inspection pilots hold extra permission from the Civil Aviation Authority") would make the job real.

### M7. The take-home rescue line is cut off for 13–17
- **Reproduce:** finish all six as 13–17. The record card shows "…guided the team (18 squar…".
- **Screenshot:** `senB/senior-1280x800-empty-31-record-card.png`.
- **Fix:** shorten `lineFor('rescue')` so it stays under 120 characters, e.g. "Search and rescue: heat camera, growing squares from the last sighting; guided the team 900 m to the walker."

## Nice-to-have
1. **Same controls in every flying mission.** Missions 2 and 5 use compass arrows plus Space and Shift; mission 3 (with motion on) uses forward and turn. Either use compass everywhere or say so on mission 3's card ("This drone flies like a car: up goes forward, left and right turn").
2. **Survey photo strips:** a single strip (`fill-opacity .16`) is almost invisible, so only overlaps show, yet Florence says "each line of photos is the width of the blue strip". Raise single-strip opacity to about 0.3 and outline each strip (`full-run2-stalled/...-26-survey-plan-gaps.png`, `leave/05-replay-survey.png`).
3. **The survey has one right answer** per field (2 squares apart; east to west at the farm). Add a third field with wind or a no-fly corner, or let 13–17 choose front overlap too (mapping teams use about 75% along the line and 60–70% between lines).
4. **Plant health view** is a flat red block, which takes no reading at all; add texture and gradients and a near-infrared line for 13–17 ("the camera sees light our eyes cannot"). The legend "Healthy (over 75%)" suggests a measured percentage; say "health score" or use an index from 0 to 1.
5. **Rescue at dusk:** "At dusk the normal camera sees almost nothing" overstates it; at dusk a normal camera still sees a fair amount. Say "As it gets dark…" or set the mission "after dark". For 13–17, mention that heat cameras work best once the ground has cooled, and that drones flying at night need a light.
6. **Pattern choice is not a decision:** both patterns work and the comparison comes only on the closing card. Show both search times side by side before going on, or let the child replay the other pattern.
7. **Record defaults invent results:** `lineFor()` with an empty summary says "flew 4 of 4 hoops and landed gently" or "found 2 cracks" (seen when earlier progress lacked summaries). Default to neutral lines ("Hand flying: done").
8. **Florence's top line goes stale** in ground school: after the day decision, the bar still reads the last check ("Where you will fly…") while the side says "Look at the checks again" (`full-run2-stalled/...-06-ground-gale.png`). Call `P.say(r.text)` for day and fix replies too.
9. **Ground-school variety:** "Where you will fly" is fine on all three days, and the answer each day is clear. Add one day where the area is the problem (people walking a dog across the field, or a power line).
10. **Built town:** the landing pad can land on the river and the take-off pad on an allotment (`senA/...-17-hand-landed.png`); avoid river tiles in `course().at()`.
11. **Inspection numbering:** the HUD's "Photo 1 of 3: the village tower" counts photos taken but names the nearest frame, while the review calls the town tower Photo 1. Use "Next photo: the village tower (1 of 3 done)".
12. **13–17 extras** from the Drone Code: Flyer ID and Operator ID, keeping 50 m from people, never flying near an emergency response.
13. **Hub focus ring:** the Start button is focused on open but has no visible ring until a key is pressed; give the focused primary button a ring regardless of `:focus-visible`.
14. **Difficulty ramp and the 13–17 hour:** move something harder late (e.g. 13–17 rescue with wind and battery, or a second search area), so the hour ends on a stretch and 13–17 fills about 45 minutes.
15. **Phone (not a target):** ground school puts the four checks below the picture; the picture has large empty space above and below (`phone/03-ground.png`).

## What is good
- Each mission opens with a real job in one line and closes with what the child can now do. The jobs screen, talk questions and break screen are right for the module (`junC/...-22-jobs-that-use-this.png`, `...-23-talk-it-over-done.png`).
- Ground school's two-step hints ("Look again…", then the answer) and "Saying no is part of a pilot's job" are excellent.
- The 120 m limit (about 400 ft), the side view, keeping the drone in sight (the screen does not count), never over crowds, air ambulances, stopped-and-locked turbines, expanding-square and parallel-line searches, and checking every warm spot are all accurate.
- Robustness is strong: leaving mid-flight cleans up the scene and keys, finished missions are kept, replay works, and there were no errors.
