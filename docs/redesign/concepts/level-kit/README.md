# The level kit

This folder holds the parts that every Eco Town level shares. It was pulled out of the Homes trial on 23 November 2026, and the Homes trial in `../trial/` now runs on it. Five other levels (Land, Getting around, Food, Power, and A school for everyone) will each be built on it by a design agent of their own.

The kit is thin on purpose. The owner decided what is shared and what is free, and the kit follows that decision exactly.

**Shared by every level, and given by the kit:** Florence's band under the picture, the word buttons and the test button, the order of the steps, the result cards with the evidence before the tick, dash or cross, a general meter, the tags of the plans, the block style and its materials, the family, the lighting effects, the page and its top pills, and the label that says the words are placeholders.

**Free for each level, and not in the kit:** the place, the camera and how it moves, the time of day and the weather, the test and how it plays out, the activity in the play break, the colours, the sound and the pace. The Homes street, sawmill, kiln, dollhouse and winter night are not in the kit. They stay in `../trial/`, and a level must not copy them.

Please do not change the files in this folder while you build a level. Other levels depend on them. If something is missing or gets in your way, say so in your report, and work around it in your own folder for now.

## What each file gives

`kit.css` is the look of the page: the picture on top, the paper band underneath, the pills along the top, the buttons, the sentence with its gaps, the cards, the meter and the signs that sit over the picture. It needs the design tokens in `docs/redesign/ui/tokens.css`, which the page loads first.

`shell.js` puts the page together as soon as it is loaded, so a level's `index.html` holds almost nothing. It also gives the small pieces of interface: `btn` makes a button, `ui` sets a whole step at once, `says` changes Florence's words, `meter` draws a row of boxes filled from the left, `meterBox` makes a box of meters for the band that can rise during a test, `planTag` draws the tag of a plan, and `resultCards` and `firstSign` draw the results. The label "This is a trial level. Its words are placeholders." is part of the page and always stays.

`stage.js` is the three.js stage. It draws whatever scene the level gives it, with the lighting effects. It gives `tw` and `wait` for changes over time, `glide` for moving the camera, `hitBox` for things that can be tapped with the mouse, `plate` for a sign that follows a place in the picture, `glowMarks` to make yellow places glow, and `newScene`, which is an optional scene with a sky, haze, a sun and soft shadows. The comment at the top of the file lists every part of a scene that the stage reads.

`fx.js` holds the lighting effects: soft darkening where blocks meet, glow around bright things, a filmic curve and a slight darkening of the corners. The stage uses it by itself. Adding `?plain` to the address turns the effects off for comparison, and `?fx=on` keeps them on whatever the speed. With neither, the page turns the effects off by itself only if it draws fewer than 15 pictures each second for eight seconds in a row.

`blocks.js` is the block style. It gives `blk` and `B` for boxes, `group`, `fig` for a person with a face, arms and legs, `place` and `frame` for yellow places, `M` for materials, `tone` for colours at full strength, `texBox`, `tileMat`, `wallMat` and `patTex` for boards, bricks, tiles, paving, bark, glass, grass and leaves, and `FAMILY` and `familyGroup` for the family, who are the same three people in every level.

`flow.js` is the order of the steps. A level calls `runLevel` once and hands it the words, the plans, the results and a scene. The steps are listed at the top of the file and in the next section.

`sound.js` gives two small sounds, `beep` and `chime`. The kit never plays a sound by itself, because sound belongs to the level.

`record.mjs` is a helper for the script that plays a level through and saves a picture of every step.

`example/` is the smallest level that uses the kit, a kite for a windy day. It is not a level of the game. Read `example/level.js` first: it is about a hundred lines, and it shows every hook in use.

## The order of the steps

Every level goes through the same steps, and `flow.js` runs them.

1. Florence says what the family needs, and one button starts the level.
2. The child fills the gaps of one sentence with word buttons and asks Florence to suggest plans. The child asks once.
3. Florence's plans appear in the place itself, and one big button starts the test.
4. The test plays. The child causes something to happen in the town, and the answer shows at a glance.
5. The child looks at the results and chooses a plan. Each card gives a sentence about what happened, and only then a tick, a dash or a cross. "Ask again" goes back to step 2.
6. The play break follows, in which the child builds or does something with the chosen plan.
7. The plan is carried out in the town. "Try another plan" shows the cards again. The child picks a second plan and sees it in the town at once, with no second play break. A small sign keeps the first result in view, Florence asks "What changed?", and the child keeps either plan.
8. The recap is one question that the child answers by tapping the town. Any answer goes on, so it never blocks.
9. One or more closing pictures end the level, and the last has "Play again".

