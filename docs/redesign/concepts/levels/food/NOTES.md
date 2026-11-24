# Food level: notes for whoever works on it next

These notes say what works, what is left and what was learned. They were last updated on 24 November 2026, at the end of the one round of rework that the owner allowed.

## What the level is

The level is built on the shared kit in `../../level-kit/` and follows `outline.md`, which the owner approved. The place is the market square. The community gardens are on the left, the indoor farm with its open front is on the right, and the big farm is far away on the hill, at the end of one long road. There are two checks only, "Short journey" and "Food all year". There is no third check, and the level does not say where the indoor farm's electricity comes from. Every word on the screen is a placeholder.

The section of `outline.md` about the play break describes the first build. The play break is now the one described below.

## The files

- `index.html` is the page. It loads the design tokens, the kit's style sheet and `level.js`, and it holds a few style rules of its own for the sign that keeps the first result in view.
- `level.js` holds the words, the plans, the results, the test, the play break, the town, the recap and the things that answer a tap.
- `place.js` builds the square, the gardens, the indoor farm, the far farm, the stalls, the people and the seasons. It borrows one shape, a lettuce, from `../../kit-v2.js`.
- `play.mjs` plays the level through and saves the pictures. It gives the page a clock of its own, so that the pictures catch the same moments however slow the machine is.

## What changed in the round of rework

### The play break is now "Fill your stall for the whole year"

In the first build the child grew one crate of food, and the only real decision was which three crops to grow. The play break now has two halves, and the child fills both sides of their own market stall: the summer side first, and then the winter side. The second half is different for each plan, so that the child feels with their own hands what the two checks found.

- **The indoor farm.** The child chooses three crops, puts six trays on nine shelves, turns on the water and the lights, picks the food and sends the cargo bike to the summer side of the stall, as before. Then snow falls outside. Nothing changes inside, and the picked trays grow again by themselves, because the water and the lights are still on. Three shelves are still empty. The child fills them for the winter and may choose a different crop for each one, from four low crops. One tap on the lift picks all nine shelves, and the cargo bike fills the winter side of the stall with crates in the child's own mix.
- **The community gardens.** The child plants, waters, picks and sends the handcart to the summer side, as before. Then autumn comes and the summer plants are over. The gardens have one winter cover, a low frame of glass. The child chooses one of three winter crops (carrots, cabbages or leeks) and one of eight beds for it. The snow comes and lies on every bed but that one. The child picks the food, and the handcart takes one small basket of it to the winter side. This is the dash of the "Food all year" check, seen from the inside: one bed is all that grows in the snow.
- **The big farm far away.** The child sows six of eight fields and starts the harvester, as before. The camera then goes close to the shed, where two farm workers stand beside six cold boxes. Each box has a band in the colour of its crop. The child taps three boxes into the cold store for the winter, and so decides which food the town will have in the snow. The other three go on the lorry, and the sign over the lorry counts "Day 1", "Day 2" and "Day 3" on the long road. Then snow covers the fields, the child opens the cold store, and the lorry makes the long journey again with the boxes that were kept.

The decisions in the play break are now these: which three crops; where each one goes; and, for the winter, which crop fills the empty shelves, or which winter crop goes under the one cover and on which bed, or which three boxes are kept. Each of them shows on the child's stall, and the stall keeps it in the town, on "Try another plan" and in the closing picture.

### Smaller changes

- **The sentence "Its lights use electricity" was taken off the result card and out of Florence's sentence in the town.** It stood under the check "Food all year", beside a tick, and said nothing about that check. It also invited the question of where the electricity comes from, which the owner has not answered. The fact itself is kept once, as a plain fact and with no source named: when the child reaches the tank and the switch, Florence says that the plants need "water from the tank and electric growing lights". If the owner would rather not mention electricity at all until the source is decided, that one phrase in `T.aSay` in `level.js` is the only place to change.
- The indoor farm's play break used to begin in the snow. It now begins in summer and ends in the snow, like the other two, so that "summer side, then winter side" is the same story for every plan.
- The recap question now asks for "the place where the most fresh food is growing in the snow", because the gardens may now have one green bed under the cover in winter.
- The name of the first plan no longer runs past the edge of the sign "Your first plan" at 1024 wide. The two lines of the name now stand one under the other.
- The corner chip shows 4, which is the place of Food in the game.
- When the level is held in a frame by the whole game (with `?next=` in its address), the last picture says "This is the end of the Food level." and not that it is the end of the trial level. Standing alone it says what it said before.
- Cold boxes can carry a band in the colour of a crop, and the small winter basket takes the colours of the winter crop.

## What was run in this round, and what was not

All three plans were played from the job to the last picture with `play.mjs`, with the lighting effects on:

