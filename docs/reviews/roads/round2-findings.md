# Self-driving cars (`roads`), the one-hour version: independent review 2

Branch `claude/jolly-goldberg-e9txp9`, module `games/ecotown/game/js/modules/roads/`. Reviewed 16 Nov 2026 with no code changed. All paths below are relative to this folder: `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/roads/hour2/`.

**How I played it** (one browser at a time; the work was paused and resumed once):
- The repo's full run `tests/playwright/roads.mjs`, ages 13–17, upright tablet 768×1024, with motion, fully built town (42 families). All six missions, then the record card, Jobs, Talk it over and Break time, and the street in the town. **Every check passed**, including `captionsHold` and `townCarMoves` (which failed in round 1), with no page errors and no outside requests (`full-senior-tablet-motion-built/`, `full-senior.log`).
- Single missions with my own `m.mjs` and `lib.mjs`:
  - M1: ages 8–12, laptop 1280×800, reduced motion, empty town (`shots/m1-junior-laptop/`).
  - M2: ages 8–12, tablet, touch (`shots/m2-junior-tablet-touch/`). My script tapped the centre of a box's group, which after labelling includes the label text, so it stuck on picture 3. That was a script fault, not the game's. The screenshots up to then are valid.
  - M3: ages 8–12, laptop, with motion, through scene 7 (`shots/m3-junior-laptop-motion/`).
  - M4: ages 13–17, tablet, large text, with motion (`shots/m4-senior-tablet-large-motion/`).
  - M5: ages 8–12, phone 390×844, large text, touch (`shots/m5-junior-phone-large/`).
- Leave in the middle of M4, come back, replay M1, leave again, then reload the page (`shots/robust/log.json`).
- Every M3 scene and option, drawn at 0, 45, 75 and 100% of the test (`svg/m3-*.png`).
- The fleet model swept over every waiting place, charger and fleet size (`fleet-probe2.mjs`).
- The unit tests: 35 of 35 roads tests pass.

**Round 1 must-fixes: all done and verified.**
- M3 now drives on the left in every scene (checked frame by frame). The turn is a real left turn into a side road to the north.
- The stopping distances are now right. The car's own figures are 8/17/28 m, and the Highway Code's figures for a person driving (12/23/36 m) are given next to them.
- M2's second test uses fresh pictures with two new hard cases (9 of 11 for ages 8–12; 10 of 12 for ages 13–17).
- The shared "Jobs that use this" screen shows the four curriculum jobs.
- M4 at dusk now agrees with M1 that radar finds something, but not that it is a person.
- The wording bugs are fixed.

Most round 1 nice-to-haves are done too:
- "Start: mission 1".
- The fewer-cars nudge shows only when one car fewer would still meet the goal.
- "just over half" for 51–55%.
- M5 starts at 8 cars.
- An icy-road scene and the ambulance scene, where too much caution is wrong.
- The M3 near miss freezes, with the marker by the person.
- M4's "new car from the factory" framing.
- M2 boxes are numbered left to right, and the task is restated on each picture.
- M1's spray and "most lidars" wording.

## Scores

| Aspect | Score | One line |
|---|---|---|
| First minute | 8 | The map, then a card for the real job, then Start. Clear on both routes. |
| Visual quality | 8 | The sensor views, labelling pictures, M3 scenes, fleet map and 3D street are good. On a tablet the 2D pictures leave empty bands above and below. |
| Controls and feel | 8 | Taps, touch, number keys and focus all work. There are no overlaps at laptop or tablet size, with or without large text. |
| Engagement and pacing | 8 | Six different activities. M3 now has animated tests and two "too cautious is wrong" scenes. M2's results are the same every time. |
| The skill is real (and accurate) | **7** | The Highway Code rules, distances and sensor facts are right. But M2's "person half hidden by a van" cannot be seen at all in the labelling picture (must-fix 1). |
| Feedback and honesty | **7** | The hints climb well and the fleet nudges are honest now. But for ages 8–12, M5's charging hints point the wrong way (must-fix 2). |
| Wording | 8 | Short and plain. One small slip: M4's test log has "all pass" in lower case after a full stop. |
| Age fit | 8 | No money. Ages 13–17 get mph, metres, %, Doppler, rule numbers, an ice scene, a peak round and a trade-off chart. Ages 8–12 get words for shares. |
| Access | 8 | Read-aloud, reduced motion, large text and keys all work. On a phone with large text, M5's map vanishes (phones are outside the brief). |
| Robustness | 9 | Leaving mid-mission keeps the finished missions, and the map reopens at the right mission. Replay works, and so does a reload. |
| Record and town | 8 | The record card, before-and-after picture, practised lines and street in the town are good. The record for ages 13–17 still shows test scores. |
| Fills the hour | 8 | About 45–50 min (ages 8–12) and 40–46 min (ages 13–17). Varied, with a fair ramp. |

