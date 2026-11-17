# Two towns (Florence first): new and changed player-facing text

For the separate wording pass (owner's rule, 17 Nov 2026: player- and leader-facing text is written by OpenAI, not
Claude). Every string below is a plain working version put in so the flow works; each needs final wording. Design:
`docs/ecotown-florence-first.md`.

Paths are under `games/ecotown/game/`. "J" = ages 8–12 (`SANDBOX.junior`), "S" = ages 13–17 (`SANDBOX.senior`).
Most strings sit in one block at the end of the `SANDBOX` section of `js/game/content.js`, marked
"Florence first … START OF BLOCK"; keys there are set with `Object.assign(J, …)` / `Object.assign(S, …)`.
Ages 8–12 rules: no money, coins, budget, kW or percentages; instructions start with an action.

## js/game/content.js (Florence-first block)

| Key | Ages | Where it shows | What it has to say |
|---|---|---|---|
| `towns.florence` | both | Switch button and the label floating over Florence's island | Names Florence's town. Short (fits a button). |
| `towns.mine` | both | Switch button and the label over the player's island | Names the player's own town. Short. |
| `towns.both` | both | Switch button | Show both towns at once. One word if possible. |
| `towns.label` | both | Screen-reader label of the switch | What the switch chooses: which town to look at. |
| `towns.notHere` | both | Caption when the player taps Florence's island | That is Florence's town; building happens in your own town; how to get back to it ("Your town"). |
| `missionsOf(n)` | both | Label on the next-step bar while a mission is next | n of 6 missions done. |
| `goToLab` | both | Button on Florence's invitation tip and on a locked build tab | Go to the AI Lab (action). |
| `invite[level]` (six: land, move, homes, food, power, heart) | both | Florence's tip when her next mission is ready (repeats every 90 s) | Florence asks the player to come to the AI Lab and tell her how to build this level in her town first; then the player builds their own. Names the level (town land, paths, homes, farms, power, school). |
| `opensAfter(title)` | both | A locked build tab (in place of the old progress bar) | This tab opens after Florence's mission called <title>. |
| `afterMission(title)` | both | Lab board: a locked mission row | Locked until mission <title> is done. |
| `firstStep` | both | Lab board: prefix before the player's step on the next mission's row | "First, in your town:" (followed by the step from `progress.js`). |
| `yourTurn(cat)` | both | The only button on the mission reward card (first time) | Your turn now: build <category> your own way, in your own town. |
| `backToYours` | both | The reward card button on a replayed mission | Back to your own town. |
| `compare` | both | Caption while the camera shows both towns after a mission | Look at Florence's town and yours side by side; now build it your way. |
| `practice` | both | Mission brief card, under the lens box (replaces the old "Florence practises on a copy…" line) | Florence builds this in her own town; your town beside hers is not changed. |
| `labIntro` | both | AI Lab board, top line (replaces) | Each mission: tell Florence what to build in her town, check her plan, catch mistakes; then build the same part your way in your town. |
| `labGoalHow` | both | Town goals pop-over (🌼), under "Catch Florence's mistakes in the AI Lab" (replaces) | How to reach the missions: the AI Lab button, when Florence asks. |
| `diaryDone(title)` | both | Town diary / report line after a first mission | Mission done; Florence built it in her town; the player builds theirs next. |
| `diaryAgain(title)` | both | Diary line after a replayed mission | Mission played again for practice. |
| `charterPlan` | both | Charter card, label before Florence's numbers (replaces "Florence's plan") | Florence's town. |
| `charterGap` | both | Charter card note when Florence's town keeps a promise and the player's does not yet | Her town keeps this promise, yours does not yet; build it your way; 🌼 shows what is still needed. |
| `nextStep.florence(level)` | both | The next-step line in the town card when a mission is ready (also read aloud) | Action first (J): go to the AI Lab and tell Florence how to build <level> in her town. |
| `unlockTip.land` | both | Florence's advice when Land opens (new; was empty) | Before building: keep off the flood meadow and the old wood; how to mark town land. |
| `unlockTip.move` | both | Florence's advice when Travel opens (new; was empty) | Before building: paths and cycle lanes keep the school run safe; car roads near homes are dangerous to cross. |
| `spotWhy.linkLand(to)` | both | Good-spot line for paths when there are no homes yet | Good spots: a line from your town land to <place>. |
| `spotWhy.needHomes` | both | Good-spot line for paths when there is no town land yet (changed meaning: town land, not homes) | Mark town land first, then Florence shows where a path goes. |
| `intro.towns` | both | Intro beat 2, over both islands | This is Florence's town and this is yours; both are empty. |
| `intro.how` | both | Intro beat 3 | How each level goes: tell Florence what to build in her town and check her plan, then build it your way in yours. |
| `intro.lab` | J (changed), S (unchanged wording, re-set) | Intro beat 4, at the AI Lab door | This is the AI Lab; Florence is clever but sometimes confidently wrong; can you catch her? |
| `intro.overToYou` | both (changed) | Intro beat 4, after `intro.lab` | Let's start with the land (the first mission). |
| `intro.go` | both | Button at the end of the intro; starts mission 1 | Go to the AI Lab. |

## js/game/progress.js (`TIERS[].need`)

The player's small step before each next mission. Shown on the next-step line (read aloud), on the Lab board after
`firstStep`, and in Florence's tip with "Show me where". J must start with an action.

| Tier (mission it opens) | Ages | What it has to say |
|---|---|---|
| `move` | both | Mark 6 tiles of town land in your town. |
| `homes` | both | Build 2 paths or cycle lanes in your town. |
| `food` | both | Build homes for 12 families (S: households) in your town. |
| `power` | both | Grow enough food for the families in your town. |
| `heart` | both | Build something that makes power (a wind turbine or solar roofs) in your town. |

## js/game/game.js (inline)

| Where | Ages | What it has to say |
|---|---|---|
| `nextStep()`, label on the progress bar for the power step (`'not yet'` / `'none yet'`) | J / S | No power made yet. |

`G.S.watchBuilt` ("Watch it being built") is reused as the button on Florence's advice tip when a level opens.

## No longer shown (can be removed in the wording pass)

`useQuestion`, `keepMine`, `usePlan`, `planUsed`, `planLeft`, `planDidntFit`, `townDiffers`, `planSkippedDone`,
`aheadDone`, `doneWhat`, `doneParts`, `classInvite`, and the old intro beats `intro.meadow`, `intro.yourTurn`,
`intro.yourTurnTag`, `intro.tiles`, `intro.wellDone*`, `intro.video`, `intro.videoLater`, `intro.unlocks` (both ages).
`ahead` / `aheadWhat` show only for a town saved before this change.

## Leader-facing documents now out of date (not edited here)

- `games/ecotown/LAB-GUIDE.md`, the paragraph starting "**The game is free building with an AI Lab inside it**": must
  now describe Florence first (each level: tell Florence in the AI Lab what to build in her town, check her plan; then
  that level opens in the child's own town beside hers; her plan is never copied; the "Florence's town · Both · Your
  town" switch).
- Same file, the paragraph starting "**Choose \"In order (class)\" on the start screen**": missions now always go in
  order; between missions a small step in the child's own town opens the next one (the five steps in the
  `progress.js` table above); "In order (class)" now only adds the pause-and-talk cards and quieter music.

## Voices

None of the strings above has a recording; the device voice reads them. Record them after the wording pass
(`voice/collect.mjs`, then `render.py`, keeping the old lines' order; see `games/ecotown/CLAUDE.md`).
