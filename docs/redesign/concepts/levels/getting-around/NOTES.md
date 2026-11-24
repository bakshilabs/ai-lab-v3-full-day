# Getting around: notes for whoever works on this level next

These notes say what works, what changed in the one round of rework, what was run and what was not, and what still stands in the way. They were last brought up to date on 24 November 2026, at the end of the round of rework.

## What the level is

The family is meeting Gran at the row of shops on a spring morning. The child asks Florence for plans for the paths and streets, presses "Open the shops" to test them on three mornings, takes a postcard of each morning, chooses a plan, and then draws the paths on the ground between the homes and the shops. The town is built with the child's own paths, and the last picture is the family's walk to the shops.

## What changed in the round of rework

### The play break is now "Draw the paths"

The first build asked the child to lay about thirty separate pieces (straight pieces, bends and forks) one tap at a time, and the only real decision was the bridge, which in truth made no difference, because the board was the same on both sides. All of that has been replaced.

- The child presses a yellow square and drags, and the path follows the mouse from square to square. One tap lays one square, for a child who does not want to drag. Each new square joins the square the child came from, so there are no kinds of piece and nothing has to be turned. The whole board takes about seven or eight drags.
- The yellow squares show where the path can grow next. At the start only the square beside the shops is yellow.
- There are 28 squares of paving for 32 free squares. A child who gives every home a path of its own runs out, and Florence then says that two homes can share one path. "Take back" returns a square.
- The old trees now stand in two groves in the middle of the board, round the old oak. No path can cross the middle. When the child presses a tree, petals fall and Florence says that the path bends round it.
- There is one bridge and two places for it, on the left and on Gran's side. This is now a real decision with different results. With the bridge on Gran's side, Gran's walk is 9 squares long and three families on the left have a walk of up to 14 squares. With the bridge on the left it is the other way round, and Gran's walk is 13 squares long. When every home is joined, Florence says how long Gran's walk is and how long the longest walk is. She does not say that either is wrong. The sign over Gran's home also shows the length of her walk as soon as her home is joined, and it changes when the bridge is moved. The bridge can be moved at any time with one tap.
- A family whose way is longer than 18 squares takes the car, and Florence says that a shorter way would let them walk. This only happens when a child draws a very roundabout path.
- "Show me one way" now keeps everything the child has drawn and adds only what is missing.
- On the board of the winding loop the path can only follow the loop. The bridge decides whether Gran can walk: with direct paths and the bridge on her side she walks, and with the bridge on the left she takes the car.
- On the board of the grid the child also has four young trees for six empty places between the streets. They stay in the town afterwards. They do not change the "Nature" result, which counts the old trees.
- The child still chooses one of three paving colours.

### The third plan follows where the child put the park

In the first build the third plan was always called "Paths through a park" and kept its park in the middle, even when the child had asked for the park at the far edge or across the river, so the park seemed to be in two places. Now, when the child asks for the park somewhere else, the third plan is called "Paths between the old trees", its second line says where the new park is, the three small maps on the notice board show the new park as a green patch at the far edge or beside the river, and a sign "The new park" stands over it in the town. The plan is still good on both checks, because its paths bend round every old tree, so one plan is always good on every check.

### Smaller repairs

- The recap no longer says "Look again at the postcards" when none are on the screen. The three postcards are shown again in Florence's band while the question is asked, and the answer to a wrong tap now names the plan that was tapped and the plans where everyone walked.
- The three signs over the maps in the recap no longer overlap at 1024 by 640, and the sign "Your family" no longer shows at the edge of that picture.
- The ending of a plan in which Gran comes by car is tidy. The cars stand in one row in front of the shops, where they hide the goods, the way in from the path is clear, and Gran stands beside the family with her sign.
- The sign that keeps the first result in view no longer lets the two lines of the plan's tag run out of its box.
- The corner chip shows 2, which is this level's place in the game.
- Inside the whole game (held in a frame, with `?next=` in the address) the last picture does not say that it is the end of the trial level. Opened by itself it still says so.
- The play break of the grid of streets is now in the pictures, because the second recorded path uses the grid.

## The rules of the results

`board.js` holds the rules and can be checked without a browser by running `node check-board.mjs`.

- The third plan is good on both checks whatever the child asks for.
- The grid of streets keeps only two of the ten old trees whatever the child asks for. Everyone walks only when the child asked for short and direct paths.
- The winding loop keeps every old tree only when the child put the park in the middle, and people from the far homes take their cars.
- In the play break a family walks only if its own path is short enough. The town and Florence's sentence there follow the child's own paths, not Florence's drawing.

## What was run, and what was not

RUN-SECTION

## What still stands in the way

- Nobody has played this with a real mouse at full speed. The recording machine was shared by six recordings at once and drew less than one picture a second, so the feel of dragging a path, which is the heart of the new play break, has only been judged from single pictures and from the script's own drags. This is the first thing a person should try.
- Sound has still not been heard at all.
- The message that all the paving is used is not in any picture. It was not reached by either recorded path.
- When the child puts the park across the river, the new park is outside the picture of the town, so only the map and the plan's tag show it. The park at the far edge is mostly hidden behind the far homes, and only its sign shows.
- The boards of the grid and the loop are still thinner than the park board. On the grid the paving is not really scarce, and the young trees are a small extra. On the loop the bridge is the only decision.
- The postcards in the band are still small at 1024 by 640.
- The level is still short. One more activity would have to be a new idea of the owner's, for example crossings for the grid or a second scene at the bridge.

## What was learned

- Run recordings with patience. With six designers recording at once the machine stopped for minutes at a time, and the helper's presses, which give up after three minutes, failed. `play.mjs` therefore has its own presses and waits of twenty-five minutes.
- The browser joins several movements of the mouse into one when the page draws slowly. `draw.mjs` waits until the page has drawn twice after every movement, so that a drag is seen square by square.
- `play.mjs` adds `&walk=3` so that the walks last long enough to be caught in a picture; the times it prints are therefore much longer than a real play.
- `peek.mjs` jumps straight to the play break, the town or the end of any plan, which is far quicker than a whole run when only one step has changed. It sets the words by hand, so the name of the third plan is not right in its pictures.
- The kit's result cards have no place for a picture, so `level.js` adds the postcard to each card itself after the kit has drawn it.

## The files

`index.html` loads the tokens, the kit's `kit.css` and `level.css`, and then `level.js`. `level.js` holds the words (all placeholders), the plans and the results. `place.js` builds the place and holds every step's hook. `board.js` holds the rules of the board. `play.mjs` records, with the help of `draw.mjs`, `peek.mjs` looks at one step, and `check-board.mjs` tests the rules.