**Module score: 7** (the lowest are "The skill is real" and "Feedback and honesty"). Both must-fixes are small. With them done I would expect 8 across the board.

### Minutes per mission (estimated from the steps and reading load, not wall-clock time on this slow machine)
| Mission | Ages 8–12 | Ages 13–17 | Notes |
|---|---|---|---|
| 1 How a car sees | 7–8 | 6–7 | 5 or 7 rounds of three views, tick and check, then the sensor table |
| 2 Labelling | 7–8 | 6–7 | 6 or 7 pictures, two tests |
| 3 Rules of the road | 7–8 | 6–7 | 7 or 8 scenes, each a 4-second animated test |
| 4 Simulation | 7–9 | 5–6 | at least 8 runs, three stages |
| 5 Shared fleet | 6–8 | 8–10 | 3 or 4 rounds; ages 13–17 also read the chart |
| 6 Street | 10–12 | 9–11 | the built loop |
| **Total play** | **≈ 45–50** | **≈ 40–46** | target ≈ 45 |

## Must fix

### 1. M2: the "half hidden" person is completely hidden (accuracy, feedback)
- **Reproduce:** Mission 2, the first hard picture (a van, a person behind it, a green light).
  - In this picture the person stands at x 2.75, z 15.5. The van is at x 1.6, z 13 and 2.2 m wide. In the perspective view the nearer van hides the whole person; at most a speck of the head shows.
  - A child cannot see anyone to label. The hint "Look closely on the right, by the van" points at nothing, and the third hint just boxes an empty patch of van.
  - That teaches the wrong lesson. Real labellers box a person who is **partly** visible.
  - The test card for the same case ("A person half hidden by a van") shows the person clearly beside the van, so the two disagree.
- **Screenshots:** `full-senior-tablet-motion-built/10-m2-hidden.png`, `zoom-hidden.png` (enlarged), `shots/m2-junior-tablet-touch/09-pic3-miss2.png`. Compare with `shots/m2-junior-tablet-touch/06-test1.png` and `full-senior-tablet-motion-built/11-m2-test2.png`.
- **Fix** (in `labels.js`, `HARD[0]`):
  - Move the person to about x 3.2–3.4 (or the van to x 1.0), so that about half the body shows past the van's right edge, as on the test card.
  - Add a unit test: the projected width of the `hidden` case outside the van's box is at least 35% of its own box.

### 2. M5 charging round: the hints for ages 8–12 point the wrong way (feedback)
- **Reproduce:** Ages 8–12, M5 round 3. Keep the round-2 plan (both homes, 8–11 cars) and run with the charger at the Depot.
  - Florence says "Too long a wait. **Where do most people call from?**" But the cars already wait at both homes; the problem is charging.
  - After four tries she adds "Put the charger **where cars wait**, and add cars." Chargers can only go at the Depot, Shops or Station, never at the homes, so a child cannot do what she says.
  - The model sweep shows that with both homes, only a Shops charger (11 or more cars) or a Station charger (13 or more cars) works.
- **Screenshot:** `shots/m5-junior-phone-large/11-r3-after4.png` (log `shots/m5-junior-phone-large/log.json`, steps r3-depot to r3-after4).
- **Fix** (in `fleet.js` `fleetSay` and the tries-at-least-4 line in `m5-fleet.js`):
  - In the charge round, make the tip about charging: "Charging takes cars away for 15 minutes. Is the charger far from where the cars wait?"
  - Make the late hint "Put the charger **near** where the cars wait (the shops are close to both homes), and add a car or two." The 13–17 line ("near the waiting places") is already right.

### 3. (Shared screen, not the module's files) The break after roads says the day is over
- **Reproduce:** Finish the hour, then Jobs, Talk it over, Break time. It says "That is the end of today's parts. Well done for today."
  - `nextPart('roads')` in `js/series.js` returns null, because `PARTS` stops at roads.
  - In `docs/full-day-plan.md`, roads is part 4 at 13:25–14:25, with the film studio and power control room still to come.
- **Screenshot:** `full-senior-tablet-motion-built/41-break.png`.
- **Fix:** Add film and power to `PARTS` when they ship. Until then, have the break screen after roads say "Next: Part 5, Town film studio" (or "Your teacher will tell you what is next"), not "end of today's parts". This belongs to whoever owns the shared pieces. It is flagged here because it is what a child sees at the end of this hour.

