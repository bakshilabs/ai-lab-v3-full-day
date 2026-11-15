# Eco Town of the future: the module contract

**Contract 1, fixed on 15 November 2026. Do not change it while module work is in progress.** If something here proves wrong, tell the main session; do not work round it.

**Notes added after the three first versions were merged (the interface itself is unchanged):**
- `ctx.town.terrain.tiles` is a **Map** of key → tile, not a list.
- `three` cannot be imported at the top of a module's `index.js`: the tests load `index.js` in Node, where `three` does not resolve. Use `ctx.engine.THREE`, or load the file that needs three.js with `import()` inside `run` and `show`.
- `show()` has no frame hook. A module that animates its result in the town runs its own `requestAnimationFrame` and cancels it in the remover.
- The game's own keys and pointer stay live under a module. The drone and roads modules block them themselves.
- A child who presses "Back to my town" before finishing keeps nothing from that visit except what the module saved with `ctx.save`.
- While a module is open, everything the modules left in the town is put away, and drawn again afterwards.

The user's plan for the three modules is `docs/afternoon-modules-plan.md`. This page is how a module plugs into the game.

**15 November 2026, later:** two more ids were added, `film` (Town film studio) and `power` (Power control room), with `ctx.engine.setMusic(mood)` for the game's own mood music (`'day'`, `'night'`, `'lab'`, `'celebrate'`). The interface is otherwise unchanged. Their plan is `docs/more-modules-plan.md`. A module appears on the board and the start page only once it is merged (`ON_BOARD` in `contract.js`).

## In short

- A module is **one folder**: `games/ecotown/game/js/modules/<id>/`. The ids are `drone`, `robots`, `roads`, `film` and `power`.
- Its `index.js` exports one object. The **loader** (`js/modules/loader.js`) opens it, gives it the town and the 3D engine, keeps what it hands back and shows its result in the town.
- A module **adds files in its own folder and its own tests. It edits nothing else.**

## Files

| File | What it is |
|---|---|
| `js/modules/<id>/index.js` | The module. Replace the placeholder. Add more `.js` files beside it as needed. |
| `tests/<id>.test.mjs` (and `tests/<id>-*.test.mjs`) | Unit tests for the module's logic. Run with the rest: `cd games/ecotown/game && node --test tests/*.test.mjs`. |
| `tests/playwright/<id>.mjs` | One browser run that plays the module from start to finish. |
| `js/modules/contract.js`, `js/modules/loader.js`, `tests/modules.test.mjs` | The contract. **Not to be edited.** |

**A module must not edit** `game.js`, `main.js`, `game.css`, `content.js`, `net.js`, anything under `worker/`, or another module's folder.

**Imports allowed:** files in its own folder, `three` (and `three/addons/…`), `../contract.js`, and two read-only parts of the game: `../../world/catalog.js` (what each build is) and `../../sim/sim.js`. Nothing else. `tests/modules.test.mjs` checks this.

**Styles:** there is no separate stylesheet file in the build. Export the module's CSS as a string (`css`); the loader adds it to the page once. Start every rule with `#module[data-module="<id>"]` so it cannot touch the game.

## The module object

```js
export default {
  id: 'drone',                                  // must match the folder
  icon: '🚁',
  title: { j: 'Drone delivery', s: 'Drone delivery' },        // j: ages 8–12, s: ages 13–17
  blurb: { j: 'One line for the board.', s: 'One line for the board.' },   // at most 80 characters
  css: '#module[data-module="drone"] .panel { … }',          // optional
  async run(ctx) { … return { finished, record, town }; },    // plays the module once
  show(townCtx, data) { … return () => { /* remove it */ }; }, // optional: draws the module's result in the town
};
```

## What `run(ctx)` is given

