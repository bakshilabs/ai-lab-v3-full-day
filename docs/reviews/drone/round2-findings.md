# Drones at work (module `drone`): one-hour review, round 2

Commit `c1a80a5` on `claude/jolly-goldberg-e9txp9`, played from a clean `git archive` export in `src/` (not the working tree). One browser at a time; the server and browsers are stopped. All paths are under `/tmp/claude-0/-home-user/398be6db-bef9-5868-a0ac-008d1a47818d/scratchpad/review/drone/hour2/`.

## Runs
| Run | Folder | Result |
|---|---|---|
| **Ages 8–12, 1280×800, motion on, small town, mission 1 → break, uninterrupted** (the repo's driver with its original slow-landing bot, the one that stuck three times in round 1) | `full/` | **Passed everything.** Landed: "A gentle landing, right on the pad". Record, jobs, talk, break, route in town; no errors or outside requests. |
| Ages 13–17, **upright tablet 768×1024, large text, motion on, fully built town**: missions 1–2 | `senTab/` | passed; landed first time at 0.8 m/s |
| Ages 8–12, **upright tablet, touch, reduced motion**: missions 2–3 | `junTab/` | passed; compass controls on the touch pad in mission 3 |
| Ages 13–17, 1280×800, reduced motion, empty town: missions 4–6, record, jobs, talk, break | `senB/` | passed (`finished` false only because mission 3 was seeded, so there is no route to draw in the town) |
| Keyboard only (map, opening, ground school day 1, take-off) | `keys.out`, `keys/` | focus now goes to the next step each time; Start shows a focus ring |
| Landing physics at 8, 15, 30, 60 and 144 fps, using the shipped `fly-physics.js` | `landsim2.mjs` | every tapped descent lands, at every frame rate (0.2–1.2 m/s, "soft") |

## Round-1 must-fixes, checked in the browser
| # | Finding | Now | Evidence |
|---|---|---|---|
| M1 | Gentle landings never registered | **Fixed.** The unchanged slow bot landed in all three runs that reached the landing (8–12 at 1280×800 motion on; 13–17 tablet; 8–12 tablet with touch). The simulation lands at all five frame rates. The landing now lives in pure `fly-physics.js` with tests. | `full/...-18-hand-landed.png`, `senTab/...-18-hand-landed.png`, `landsim2.mjs` output |
| M2 | No airports | **Fixed.** Airfield with a shaded no-fly zone and legend; helipad and seabird cliffs shaded too; a "film the planes landing" plan; for 13–17, "check these zones on a drone safety map". | `full/...-08-ground-airfield.png` |
| M3 | Nesting-bird law overstated | **Fixed**: "Many nesting birds are protected by law…" | code + plan screen |
| M4 | Keyboard focus jumped to Battery | **Fixed.** Focus goes check → Looks good → next check → "Fly today" → "Next day". `focusFirst` now tries the selectors in order. | `keys.out` steps 0–9 |
| M5 | Inspection camera hid the turbine | **Fixed.** All three blue frames and the rotor are in view. | `full/...-38-inspect-turbine-flying.png` |
| M6 | Invented limits shown as rules | **Fixed.** 5 m is "this company's rule"; "your company's 20 cm limit"; the 13–17 card mentions extra Civil Aviation Authority permission. | `senB/...-17-inspect-turbine-found.png` |
| M7 | 13–17 rescue line cut off | **Fixed.** All six record lines are 63–94 characters; lines for seeded missions are neutral, not invented. | `senB/...-37-record-card.png`, `senB.json` |

## The other three checks
- **Compass controls in mission 3:** the arrows fly north, south, east and west, as in missions 2 and 5. The card says "Hold an arrow key to fly that way, just as in hand flying." The camera stays behind and south of the drone (no turning). The bot flew the hand delivery in 70–87 s through all hoops, on a laptop with keys and on a tablet with touch. **Good.**
- **Harder second search (13–17):** after dark, no last sighting, only the car known. This time growing squares take about 15 min and lines about 5, the reverse of the first search (3 and 12). Both times are shown side by side with a reason, and a second guided walk follows (17 squares, matching the shortest safe way). It is a real decision, not a repeat. **Good** (one wording point below).
- **Hand flying on an upright tablet:** the camera stands far enough back. The drone, its plumb line, the ring and the next hoop all show above the HUD and pad. Large text fits. **Good.** A near hoop sometimes cuts across the lower left of the view (`junTab/...-08-hand-hoops-flying.png`). That is minor.

## Scores (1–10)
| Aspect | R1 | R2 | Note |
|---|---|---|---|
| First minute | 8 | 8 | Focus ring now shows on Start. |
| Visual quality | 7 | 8 | Readable health map with gradients; outlined survey strips; no-fly zones on the map; inspection framing fixed. |
| Controls and feel | 5 | 8 | Landings count at every frame rate; one way of flying; tablet camera good. |
| Engagement and pacing | 7 | 8 | A fourth ground-school day (people on the field); a real survey trade-off with front overlap for 13–17; a second search with the opposite answer. |
| The skill is real (and accurate) | 6 | 8 | Airfields, emergencies, Flyer and Operator IDs, company rules, heat cameras "as it gets dark". |
| Feedback and honesty | 7 | 8 | Florence's line follows every reply; the record says only what happened. |
| Wording | 8 | 8 | |
| Age fit | 7 | 8 | 13–17 now has enough to do (9 plans, front overlap, sizing cracks, two searches). |
| Access | 6 | 8 | Keyboard flow fixed; large text and touch fine on the tablet. |
| Robustness | 8 | 8 | Leave-and-return check in the full run passed; no errors in any run. |
| Record and town | 7 | 8 | |
| Fills the hour | 7 | 8 | See below. |
| **Module (lowest)** | **5** | **8** | |

### Minutes per mission (estimate, normal device)
| Mission | 8–12 | 13–17 |
|---|---|---|
| 1 Ground school (4 days, 8 or 9 plans) | 9–11 | 6–8 |
| 2 Hand flying | 6–8 | 4–6 |
| 3 Delivery | 10–13 | 8–10 |
| 4 Farm survey | 5–7 | 5–6 (front overlap too) |
| 5 Inspection | 7–9 | 6–7 |
| 6 Search and rescue | 4–6 | 7–9 (two searches) |
| Cards | 2–3 | 2 |
| **Total** | **43–57** | **38–48** |

Both ages now fill the 45 minutes of play. The ramp is better: the 13–17 hour ends on its hardest decision (the second search). The 8–12 hour still ends on its gentlest mission, which suits the talk that follows.

## Must-fix
None.

## Nice-to-have (small polish)
1. **Landing advice and speed:** "Let go of Down just before the pad" leads to a hard bump if Down was held from height. Letting go 0.3 m above the pad lands at about 3.7–4.1 m/s ("hard"), and at 0.6 m it is "firm" (`landsim2.mjs`). Say "Let go of Down a little way above the pad, then tap it" or "come down in short taps", or soften descent speed close to the floor.
2. **Second-search reason (13–17):** the car *is* a last known point, so "nobody knew where the walker went" is not quite why squares lost. Suggest: "They had walked all day, so they were probably far from the car. Squares spent the first minutes near the car; lines covered the whole area steadily."
3. **Guiding the team twice for 13–17** is about 35 taps. Let one tap on a square in a straight line from the orange dot add the whole straight run, as the delivery map does.
4. **Built town:** the take-off and landing pads still sit on crop or flower plots, with blocks poking through the pads (`senTab/...-14-hand-hover0-flying.png`). Prefer plain tiles or hide small scenery under the pads.
5. **Survey plan:** the first strip in the hay meadow is still faint next to the overlaps (`full/...-27-survey-plan-gaps.png`). A slightly stronger single-strip fill would help the "width of the blue strip" sentence.
6. **Upright tablet:** a near hoop can sweep across the lower left of the view. Fade hoops already passed, or ones within a few metres of the camera.
