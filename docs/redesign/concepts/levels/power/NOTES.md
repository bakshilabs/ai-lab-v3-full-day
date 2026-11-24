# Power level: notes for whoever takes over

Every word on the screen is a placeholder. The approved sentence, plans, checks, results, test button and recap come from `docs/redesign/wireframes-data.js` (town 0, level index 4) and must not be changed.

## What works (24 Nov 2026)

The level plays from the job to the closing picture on the shared kit.

1. The job and the sentence. A tapped word shows at once: the sun flares, or a gust catches the kite and the tall turbine.
2. Florence's three plans appear as three neighbourhoods. The yellow tag follows the child's words (the second gap decides whether the child's own plan has a battery, wastes the spare power, or is switched off at night).
3. "Keep the lights on" sends the sun down. The child then taps each neighbourhood to bring its families home, and that neighbourhood's night plays: solar homes go dark, the geese bend round the long row of turbines, the battery empties cell by cell. The card of the plan comes up afterwards. "Show all three" settles anything not tapped.
4. The play break. The child places turbines and solar roofs (more places than parts; a turbine beside the pond sends the geese away, and they come back if it is moved), picks the stripe colour, then drags the sun (or taps the yellow mark) through morning, midday, afternoon, evening, night and dawn. Spare beads are saved in the battery by a tap, and at night a tap sends a bead to a dark home. If beads are left over in the middle of the night the child chooses which of three things to light (tree, skating pond, clock); there are never beads for all three. "Move the sun back" undoes a step. After three minutes Florence offers to finish the day.
5. The town, "Try another plan" (the first result stays in a small sign), the recap by a tap, and the dawn picture.

The numbers add up everywhere: six homes need six beads; a turbine makes one bead by day and by night; a solar roof makes one by day; the battery holds six.

Things that answer a tap: the kite, the family, the tall turbine, the snowman, the pines, the geese by the pond.

## Changed in the finishing pass

- The night was too dark to read (dark homes vanished, the family's faces were black). The night light is stronger now.
- In the look step the one card covered the neighbourhood it was about. The camera now lifts the town above the card (`LOOKC`), and the tags sit low on the lanes during that step (`tagsLow`) so that they do not slide under the pills at the top.
- The "in the battery" number signs covered homes in the town picture. They are hidden there; the glowing cells of the barns show the same thing.

## How to check and record

`node play.mjs <out> <width> <height> <word 0-2> <word 0-2> <plan 0-2> <second plan or -1> <speed>` from this folder. A full run takes 10 to 25 minutes on the shared machine. `dev.mjs` is an older quick-look script and is behind `play.mjs`; use `play.mjs` with a speed of 5 for quick checks.

The two recorded paths are `pictures/wind-sun-battery-1440` (words 2 and 1, plan 2) and `pictures/solar-then-another-plan-1024` (words 0 and 0, plan 0, then plan 2).

- A pine stood in front of the sun's yellow mark in the solar neighbourhood and took its tap, so the solar day could not go past the afternoon. Pines no longer take taps while the mark is showing.
- The geese's pond in the wind and sun play break was hidden behind the tree of lights and the clock. It is now at the left end of the row of places, where it can be seen (near places 0 and 1).
- The title of the last card is cleared when another neighbourhood starts to play.

## Things learned

- Never put a `//` comment in the middle of one of the long lines of `level.js`: it cuts off the rest of the line. A comment of that kind removed the close camera of the look step for a while. Use `/* */` inside a line.
- Other agents on the shared machine sometimes stop every process called `play.mjs`. Record from a copy with another name (the import of `record.mjs` then needs its full path).
- When the machine is busy the recorder's shots fall behind the animation, so the pictures of the look step can miss the geese. A separate slow check showed them bending up and over the long row of turbines.
- The times the recorder prints depend on how busy the machine is. On a quiet machine the solar path with "Try another plan" came to 10.6 minutes for a typical child.

## What is left or weak (after the last recording, 24 Nov 2026)

- With the solar plan the play break is thin: six panels go on six roofs, so the only choices are the stripe colour and moving the sun. It ends with a dark night and Florence's "Try another plan". The wind farm plan has the choice of places and the geese, but no battery to work.
- The geese are small and dark against the night sky in the test, and small by the pond in the play break.
- The kite string crosses the middle neighbourhood in the wide view.
- At night the family in front are dim.
- The wind farm path (plan 1) and the second words "switch the power off at night" were not recorded in this pass. "Ask again", "Move the sun back", "Go back to my first plan" and Florence's offer to finish the day were not pressed in this pass.
- No sound was heard: the recordings are silent.
- `dev.mjs` is out of date and could be removed.
