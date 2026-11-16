# Roads for self-driving cars: review round 2

Branch `claude/jolly-goldberg-e9txp9`. The working tree changed while I reviewed (curriculum, power module, loader `endOfPart`); the module folder itself did not.
Screenshots: `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/roads/round2/` (called R/ below).

Runs (software 3D, load average 30 to 60, so all timings are slow):
- R/t-jr-motion-1280: `tests/playwright/roads.mjs`, ages 8–12, 1280×800, motion on, empty town. All checks passed.
- R/t-sr-reduce-large-768: the same, ages 13–17, upright tablet 768×1024, reduced motion, large text. All checks passed.
- R/t-jr-reduce-large-built-1024: ages 8–12, 1024×768, large text, reduced motion, full town (36 families). Every step passed; it then hung after the record card (see must-fix 5).
- R/p-jr-touch-built-768: my own script (`play.mjs`), ages 8–12, upright tablet, **touch taps only** (`touchscreen.tap`), motion on, full town.
- R/p-sr-kbd-1280: my own script, ages 13–17, 1280×800, **keyboard only** (Tab, Enter, digits, arrows), reduced motion, empty town.
- Unit tests: `tests/roads*.test.mjs` and `tests/modules.test.mjs`, 30 out of 30 pass.

## Scores

| Aspect | Round 1 | Round 2 | Why |
|---|---|---|---|
| First minute | 5 | **8** | One screen of 39 words, then "Tap the street" with a bobbing arrow. The first drop-off is one tap away, and a tap on the 3D street works by mouse and by touch. |
| Visual quality | 6 | **7** | The set is good to look at: clear pieces, signs where the numbers come from, readable lettered plots. But the ride ends looking at an empty green field (R/t-jr-motion-1280/16-ride-end.png, R/p-jr-touch-built-768/22-ride-end.png), and on an upright tablet the bottom third of the street view is an empty side road. |
| Controls and feel | 5 | **8** | Tapping the street, the labelled strip, keys 1–4 with the arrow keys, and focus moves to the main button on every screen. Touch works on the tablet. |
| Engagement and pacing | 6 | **7** | The new-homes run is a good second challenge. But ages 8–12 reach "Good: 4 of 4" on the second run with the obvious layout (any number of pieces, nothing to give up). After three runs the "Keep" button becomes the main one even when the new homes have just broken the street (R/p-jr-touch-built-768/17-numbers-homes.png: Good 1 of 4, wait 7 minutes "Needs work", and Keep is the green button). |
| The skill is real | 6 | **8** | A real simulation. Waits, walks, queues and safe crossings each come from the layout. 13–17 also choose the fleet size (trips for each car against the wait). The land choice has a measured cost ("6 min 53 s now, 12 min 49 s with them"). |
| Feedback and honesty | 6 | **7** | The numbers are on the street and the praise matches the result. But the fleet a 13–17 player chose is silently raised when the new homes arrive (chose 6, the run and record say 7). The drop-off is placed on the homes' side yet named after the car park opposite. "Longest queue: 1 car, Good" is not a queue. |
| Wording | 7 | **8** | Plain and short, with "the size of a tennis court" for 8–12. Small slips: "With 4 more families: The longest wait…" (capital after a colon), "1 car" queue, "by the car park" for a stop outside the homes. |
| Age fit (both routes) | 6 | **8** | 8–12: one crossing for everyone, whole minutes, plain lines. 13–17: walkers' and cycle crossings, the fleet choice, seconds, trips for each car. 8–12 is a little thin on decisions (see engagement). |
| Access | 5 | **8** | Keyboard-only play works end to end with visible focus. Key labels appear when a key is pressed. Large text fits at 768 and 1024, Florence's panel moves under the Back button, reduced motion gives three still pictures and a nine-view ride, and touch works. |
| Robustness | 6 | **7** | No page errors in any run, and leaving and resuming work. But the module's own browser test now hangs at the end. It does not handle the end-of-part card the loader added after the record card, so `roads.mjs` cannot pass any more (it timed out in 1 run of 3 here, and my two scripts hung at the same place). |
| Record and town | 6 | **8** | The record is true and readable at card size, with before and after, a "with 4 new families" line, and practised lines that complete "You practised …". In town the street is three tiles long with a sign (129 px wide from the usual view). The "Shared-car street" label is tiny at that distance. |

**Module score: 7** (the lowest aspects: visual quality, engagement and pacing, feedback and honesty, robustness).

### Round-1 must-fix items: checked
1. Street tap: **fixed** (mouse and touch). The test fails if the tap is under a panel or places nothing.
2. Freed land hidden: **fixed** (plots above the tray at 1280, 1024 with large text and 768; A, B and C signs; one row per plot).
3. Keyboard focus lost: **fixed** (focus on the new main button on every screen; key hints shown in keyboard use).
4. Town result too small: **fixed** (three tiles, a car, plot blocks and a sign). The label is still small (nice-to-have).
5. Praise and record wording: **fixed** ("Well planned!" only when every number is Good; "before: 0 of 3"; 8–12 graded on whole minutes; all-parking line; practised lines without "you").
6. Large-text overlap: **fixed**.
7. Reduced motion: **fixed** (three still pictures; the ride is not capped and ends on the closing line).
8. Reason on the street: **fixed** (signs for the wait, walk and queue, flags at crossings, the walk path drawn; the cards point to their place; people wait at unmarked crossings).
9. Slot strip: **fixed** (labelled landmarks, 20 px or larger icons, darker crossing chip).
10. Captions flash past: **fixed** (each holds at least 2.4 s).
The "also do" list is done too: a one-screen start, the land consequence and a re-run with the new homes, the fleet choice for 13–17, "Best so far", "Clear the street", runs kept across a resume, real-time animation, the land camera on the ride, and bigger labels on the picture.