## What a level must supply

A level lives in a folder of its own and has three files of its own: `index.html`, a script for the level, and a script that records it. The level's script calls `runLevel` with one object. These are its parts.

`place` names the level in the top left pill, for example `{ number: 1, town: 'Eco Town', level: 'Food' }`.

`words` holds every word of the shared steps. All of them are placeholders. The names are: `level`, `job`, `start`, `askT`, `askHow`, `ask`, `sentence`, `plansSay`, `test`, `testT`, `watch`, `choose`, `again`, `use`, `playT`, `next`, `townT`, `townHow`, `built`, `tryOther`, `chooseOther`, `first`, `what`, `keepFirst`, `keepThis`, `recapT`, `recapQ`, `recapYes`, `recapNo`, `end` and `replay`. A level that lets the child look at each plan in turn also gives `lookT`, `look` and `showAll`. The example shows what each one is for. `sentence` is a list in which a string is fixed words and a list of strings is a gap with its options. `plansSay` is a function that is given the words the child chose and gives back what Florence says.

`plans` is a list of plans. Each plan has a `name`, two short `lines` for its tag, and an optional `icon`, which is a small SVG picture with the class `tagpic`. If two plans could be confused, give them pictures that tell them apart at a glance.

`results(i, scene)` gives the rows of the result card of plan `i`. Each row has a `check` (its name), a `text` (a sentence about what happened), a `mark` (`'g'` for a tick, `'f'` for a dash or `'p'` for a cross) and an optional `evidence`, which is a small picture such as `meter(7, '7 of 10')` that stands in front of the sentence. The results must depend on the words the child chose.

`after(i, scene)` gives the sentence that Florence says when plan `i` is in the town.

`evidence` is optional. It is an element, such as the box from `meterBox()`, that stays in the band from the test until a plan is chosen.

`scene()` makes the place and gives back a scene object. It is called again each time the level starts. The scene carries the hooks below, and everything inside them is yours to design.

- `words(list)` is called whenever the child changes a word, so that the child's words can be drawn in the town at once. The list holds the number of the option chosen for each gap, and `undefined` for an empty gap.
- `showPlans(list)` makes Florence's plans appear in the place. The test button waits until it has finished.
- `test(api)` plays the test. It gives back `true` when it has finished, or `false` if the level was started again meanwhile. `api.step(text)` changes the title of the step, and `api.say(paragraphs)` changes Florence's words.
- `playBreak(pick, api)` is the play break. `api.say(paragraphs)` changes Florence's words, `api.tray(things)` puts buttons of your own in the band, and `api.done(paragraphs)` must be called when the child has finished: it shows the "Next" button.
- `town(pick, api)` carries the plan out in the town and finishes when it is done. `api.tray` and `api.btn` are there if this step needs a button of its own.
- `swap(pick)` shows another plan in the town at once, for "Try another plan".
- `recap(answer)` sets up the tap on the town and calls `answer(true)` or `answer(false)`. Leave it out and the level goes straight to the end.
- `asking()`, `wordTapped(gap, option)`, `look(seen)` and `showResults()` are optional. The comments in `flow.js` say when each is called.
- `spot(name, i)` is only for the recording script. It gives the place in the world, as `[x, y, z]`, of something the script should tap.

