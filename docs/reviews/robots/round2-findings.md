# Robots at work: one-hour review, round 2

Branch `claude/jolly-goldberg-e9txp9`, module `games/ecotown/game/js/modules/robots/`. Reviewed 16 Nov 2026. No code edited. Judged fresh; round 1 findings used only to choose what to attack.

Folder for everything below: `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/robots/hour2/`

**How it was played.** Served `games/ecotown/game` on port 8879, one headless Chromium at a time (the machine was paused and restarted part way; the cut-off run was re-run from mission 5).

| Run | Route | Screen | Settings | Town | Missions | Result |
|---|---|---|---|---|---|---|
| a + a5 (`shots/a`, `shots/a5`) | 8–12 | 768×1024 upright tablet | touch, **motion on** | small | 1–4, then 5–6, record, jobs, talk, break, replay | all checks passed, no errors |
| b (`shots/b`) | 13–17 | 1280×800 | reduced motion | **fully built** | 2–6 (incl. arm order task, leave and resume in mission 3), end, replay | all 47 checks passed |
| c (`shots/c`) | 8–12 | 1280×800 | **large text**, reduced motion | **empty** | 4 (street scene), 5, 6, end | all checks passed |
| kb (`shots/x/kb-*`) | 13–17 | 1280×800 | **keyboard only**, large text | small | all of mission 1, into 2 | every control reached by Tab and Enter |
| resume (`shots/x/resume-390-*`) | 8–12 | **390×844 phone** | reduced motion | empty | 6: leave mid-mission, replay 2, leave, resume 6 | design and trip kept (see nice-to-haves) |
| bypass (`shots/x/bypass-junior-768-*`) | 8–12 | 768×1024 | touch | small | 3 and 5: every shortcut I could find | see below |
| logic (`logic.mjs`) | both | – | – | – | every rule set and order (m3), every setting (m5), every rule (m1 room 2), every design (m6) | see below |

Unit tests: `node --test tests/robots*.test.mjs`, 20 of 20 pass. No console errors and no outside requests in any run.

## Scores

