# The Eco Town game: six levels joined into one

This folder holds the start page that joins the six trial levels of Eco Town into one game. It was made on 24 November 2026. Every word on the page is a placeholder.

## What the child sees

The start page shows Eco Town as a small valley with six places, one for each level, joined by one path in the order of the game: Land, Getting around, Homes, Food, Power and School. A place that has not been played is a building plot with stakes and a rope. A place that is done is built, with people in it, and its sign has a tick and the word "Done". The family stands on the path beside the place that comes next, whose plot and sign are yellow. Florence's band is under the picture, with six squares that show which levels are done and one big yellow button that says "Start" or "Carry on".

When the child presses the button, the level opens and fills the page under a narrow bar. The bar has a button that leads back to the town, the number and name of the level, and the six squares. When the level reaches its last closing picture, a yellow button "Go on" stands beside "Play again". It leads back to the town, where the new place grows out of its plot, the family walks on, and "Carry on" opens the next level.

After the sixth level the town is shown at dusk with every window lit, and the camera comes down to the family. The next picture shows three real jobs, a line about the jobs and a line about the break. These words are the approved sample words for Eco Town in `docs/redesign/wireframes-data.js`.

There is no score, no coins, no stars, no timer and no way to fail. Any level may be played again by clicking its sign, whether it is done or not. "Start a new town" empties the town again, after Florence has asked whether the child is sure.

## The files

- `index.html` is the page. It loads `../../ui/tokens.css`, `../level-kit/kit.css`, `game.css` and `game.js`.
- `game.js` holds the placeholder words, what is remembered, the band, the frame that holds a level, and the ending.
- `town.js` builds the picture of the town from blocks.
- `game.css` is the look of the title, the signs, the bar and the cards of the jobs.
- `check.mjs` checks the game in the pre-installed Chromium and saves the pictures in `pictures/`.

The page also loads these files of the kit and of the redesign, all by relative addresses: `../level-kit/shell.js`, `stage.js`, `blocks.js`, `fx.js` and `sound.js`, `../kit-v2.js`, `../../animation/vox.js`, `../../animation/three.module.min.js`, the two fonts `../../animation/inter.woff2` and `bricolage.woff2`, and Florence's picture `../../animation/florence-sprite.webp`. It loads nothing from outside this folder tree and sends nothing anywhere.

## How the game learns that a level has ended

The game never changes a level. It opens the level's own page in a frame with `?next=Go on` added to the address. One small addition to `../level-kit/flow.js` does the rest, and it is described in the kit's README. In short, a level that is held in a frame and has `?next=` in its address shows one more button on its last closing picture, and tells the page that holds it when that picture shows and when the button is pressed. A level that is opened by itself is exactly as before.

A level counts as done when its last closing picture shows, even if the child then goes back to the town with the bar and not with "Go on".

## What is remembered

The numbers of the levels that are done are kept in the browser's own memory on the device (`localStorage`, under the name `eco-town-game-1`). Nothing else is kept. If the browser will not keep it, the game still works until the page is closed.

## How to check it

Run these from this folder. The machine that records draws in software, so the second command takes a long time, and it can be run in parts.

```
node check.mjs start 1440 810          the start page with nothing done, three done and all done, and the ending
node check.mjs join 1440 810 3         from the start page through all six levels to the ending
node check.mjs join 1440 810 3 4       the same, starting at level 4 with levels 1 to 3 remembered as done
```

The second command does not play the levels. In each level it jumps straight to the closing pictures with `window.trial.end()`, which exists for this check only. Its pictures prove the way from one level to the next, and not the levels themselves.