`ends(pick, scene)` gives the closing pictures as a list. Each has a `step` (the title), `say` (Florence's words), `go` (a function that shows the picture) and `next` (the words on the button that leads to the picture after it).

## A minimal example

The page of a level is this short, because `shell.js` builds the rest. The paths below are for a level in `docs/redesign/concepts/levels/<name>/`.

```html
<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eco Town: the name of the level</title>
<link rel="stylesheet" href="../../../ui/tokens.css">
<link rel="stylesheet" href="../../level-kit/kit.css">
</head>
<body>
<script type="module" src="level.js"></script>
</body>
</html>
```

The script of a level has this shape. `example/level.js` is the same thing filled in, and it runs.

```js
import { B, group, familyGroup } from '../../level-kit/blocks.js';
import { newScene, tw, run, glide, hitBox } from '../../level-kit/stage.js';
import { meter } from '../../level-kit/shell.js';
import { runLevel } from '../../level-kit/flow.js';

const words = { level: '…', job: ['…'], start: 'Start', sentence: ['Florence, please suggest …', ['one option', 'another option'], '.'] /* and the rest */ };
const plans = [{ name: '…', lines: ['…', '…'] }, { name: '…', lines: ['…', '…'] }, { name: '…', lines: ['…', '…'] }];
const results = (i, scene) => [{ check: '…', evidence: meter(7, '7 of 10'), text: 'A sentence about what happened.', mark: 'g' }];

function myPlace() {
  const s = newScene(40);                                   // or a scene of your own
  Object.assign(s, { eye: [0, 3, 20], at: [0, 4, 0], fov: 45 });   // your own camera
  B(s.g, 0, 0, 100, 100, -1, 1, '#7cc65c');                 // build the place from blocks
  familyGroup(group(s.g, 6, 0, 4));
  s.words = (list) => { /* draw the child's words in the place */ };
  s.showPlans = async (list) => { /* the plans appear */ };
  s.test = async (api) => { const me = run; await tw(3, (t) => { /* something happens */ }); return me === run; };
  s.playBreak = async (pick, api) => { /* your activity; call api.done([...]) at the end */ };
  s.town = async (pick) => { /* the plan is carried out */ };
  s.swap = (pick) => { /* another plan, shown at once */ };
  s.recap = (answer) => { /* a tap on the place; call answer(true) or answer(false) */ };
  return s;
}
runLevel({ place: { number: 1, town: 'Eco Town', level: '…' }, words, plans, results, scene: myPlace,
  after: (i, scene) => 'What Florence says when the plan is in the town.',
  ends: (pick, scene) => [{ step: '…', say: ['…'], go: () => { /* the closing picture */ } }] });
```

Two habits keep a level safe when the child presses "Play again" in the middle of an animation. Use `tw` and `wait` from the stage for everything that takes time, because they stop quietly when the scene changes. In a long animation, keep `const me = run` at the start and leave with `if (me !== run) return` after each wait.

A level that wants a camera entirely of its own gives its scene a `camera(cam, seconds)` function, and the stage then leaves the camera alone. A level that wants its own sky and light makes its own `THREE.Scene` and does not call `newScene`.

## How to record pictures

Do not install Playwright; the pre-installed Chromium is used. Write a short script beside your level that uses `record.mjs`, and run it with Node from your level's folder. `../trial/play.mjs` and `example/play.mjs` are two such scripts.

```js
import { openLevel } from '../../level-kit/record.mjs';
const r = await openLevel({ page: 'concepts/levels/<name>/index.html', out: 'pictures/my-run', width: 1440, height: 810 });
await r.shot('job', 1500);            // waits, then saves pictures/my-run/01-job.jpg
await r.click('Start');               // presses the button with exactly these words
await r.has('Make it rain');          // waits until that button can be pressed
await r.usePlan(1);                   // presses "Use this plan" on the second card
await r.tap('plot', 0);               // taps the place that scene.spot('plot', 0) gives
await r.report(); await r.close();
```

The recording machine draws in software, at about one picture each second, so a whole level takes ten minutes or more. Give the command a generous time limit, and run one recording at a time, because two at once slow each other and change what the pictures catch. The helper always adds `?fx=on`, so that the lighting effects stay on at that speed. A `speed` above 1 plays the animations faster and is for quick checks only. Record at 1440 by 810 and at 1024 by 640, and look at every picture at full size: check that nothing important is hidden behind a card or a sign, that the yellow places are easy to see, and that the words fit.

## The owner's rules that every level must follow

- There is no budget, no coins, no score, no timer and no way to fail.
- The game is played with a mouse only. Targets are big and yellow, and a child should not have to aim.
- Nothing in a level may be unsafe for a child to copy.
- Florence is never wrong or incomplete, and nothing says how sure she is. She suggests plans and the child decides.
- The child asks once, tests once and chooses. There is no step that adds to the sentence and asks again, no prediction step, and the child never picks which checks to use.
- The word buttons must be a real decision. The goals of the job are fixed in the sentence. The options in a gap must not all be equally good, and the screen must give the child what they need to judge them. The child's words must change the result.
- At least one plan is good on every check.
- Every result is a sentence about what happened, with the evidence before the mark. A mark is a shape as well as a colour.
- One press starts the test, the child causes something to happen in the town, and the answer shows at a glance.
- The play break has a real small decision and leaves a visible mark on the town. It is about the plan itself, not decoration.
- The Eco Town choice is always the most attractive thing in the picture. Nothing that harms the town, such as traffic, may look nicer.
- Say "plan" and never "solution", "check" and never "lens", "pollution" and never "smoke", and "no wind" and never "still".
- Every word on the screen is a placeholder until the owner's words are in, and the label that says so stays on the page. Do not call any outside service to write words.
- The classrooms have fast computers, so do not hold back the look: soft shadows, glow and the other lighting effects are wanted.
- Each level must look and feel different from the others and from Homes. The camera is down among the people, the people have faces and are doing something, and the child is inside a small human story.
