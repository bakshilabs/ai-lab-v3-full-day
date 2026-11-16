# Power control room (`power`): review round 3

**Commit reviewed:** `34bc085` (round-2 fixes in `2943414`). It was exported fresh with `git archive` to `hour3/src` and served from there. No code was edited.

The 27 power unit tests pass.

**Browser runs** (one browser at a time; paths are relative to this folder):

- **Full run, `a-sr1280/`:** ages 13–17, 1280×800, reduced motion, empty town, all six missions to the record, "Talk it over", the town at night and a replay. Result `ok: true`: no page errors, no outside requests, nothing clipped, no button under 40 px. Leaving mid-mission, resuming and replaying all worked.
- **`j/jr390-m1res-*`:** ages 8–12 on a phone (390×844) by touch. Mission 1: round 1 passed, left the module, came back.
- **`j/sr390-m6res-*`:** ages 13–17 on a phone by touch. Mission 6: rounds 1–2 done, left the module, came back.
- **`j/jr768L-m4-*`:** ages 8–12 on an upright tablet (768×1024), large text, mission 4 through to its done card.
- **`j/jr1280-m2*`:** ages 8–12 at 1280×800, mission 2, marked correctly, to check what the reveal says.
- **`j/jr390-m5-*`:** ages 8–12 on a phone by touch, mission 5, all four days.

## Scores

| Aspect | R2 | R3 | Why |
|---|---|---|---|
| First minute | 8 | 8 | Unchanged and clear. |
| Visual quality | 8 | 8 | The key now explains "S" (school dark), and the mission 5 day title stays visible when the job list scrolls. |
| Controls and feel | 8 | 8 | On a phone, mission 1's scale, More/Less and Next now sit together (`j/jr390-m1res-03-start.png`). |
| Engagement and pacing | 8 | 8 | Mission 1 rounds now run 10 / 8.5 / 7 s per step (13–17: 8 / 7 / 6 s). Checked in the code, not timed: this machine is too slow. |
| The skill is real (and accurate) | 7 | **8** | The 13–17 crew order now reads: isolate and lock off, prove dead, earths then permit, repair, crew clear and permit handed back then earths off, re-energise (`a-sr1280/38-m6-crew.png`). Everything checked in round 2 still holds. |
| Feedback and honesty | 7 | **8** | Ages 8–12 hear "Three rounds, each one harder." Mission 2's words now match the marks (details below). |
| Wording | 8 | 8 | "1 rule." is now singular. Mission 3's done card for 8–12 now says "the dark squares added up to …". |
| Age fit (both routes) | 6 | **8** | The mission 4 card for 8–12 reads "1 rule. On the test days: 397 of 432 lit hours." (`j/jr768L-m4-10-m4-done.png`). No %, kW, kWh or money appears on any 8–12 screen checked. The 13–17 route is good end to end. |
| Access | 8 | 8 | Phone order improved for missions 1 and 5. Large text works, and keyboard focus behaves as before. |
| Robustness | 8 | **8+** | The new resume-by-round works (details below). |
| Record and town | 7 | **8** | An empty town now gets six lanterns that follow the rules at night (`nightLamps {lit:5, dark:1}`, `a-sr1280/45-town-night.png`), as well as the hut. |
| Fills the hour | 8 | 8 | About 41–47 min for 8–12 and 38–44 min for 13–17. |
| **Module score** | **6** | **8** | |

Mission 2 wording, ages 8–12 (`j/jr1280-m2-*`):
- Florence: "Right. The town will be short from 5 pm to midnight."
- The note under the chart: "homes would start going dark at 5 pm, and it is worst at 7 pm".

Mission 2 wording, ages 13–17 (`a-sr1280/09-m2-right.png`, `12-m2-kwh.png`):
- Florence: "Correct: shortfall 17:00 to 00:00".
- The note: "shortfall from 17:00, worst at 19:00, gap 23 kW".
- The winter forecast reads "15:00 to 23:00", matching marks 15–22.

Resume by round:
- **Mission 1, ages 8–12:** after round 1 the save holds `{"id":"balance","round":1,"part":{"level":8,"of":8}}`. On return the briefing says "Welcome back: you carry on from round 2." with a "Carry on ➜" button, and play opens at Round 2, 7:30 am (`j/jr390-m1res-06`, `-07`).
- **Mission 6, ages 13–17:** after two rounds the save holds `round 2`, and play resumes at the battery round (35 kW).

## Round-2 must-fixes: status (checked in the browser)
1. **Percentage for 8–12 on the mission 4 card:** fixed.
2. **Permit to work after the earths, handed back before they come off:** fixed.
3. **"Faster each time":** fixed. The words now say "each one harder", and the steps really do get shorter each round.
4. **Mission 2 reveal matches the marks:** fixed for both ages.
5. **Lanterns in an empty town:** fixed.

## Must-fix
None.

## Nice-to-have (small polish)
- **The mission map does not show a half-finished mission.** After leaving mission 1 in round 2, the map button still reads "Start: mission 1 ➜" (`j/jr390-m1res-05-m1res-map.png`). Only the briefing says "carry on". Use "Carry on: mission 1 (round 2) ➜".
- **Partial progress can be lost.** Leave mission N part-way, replay a finished mission to its end, and the partial progress is gone: `p.cur` is set to null whenever any mission finishes, and leaving another mission part-way overwrites it. Keep one `cur` per mission id, or clear it only when that same mission finishes.
- **Mission 5 on a phone:**
  - The slots and Run button now come first and the job list after them (`j/jr390-m5-04-m5-moved.png`). The child still has to scroll down to pick a job and back up to place it.
  - Nothing near the slots says which job is selected, and the day's title and note are now at the bottom.
  - Fix: a "Moving: 👕 Washing machines" chip above the slots, with prev/next job arrows.
- **Mission 1 time chips on a phone:** "6:00 am" fills the 40 px chips edge to edge (`j/jr390-m1res-03-start.png`). Drop "am/pm" from the chips under 560 px; the clock on the plate already shows it.
- **Mission 4 has no per-round resume.** Its rules are saved as they change, so little is lost.
- **Carried over from round 2:** small charts on the phone for 13–17, the frequency simplification note, and no leader run-sheet section for this hour.
