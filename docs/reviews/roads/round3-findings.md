# Self-driving cars (`roads`): independent review 3

Commit `47de33f` on `claude/jolly-goldberg-e9txp9`. I reviewed a fresh export of that commit (`git archive`, in `src/` in this folder) and changed no code. All paths below are relative to `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/roads/hour3/`.

**What I ran** (one browser at a time; the server is now stopped):
- The 35 roads unit tests: all pass.
- The repo's full browser run on the **ages 13–17 route**, laptop 1280×800, reduced motion, empty town. All six missions, then the record, Jobs, Talk it over, Break time, and the street in the town. **Every check passed**, with no page errors and no outside requests (`full-senior-laptop/`, `full-senior.log`).
- Ages 8–12, M5 on a laptop, with the charging round played wrong four times on purpose (`shots/m5-junior-laptop/log.json`).
- Ages 8–12, M3 on a laptop, all 7 scenes (`shots/m3-junior-laptop/`).
- Every M3 scene and option drawn for ages 8–12 (`svgj/m3-*.png`).
- The new second-test cases drawn, with the second-test words for all three possible pairs (`umbrella.png`, `umb.html`).

## Round-2 must-fixes: both fixed
1. **The half-hidden person in M2 can now be seen.** About two thirds of the body shows to the right of the van, the box sits on the visible part, and it matches the test card (`full-senior-laptop/10-m2-hidden.png`).
2. **The M5 charging hints for ages 8–12 are right now.** Each run now says "Charging takes cars away for 15 minutes. Is the charger far from where the cars wait?" After four tries it adds "Put the charger near where the cars wait (the shops are close to both homes), and add a car or two." Following that advice (Shops, 11 cars) meets the goal (`shots/m5-junior-laptop/log.json`, steps r3-depot to r3-shops).
3. **The shared break screen** now says "Next: Part 5, Town film studio" (`full-senior-laptop/38-break.png`).

## Ages 13–17 route (new this round)
- **Record lines** carry no test scores now. M2 reads "Labelled 18 objects (6 edge cases) and tested the car on two sets of unseen pictures". M6 reads "…; crossings marked where people cross". The M5 line still gives the plan's own numbers (longest wait 12 min, 52% empty driving); that describes what was made, so it is fine (`full-senior-laptop/36-record.png`).
- **The second test varies.** It uses two of three new cases: box, scooter or umbrella.
  - The umbrella is recognised ("close enough to the people it had learnt"), so the result is 10 of 12 or 11 of 12 for ages 13–17, and 9 of 11 or 10 of 11 for ages 8–12. The words match the count in each case (`umb.html`).
  - This run drew box + scooter: 10/12, "2 new cases failed" (`full-senior-laptop/11-m2-test2.png`).
  - The umbrella picture is clear (`umbrella.png`).
- **The note under the chart** ("One more car can now and then mean a longer wait…") shows in plain words under the chart and fits on a laptop (`full-senior-laptop/20-m5-peak.png`).

## Quick extras: nothing broken
- **Left-lane camera.** The driver's view now sits in the left lane, with the dashed centre line to the right. The car ahead is straight ahead in our lane, nothing is cut off at the edges, and the radar view moved with it (`full-senior-laptop/03-m1-camera.png`, `10-m2-hidden.png`).
- **The 20 sign (ages 8–12)** is hidden before the test and appears at the end of it (`shots/m3-junior-laptop/06-s2-school.png` and `07-s2-unsafe-end.png`).
- **"only just".** The 2-second rain result and the 10-second ice result are now labelled "only just", which agrees with the red marker; 4 s and 20 s still say "room left" or "gap left" (`svgj/m3-rain.png`).
- **M3 still drives on the left** in every scene. M4's log now reads "All pass".

## Scores

| Aspect | Score | One line |
|---|---|---|
| First minute | 8 | The map, then a card for the real job, then Start. |
| Visual quality | 8 | The left-lane view reads better. On a tablet the 2D pictures still leave empty bands. |
| Controls and feel | 8 | No change, and nothing broken. |
| Engagement and pacing | 8 | The second labelling test now varies. The 20 sign no longer gives the answer away. |
| The skill is real (and accurate) | 8 | The hidden person is fixed. The Highway Code rules, distances and sensor facts are all right. |
| Feedback and honesty | 8 | The charging hints are right, the chart note is honest, and the test words match the counts. |
| Wording | 8 | One nit: ages 8–12 read "the car missed one" but "the car missed 2". |
| Age fit | 8 | Both routes as before. No money. |
| Access | 8 | No change (phones with large text are outside the brief). |
| Robustness | 9 | Saving and the full flow still pass. |
| Record and town | 8 | The record now shows what was made or practised, not scores. The street stays in the town. |
| Fills the hour | 8 | About 45–50 min (ages 8–12) and 40–46 min (ages 13–17). |

**Module score: 8.**

## Must fix
None.

## Nice to have (small polish)
- In `labels.js` `M2.test2`: for ages 8–12, write "two" rather than "2" ("the car missed 2").
- In M5's late charging hint, "the shops are close to both homes" assumes the cars wait at both homes. If they wait somewhere else (for example the station), say "a charger near your waiting places".
- The 20 sign in M3 stands on the far (south) kerb. Put it on the near (north) kerb, for the car's own side of the road.
- On a tablet, the 800×420 pictures in M1–M3 leave about 150 px empty above and below.
- On a phone with large text, M5's map is squeezed out (outside the brief).
