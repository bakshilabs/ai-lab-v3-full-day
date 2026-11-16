# Self-driving cars (`roads`), the one-hour version: independent review 1

Branch `claude/jolly-goldberg-e9txp9`, module `games/ecotown/game/js/modules/roads/`. Reviewed 16 Nov 2026. I changed no code.

**How I played it.** I served `games/ecotown/game` on port 8873 and used Chromium through Playwright. My own scripts are `lib.mjs` and `m.mjs` (one mission per run), plus `svg.mjs`, `fleetcheck.mjs`, `words.mjs` and `touch2.mjs`. I also ran the repo's full test `tests/playwright/roads.mjs` in three set-ups:
- junior, laptop 1280×800, reduced motion (stopped by the worker restart once mission 6's land was built);
- senior, tablet 768×1024, with motion, fully built town (42 families). This run completed. It failed two checks: `captionsHold` (the first ride caption stayed up 2.2 s) and `townCarMoves`.
- junior, laptop, large text, keyboard. This run was still going when I wrote this.

I also played single missions in these set-ups:
- M1: junior laptop; senior tablet with large text and motion;
- M2: junior tablet by touch, and junior laptop with deliberate mistakes;
- M3: senior tablet with motion; junior laptop with motion;
- M4: senior laptop, keyboard (Enter for the main buttons; settings were clicked);
- M5: junior phone 390×844 with large text and touch; senior laptop.

The empty town and the built town were both played (25 and 42 families). Screenshots are under `shots/<run>/`, `base-*/` and `svg/` in this folder. The 40 unit tests for roads and the module contract pass, and no run hit a page error.

## Scores

| Aspect | Score | One line |
|---|---|---|
| First minute | 8 | The mission map, then a clear card for the real job, then Start. The first button says "Carry on: mission 1" before anything has been played. |
| Visual quality | 7 | The sensor views, labelling pictures and 3D street are good. In M3 the scene is small on a tablet with empty bands, and an unsafe test ends with the car off-screen. On the phone the M5 map vanishes. |
| Controls and feel | 8 | Taps, touch, number keys and focus handling all work, with no layout overlaps at laptop or tablet size. |
| Engagement and pacing | 7 | Good variety, but M1 and M3 are pick-the-answer quizzes, M5 round 1 is "press + seven times", and M2 always ends 9 of 9. |
| The skill is real (and accurate) | **6** | The Highway Code mission draws traffic on the right. The turn is a right turn but the words say left. "Stopping distance" uses figures that are not the Highway Code's. M2 trains and retests on the same pictures and reaches 100%. M4 contradicts M1 about radar at night. |
| Feedback and honesty | 7 | The hints climb well and never give the answer early. But "100%" accuracy is overclaimed. Florence says "Could fewer do?" when fewer cannot. Ages 8–12 see "about half" empty driving yet fail a "less than half" goal. |
| Wording | 7 | Mostly short and plain. Bugs: "There is 3 more things", "1 sensors", a lower-case "needless stops" after a full stop, "camera: 9 gaps". |
| Age fit | 8 | No money, and ages 13–17 get mph, metres, %, Doppler and a trade-off chart. M3 is too easy for ages 13–17. |
| Access | 7 | Read-aloud, reduced motion (M3 jumps to its last picture), large text and keys all work. On a phone with large text, M5's map and numbers are squeezed out. |
| Robustness | 8 | Leaving and resuming at the map works, missions open in order and replay works. Leaving mid-mission loses that mission's progress, which the spec allows. |
| Record and town | 7 | The record card, picture, practised lines and street in the town are good. The record shows scores ("right first time in 0 of 5", "44% → 100%"). The required "Jobs that use this" screen is missing. |
| Fills the hour | 7 | About 42–47 minutes for ages 8–12 but about 32–36 for ages 13–17. The difficulty ramps reasonably. |

**Module score: 6** (the lowest is "The skill is real (and accurate)").

### Minutes per mission (estimated from the steps and reading load, not wall-clock time on this slow machine)
| Mission | Ages 8–12 | Ages 13–17 | Notes |
|---|---|---|---|
| 1 How a car sees | 7–8 | 4–5 | 5 rounds × (3 views, tick, check, read why), then the sensor kit |
| 2 Labelling | 6–7 | 4–5 | 6 pictures, 2 test screens |
| 3 Rules of the road | 5–6 | 3 | 6 two-to-four-choice quizzes; the cautious answer is always right |
| 4 Testing in simulation | 6–8 | 4–5 | at least 8 runs; the table is abstract for ages 8–12 |
| 5 Shared fleet | 5–7 | 4–5 | 3 rounds; ages 13–17 also get a chart |
| 6 Street | 10–12 | 9–11 | the built loop |
| **Total play** | **≈ 42–47** | **≈ 32–36** | target ≈ 45 |

## Must fix

### 1. Mission 3 draws traffic on the right, and the "turn left" is a right turn (accuracy)
- **Reproduce:** Mission 3, any scene, but best in "Overtaking a cyclist", "No room to pass" and "Turning at a junction".
  - Our blue car drives east (left to right) in the **lower** half of the road, with the cyclist at the lower kerb. The oncoming car drives west in the upper half. Seen from above with the homes to the north, that is driving on the right.
  - In "Turning at a junction" the car turns from east to south, which is a **right** turn. The senior question says "Turning left into a side road".
  - For a mission built on the UK Highway Code (rules 163 and H2) the picture teaches the wrong side of the road.
- **Screenshots:** `svg/m3-turn.png`, `svg/m3-narrow.png`, `svg/m3-school.png`, `shots/m3-senior-tablet-motion/15-s3-unsafe-end.png`.
- **Fix** (in `m3-rules.js`):
  - Mirror the lanes: our car in the upper lane (`LANE` about 168), oncoming traffic in the lower lane (`OTHER` about 255).
  - Put the cyclist by the upper kerb and the parked cars and child on the north kerb.
  - Put the side road on the north side, so that turning from east to north is a left turn.
  - Or flip the travel direction to westward. Either way, check every scene again for UK left-hand traffic.

### 2. "Stopping distance" figures are not the Highway Code's (accuracy, ages 13–17)
- **Reproduce:** Mission 3, "School street", choose 30 mph.
  - The results say "Stopping distance at 20 mph: 8 m" and "at 30 mph: 16 m".
  - The braking distances in the code (6, 14 and 24 m) match the Highway Code. But Rule 126's typical **stopping** distances are 12, 23 and 36 m (thinking distance plus braking distance).
  - The game adds a fixed 2 m "to react" at every speed. Thinking distance really grows with speed.
  - A teenager now learns "stopping distance at 20 mph is 8 m".
- **Screenshot:** `svg/m3-school.png` ("needs 8/16/26 m to stop").
- **Fix** (in `rules.js`):
  - Call it "**the car's** stopping distance" and add one line: "A person driving needs about 12 m at 20 mph (Highway Code); a computer reacts faster."
  - Make the reaction part scale with speed, for example 0.2 s: about 2, 3 and 4 m.
  - Note that at 20 mph a human driver's 12 m equals exactly the 12 m of room, which is itself a good teaching point.

### 3. Mission 2 always ends at 9 of 9 (100%), retested on the same pictures (the skill and honesty)
- **Reproduce:** Play mission 2 any way at all.
  - The labels must be corrected before Done passes, so the first test is always 4 of 9 and the retest always 9 of 9.
  - The take-home record says "test accuracy 44% → 100%".
  - Florence says "test it on the same pictures". Fixing what failed and retesting on the same set is the classic test-set mistake the mission should warn against.
  - One labelled example per edge case giving a perfect model overstates it.
- **Screenshots:** `base-junior-laptop/11-m2-test2.png`, `base-senior-tablet-motion-built/38-record.png`.
- **Fix** (in `labels.js`):
  - Make the second test use **fresh** pictures that include one or two new edge cases nobody labelled (someone carrying a large box, a person in a costume, a mobility scooter). It might then score 9 of 11.
  - Have Florence say "New hard cases keep turning up; that is why teams keep testing on pictures the car has never seen."
  - Drop the percentage for ages 8–12.

### 4. No "Jobs that use this" screen (the curriculum requires it)
- **What is missing:** `docs/curriculum.md` says the last screen before the talk is **"Jobs that use this"**: three or four real jobs, each with one line. For this hour those are autonomous vehicle engineer, transport planner, safety test driver and traffic data analyst. The module goes from the map's Finish straight to the record card and then "Talk it over".
- **Screenshots:** `base-senior-tablet-motion-built/37-hub-done.png` → `38-record.png` → `39-talk.png`.
- **Fix:** In `index.js`, after `hub()` returns `'finish'`, show one stage card that lists the four jobs, each with a line tied to a mission (for example, "Safety test driver: checks in real streets what simulation found"), with a Next button. Add it to `missions.js` as data, with words for each age route.

### 5. M4 says radar cannot find a person at dusk; M1 taught that it can (consistency and accuracy)
- **Reproduce:** Mission 4, when the dusk test day is added, press "Fail: replay".
  - It says "neither camera nor radar resolved a pedestrian in dark clothing" (ages 8–12: "the car could not make out a person in dark clothes").
  - In M1, round 2 the child was taught that radar **does** see the person in a dark coat at night.
- **Screenshot:** `shots/m4-senior-laptop-keys/07-dusk.png` (log entry `replay-dusk`).
- **Fix** (`REPLAY.dark` in `simtest.js`):
  - Ages 13–17: "Radar found something, but its blurry picture could not tell it was a person; the camera saw too little in the low light. Lidar shows the shape."
  - Ages 8–12: "Radar knew something was there but not that it was a person."

### 6. Wording bugs a child will see (wording)
- `labels.js` `reviewSay`, ages 8–12: "**There is 3 more things** the car must know about." Seen in `shots/m2-junior-laptop-errors/log.json` (pic1, try 2). Fix: `There ${n === 1 ? 'is one more thing' : `are ${n} more things`}`.
- `sensors.js` `m1Line`, ages 8–12: "chose **1 sensors**". Use `plural()`.
- `simtest.js` `diffSay`: "…→ 20%). **needless** stops 1 → 9". Capitalise the first part, or join the parts with "; " after the first sentence (`shots/m4-senior-laptop-keys/06-stops.png`).
- `sensors.js` `kitSay`, ages 13–17: "**camera**: 9 gaps". Use the capitalised sensor names.

## Nice to have
- **The record and mission cards show scores.**
  - "Sensors: right first time in **0 of 5** views" (`shots/m1-junior-laptop/21-closing.png`) and "(5 safe on the first test)" are performance scores on a take-home page. MODULES.md asks for what was made or practised, not how well.
  - Fix: "Compared camera, radar and lidar in 5 conditions; chose all three sensors."
- **M3 is too easy and too similar for ages 13–17.**
  - The most cautious option is always right, and the "School street" picture shows a 20 sign.
  - Add one scene where over-caution fails, or ask for a number: set the gap behind a cyclist on a 40 mph road (Rule 163: more than 1.5 m), or the gap in seconds on ice (up to ten times).
- **M3 outcome pictures.**
  - After an unsafe test the car has driven off the frame. The zebra "!" sits on a house roof, away from the person.
  - Freeze the last frame at the moment of the near miss, and put the marker by the person.
  - On a tablet the 800×420 scene leaves big empty bands (`shots/m3-senior-tablet-motion/05-s1-unsafe-end.png`); let the frame fill the stage height.
- **M4 starts at 30 mph and a 2 s gap straight after M3 "loaded" 20 mph and 4 s.** Say "a new car straight from the factory, before anyone has set its rules", or start from M3's choices and fail on something else.
- **M5 feedback.**
  - "Some cars stand idle a lot. Could fewer do?" appears at the minimum fleet that works (8 cars, homes and homes: busy 45%). Show it only if `meets()` still holds with one car fewer.
  - Ages 8–12 see 52% empty as "about half" and are then told "Too much empty driving" against a "less than half" goal (`shots/m5-junior-phone-large/07-where-run.png`). Map 50–55% to "just over half".
  - Round 1 is pressing + seven times. Start at 8 cars, or let − and + step by two.
- **M5 on a phone with large text.** The map and numbers shrink to a sliver or disappear in the charging round (`shots/m5-junior-phone-large/07-where-run.png`, `08-charge.png`), and "−" is 37 px wide. Phones are outside the brief, but a small tablet with large text may squeeze it too: put the controls below the map and let the page scroll.
- **M1 and M4 disagree about rain.** In M1's table the camera works fully in rain; in M4 a camera-only car fails in rain because "spray blinded the camera". Add rain spray to M1's rain round (camera sees close up only) or soften M4.
- **M1 facts (fine as simplified, worth one word each).**
  - "Camera and lidar only give position at one moment": say "most lidars". Newer "4D" (FMCW) lidar also measures speed directly.
  - The coverage table gives the camera "read lights and signs" in the dark. That is fine for lit lights; say "lit signs and lights".
- **M2.**
  - Florence's line from the previous picture ("All labelled, first time!") stays on the next picture. Restate the task each time (`shots/m2-junior-laptop-errors/14-pic6.png`).
  - Box names follow area order ("Box 2", "Box 3", "Box 1"), not left to right.
  - A wrong label can never stay, so careless labelling has no visible effect. Consider letting a "reflection = person" label through once and showing the car braking for reflections in the test.
- **Hub.** The first button says "Carry on: mission 1" before anything is played; use "Start mission 1".
- **Ride caption.** In the senior tablet run with motion, the first ride caption stayed up 2.2 s (the test wants 2.4 s or more; `captionsHold` failed).
- **Town car.** `townCarMoves` also failed in that run (the car in the town showed x = −7 at both checks). It may be a timing artefact of this loaded machine; check it again on a normal machine.

## What is good (keep it)
- Six clearly different real uses, each with the real job in one line and "Now you can" at the end.
- M1's three sensor views are well drawn, and the hints climb without giving answers (`shots/m1-junior-laptop/log.json`).
- M4's "one change at a time" lock with replays of each failure, and the trade-off of needless stops against near misses.
- The M5 chart for ages 13–17, and M6's street.
- Highway Code checks:
  - Rule 195 (zebra crossings) is correct, including the 2022 "give way to people waiting".
  - Rule 163 (1.5 m up to 30 mph; wait behind if there is no room) is correct.
  - Rule 126 (2 s gap, at least double in the wet; braking distances 6/14/24 m) is correct.
  - Rule H2 (give way to people crossing a road you turn into) is correct.
- The radar, lidar and camera strengths are right in substance: radar gives range and Doppler speed in any weather but a blurry picture; lidar gives 3D shape, works in the dark and is scattered by fog; the camera gives colour and detail but needs light and clear air.
