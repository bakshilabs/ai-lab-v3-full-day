# Eco Town: Florence first, then your own town

Design note, 17 November 2026. Source: the owner's decisions at the bottom of
`docs/feedback/2026-11-16-ecotown-partner-AH.md`, after the parent-and-child playtest
(`docs/feedback/2026-11-16-ecotown-parent-and-child-age8.txt`).

**The change in one line:** at each level the child first tells Florence what to build in *her* town and checks her
plan; only then does that level open in the child's *own* town, beside hers, to build their own way.

## 1. The six levels and the six missions

One mission per build level, in a fixed order. A level's builds open in the child's town when Florence's mission for it
is done. The next mission opens after a small "your turn" step in the child's own town, so the hour alternates:
Florence, you, Florence, you.

| Level (build tab) | AI Lab mission (her town) | New lens | Opens in your town | Your turn before the next mission |
|---|---|---|---|---|
| 1 Land | Choose the land | flood | Town land, Keep wild | Mark 6 tiles of town land |
| 2 Travel / Getting around | Getting around | street, step-free | paths, cycle lanes, tram, roads… | Build 2 paths or cycle lanes |
| 3 Homes | Homes | carbon | all homes | Homes for 12 families |
| 4 Food | Food | nature | farms, orchards, hedges… | Enough food for your families |
| 5 Power (& water) | Power | winter night | wind, batteries, rain gardens… | Build one thing that makes power |
| 6 Town heart | A school for everyone | walk | school, market, park, hall… | (none: finish the town) |

The steps are smaller than the old growth thresholds (6 tiles, 12, 24 and 36 families fed), so six missions and six
turns fit in about an hour. Once all six missions are done, the eight town goals (40 families, food, nature, health,
winter power, places to meet, carbon, walk to school) are the rest of the hour, as before.

Code: `js/game/progress.js` (`TIERS` now holds the "your turn" step for each mission, `unlocked()` opens a level when its
mission is done, `missionReady()` and `nextMission()` replace the old growth unlocks).

## 2. What the child sees at each level

1. **The next step says Florence's turn.** The line in the town card reads "Next: tell Florence how to build the homes
   in her town" and the AI Lab button glows. Florence's tip has a "Go to the AI Lab" button. The locked build tab says
   "Opens after Florence's mission: Homes".
2. **The mission, on Florence's island.** The opening story film (first time), the brief card, then as now: the child
   instructs her (word tiles, cards or typing), she plans in *her* town, the child checks with the lenses, names her
   habit, writes a clearer instruction, and the build film plays in her town. Her town has the whole screen (no
   split during a mission); the child's town is not shown and not changed.
3. **The reward card** has the stars and the outcome as before. The old "Use Florence's plan / Keep my town" choice is
   gone. One button: "Your turn: build Homes your way".
4. **The closing story film** (first time).
5. **Back outside, the split screen opens**: Florence's town and the child's in two labelled panes, until the child
   builds something or hides it (section 3).
6. **Advice before building:** the level opens with an alert, and Florence's tip for that level (warm, low-carbon homes;
   keep the hedges; wind and batteries for a winter night; the school in the middle) with "Watch it being built" where a
   build film exists. Nothing is said as a correction after building (`AFTER_TIPS = false` stays).
7. **Your turn.** The child builds the level their way. The next-step line shows the small step that opens the next
   mission, with a progress bar. Florence's tips and her "is this right?" ideas (catch her with a lens) carry on.

The intro is now four short beats: hello; "this is my town, and this is yours" (the split screen opens); "first you tell me what to
build in mine, then you build yours"; then the AI Lab door, with a button that starts mission 1.

## 3. Two towns on screen: a split screen (changed 17 Nov 2026)

The first version stood Florence's town on a second floating island beside the child's. The owner asked for a **split
screen that can be shown or hidden** instead (`js/game/twotowns.js`; pure rules in `js/game/split.js`, tests
`tests/split.test.mjs`).

- **Two panes, one scene.** Florence's town is on the left (landscape screens) or on top (upright phones and tablets), the
  child's town on the right or below. The line between them runs through the middle of the free area (the screen less
  the town card and build bar), so both towns get the same room. Each pane has a label beside the line ("Florence's town"
  with 🤖, "Your town" with 🏡). Both panes are drawn by the one renderer from the one scene (`stage.split`: viewport and
  scissor, two cameras); no second WebGL context.