| | |
|---|---|
| `ctx.junior`, `ctx.band` | The age route: `true` / `'junior'` for 8–12, `false` / `'senior'` for 13–17. |
| `ctx.settings` | `{ readAloud, reduceMotion, largeText }`. Respect all three. |
| `ctx.town.cells` | The child's own town, to read: an array of `[key, cell]`. A key is `"gx,gz"`; a cell is `{ mark, item, mods }` (`mark: 'town'` is town land; `item` is a build id from `catalog.js`). It is a copy: changing it changes nothing. |
| `ctx.town.sim` | The simulation's result for that town (families, homes, walk times, carbon and so on; see `sim/sim.js`). |
| `ctx.town.terrain` | The island: `terrain.tiles` (`{ k, gx, gz, zone, fixed }`), and helpers. |
| `ctx.engine` | `{ THREE, scene, camera, renderer, canvas, stage, world, rig, life, florence, audio }`. The island and the town stay in the scene. `world.tileTop(key)` gives a tile's position. Add your own objects to `scene` and **remove them when the module ends**. |
| `ctx.engine.onFrame(fn)` | `fn(dt, t)` runs every frame after the game's own camera. Set `camera.position`, `camera.quaternion` and `camera.fov` there to have your own view. The loader puts the camera back when the module ends. |
| `ctx.root` | An empty layer over the 3D view. Put the module's panels and buttons here. It is removed when the module ends. |
| `ctx.say(text)` | Reads a line aloud when read-aloud is on. Every instruction a child must follow is spoken as well as written. |
| `ctx.report({ stage, state, finished })` | Where the child is, for the leader's list. `stage` is a short phrase (at most 80 characters). Call it at each step. |
| `ctx.saved`, `ctx.save(state)` | The module's own progress from last time (or `null`), and a way to keep it: any JSON up to 8 KB. Never anything typed. |
| `ctx.left`, `ctx.signal`, `ctx.onLeave(fn)` | The loader draws **the one way back**: a "Back to my town" button, top left. When it is pressed `ctx.signal` aborts, `ctx.left` resolves and each `onLeave` function runs. Stop timers and remove 3D objects there. Do not draw a second way out. |

## What `run(ctx)` hands back

```js
return {
  finished: true,                 // the loop was completed. false: the child left early.
  record: {                       // for the take-home page
    made: { title: 'My drone route',                       // at most 60 characters
            lines: ['From the bakery to the school', '5 steps'],   // up to 6 lines of 120 characters
            picture: '<svg …>…</svg>' },                    // optional: inline SVG, or a data:image/png address, at most 200 KB
    practised: ['planning a route on a map', 'breaking a job into steps a machine can follow'],  // 2 to 4 lines
  },
  town: { kind: 'drone-route', data: { … } },   // the one visible result left in the town; data is yours, at most 4 KB
};
```

- **`practised` lines** each complete the sentence "You practised …". Build them from what the child actually did. Say what was practised or made, never what was learned or how much anyone improved.
- **`finished: true` needs** a title and at least two practised lines, or it is recorded as not finished.
- The loader trims and checks all of this (`contract.js`), keeps it in the save under `modules.<id>`, sends the words (not the picture) with the server copy, and shows a "You made / You practised" card. The picture stays on the device.
- **A module never writes the save, local storage or the network itself.**

## The result in the town

If the module returns `town`, the loader calls `show(townCtx, data)` when the town starts and after the module ends:

- `townCtx` is `{ engine: { THREE, scene, world, life, stage }, town: { cells, terrain }, junior, reduceMotion }`.
- Draw one thing (a drone flying its route, a robot at work, the rebuilt street). **Scenery only:** it does not change the town's tiles or its numbers in this first version.
- Return a function that removes everything you added. The loader calls it before drawing again.
- The town may have changed since the module was played. If the place your result needs is gone, draw nothing.

## How a module is opened

- **In the game:** Menu → **Town of the future** opens a board of the three modules.
- **By address:** `?module=<id>` opens it as soon as the town is ready (after the intro).
- **In a browser test:** `window.__eco.openModule('<id>')`. To get into a town quickly, see `tests/playwright/run.mjs` (it sets `ecotown.prefs` to low graphics, picks an age, names a town and skips the intro with `[data-introskip]`).
- A module does not open in a challenge town.

## Rules for every module

- **Nothing a child types leaves the device. No names.** Prefer no typing at all: tiles, taps and drags.
- **Florence writes no free text.** She assembles what she says from built-in lines and choices.
- **No lesson about catching the AI out.** That is the morning's lesson and it stops there. Here Florence and the machines are capable partners. A machine may have an honest limit the child can see and fix.
- Plain British English. Short sentences. No budget or coins for ages 8–12.
- Works on a laptop and a tablet, by touch and by keyboard. With reduced motion on, nothing spins, shakes or flies past: cut, do not animate.
- **Never deploy. Never contact the original sites.**
- **First version only:** one playable loop of about ten minutes, unit tests for its logic, and one browser run that plays it from start to finish with no errors.
