# Is the Tiny Town challenge possible?

**Yes, for both age groups and on both islands.** It is tight, though. There is one key idea, and the game's own hint points away from it.

- **Tiny Town** (home island) and **Hills: Tiny Town** were both won in the real game, in a browser, for 8–12 and for 13–17. Each run showed the "Challenge passed" card and earned a **silver medal** (score 83 on the home island, 85 on the hills).
- **The key idea:** 40 families on 8 tiles means **5 families on every tile**. Only the **Cohousing court** (5 families, low carbon) does that. A Timber terrace holds only 4 families, so 8 timber terraces give 32 families and the town is stuck.
- **The problem:** the game's "Next" hint for homes always suggests the Timber terrace. A child who follows the hints fills all 8 tiles with timber terraces and gets stuck at "homes for 40 families (32 so far)". We checked this in the browser on both islands.

---

## 1. The rules

Source: `js/game/challenges.js`, `js/game/progress.js`, `js/sim/sim.js`, `js/world/catalog.js`, `js/game/game.js`.

**What the children are told**
- 8–12: "Only 8 tiles of town land. Every tile has to work hard."
- 13–17: "Town land is capped at 8 tiles: density without the carbon."

**What the challenge adds:** only the cap (`cap: 8`). Tiny Town has no goals of its own. Every building is offered. You pass when **all eight usual town goals** are met with no more than 8 tiles of town land.

**The 8-tile limit:** it counts tiles marked as town land. When you build a home on open ground, the game marks that tile as town land automatically. Homes, the market, the hall and the repair café can only go on town land. The school, farms, wind turbines, batteries, parks and paths can go on ordinary field or slope, so **they do not use up the 8 tiles**. A ninth town tile is refused ("Town land is full (8 tiles)").

**The eight town goals (the same for both ages):**

| Goal | What it needs |
|---|---|
| Homes | 40 families in homes that do not flood |
| Food | food ≥ families ÷ 3, rounded up (14 for 40 families) |
| Nature | nature score ≥ 70 % of the empty island's, **and** bees **and** deer living there |
| Health | health score ≥ 9 |
| Energy | still winter night: wind + stored power ≥ demand (1 per home, 1 for the school) |
| Community | community score ≥ 8 |
| Carbon | whole town ≤ 160 t (each home: building carbon + 3 t gas heating) |
| Walk | a new Town school is built, and every home is within 15 minutes' walk of it |

**Differences between the ages:** the rules and scoring are identical. The one difference is that **13–17 players have credits**. They start with 60, and each new town day (about 2½ minutes of play) pays them households × 1.5 + community. The winning build costs 75, so a 13–17 player runs short after the first wind turbine. At the end of the day the town pays 80 credits, and the build can then be finished.

---

## 2. The winning build, step by step (for a teacher to show a partner)

Open the challenge board (🏆 Challenge towns) and choose **Tiny Town**. To go straight there, use `index.html?ch=tiny&band=junior`, or `band=senior` for 13–17. All builds are open from the start.

Tile references are the game's grid positions (column, row), as used in the code. Exact tiles are not essential. Section 3 explains what matters.

### Home island: Tiny Town

| Step | Build | Where | Why |
|---|---|---|---|
| 1–8 | **Cohousing court** × 8 (Homes tab) | a tight block on the sunny slope: 9,5 · 9,6 · 10,4 · 10,5 · 10,6 · 11,4 · 11,5 · 11,6 | 8 × 5 = **40 families**. Uses all 8 town tiles. Each court also adds 2 to community (16 in all, so the community goal is met) |
| 9 | **Town school** (Town tab) | field beside the homes, 9,3 | Walk goal (longest walk 12 of 15 minutes). Does not use town land |
| 10–12 | **Mixed farm** × 3 | fields 8,3 · 9,2 · 7,7 | 15 food for a need of 14 |
| 13–14 | **Wind turbine** × 2 | beach 10,8 · 11,8 | Power on winter nights. Makes the batteries count |
| 15–16 | **Battery store** × 2 | fields 7,3 · 8,2 | Winter supply 10 for a demand of 9 (8 homes + school) |
| 17–18 | Park × 2 | fields 6,7 · 9,1 | Health and nature to spare (optional) |
| 19–20 | Footpath × 2 | fields 7,2 · 6,3 | Health to spare (optional) |

**Result from the game's own code:** 40/40 families · food 15/14 · nature 146 % with bees and deer · health 15/9 · winter power 10/9 · community 22/8 · carbon 95 t of 160 · longest walk 12 of 15 min · **8/8 town tiles · passed · silver (83)**.

**13–17 players:** after step 13 they have 1 credit left. They wait for the evening; the new day pays 80 credits; then they finish steps 14–20.

### Hill island: Hills: Tiny Town

The same recipe, on the terraces, with the turbines on the beach:

| Build | Tiles |
|---|---|
| Cohousing court × 8 | slope 8,4 · 8,5 · 8,6 · 9,4 · 9,5 · 9,6 · 10,4 · 10,5 |
| Town school | slope 10,6 |
| Mixed farm × 3 | slope 7,4 · 7,5 · 11,5 |
| Wind turbine × 2 | beach 8,7 · 9,7 |
| Battery store × 2 | slope 7,6 · 11,4 |
| Park × 2, Footpath × 2 | slope 11,6 · 6,5 and 6,4 · 6,6 |