- **Show and hide.** One toggle button (`#towns`, `aria-pressed`, a knob for the state) in the top row (laptops) or beside
  the Camera button (phones). Hidden, the child's town fills the screen exactly as before the two-towns work. The child's
  choice lasts the browser session (`sessionStorage` `ecotown.split.v1`), also across a reload.
- **When it opens by itself.** (1) The compare moment after each first mission: the split opens about a second after the
  child is back outside and **stays until the child builds something or hides it** (it used to close after 5 seconds).
  (2) Intro beats 2 and 3 ("this is my town, and this is yours"; how a level goes), closing when Florence walks to the AI
  Lab. Nowhere else: a game that keeps opening half the screen would take room from building, and the child can open it
  any time. A split the game opened closes at the first build; a split the child opened stays until they hide it.
- **Where it never shows:** missions and the AI Lab (Florence's town is the main view, on the full island, as before),
  street view and inside a house (one camera has the whole screen; the split comes back afterwards if it was on), the
  build and episode films (`?shoot=`, `?episode=` never start the building game), challenge towns and the other islands.
- **Interaction.** Building, hover previews, the ★ pins, the lenses and their highlights are all in the child's pane (the
  world labels are clipped to it). Pointers that start in Florence's pane never pan, zoom or build (`rig.paneBlock`); a
  tap there shows the "That is Florence's town" caption (`rig.onPaneTap`). Her pane has a **fixed overview that turns with
  the child's camera** (same compass direction, so the same corner of each town faces the same way) and does not pan or
  zoom by itself: nothing for a second finger to grab on a tablet, and no gesture has to be routed between panes.
- **The cheap copy** of the island (no clouds, rocks, waterfalls, bridge, sails, residents, dust or confetti) now stands far
  off (`COPY_AT`, 6000 units away: beyond the main camera's far plane and the sun's shadow area), so each camera sees only
  its own town. It is hidden when the split is closed.
- **Performance.** Florence's pane is drawn without post-processing (no colour grade or SMAA), without shadows and without
  redrawing the shadow map; the main pane's effects run at the pane's size, not the screen's. "auto" graphics still step
  down on a slow device. Numbers below in the hand-over.
- **Phones.** Upright: Florence's pane on top, the child's below, each about a third of the screen between the card and
  the tray. Landscape phones split left and right.

## 4. Saved games from the old flow

- A save without the new `flow: 2` mark is an old-flow town. It is kept exactly as it is: nothing in the child's town is
  removed, and build tabs it had already opened stay open (taking them away would punish a child for the old design).
- Missions already done stay done. The next mission is the first one not done, in order.
- Florence's town for an old save is rebuilt from her clear plans for the missions already done, in order (the same
  "clear" chain the practice island always used, `js/game/seed.js`).
- Saves now hold Florence's town (`fcells`) as well as the child's (`cells`). The server copy carries both (no typed text
  is in either).

## 5. What stays the same

- The six missions themselves: instruct, plan, check with lenses, name the habit, a clearer instruction, the build film,
  stars, the bias check and the charter in mission 6, the reflection after mission 6, town meetings for 13–17.
- The lesson: "AI can be confidently wrong: check it". The lenses and catching Florence are the centre of every level,
  and Florence's confidently wrong ideas for the child's own town still come (check them with a lens, catch her).
- Both age versions, the passport and stars, the take-home card, the leader page, voices, reduced motion, class mode
  (missions are now always in order, so class mode only adds the pause-and-talk cards and quieter music).
- Challenges stay hidden (`CHALLENGES_ON = false`). The passport ranks are rescaled for the points a child can earn
  without challenges (35), so a child who finishes Eco Town well can reach Chief Planner.

## 6. Wording

Every new or changed line the player sees is a plain working version, listed in `docs/two-towns-new-text.md` for the
OpenAI wording pass (owner's rule, 17 Nov 2026). Quoted lines in this note describe what a line is for, not its final
words. The leader guide (`games/ecotown/LAB-GUIDE.md`) still describes the old flow; what it must now say is in the same
list.

## 7. Decisions the owner should check

- The size of the "your turn" steps (table above). Larger steps make each level longer; smaller ones risk children
  rushing from mission to mission.
- Florence's town starts each mission from the town the child's own fixed instructions built. If that town cannot pass
  the next mission (checked with her clear plan), she starts from her tidy practice version instead, without comment.
- A replayed mission is practice: it runs on a copy and does not change Florence's town.
- Florence's ideas for the child's own town ("Use it" builds one idea there) were kept: they are single builds the child
  chooses, not a copied plan, and they are how the "catch her in your own town" lesson works.
