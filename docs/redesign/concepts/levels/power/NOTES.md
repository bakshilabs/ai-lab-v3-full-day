# Power level: notes for whoever takes over

Every word on the screen is a placeholder. The approved sentence, plans, checks, results, test button and recap come from `docs/redesign/wireframes-data.js` (town 0, level index 4) and must not be changed.

## What the level is (after the one round of rework, 24 Nov 2026)

The level plays from the job to the closing picture on the shared kit.

1. The job and the sentence. A tapped word shows at once: the sun flares, or a gust catches the kite and the tall turbine.
2. Florence's three plans appear as three neighbourhoods. The yellow tag follows the child's words (the second gap decides whether the child's own plan has a battery, wastes the spare power, or is switched off at night).
3. "Keep the lights on" sends the sun down. The child then taps each neighbourhood to bring its families home, and that neighbourhood's night plays: solar homes go dark, the battery empties cell by cell, and a flock of geese crosses the sky over every neighbourhood. Over the wind farm the geese have to climb up and over the long row of turbines. The card of the plan comes up afterwards. "Show all three" settles anything not tapped.
4. The play break, "Run one winter day". The child places the parts, picks the stripe colour, and then drags the sun (or taps the yellow mark) through morning, midday, afternoon, evening, night and dawn. Each plan now has its own decisions, which are listed in the next section.
5. The town, "Try another plan" (the first result stays in a small sign), the recap by a tap, and the dawn picture.

The numbers add up everywhere: six homes need six beads; a turbine makes one bead by day and by night; a solar roof in the sun makes one by day; the battery holds six.

Things that answer a tap: the kite, the family, the tall turbine, the snowman, the pines, the geese by the pond, and a dark home at night.

## What changed in the round of rework

**The geese can be seen.** They were seven small dark birds. They are now five large pale geese with orange beaks and dark wing tips, drawn so that light and haze do not dim them, and they leave a dotted trail that stays in the sky after they have gone. The geese cross over all three neighbourhoods in the test, so that the straight paths can be compared with the bent one. Each result card also has a small picture in front of the "Nature" sentence that shows the path the geese flew (straight, or up and over the turbines), so the evidence is still there when the camera has moved on. The turbines keep a pale glow at night, so the row that the geese bend round can be seen as well. The geese that rest by the pond in the play break are bigger and pale too.

**The night is lighter and the family's faces are lit.** The night sky and the night light are a little brighter. A lantern stands in the snow beside the family and comes on as night falls, so their faces are warm and clear in every night picture.

**The solar roofs have a real choice in the play break.** There are now seven places for the panels and not six: the six roofs of the homes and the roof of the clock tower. One home stands in the shade of tall pines, and a panel there makes no power. Florence says why at once, and a panel can be taken back with a tap and put somewhere else. The clock tower shares its power with the homes, which shows that a panel does not have to sit on the home it powers. The same seven places are used in the wind and sun plan, where four panels go on seven places. Florence's own plans never put a panel in the shade. A dark home at night now answers a tap (somebody comes to the door, and Florence says that this home has to wait for the sun), so the dark night of this plan is no longer a picture with nothing in it to touch.

**The wind farm has a real choice in the play break.** At dusk the geese fly home along the hill and wait at the edge of the picture. The child chooses between "Stop the turbines" (the geese fly straight through, and the homes are dark for a moment) and "Keep them turning" (the lights stay on, and the geese climb up and over the row). Both are allowed and nothing is lost. This is the same give and take that the "Nature" and "Staying warm" checks show on the card. The wind farm is seen from further back in the play break, so that the sky above the row is in the picture. If the child's words switch the power off at night, there is no question, and the geese simply fly straight past the turbines that are off.

**Two repairs for the whole game.** The corner chip already showed the right number, 5. The last picture no longer says that it is the end of the trial level when the level is held in a frame with `?next=` in its address. Standing alone it still says so.

**Finished by a second designer (24 Nov 2026).** The first designer of this round was stopped before its recordings were done. The second designer ran the level again on three full paths, looked at every picture, and made three more changes. First, the five geese flew so close together that from the side they merged into one long white shape, which looked more like an aeroplane than a flock; they are now spread out and staggered up and down, so that five birds can be counted. Second, the wind farm's play break had been moved so far back that the row of yellow places was a set of thin, faint columns on the horizon and the geese's pond was a tiny smudge; the camera now looks up the slope from nearer with a wider view, so that the six homes, the row of places, the pond and the sky above the ridge are all in the picture and the places are bigger. The flock that waits at dusk now waits fully in the picture and sets off from where it waits. Third, the button that moves time back says "Move the moon back" once the moon is up, because Florence says "Drag the moon" then.

**Small things.** The kite now flies to the right of the family, so that its string no longer crosses the middle neighbourhood. In the play break the top of the sun's path is lower, so that the yellow mark does not go under the title. `dev.mjs` was rewritten as a quick-look script that jumps to one part of the level.

## How to check and record

`node play.mjs <out> <width> <height> <word 0-2> <word 0-2> <plan 0-2> <second plan or -1> <speed> <extras>` from this folder. The extras are letters: `a` presses "Ask again" once, `b` goes back to the first plan after trying another, `k` keeps the turbines turning for the geese (without it they are stopped), and `m` moves the sun back once.

`node dev.mjs <out> <part> <plan> <word> <word> <width> <height> <options> <speed>` jumps straight to one part (`night`, `place`, `dusk` or `town`). Put `fx` in the options for the lighting effects and `keep` to keep the turbines turning. A speed of 0.2 or 0.25 plays the animations more slowly. On the recording machine the page draws about one picture every few seconds, so the ordinary recordings almost never catch the geese in the air, and even the slowed quick looks catch them only at the start of a flight. What the recordings do show is the dotted trail, which stays, and the small picture on each card.

The recorded paths in `pictures/` were all made on the finished code of this round:

- `wind-sun-battery-1440` is the good plan at 1440 by 810 (words "the sun and the wind together" and "save the spare power in a battery", plan 3), from the job to the closing picture.
- `solar-then-another-plan-1024` is the solar roofs plan at 1024 by 640 (words "only the sun" and "save the spare power in a battery"), with a panel put in the shade and moved, the panel on the clock tower, a tap on a dark home, then "Try another plan", the good plan, and "Keep this plan".
- `wind-farm-ask-again-1024` is the wind farm plan at 1024 by 640 (words "only the wind" and "waste the spare power"), with "Ask again" pressed once, a turbine put beside the pond and moved, "Move the sun back", "Stop the turbines", then "Try another plan", the solar roofs plan, and "Go back to my first plan".
- `geese-slowed` holds four single pictures: the geese over the wind farm in the test at 1440, the flock waiting at dusk in the play break, and the trail after "Keep them turning" (an arch over the row) and after "Stop the turbines" (a straight line through it).

## Things learned

- Never put a `//` comment in the middle of one of the long lines of `level.js`: it cuts off the rest of the line. Use `/* */` inside a line.
- The scratchpad folder is shared with the other designers. Give log files and picture folders a name that nobody else will use.
- When the machine is busy, opening the page can take more than thirty seconds. Start it again.
- The times that the recorder prints are far too long when several recordings run at once (40 to 48 minutes this time). On a quiet machine the first build's solar path came to 10.6 minutes for a typical child. The level has not been timed on a quiet machine since the rework.

## What was run and what was not

Run in this round, with every picture looked at: the three full paths listed above; slowed quick looks of the wind farm's night in the test and of the dusk question with "Keep them turning", before and after the changes; and the level opened inside a frame with `?next=` in its address, where it loaded without errors, the corner chip showed 5, and the condition that leaves out "the end of the trial level" was true.

Not run: the whole game page itself; the last picture of the level while framed (only the condition was checked, not the picture); the second words "switch the power off at night" with any plan; Florence's offer to finish the day after three minutes; a day that is started with a panel left in the shade; the wind and sun plan without a battery in the play break; any window smaller than 1024 by 640. No sound was heard, because the recordings are silent.

## What is still weak

- The geese in flight are seen only in a moment of each flight on the recording machine. On a classroom computer they should fly smoothly, but nobody has watched that yet.
- In the wide views of the town the geese are far away and small. The close view of each neighbourhood in the test is where they can be seen well.
- The choice about the geese at dusk is made with two buttons in the band, not with a tap in the town.
- The place on the clock tower is small, and a lamp post stands partly in front of it in the solar neighbourhood. It can still be tapped.
- In the wind farm's play break the front homes are cut by the band at the bottom of the picture. Their lit windows can be seen, but their doors cannot.
- The dark night of the solar plan is still dark and quiet. That is what the plan does, and the level does not hide it, but the child's only things to do there are to tap a dark home and move on.
- With the words "only the sun" and "save the spare power in a battery", the solar plan has a battery that never fills, because six roofs make only the six beads the homes need. That is true and Florence says so, but a child may wonder why the battery is there.
- "Try another plan" still has no play break of its own (the kit shows the second plan in the town at once).