| Aspect | Score | Why, in one line |
|---|---|---|
| First minute | 8 | A clear map of six jobs, "Start with mission 1", a brief that opens with the real job, read aloud. The ages 8–12 brief for mission 1 lists two steps but the mission has three. |
| Visual quality | 8 | Clean, consistent workshop style; good arm, room, hospital plan and street drawings. Small slips: "chickwee/d" breaks mid-word in large text; 16-step programs and the m3 rule list run under the bottom fade. |
| Controls and feel | 8 | Taps, touch and keyboard all work; focus moves to the next control with a visible ring; "Skip to my next turn" in the loop; the robot and arm now glide with motion on. |
| Engagement and pacing | 8 | Each mission now has a real ramp and a real "first try fails" moment: room 2 breaks the rule just shown, trip 2 makes "stop for everyone" too late, trip 3 needs reordering, the carrot row needs a different setting, street 2 has one working design. |
| The skill is real (and accurate) | 8 | Round 1's two shortcuts are closed (checked by enumeration and in the browser). Facts checked are right. Ages 13–17 cannot see the energy rule in mission 6, so "battery life against weight" is learnt only by trial. |
| Feedback and honesty | 8 | Every verdict is true of the run; unused unsafe rules are named; a cautious weeding setting is amber with the other cost spelt out. One confusing line in mission 3 (below). |
| Wording | 8 | Plain British English, short sentences for 8–12; the sure-words now rise in order and match the row. A few small slips (below). |
| Age fit (both routes) | 8 | Ages 13–17 now have a distance stepper, an arm order set by x, metres and seconds, flags for the farmer and a table; no money anywhere for 8–12. |
| Access | 8 | Keyboard-only mission 1 completed with 0–4 Tabs per action; large text, reduced motion, phone and tablet layouts all clean (the builder's layout check passed in every run); verdicts scroll into view. |
| Robustness | 8 | Leave and resume works mid-trip and mid-design; each mission keeps its own half-done state, so replaying mission 2 no longer wipes mission 6. The map then points at the replayed mission, not the unfinished one. |
| Record and town | 8 | Six true record lines, four practised lines, a picture; the "Jobs that use this" screen now exists with the four curriculum jobs; mission 3 counts only safe rules. |
| **Fills the hour** | **8** | About 41–51 minutes of play for ages 8–12 and 42–52 for ages 13–17 (table below), six different jobs, a ramp inside every mission. |

**Module score: 8.**

### Minutes per mission (estimated, classroom pace with read-aloud, ignoring the slow machine)

| Mission | Ages 8–12 | Ages 13–17 | Notes |
|---|---|---|---|
| 1 Sensors and the loop | 7–8 | 6–7 | 8 jobs, 10 loops with 4 predictions (skippable), then room 2: only "turn left, right in front" (or 50–75 cm) gets home, and two rules must be tried. |
| 2 Robot arm | 7–9 | 10–12 | One seedling, fix the bug, the tray with a repeat; ages 13–17 add a 16-step order set by x. |
| 3 Hospital rules | 6–8 | 6–8 | Trip 1 two rules; trip 2 "stop for everyone" is late (165 s > 150 s); trip 3 needs the new rule moved above "a person is near". |
| 4 Recycling sorter | 9–11 | 8–10 | Unchanged and strong; the street scene works in an empty and a built town. |
| 5 Weeding robot | 6–7 | 6–8 | 4 checks, lettuce row (only "Quite sure" is best), carrot row (only "Very sure"); ages 13–17 tune a flag threshold for the farmer. |
| 6 Flood rescue | 6–8 | 6–8 | Street 1 has 12 working designs, street 2 exactly one (tracks, heat camera, floats, big battery, 25 kg). |
| **Play in total** | **about 41–51** | **about 42–52** | Target about 45 minutes. |

### Shortcut hunt (round 1 found two; both are closed)

- **Mission 3** (`logic.mjs`, all 3×3×3×3 rule sets in all 24 orders): trip 3 passes **only** with "someone steps in front → stop" above "a person is near → slow", "block → wait" and "lift → call". In the browser: beep rule left at the bottom fails and is named ("A rule to fix") (`shots/x/bypass-junior-768-05-m3-r3-beep.png`); "stop" not moved fails with the "two rules fitted" note (`-06-`); dodging the order with "person → stop" is "Safe, but too late" (`-07-`); trip 2 with "stop" is late (`-03-`). Closing card and record now true (`-09-m3-done.png`).
- **Mission 5**: "Extremely sure" is amber with "3 weeds stay and steal water and light… Can it pull more weeds and still keep every lettuce?" and no Next (`shots/a5/…-05-m5-cautious.png`); four tries at "Extremely sure" on carrots never pass (`shots/x/bypass-junior-768-07-m5-c90x4.png`). The labels now rise: A little, Fairly, Quite, Very, Extremely sure.
- **Remaining soft spot** (nice-to-have 1): "Extremely sure" once, then "Very sure" twice, passes the lettuce row as "close" without ever trying "Quite sure".

## Must-fix

None. Nothing found that teaches the wrong thing, says something untrue, breaks, or keeps a child from finishing. The items below are polish; the first three are worth doing in the next pass.

## Nice-to-haves (most useful first)

1. **Mission 5, the "close" pass counts tries at any setting.** Reproduce: 8–12, lettuce row: "Extremely sure" → Weed, then "Very sure" → Weed twice. On the third try Next appears: "2 weeds were left… That is close: one setting leaves 1. You can carry on" and the footer says "Well set." (`shots/x/bypass-junior-768-04-m5-l80-third.png`). The child never lowered the setting past "Very sure". Fix in `m5-ui.js` `run()`: only allow `near` once the child has also tried the setting one step lower (or once a crop has been lost in this row); and make the footer for `near` say "Close. One setting does better." rather than "Well set."
2. **Mission 3, the unused-rule line contradicts the trip.** Reproduce: trip 3, new rule "Beep and keep going", not moved. The log says "Rule 4 was not used on this trip. But one day someone steps right in front…" directly under "Child runs out: Someone stepped right in front" (`shots/x/bypass-junior-768-05-m3-r3-beep.png`). Fix in `m3-rules.js` `unusedLine`: when the event did happen but another rule caught it, say "Rule 4 never got its turn, because rule 1 came first. If it did, ‘Beep and keep going’ would not be safe."
3. **Mission 6, ages 13–17 cannot reason about battery against weight.** The curriculum asks for "battery life against weight"; the panel shows kg and Wh used but not the rule (`WH_PER_KG_MIN`), so the big battery is found only by failing (`shots/b/senior-built-1280x800-27-m6-two.png`). Add one line under the weight: "Uses 1.5 Wh for each kg, each minute (game numbers)" and show minutes per part, so a 13–17 player can work out 25 kg × 10 min × 1.5 = 375 Wh before testing.
4. **Map after a replay** points at the replayed mission ("Welcome back. Carry on with mission 2", main button "Carry on: mission 2") while mission 6 is still unfinished (`shots/x/resume-390-07-map-two-half.png`). Prefer the lowest unfinished mission in `index.js` when choosing `prog.cur`, or show "Carry on" on both cards.
5. **Wording slips:** junior trip 3 pass line "reached the children’s ward, upstairs in time" (missing "and"; `shots/a/…-18-m3-r3.png`); "one setting leaves 1" (say "one setting leaves only 1 weed"); senior table row "carrots (5)" starts lower case (`shots/b/…-23-m5-carrot.png`).
6. **Mission 1 brief (ages 8–12)** lists two steps; add "Then choose the robot’s rule in a new room." (`shots/a/…-02-m1-brief.png`).
7. **Large text:** "chickweed" breaks as "chickwee / d" in the lettuce row at 1280×800 (`shots/c/junior-large-empty-1280x800-11-m5-row.png`). Use `hyphens: auto` or `overflow-wrap: normal` with a smaller name size in `.rb-plants b`.
8. **Under the fade at 1280×800:** steps 8 and 16 of the senior order program (`shots/b/…-07-m2-order.png`) and the lift rule in trip 3 (`shots/a/…-17-m3-order.png`) sit half under the bottom fade; the page does scroll, but the last row is the one a child edits. Add bottom padding equal to the fade height in `.rb-main`.
9. **Selected wrong answer looks "right":** after an unsafe trip 1, the chosen "Keep going at full speed" stays green-outlined (`shots/a/…-13-m3-unsafe.png`). Use a neutral selected style, or red when the rule failed.
10. **Heat camera icon** is ♨️ (the hot-springs sign). A camera with a warm glow would read better; the facts in the text are right ("saw someone warm in the back room").
11. **Senior arm tile** "Move to next: x + 10" is true only because seedlings are 10 cm apart and "next" skips empty places; "Move to the next seedling still in the tray" is exact.
12. **Town result:** in a fully built town the recycling robot is still easy to miss (`shots/b/…-33-town-after.png`).

## Accuracy check (all correct unless listed above)
Camera cannot see in the dark or measure heat; ultrasonic distance sensor times an echo and works in the dark; a bump switch only knows after contact; wheels cannot climb stairs; hospital robots call lifts by radio and slow near people; a pulled crop is lost while a missed weed can wait; thermal cameras see warm bodies in the dark (no longer "upstairs" through floors); mission 6 numbers are labelled in code as the game's own.