- the indoor farm at 1440 by 810 (`pictures/indoor-farm-1440/`);
- the gardens at 1024 by 640, followed by "Try another plan" with the big farm and "Go back to my first plan" (`pictures/gardens-then-big-farm-1024/`);
- the big farm at 1024 by 640, followed by "Try another plan" with the indoor farm and "Go back to my first plan" (`pictures/big-farm-then-indoor-farm-1024/`). This run also shows the ending for the big farm plan, which the first build had not run again.

The corner chip and the closing words were checked with a small script that holds the level in a frame with `?next=Go on`, for all three plans, and once standing alone.

These were not run:

- "Keep this plan" after "Try another plan". Every run pressed "Go back to my first plan".
- "Ask again", and "Play again" in the middle of the play break.
- The level inside the real page of the whole game (`../../game/`). Only a plain frame was used.
- Nobody has played the level by hand with a mouse in a real browser at full speed, and nobody has listened to its sound.

## How to record

Run these from this folder. Each takes between twenty minutes and more than an hour, because the machine draws in software.

    node play.mjs pictures/indoor-farm-1440 1440 810 2 -1
    node play.mjs pictures/gardens-then-big-farm-1024 1024 640 0 1
    node play.mjs pictures/big-farm-then-indoor-farm-1024 1024 640 1 2

The last two numbers are the plan the sample child chooses and the plan it tries afterwards (0 is the gardens, 1 is the big farm, 2 is the indoor farm, and -1 means that it does not try another). For a quick look at the play break alone, put `SKIP=1 QUERY='&plain' STEP=500` in front of the command: it goes from the job straight to the play break, with the lighting effects off.

## What is left, and what is weak

- **The cold store is a simplification that the owner should know about.** The first build already said that the big farm sends food in winter "from its huge fields and its cold stores", and the play break now makes the child do it. Apples, carrots and cabbages really are kept in cold stores for months. Lettuce, strawberries and tomatoes are not, and in real life a far farm sends those in winter because it is somewhere warmer or grows them under glass. The level lets the child put any of its five crops in the cold store. If the owner wants this to be exact, the big farm needs crops of its own that keep, or the far farm must be in a warmer place.
- All three plans always appear, so the child's words only decide which plan appears first with the yellow sign "Nearest to your words". The results on the cards do not change with the words. This was not changed in this round.
- The winter cover in the gardens is made of glass, and one of the word buttons is "under glass", which leads to the indoor farm. A child could ask why the gardens do not simply have more covers. The level answers only that the gardens have one.
- In the far view of the big farm in winter, the cold store is a small target, although its sign can be tapped as well.
- The big farm is still the plainest of the three play breaks to look at, because most of it happens far away.
- The play break is now about twice as long as before. Whether a child of eight stays with it to the end has to be seen with real children.
- On the cold boxes the band of the tomatoes and the band of the strawberries are two reds that are hard to tell apart. A child who grows both cannot easily see which box is which.
- The play break is still made of taps on yellow places. It has more to decide than before, but nothing in it asks for skill or gives a surprise.
- While a recording runs, the grey pollution behind the lorry fades more slowly than everything else moves, so some pictures show more of it than a child would see.

## What was learned

- Several recordings can run at the same time, because of the page's own clock in `play.mjs`. When the machine is very busy the kit's helper gives up on saving a picture after three minutes, so `play.mjs` saves its own pictures and tries again.
- The scratchpad folder is shared by all the designers who work at the same time. Use a folder of your own inside it, or two recordings will write over each other's pictures.
- The camera of the gardens looks down across the front beds to the back beds. The boxes that take the taps for the front beds are therefore kept low, or a tap on a back bed picks the bed in front of it.
- The kit's sign for the first result is too narrow for this level's long sentences, so `index.html` has its own rules for it. The kit was not changed.
- The yellow of an upright place is faint against the pink wall of the indoor farm once the growing lights are on, so the level makes it stronger for the winter shelves.

## The designer's answers to the owner's four questions, after the round of rework

**Is the level long enough?** Yes. The play break is about twice as long as it was, and the whole level is now estimated at twelve to fourteen minutes. This is an estimate from the recordings and not a measurement with a child.

**Does it need more activities or scenes?** No. It has the square, three places to grow food, a year of weather, and a play break in two halves. What it needs now is to be played by real children, and then to be trimmed where they lose interest, most likely in the big farm's play break.

**Is the designer proud of the work?** Yes for the gardens and the indoor farm, with one reservation for the big farm. The winter cover in the gardens and the three empty shelves of the indoor farm make the child do with their own hands what the check "Food all year" found, and the stall shows it afterwards. The big farm's cold store works as play, but it rests on a simplification about which foods keep, which is written above for the owner to judge.

**Is the designer impressed by the experience a child gets?** By the place and by the test, yes: the far farm is truly far, and the year turns in front of the child. By the play break, more than before, but not fully. It is still a chain of taps on yellow places, the result cards still do not change with the child's words, and nobody has yet played it by hand at full speed or listened to it.
