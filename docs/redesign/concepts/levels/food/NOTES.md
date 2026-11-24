# Food level: notes for whoever works on it next

These notes say what works, what is left and what was learned. They were last updated on 24 November 2026.

## What the level is

The level is built on the shared kit in `../../level-kit/` and follows `outline.md`, which the owner approved. The place is the market square. The community gardens are on the left, the indoor farm with its open front is on the right, and the big farm is far away on the hill, at the end of one long road. There are two checks only, "Short journey" and "Food all year". The level does not say where the indoor farm's electricity comes from. Every word on the screen is a placeholder.

## The files

- `index.html` is the page. It loads the design tokens, the kit's style sheet and `level.js`, and it holds a few style rules of its own for the sign that keeps the first result in view.
- `level.js` holds the words, the plans, the results, the test, the play break, the town, the recap and the things that answer a tap.
- `place.js` builds the square, the gardens, the indoor farm, the far farm, the stalls, the people and the seasons. It borrows one shape, a lettuce, from `../../kit-v2.js`.
- `play.mjs` plays the level through and saves the pictures. It gives the page a clock of its own, so that the pictures catch the same moments however slow the machine is.

## What works

The level plays from the job to "Play again" on all three plans. This was checked on 24 November 2026 by running `play.mjs` for the indoor farm, for the gardens followed by "Try another plan", and for the big farm followed by "Try another plan".

## How to record

Run these from this folder. Each takes between ten and forty minutes, because the machine draws in software.

    node play.mjs pictures/indoor-farm-1440 1440 810 2 -1
    node play.mjs pictures/gardens-then-big-farm-1024 1024 640 0 1

The last two numbers are the plan the sample child chooses and the plan it tries afterwards (0 is the gardens, 1 is the big farm, 2 is the indoor farm, and -1 means that it does not try another).

## What is left, and what is weak

- Snow now lies on the far fields in winter, and the result sentence says that the big farm sends food in winter from its huge fields and its cold stores. The picture does not show a cold store, so a child has to take that from the words.
- At 1024 by 640 the name of the first plan runs a little past the right edge of the sign "Your first plan" when the plan is the community gardens (picture 34 of the second path).
- In the picture `32-break-delivery` of the first path the cargo bike has reached the stall and the crates have not appeared yet. This is the moment the picture caught and not a fault in the level.
- All three plans always appear, so the child's words only decide which plan appears first with the yellow sign "Nearest to your words". The results on the cards do not change with the words.
- The play break of the big farm is shorter and plainer than the other two: sow six of eight fields, tap the harvester, tap the shed. It has the choice of crops and nothing else to decide.
- The rule that tall plants need the tall places is a rule to follow, not a choice with two different results. The real choice in the play break is which three crops to grow, and it shows on the shelves or beds and on the stall.
- Nobody has played the level with a mouse in a real browser at full speed. The length of about ten minutes is an estimate.
- There is sound (short beeps and a chime), and nobody has listened to it.

## What was learned

- Two recordings can run at the same time, because of the page's own clock in `play.mjs`. When the machine is very busy the kit's helper gives up on saving a picture after three minutes, so `play.mjs` now saves its own pictures and tries again.
- The camera of the gardens looks down across the front beds to the back beds. The boxes that take the taps for the front beds are therefore kept low, or a tap on a back bed picks the bed in front of it.
- The kit's sign for the first result is too narrow for this level's long sentences, so `index.html` has its own rules for it. The kit was not changed.
