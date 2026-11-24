# Getting around: notes for whoever works on this level next

These notes say what works, what is left and what was learned. They were last brought up to date on 24 November 2026.

## What works

The level plays from the job to "Play again" with no errors in the page. It was played through by the recording script on two paths: the plan that is good on every check (paths through a park, with short and direct paths and the park in the middle) at 1440 by 810, and the winding loop with "Try another plan" at 1024 by 640. The pictures of both are in `pictures/`.

- The job, the sentence with two gaps, and "Ask Florence" follow the approved wireframe. The child's words are drawn in the place at once: a sample of the kind of path beside the forecourt, and a yellow outline where the park would go.
- Florence's three plans appear as three small maps on a notice board on the forecourt.
- "Open the shops" opens the shutters and plays three mornings in turn. After each one the child presses "Take the postcard", and the postcard drops into Florence's band.
- The result cards carry the postcards, a meter of ten boxes before each sentence, and a tick, dash or cross. A tap on a postcard shows it large.
- In the play break the child fits straight pieces, bends, forks and one bridge onto a board of seven squares by seven. A family sets off for the shops as soon as its home is joined. The child chooses one of three paving colours.
- The town shows the child's own paths and paving colour. "Try another plan" keeps the first result in a small sign.
- The recap is a tap on one of the three maps, and any answer goes on.
- The last picture is the family's walk along the path to the shops.
- Trees, shop bells, neighbours and the family all answer a tap, at any step outside the play break.

## The rules of the results

`board.js` holds the rules and can be checked without a browser by running `node check-board.mjs`.

- Paths through a park is good on both checks whatever the child asks for, so one plan is always good on every check.
- The grid of streets loses most of the old trees whatever the child asks for. Everyone walks only when the child asked for short and direct paths.
- The winding loop keeps the trees only when the child put the park in the middle, and people from the far homes always take their cars.
- In the play break a family walks only if its own path is short enough (13 squares for the park plan). The town and Florence's sentence there follow the child's own paths, not Florence's drawing.

## What is left, and what is weak

- The play break on the park board needs about thirty pieces. That is a lot of taps for a child of eight. "Show me one way" finishes the board and keeps the child's bridge, but it replaces the child's other pieces.
- The boards of the grid and the loop offer a smaller decision than the park board. On the loop the only real choice is which side gets the bridge. The young trees to plant on the grid board, which the outline mentions, are not built.
- With the park put at the far edge or over the river, the third plan still keeps every old tree in the middle. This was done so that one plan is always good, but a child could fairly ask why the park is drawn in two places.
- The postcards in the band are small at 1024 by 640.
- Nobody has played this with a real mouse at full speed. The recording machine draws about one picture a second, so the feel of the walking and of laying pieces has only been judged from single pictures.
- Sound has not been heard at all.
- When the child taps a plan in the recap where not everyone walked, Florence says "Look again at the postcards", but no postcards are on the screen at that step. The words should be changed, or the postcards shown again.
- When Gran comes by car, the last walk passes very close to the tubs of tulips and the parked cars, so the picture on the way is crowded. The last picture itself is clear.
- In the pictures at 1440 by 810 the machine was so slow that the three "walking" pictures show people who have already arrived. The pictures at 1024 by 640 do show people on the way.
- The recording script estimated about ten minutes for a fast reader and about thirteen for a typical child who also tries another plan. That run played every walk three times as slowly as the real level, so the real time should be a little shorter.

## What was learned

- Run one recording at a time and expect each to take a long time. `play.mjs` adds `&walk=3` so that the walks last long enough to be caught in a picture; the times it prints are therefore much longer than a real play.
- `peek.mjs` jumps straight to the play break, the town or the end of any plan, which is far quicker than a whole run when only one step has changed.
- `check-play.mjs` checks a list of pieces against the rules without a browser. Use it before changing the pieces that `play.mjs` lays.
- The kit's result cards have no place for a picture, so `level.js` adds the postcard to each card itself after the kit has drawn it.
- The kit's sign for the first result grows very tall with two long sentences, so `level.css` makes it narrower and lets the words wrap around the meter.

## The files

`index.html` loads the tokens, the kit's `kit.css` and `level.css`, and then `level.js`. `level.js` holds the words (all placeholders), the plans and the results. `place.js` builds the place and holds every step's hook. `board.js` holds the rules of the board. `play.mjs` records, `peek.mjs` looks at one step, and the two `check-` scripts test the rules.