## Must fix (to reach 8)

1. **The game nudges the child to stop just when the new homes break the street.**
   - Reproduce: ages 8–12, full town. Make a street that reads 4 of 4 Good on run 2. Choose Homes, Homes, Park. Run the morning with the new homes. You get Good 1 of 4, a 7-minute wait marked "Needs work", and "Keep this street ➜" is the green main button (R/p-jr-touch-built-768/17-numbers-homes.png). The cause is `more = nextStep(res, j) !== 'none' && st.runs < 3` in `index.js` `morning()`.
   - Fix: when the result is worse than the best so far, or any number is "Needs work", keep "Change my street" as the main button whatever the run count. After a new-homes run, also offer "Change the land" (back to `freed()`), so the trade-off can be settled both ways. Florence's line could name the trade: "The new homes made the wait longer. Add a bay, or choose a different use for a plot."

2. **The ride ends on an empty field.**
   - Reproduce: play to the end of the ride, with or without reduced motion. The last view is the car's back against green grass and sky (R/t-jr-motion-1280/16-ride-end.png, R/p-jr-touch-built-768/22-ride-end.png). This is the last picture before the record, and it shows nothing the child made.
   - Fix: for the closing line, cut or turn to a view back along the whole street: `views.street`, or a raised view from x = 46 looking west, so the child's crossings, stops, bays and the rebuilt plots are all in shot.

3. **13–17: the fleet the player chose is changed without a word.**
   - Reproduce: ages 13–17, empty town. Set 6 shared cars and build homes on any plot. Run the morning with the new homes. The heading reads "7 shared cars", and the record says "10 now, 7 shared cars" (R/t-sr-reduce-large-768/12-numbers-new-homes.png, record lines in t-sr-reduce-large-768.json). `cleanFleet` raises it to the new minimum, `ceil(28 / 4.5)`.
   - Fix: when `cleanFleet` changes `st.fleet` because the number of calls changed, say so in Florence's line and on the results heading ("The 4 new families need at least 7 cars, so one car was added"). Or show the fleet control on the built screen before the re-run.

4. **The drop-off is placed on the homes' side but named after the car park opposite.**
   - Reproduce: on the first design screen Florence says "Tap the street outside the homes". Tap there, and the hint reads "Drop-off point placed by the car park." (R/t-jr-motion-1280/03-street-tap.png). The shelter stands in front of the homes. The same happens with "the home by the school is furthest…" and "the drop-off point by the car park" in the still pictures and the ride.
   - Fix: in `words.js` `beside()`, name a place by both sides, or by the side the piece stands on: "outside the homes, opposite the car park". Use the same name in `placed`, `whereSay`, `stillSay` and `rideStops`.

5. **The module's browser test no longer finishes.**
   - Reproduce: `LARGE=1 BUILT=1 node tests/playwright/roads.mjs http://localhost:8873/ out junior 1024 768`. Every step passes, then `waitForFunction(() => window.__roads !== undefined)` (line 197) times out. The loader now shows `endOfPart(app, id, j)` (`js/ui/talk.js`) after the record card, and the test never answers it. My own scripts hung at the same place.
   - Fix: after pressing OK on the record card, the test should press through the discussion and break card(s), using their own button selector, before it waits for `__roads`. Re-run all three configurations.

## Nice to have
- **8–12 depth:** give a reason to choose. For example, a limit of 8 pieces, or a "school rush" second morning in which the school crossing and a drop-off by the school matter more. Today the same layout of 2 drop-offs, 3 bays and 3 crossings is Good for 24 and for 36 families.
- **Upright tablet framing:** in the street view the empty side road takes the bottom third (R/p-jr-touch-built-768/02-design-empty.png). Lift the camera target, or crop the side road, so the street is larger.
- **Queues:** do not show "Longest queue: 1 car" as a sign or a Good number. Say "No queue" when `queue <= 1`.
- **Capital after a colon:** "With 4 more families: The longest wait…" and "With the 8 new families: Someone waited…". Lower-case the comment's first letter after `withHomes`.
- **Number cards:** on 768 with large text, "Last run: 9 min 10 s" breaks with "s" alone on the next line. Use a non-breaking space inside durations.
- **Still picture 3** ("the longest wait"): highlight the family that waited (a clock sign over them), as the results screen does.
- **Results with too many bays (13–17):** with 4 bays (12 places) and 6 cars, Florence could say that bays stand empty, as part of the trade-off.
- **In town:** the "Shared-car street" label is about 8 px high from the usual island view (R/t-jr-motion-1280/18-town.png). Make it larger, or show it only when the camera is near.
- **Car park emptied early:** during the first morning the three plots are already empty frames with yellow edges, before the land step is explained (R/t-sr-reduce-large-768/04-first-still.png). Show the old car park full until the land step, or add a short sign ("Free once the shared cars run").
- **Scope:** the root `CLAUDE.md` and `docs/full-day-plan.md` (changed during this review) now ask for each module to run for one hour. This loop is about 10 minutes. These scores judge it as the first version I was asked to review; against a one-hour part, engagement would score much lower.

## Worked well: keep
The real simulation and "Last run:" on each number; the signs on the street for each number; one-screen start with the arrow; the freed-land step with true numbers and its consequence run; the fleet trade-off for 13–17; the reduced-motion still pictures; the keyboard path; the readable record picture; the street left in the town.