## Nice to have
- **The driver's-eye view sits on the centre line (M1 and M2 pictures).** In `art.js` the camera is at x 0 and the dashed centre line runs straight ahead under it. Other traffic is drawn correctly in the left lane, but a UK car should itself sit in the left lane. Shift the viewpoint about 1.8 m left (a `CAM_X` in `project()`), so the centre line runs to the right of the view (`shots/m1-junior-laptop/13-r4-camera.png`).
- **The record for ages 13–17 still shows scores:** "the car on unseen pictures: 4/10 before, 10/12 after" and "3 of 3 crossings safe" (`full-senior-tablet-motion-built/39-record.png`). MODULES.md asks for what was made or practised. For example: "Labelled 18 objects (6 edge cases); tested on two unseen sets."
- **M2 is the same every time.** The first test is always 4 of 9 and the second always 9 of 11. A wrong label can never stay. Consider letting one careless label through (say, a reflection labelled "person") and showing its cost in the test.
- **The 20 sign in the M3 school scene (ages 8–12)** gives the answer away, and it stands on the far side of the road. Put it on the near (north) kerb, or show it only after the test.
- **The 2-second rain result** labels the end frame "gap left" next to a red "!" marker. Use "only just" so the label and the marker agree (`svg/m3-rain.png`).
- **M5 chart for ages 13–17.** The model is not always monotonic: in some plans one more car gives a longer wait. For example, both homes with the charger at the Station gives 11 cars 9 min, 12 cars 8 min, 13 cars 6 min, but homes West plus Station with the charger at the Station gives 12 cars 6 min and 13 cars 9 min. That shows up as a bump in the chart. Smooth it, for example with the nearest free car breaking ties by waiting place, or say in one line that real data is bumpy.
- **M5 on a phone with large text.** The tray fills the screen, the map and numbers disappear, and Florence's line is cut off under the tray (`shots/m5-junior-phone-large/11-r3-after4.png`). This is outside the brief, but a small tablet with large text may be squeezed too. Let the page scroll, or fold the controls.
- **Tablet pictures.** In M1, M2 and M3 an 800×420 picture sits in a tall stage with about 150 px empty above and below (`full-senior-tablet-motion-built/05-m1-lidar-fog.png`, `13-m3-school-miss.png`). Centre a caption or the question there, or allow a taller crop.
- **M4 log wording.** Use "All pass" and "1 failing" with a capital after the full stop (`shots/m4-senior-tablet-large-motion/07-dusk.png`).
- **M1:** the question appears twice, in Florence's panel and again in the tray. Show it once.

## Accuracy checks (all correct)
- **Left-hand traffic in M3**, all 8 scenes and every option:
  - Our car drives east in the north lane, and oncoming traffic drives west in the south lane.
  - The cyclist rides by the north (left) kerb and is passed on the right.
  - Pulling over for the ambulance goes to the left kerb.
  - The junction turn is a left turn into a side road to the north.
  - The child steps out from the north kerb between cars parked there.
- **Highway Code:**
  - Rule 126: a 2-second gap, at least double on wet roads. Braking distances 6/14/24 m and typical stopping distances 12/23/36 m at 20/30/40 mph; the "thinking distance plus braking distance" explanation is right.
  - Rule 163: at least 1.5 m when overtaking a cyclist at up to 30 mph, and wait behind if it is not safe.
  - Rule 195: be ready to slow or stop for people waiting at a zebra crossing; you MUST give way to people on it.
  - Rule 219: help an emergency vehicle pass, and pull to the side where it is safe.
  - Rule 230: stopping distances can be ten times greater on ice.
  - Rule H2 (2022): give way to people crossing or waiting to cross a road you turn into.
  - The rule numbers and wording are right.
  - Two simplifications are stated honestly: the car reacts in 0.2 s (so its stopping distances are 8/17/28 m), and the icy gap is 10 × 2 s.
- **Sensors:**
  - The camera gives colour and detail but needs light and clear air, and spray blurs far things.
  - Radar gives range and Doppler speed in any weather, but a blurry picture.
  - Lidar gives 3D shape and range by time of flight, works in the dark, and fog scatters it. "Most lidars" do not measure speed directly.
  - The sensor table leaves two gaps with all three sensors (far shapes and signs in thick fog). That is consistent, and matches M4 (rain: a camera-only car fails; dusk: radar finds something but not that it is a person).
- **M2 does not retest on the training pictures.** Both tests use pictures never labelled, and the second set is fresh, with two new cases.

## What is good (keep it)
- Six clearly different real uses, each opening with the real job and closing with "Now you can".
- M3 is now an accurate and lively Highway Code mission, with honest near misses.
- M4's one-change-at-a-time lock, the replays and the "too many needless stops" trade-off.
- M5's goals now match the words, the nudges are honest, and ages 13–17 get a peak round and a chart.
- The jobs, talk and break screens appear in order. The street stays in the town.
- Saving across a leave and a reload is solid.