**Result:** 40/40 · food 15/14 · nature 147 % · health 15/9 · winter 10/9 · community 22/8 · carbon 95 t · longest walk 9 min · **passed · silver (85)**.

---

## 3. What matters, and what doesn't

We removed each building in turn from the winning town to see which ones it cannot do without:

- **Cannot lose any of:** the 8 cohousing courts, the school, the 3 mixed farms, the 2 batteries. Each one brings a goal down.
- **Can lose:** either turbine (one turbine is still enough: 1 + 8 = 9), the parks and the paths.

**Other home mixes that also pass** (on the same layout): 7 cohousing + 1 concrete (41 families, 116 t), and 5 cohousing + 3 concrete (43 families, 158 t, only just under 160). Mixes that **fail**: 8 timber (32 families), 6 cohousing + 2 timber (38), and 8 concrete (48 families, but 263 t of carbon, food and community short). Every mix that reaches 40 families on 8 tiles needs mostly cohousing or concrete.

**Traps to avoid:**
- Do not put the school, a battery, a farm or a park on town land. Each one wastes one of the 8 tiles. Build them on open field or slope.
- The market, the hall and the repair café can only go on town land, so **there is no room for them**. The cohousing courts give enough community on their own.
- **Hill island, deer:** the deer need at least 4 hedges, and the hill island has **exactly 4** (the hedged fields along column 4). Building a battery, turbine, school or home on one of them loses the deer and fails the nature goal. Planting a hedge (Food tab) puts it right.
- **Home island, deer:** the deer need at least 5 of the 6 old-wood tiles left standing, so build at most one thing in the wood.

---

## 4. Checked in the game

`browser.cjs` drove the real game in one headless Chromium, served with `python3 -m http.server`. It placed each building through the game's own tap path, `G.placeAt(…, { replace: true })`, which applies the 8-tile cap and the 13–17 credits.

| Challenge | Age | Result |
|---|---|---|
| Tiny Town | 8–12 | Challenge passed, silver, 83. Medal saved on the device. 9th town tile refused |
| Tiny Town | 13–17 | Ran out of credits after the first turbine; one town day paid 80; passed, silver, 83 |
| Hills: Tiny Town | 8–12 | Passed, silver, 85 |
| Hills: Tiny Town | 13–17 | One town day needed; passed, silver, 85 |

No page errors. Screenshots are in the same folder (`tiny-junior.png`, `tiny-senior.png`, `h-tiny-junior.png`, `h-tiny-senior.png`).

`tests/challenges.test.mjs` already checks this same recipe ("Tiny Town can be passed"). It still passes.

---

## 5. Could an eight-year-old find it?

**Not without help, as the game stands.**

- What helps: the info line for each home type gives the family count ("Homes for 5 families around a shared garden", "Wooden homes for 4 families", "Flats for 6 families, but concrete makes a lot of carbon"). The town card shows "🏘 n/8 tiles · 👪 n/40 families" side by side.
- What gets in the way:
  1. **The hint leads to a dead end.** For the homes goal, the next-step hint and the highlighted tool always pick the **Timber terrace** (`IDEA_TOOL.homes = ['timber']` in `game.js`). A hint-follower builds 8 timber terraces, reaches 32 families and is stuck: the hint keeps asking for timber, and the town is full. We confirmed this in the browser on both islands.
  2. The rule card never says that 40 families are needed, or that 8 × 5 = 40. "Every tile has to work hard" is the only clue.
  3. A child who does think "bigger homes" will probably try concrete flats first (6 families, the biggest number). Eight of those fail on carbon, food and community. Only by mixing do they find that cohousing is the one that works.
- An older child (13–17) who reads the numbers will likely find it, and their rule text ("density without the carbon") points the right way.

**Hints that would help** (suggestions only; no game code was changed):
- In the rule card (8–12): *"Only 8 tiles, and 40 families need a home. That's 5 families on every tile. Which homes hold 5?"*
- Make the homes hint aware of the cap. When a capped challenge's free town land cannot reach 40 families with timber terraces, suggest the Cohousing court: in `game.js`, `IDEA_TOOL.homes` or `ideaTool('homes')`.
- A line in the 🌼 goals pop-over when the town land is full but families are short: *"Town land is full. Swap a home for one that holds more families (tap it with a Cohousing court)."* Replacing in one tap already works.

## Rule problems

- **No rule makes it impossible.** An older note in `progress.js` says the earlier 70 t limit on homes' building carbon once made Tiny Town impossible. That limit has already been removed from the town goals: the eight cohousing courts' building carbon is 72 t, just over the old 70 t limit.
- **The real problem is the hint.** It guides children to a build that can never win. This should be fixed before the challenge is shown to children without an adult on hand.
- **A small point:** the hill island's deer have no margin (4 hedges, and 4 needed).

Scripts: `prove.mjs` (proof with the game's own code), `variants.mjs` (other home mixes), `hedges.mjs`, `browser.cjs` (winning builds in the browser), `hints.cjs` (a player who only follows the hints). All are in this folder.
