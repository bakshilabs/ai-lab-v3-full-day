# EcoTown Homes simulation and seven mini-games: design feedback

**Reviewed:** 23 November 2026  
**Playable simulation:** [Eco Town Homes Trial](https://claude.ai/artifact/H3zRPAwjaJTVZeMBpZaDWm)  
**Mini-game proposal deck:** [Seven play breaks in one street](https://claude.ai/artifact/9mJx69BCvn319J9WGUvgP5#slide-3dd33bdac6c2)  
**Intended age range:** 8–12, with the main path understandable to an eight-year-old and optional depth for older children.

## Overall assessment

The playable Homes simulation is a meaningful improvement over a storyboard made mainly of requests, answer cards and Florence-led tests. It gives the child a place in the world, shows their family, lets them change a request, animates consequences, and eventually lets them build and furnish a home. The strongest moments are the ones in which the child changes something and immediately sees a relevant effect: a window in a shaded wall receives no sun; a roof window creates a patch of winter sunlight; a bed placed in that patch will be warmer; and a tree can be positioned without blocking the home's light.

However, the central decision is not yet strong enough. Timber is the best plan in every tested combination: it stays warm and is shown as causing no pollution. This means the child can learn the winning material once and then ignore the sunny/shady and thick/thin choices. The game appears to offer several variables, but one material dominates all of them. The wording also makes a scientifically indefensible claim that making wood adds no pollution.

The seven mini-games provide more mechanical variety than the earlier repeated sequence. The child drags, walks, jumps, collects and manages power rather than only selecting answer cards. That is the right direction. The weakness is that many of the proposed “small decisions” are not yet meaningful decisions:

- all home plots in Land appear favourable;
- the straight bridge is plainly better than the longer detour;
- the walking route is a maze with a harmless wrong turn rather than a planning decision;
- several home-building actions are compulsory decoration;
- the food game is active but has little thinking in it;
- the Power lever has an obvious answer in the one condition shown; and
- the School activity often matches one obvious object to one waiting child.

The next iteration should not add more explanation to compensate. It should improve the cause-and-effect structure. For every important choice, the child should be able to answer:

1. **What am I trying to do?**
2. **What can I change?**
3. **What happened because I changed it?**
4. **What did I learn that will help me choose or revise a plan?**

The most important design principle is:

> **Build or choose something, use it, see a consequence, and revise only when new evidence gives a reason to revise.**

## Review method

The playable simulation was run through from its request screen to the completed street. Two contrasting requests were tested:

- sunny side with thick walls; and
- shady side with thin walls.

The three home plans, the winter test, the individual result cards, “Ask again,” final plan selection, interior building, garden building and ending were inspected. The mini-game deck was reviewed slide by slide, including its framing and three open design questions.

Each activity was assessed against the same criteria used in the earlier EcoTown review:

- whether an eight-year-old can understand the goal without adult translation;
- whether the child performs a meaningful action rather than confirms a predetermined answer;
- whether the visible evidence supports the result;
- whether changing an input changes a relevant outcome;
- whether Florence has a useful but bounded role;
- whether the activity teaches an identifiable AI-literacy practice;
- whether the seven activities feel mechanically and visually different; and
- whether the whole hour remains coherent, enjoyable and simple to facilitate.

“Placeholder wording” has been treated as provisional. Wording is only flagged where it reveals a conceptual problem, creates an inaccurate lesson, or would make the interaction confusing even after polishing.

---

# Part A — Playable Homes simulation

## The current flow

The simulation currently follows this sequence:

1. The child sees their family and an empty plot.
2. The child completes a sentence by choosing sunny or shady, then thick or thin walls.
3. Florence produces timber, brick and concrete homes using those selected conditions.
4. The child starts a winter test.
5. Material-making pollution appears as dark clouds, followed by a snowy night and warm or cold windows.
6. The child inspects each home or shows all three result cards.
7. The child can ask again or select a plan.
8. After selecting a plan, the child places windows, furniture, a door and a roof.
9. The child places a fir tree, bench and bicycles in the garden.
10. The whole street changes to the chosen material and the child can try another plan or continue.

This is substantially more playable than a simple multiple-choice sequence. The issue is not the existence of these stages; it is which of them contain real thinking and which merely add taps.

## What should be retained

### 1. The child's family and plot

Showing **“Your family”** and **“Your plot”** gives the task a personal reason. The child is not deciding for an abstract card; they are making a home for visible people. Keep this throughout the level.

### 2. A request that changes the generated scene

The selected sunny/shady side and thick/thin walls do change the location and warmth results. This is important. It demonstrates that details in a request can affect the output. The connection needs to be made clearer and more scientifically consistent, but the underlying mechanism is useful.

### 3. A visible test rather than a written verdict alone

The material clouds, snowfall and window colours give the child something to watch. The distinction between yellow warm windows and blue cold windows is easy to grasp. Keep visible evidence before the cards explain it.

Do not rely on colour alone. Add a simple warmth symbol, thermometer or shivering/comfortable character so the result remains understandable for children with colour-vision differences.

### 4. Inspecting one plan or comparing all three

Letting the child tap a home to look closely, while also offering **“Show all three,”** supports two styles of exploration. Keep both. During comparison, stop the camera and background characters so the child can concentrate on stable evidence.

### 5. Immediate placement feedback

The best interaction in the level occurs when a child puts a window in a shaded wall and is told that no sun comes through there. They can then use another window in the roof and see a patch of sunlight. This is a real experiment: action, evidence and a chance to improve.

### 6. Connecting the home and garden

The tree-placement feedback—showing that the windows still receive sunlight—starts to make the world behave as a connected system. This is much better than decoration that has no consequence. Keep this idea and make the shadow itself visible.

## Main design problems

### H1. Timber is a dominant answer in every tested request

In the sunny/thick test:

- timber stays warm and is described as adding no pollution;
- brick stays warm but adds some pollution; and
- concrete becomes a little cold and adds a lot of pollution.

In the shady/thin test:

- timber still stays warm and is described as adding no pollution;
- brick becomes a little cold and adds some pollution; and
- concrete stays cold and adds a lot of pollution.

Once the child sees the first result, there is no reason to examine later combinations. Timber wins on both displayed measures regardless of what the child asked for. The prompt choices therefore look more influential than they really are.

**Required change:** decide what the level is actually comparing and hold the other variables constant.

A clear version for ages 8–12 would use two linked tests:

1. **Warmth test:** use the same basic home and compare less insulation with more insulation on the same winter night.
2. **Making-materials test:** compare the impact of making three otherwise comparable wall systems.

The child can then combine the lessons: **“This design stayed warm, and this material had the lowest impact in our comparison.”** The material should not magically determine insulation, location, wall thickness and night-time comfort at once.

An introductory level may have one clearly better answer. The problem is not that timber wins; it is that the other child-controlled details cease to matter and the game presents the result as a rich decision.

### H2. “Making the wood adds no pollution” is inaccurate

Timber can have a lower whole-life carbon impact than some masonry systems, and sustainably sourced wood stores carbon. It is not pollution-free. Forestry, processing, drying, treatment, manufacturing and transport all have impacts. The UK Government's [Timber in construction roadmap](https://www.gov.uk/government/publications/timber-in-construction-roadmap-2025/timber-in-construction-roadmap-2025) describes timber as a potentially lower-carbon material while still requiring whole-life data, sustainable supply and transport assessment.

**Required child-facing change:**

> **“Making this timber plan caused less pollution in our comparison.”**

Do not say **“no pollution,” “clean air,”** or imply that every timber home is automatically the best environmental option.

### H3. The game mixes local air pollution and embodied carbon

The animation shows black clouds above completed homes, then labels the result **“Clean air.”** This can make children think occupied timber, brick and concrete homes emit different amounts of smoke from their roofs. The intended comparison appears to be pollution or greenhouse-gas emissions from making the materials.

**Required change:** show material-making in the place where it happens—a sawmill/workshop, brick kiln and cement works—or use simple “impact blocks” on the plan cards. Then return to the homes for the cold-night test.

Use a result label such as:

- **“Pollution from making it”** for the younger route; or
- **“Climate impact from making it”** if that concept is explicitly taught.

Do not use **“Clean air”** as a score for a whole-life material comparison.

### H4. “Thick walls” is not a reliable synonym for insulation

The current request offers **“thick walls”** and **“thin walls.”** Thickness alone does not determine whether a home stays warm. Different materials resist heat flow differently, and thermal mass is not the same as insulation. Official building guidance explains that insulation slows heat loss and that uninsulated thermal mass can perform poorly in winter; see [Building Performance guidance on insulation and thermal mass](https://www.building.govt.nz/getting-started/smarter-homes-guides/design/using-thermal-mass-for-heating-and-cooling).

**Required child-facing change:** replace the choices with:

- **“more insulation”** and **“less insulation”;** or
- **“a thick layer of insulation”** and **“a thin layer of insulation.”**

Show the layer in a wall cutaway. This makes the cause visible and teaches something the child can transfer beyond the game.

### H5. The two request choices are too obviously right or wrong

For a winter-warmth goal, “sunny” and “thick” are both obvious. Selecting “shady” or “thin” mainly tests whether the child chooses the approved word, not whether they can reason from evidence.

Two acceptable ways to handle this are:

- **Prediction route:** openly frame the weaker choice as an experiment—**“Which do you predict will stay warmer?”**—then let the child test it without pretending both are equally sensible plans.
- **Simple compromise route:** provide one understandable constraint, such as a limited number of insulation panels, and let the child decide where they matter most. Do not add cost, durability, carbon, sunshine and insulation to the same decision.

For the main route, the prediction version is more suitable for the youngest children.

### H6. Florence does not yet create a meaningful AI-checking task

Florence follows the selected side and wall choice, presents three materials and gives the child the answer through a test. She does not miss a requested detail, explain uncertainty or offer a plan the child must inspect against the request. The child practises operating an interface, but the AI-literacy lesson remains implicit.

Add one short, visible check before the test:

> **“You asked for more insulation. Do all three plans show it?”**

Occasionally let one plan visibly miss that detail. The child can tap **“Add the insulation”** and receive a corrected plan. Florence should usually be helpful; if she is wrong every time, checking becomes another predictable quiz.

Florence should remain available through **“Help me”** during building, but she does not need to speak before every action.

### H7. The test combines two experiments too quickly

The instruction says the materials are made and then the cold night comes. The animation moves from manufacturing clouds to snowfall, and the final cards combine both results. For a younger child, these are two different causes at two different times.

Split the evidence into two short, named moments:

1. **“Test 1: Making the materials.”**
2. **“Test 2: A cold winter night.”**

After each, ask the child to notice one thing. The comparison screen can then show both icons together.

### H8. The result cards answer before all children have observed

The cards use ticks, dashes and crosses, and text such as **“It stays warm all night.”** These are helpful summaries, but the visual evidence should be visible long enough before the score appears. The black clouds differ in size, but their meaning is not labelled during the animation.

Show a small legend before the test and reveal explanations after the animation. Pause camera movement when the cards appear. If comparison is the learning goal, show a quiet **“1 of 3 checked”** indicator while still allowing a confident child to choose early.

### H9. “Ask again” repeats too much work

Changing from sunny/thick to shady/thin requires the whole plan-building and winter-test sequence again. That is useful once, but it will become repetitive if the child wants to compare one variable.

Replace the generic reset with **“Change one detail.”** Keep the previous result as a small picture and let the child change only the side or only the insulation. Then ask **“What changed?”**

If **“Try another plan”** appears after the home has been furnished, preserve the child's door colour, furniture and garden. A science retry should not require rebuilding all the decorative parts.

### H10. The building sequence mixes meaningful design with compulsory decoration

The current building sequence includes:

- two windows;
- a bed;
- a table;
- a sofa;
- a door and door colour;
- the roof;
- a fir tree;
- a bench; and
- bicycles.

The window, bed and tree can express the lesson. The table, sofa, door, bench and bicycles are mainly ownership or decoration. They are pleasant, but requiring all of them interrupts the causal chain between choosing a home and understanding why it works.

**Recommended main path:**

1. Place the roof window and see the sunlight patch.
2. Place the bed or family area in relation to that light.
3. Place the tree and check that it does not block the winter sun.
4. Finish the roof and move the family in.

Then offer **“Decorate my home”** as an optional reward containing the table, sofa, door colour, bench and bicycles. Decoration should be celebrated as creativity, not scored as environmental reasoning.

### H11. Some placement feedback is useful, but the consequences need to persist

When the game says a wall window receives no sun, the child's later result should remember that. When the bed is in the sun, the finished home should visibly retain the roof window and sunlight. When a tree does not block the windows, its shadow should demonstrate that.

Test every alternative placement. A wrong placement should produce a visible, reversible consequence rather than a sentence that simply says it is wrong. The child should be able to move the object without losing progress.

### H12. The ending overstates both ownership and certainty

The ending says:

- **“The whole street is built your way”;** and
- **“Making the wood added no pollution, and the air is clean.”**

The first statement is stronger than the available customisation, and the second is inaccurate.

Use:

> **“Your home is ready, and this plan is now part of the street.”**  
> **“In our test, this home stayed warm and its material caused less pollution to make.”**

Finish with one short reflection:

> **“What did the winter test help you notice?”**

Then add the AI takeaway:

> **“Florence suggested plans. You tested them and chose what worked for your home.”**

Do not automatically tell every child to repeat the whole level. Keep **“Change one detail”** available as an optional investigation.

## Wording and interface corrections

| Current wording or behaviour | Recommended version | Reason |
| --- | --- | --- |
| “Build them on the the sunny side…” | “Build them on the sunny side…” | The option already contains “the,” creating a duplicated article. |
| “thick walls / thin walls” | “more insulation / less insulation” | Makes the tested cause accurate and visible. |
| “Bring the winter night” | “Start the cold-night test” or playful heading “Bring on the winter night” with a clear test icon | Clarifies that the child is running an experiment. |
| “Clean air. Making the wood adds no pollution.” | “Lower impact in this comparison. Making this timber plan caused less pollution.” | Removes an absolute and inaccurate claim. |
| “Yellow windows are warm. Blue windows are cold.” | Keep, plus a warmth symbol or thermometer | Avoids relying on colour alone. |
| “The bench is in the shade of the wood.” | “The bench is in the tree's shade.” | “Shade of the wood” sounds like a wording error. |
| “The whole street is built your way.” | “Your plan is now part of the street.” | Matches the degree of control the child actually had. |
| Clickable homes not exposed clearly as controls | Add focus outlines, hover states, keyboard/touch support and accessible names | The instruction says to tap homes, but the interactive targets are not consistently recognisable as buttons. |

## Recommended Homes flow

The strongest version of this level would be:

1. **Context:** “EcoTown has cold winters. Help this family make a warm home with a lower impact.”
2. **Ask:** the child chooses one relevant condition, such as more or less insulation.
3. **Check Florence:** one quick visual check that each plan includes the requested condition.
4. **Predict:** the child predicts which design will stay warmest.
5. **Warmth test:** same night, same house size, visible inside-warmth indicators.
6. **Making-materials test:** separately compare the impact of making the materials.
7. **Choose:** the child selects a plan from evidence.
8. **Build:** place the roof window, bed and tree; each has a visible effect.
9. **Move in:** the family uses the completed home.
10. **Reflect:** one question about the evidence, followed by the simple AI takeaway.

This retains the attractive parts of the prototype while removing repetition and scientific ambiguity.

---

# Part B — The seven mini-games

## Summary table

| # | Level and proposed activity | Current child verb | What is promising | Main problem | Recommended status |
| --- | --- | --- | --- | --- | --- |
| 1 | Land — Give every waiting family a home | Drag and place | Families move into homes immediately; the street begins to feel inhabited | All plots appear favourable, so placement is mostly aesthetic and the Land/flooding lesson disappears | **Redesign the decision; keep the family reward** |
| 2 | Getting around — Finish the way to school with one bridge | Drag and connect | A placed bridge is used immediately by visible people | Straight ahead is plainly better than a longer detour; there is no reason to deliberate | **Keep the action; add one visible trade-off** |
| 3 | Getting around — Walk to school while a friend sits in traffic | Navigate and compare | Movement, map reading and street-level perspective add variety | It is a low-stakes maze; the built bridge and route are not clearly carried forward | **Keep, but make it use the child's earlier design** |
| 4 | Homes — Build your family's home | Build and arrange | Strong ownership and immediate placement feedback | The sequence is too long and mixes science with forced decoration | **Keep and shorten** |
| 5 | Food — Run, jump and pick food for the market | Run, jump and collect | The clearest change of pace and strongest physical play | Collecting has little reasoning or AI-literacy content | **Keep; add a simple observation task** |
| 6 | Power — Keep the lights on | Manage and respond | The best systems-thinking idea; supply, storage and demand can change over time | One frozen condition makes the Save/Use answer obvious; displayed numbers need checking | **Develop into a short three-moment simulation** |
| 7 | School — Make room for everyone | Observe, place and test | A person uses each improvement immediately, making the benefit visible | It can reduce inclusion to matching one object to one disability; many placements are obvious | **Keep the purpose; reframe around testing with varied users** |

## Mini-game 1 — Land: Give every waiting family a home

### Current proposal

Two families wait with their cases in an unfinished street. The child has three homes and seven yellow places, chooses where homes go and selects roof colours. A family moves in as soon as a home is placed.

### What works

- Waiting families give the activity an emotional purpose.
- Seeing someone move in is an immediate and satisfying consequence.
- A street-level view is more personal than a distant planning map.
- Roof colour gives harmless creative ownership.

### What does not yet work

The activity is labelled Land, but it does not ask the child to understand the land. The yellow plots appear equivalent. Living nearer the school is an obvious advantage, while filling one side of the street has no shown consequence. The proposal therefore repeats home placement without teaching why one place is safer or more suitable.

There is also a small internal mismatch: the slide describes two waiting families but gives the child three homes. If one home is deliberately left empty for a future family, the game should show that reason.

### Recommended version

Use both map and street:

1. From above, Florence suggests two possible building areas.
2. The child places one temporary marker and runs the rain test.
3. Water reaches the low area but not the higher area.
4. The child confirms the safe building area.
5. The view enters the street, and the waiting families move into homes there.
6. Roof colour remains an optional reward.

The child-facing lesson is:

> **“A suggestion can look fine. Test it before you build.”**

This keeps the lively street while restoring the reason the level is called Land.

## Mini-game 2 — Getting around: Finish the way to school with one bridge

### Current proposal

The path stops at a stream. The child places one bridge in one of two locations. One location continues straight towards the school; the other creates a longer detour along the bank. People cross as soon as the bridge is placed.

### What works

- The missing bridge is a clear problem visible without much reading.
- Dragging a real object into the world is satisfying.
- Watching people cross proves that the connection works.
- The bridge can create continuity with the following walking activity.

### What does not yet work

The straight location is better on all visible measures. The longer route has no benefit. This is not a small trade-off; it is an obvious correct answer with an unnecessary alternative.

The deck also notes that the yellow places are small and partly hidden, and that the bridge being dragged can cover the school. Those are significant usability issues for the youngest children.

### Recommended version

Give each location one visible property:

- **Straight crossing:** shorter, but the bank is soft or floods during high water.
- **Downstream crossing:** a little longer, but the bank is firm and the bridge remains usable.

The child can place the bridge provisionally, run a short high-water test and move it if needed. Do not add cost, wildlife, traffic and safety at the same time.

An alternative is to make the straight route safe but remove a valued tree, while the slightly longer route keeps it. Show the difference before asking for a choice.

Carry the selected bridge into the next mini-game. If the child later walks across the exact bridge they placed, the two activities become one meaningful build-and-use loop.

## Mini-game 3 — Getting around: Walk to school while a friend sits in traffic

### Current proposal

The child walks with their family, chooses a direction at junctions and reads a map. A wrong turn loops back. A split screen shows a friend in a traffic queue in Car Town.

### What works

- Walking through the street is a welcome change from placing objects.
- The child's earlier town becomes a place they can inhabit.
- No timer and no loss state are appropriate for this age group.
- The contrast between walking and a slow car journey can make the environmental point visible.

### What does not yet work

The activity currently behaves like a simple maze. A wrong turn has no interesting consequence beyond looping back, so the child is mainly matching the route to a map. The friend in traffic risks becoming a passive moral comparison rather than part of a system the child understands.

The map does not match the new street, the school is partly hidden and the arrows crowd the family. These are not cosmetic problems; they directly affect the child's ability to navigate.

The phrase **“mum and dad”** assumes one family structure. Use **“your family”** or show the family without requiring a label.

### Recommended version

- Use the bridge and paths the child just built.
- Let the child walk to the school and cross their own bridge.
- Make the friend's car visibly move slowly rather than remain frozen.
- Show one simple comparison at the end: walking time and number of car trips, without requiring carbon calculations.
- Replace “wrong” turns with landmarks or small discoveries so exploration is not punished.
- Keep Florence behind an optional **“Help me read the map”** button.

The child-facing environmental link can be:

> **“This path lets your family walk to school instead of making another car trip.”**

The AI practice is checking that a suggested route really reaches the destination, not merely following Florence turn by turn.

## Mini-game 4 — Homes: Build your family's home on its plot

### Current proposal

The deck shows the child placing windows, a roof and a door on a home between its neighbours. The playable simulation goes further by adding an interior, furniture, a roof window and a garden.

### What works

- This is the most personal building activity.
- The family watches their own home take shape.
- Window placement can create an immediate light-and-warmth consequence.
- The current playable cutaway is more useful than the deck's outside-only façade.

### What does not yet work

The deck says that the child decides which rooms receive light, but its picture contains no readable rooms. The playable version has one open interior rather than distinct rooms. Door colour is creative but not a scientific decision, and roof placement has only one valid destination.

The current build also diverges from the earlier idea of entering a prefab factory. That is not automatically a problem: the plot and cutaway connect more directly to the family and the warmth test. The project should make an explicit choice rather than carrying both concepts as unfinished expectations.

### Recommended version

Use the plot and cutaway as the main experience. Keep only the placements that express the lesson—roof window, bed or family area, and tree. Move furniture and colours to an optional decoration moment.

If off-site construction is important, show it briefly: the child adds an insulation layer to one wall panel in a small workshop, the panel travels to the plot, and the child completes the home there. Do not create a separate factory sequence unless it adds a distinct action the child can understand.

The AI practice is specifying the cold-weather need, checking whether Florence included it and then testing the proposed design.

## Mini-game 5 — Food: Run, jump and pick food for the market

### Current proposal

The child moves through a greenhouse and underground growing area, automatically collects lettuces and jumps for tomatoes and strawberries. A lift connects the two levels and the harvest goes to a market stall. Jumping is only required for optional extras.

### What works

- This is the most obviously playful activity in the set.
- Running, jumping, using a lift and collecting objects create a distinctive signature experience.
- Optional jumping supports different ability and confidence levels.
- The vertical greenhouse and tunnel make this level feel unlike the street.
- The market stall provides a visible destination for the harvest.

### What does not yet work

The action currently has little decision-making. A child can move through the level and collect everything without applying what the level is meant to teach. Hydroponic water, crop readiness and the reason for growing above or below ground are visible only as scenery.

“Real food” is unnecessary wording and could imply that other foods are not real. **“Fresh food”** or simply **“food for the market”** is clearer.

### Recommended version

Keep the platforming and add one light observation challenge:

- the market asks for a small visible order;
- Florence highlights crops she thinks are ready;
- one highlighted crop is visibly unripe; and
- the child checks colour or size before picking it.

This provides a concrete AI-literacy moment without stopping the play:

> **“Florence can help spot crops. You still check before you pick.”**

Use no more than one deliberate mistake in the main route. Optional bonus produce can remain above the basic path. Brighten the underground area, keep food visually distinct and make the water loop understandable through movement rather than a label hidden near the title.

## Mini-game 6 — Power: Keep the lights on in your own street

### Current proposal

The child watches solar, wind and battery supplies feed ten home lights. A large lever switches the battery between Save and Use. The view looks out over the street the child built.

### What works

- This is the strongest systems-thinking proposal.
- Supply, storage and demand can all be made visible.
- A large lever is easy and satisfying to operate.
- Homes going dark provide a direct consequence.
- Reusing the child's street gives the decision emotional weight.

### What does not yet work

The deck shows one winter-evening moment, so **Use** is the obvious answer. The description refers to summer midday and winter evening, but the child does not yet play those changing conditions.

The displayed quantities also need a careful consistency check. If sun, wind and battery numbers represent available units, the number of lit homes must match the blocks that are actually being supplied. A child should not need to infer an undocumented rule to reconcile the display.

### Recommended version

Create a three-moment, untimed sequence:

1. **Windy daytime:** supply exceeds demand; the child can save spare energy.
2. **Calm evening:** solar falls and wind weakens; the child can use the battery.
3. **Storm warning or next morning:** the remaining charge reveals the effect of the earlier decision.

Use ten homes, one block per home and a battery bar with the same units. Animate each block from source to home.

Florence can give a weather forecast rather than a command:

> **“The wind may drop this evening.”**

The child checks present supply, future need and stored energy. The AI lesson is that predictions help with planning but do not replace monitoring the real system.

## Mini-game 7 — School: Make room for everyone, one person at a time

### Current proposal

The child places a ramp, lift, quiet room and wide door. Each feature has a visible person waiting, and that person uses it immediately. The lift can be placed beside one of two staircases.

### What works

- A person using a feature immediately is strong cause and effect.
- The cutaway school makes several spaces visible at once.
- Faces, routes and yellow placement areas can communicate without long text.
- The activity can teach an important future skill: testing a design with people whose needs differ.

### What does not yet work

The title **“one person at a time”** and the one-feature-per-character structure can make accessibility feel like a set of special fixes for isolated individuals. Inclusive design is stronger when children see that a ramp, lift, quiet space or wide door can help many people in different situations.

The lift location is also close to an obvious matching puzzle: place it near the child who is waiting. The loud music-room clue may oversimplify both mobility and sensory needs.

The deck itself notes that the school does not match the school at the end of the street and that nobody visibly needs the wide door. Those continuity and evidence gaps should be corrected.

### Recommended version

Rename the activity:

> **“Design a school everyone can use.”**

Show several people arriving for a school morning. After the child places features, run a short route test. The same feature should help more than one person—for example, a wide automatic door can help a wheelchair user, a group carrying equipment and a parent with a pushchair.

Florence can suggest an initial school plan that works for the most obvious route but misses one visible user. The child observes the school morning, identifies who cannot reach or comfortably use a space, and revises the plan. The lesson is not that AI decides whose needs matter. It is:

> **“Test a plan with different people. A plan that works for one person may not work for everyone.”**

Keep the building's exterior and location consistent with the school visible from the street.

---

# Part C — How the seven activities should work as one EcoTown hour

## The suite needs a clearer progression

The proposed activities have good ingredients, but the order currently duplicates some actions. Land already asks the child to place homes; Homes later asks the child to build a home. Getting around contains two separate breaks, but the bridge and walking route are not yet clearly one continuous task.

A stronger progression is:

| Stage | Main child verb | Playful outcome | AI-literacy idea |
| --- | --- | --- | --- |
| Land | **Test and place** | Run rain, choose safe land, then watch families move in | Test a suggestion before building |
| Getting around A | **Connect** | Place a bridge that survives the relevant test | Check whether a plan works in the real place |
| Getting around B | **Walk and explore** | Use the exact route and bridge the child built | Check that the route reaches the goal |
| Homes | **Compare and build** | Choose from evidence, then make one warm home | Give useful conditions and inspect what AI included |
| Food | **Run, jump and check** | Harvest a market order and spot one unripe crop | AI can help identify things; people still verify |
| Power | **Manage and respond** | Save energy, then use it when conditions change | Predictions depend on changing conditions |
| School | **Observe and improve** | Test a school morning with different people | Test a plan with varied users, not only a typical case |

This creates a genuine build-up in AI literacy without repeating the same quiz:

1. **Test a suggestion.**
2. **Check it against the place.**
3. **Use it in a real task.**
4. **Give a useful condition.**
5. **Verify a label.**
6. **Respond when conditions change.**
7. **Test with different people.**

Children do not need to see those technical labels. They experience the ideas through play.

## Florence's role across the hour

Florence should be a familiar helper, not the main performer in every scene.

Use Florence directly at a few meaningful points:

- **Land:** suggests places; the child rain-tests them.
- **Homes:** turns the child's conditions into plans; the child checks and compares them.
- **Food:** highlights crops; the child verifies one uncertain example.
- **Power:** gives a forecast; the child monitors the actual supply.
- **School:** proposes a layout; the child tests it with different people.

During the bridge and walking activities, Florence can remain available through **“Help me”** without interrupting. This lets the child feel increasingly independent.

Florence should not be deliberately wrong in every level. A useful pattern is:

- usually correct and helpful;
- sometimes incomplete in a visible, fair way; and
- always open to a specific correction.

## Answer to the deck's three design questions

### 1. Street or map for Land?

**Use both, for different jobs.**

The map is necessary for understanding height, the river, rain and the wider area. The street is necessary for making the families and consequences feel real. Start from above for the land test, then move into the street when the child builds and the families arrive.

A street-only version is livelier but cannot clearly communicate the land system. A map-only version communicates the system but loses ownership. The transition between them is the solution.

### 2. Plot or factory for Homes?

**Use the plot and cutaway home as the main experience.**

It connects the design to the family, sunlight, neighbours and garden. The playable prototype already demonstrates that this can work. A full factory sequence would add another location and more steps without automatically strengthening the lesson.

If prefabrication remains important, include one brief workshop action—such as placing insulation inside a wall panel—then deliver that panel to the plot. Do not build a second long mini-game unless child testing shows that the factory itself is more enjoyable and educational than completing the home.

### 3. Is one street enough?

**Use one street as the anchor, but not as the only visual or activity space.**

Continuity is a strength when the child sees families, paths, homes and lights carry forward. Repetition occurs only if the camera, verb and consequence remain the same. The proposed hour already has opportunities for distinct spaces:

- map and river system;
- street and bridge;
- walking route;
- cutaway home;
- vertical farm;
- power control room; and
- cutaway school.

The street should be the place the child returns to and sees changing, not the background for five nearly identical placement screens.

## Suggested pacing for a 60-minute session

This is a starting budget to test with children, not a promise of exact completion time.

| Segment | Approximate time |
| --- | ---: |
| Welcome, town goal and Florence's role | 4 minutes |
| Land | 7 minutes |
| Getting around: bridge and walk | 10 minutes |
| Homes: compare, build and optional decoration | 11 minutes |
| Food | 7 minutes |
| Power | 8 minutes |
| School | 8 minutes |
| Final town view and discussion | 5 minutes |

If the full playable path takes longer, remove compulsory decoration before shortening the experiments. The tests, visible consequences and brief reflection are the educational core.

## Provider discussion opportunities

The provider should not need to explain the controls or rescue the child from unclear wording. Their role is to help children articulate what they noticed.

Useful end-of-activity questions are:

- **Land:** “What did the rain test show you?”
- **Getting around:** “Did the route work the way you expected?”
- **Homes:** “Which clue helped you choose the home?”
- **Food:** “What did you check before picking?”
- **Power:** “Why did you save or use the battery?”
- **School:** “Who could use the school after your change?”

At the end of the hour:

> **“Show one idea Florence suggested. What did you check before you used it?”**

This is more defensible than asking what the child “gave up” when several activities still have one clearly successful answer.

---

# Part D — Changes required before the next child test

## Essential

1. Remove the claim that making timber adds no pollution.
2. Separate insulation/warmth from material-making impact in the Homes logic.
3. Ensure changing the request changes a relevant result and that no plan wins regardless of every input.
4. Replace Land's equivalent home plots with a visible land test.
5. Give the two bridge locations a real, child-readable difference.
6. Carry the chosen bridge and route into the walking mini-game.
7. Make Power a sequence of changing conditions, not one obvious lever choice.
8. Reframe School around testing with different people rather than matching one object to one child.
9. Make every test show evidence before ticks, crosses or explanatory cards.
10. Preserve decoration when a child retries a science decision.

## Important

1. Move compulsory decoration out of the main Homes path.
2. Add one observation or verification task to Food.
3. Use a map-to-street transition in Land.
4. Keep Florence optional during active movement.
5. Make all interactive objects visibly tappable and keyboard/touch accessible.
6. Avoid relying on colour alone for warmth, power or success.
7. Make the school exterior consistent across street and cutaway views.
8. Correct text such as **“the the sunny side”** and **“shade of the wood.”**

## Nice to have

1. Optional home and garden decoration.
2. Bonus produce in the Food platforming section.
3. A small previous-result card when changing one request detail.
4. A replay of the evidence rather than a restart of the full level.
5. Optional harder conditions for older children, such as a second weather state or one additional constraint.

## Acceptance checklist for every mini-game

Before a mini-game is treated as ready, verify that:

- an eight-year-old can state the goal after the opening instruction;
- the child controls at least one variable that affects the result;
- every offered choice has a visible meaning;
- an apparently “wrong” choice produces evidence, not just a red cross;
- the explanation does not claim more than the test showed;
- Florence's output is distinguishable from the child's decision;
- the child can revise without losing unrelated work;
- the action is meaningfully different from the previous activity;
- controls work with mouse, touch and keyboard, with readable focus states;
- important meaning is not conveyed by colour alone;
- the activity can be completed without an adult translating the wording; and
- the provider has one short, answerable discussion prompt.

## Recommended child-test questions

After each playtest, ask the child to show rather than merely say:

1. “What were you trying to do?”
2. “Show me something you changed.”
3. “What happened after you changed it?”
4. “Did Florence decide, or did you decide?”
5. “Was there any part you wanted to skip?”
6. “Which activity would you play again?”

Observe whether the child notices the evidence before reading the result card. If they only learn the answer from Florence's sentence or a tick/cross, the simulation is still explaining instead of letting them discover.

## Final recommendation

Continue with the one-street world and the wider range of verbs. The concept is moving in the right direction. Do not yet scale the Homes logic across all levels without correcting its dominant answer, scientific claims and compulsory decoration.

The strongest EcoTown hour would use the street as a growing home base while each level delivers a distinct experience:

- **test the land;**
- **connect and walk the route;**
- **compare and build the home;**
- **run and check the harvest;**
- **manage changing power;** and
- **test the school with different people.**

That structure can make EcoTown fun without sacrificing the educational promise. The child is not repeatedly choosing the “right” sentence. They are building a world, using it, checking what happens and learning when an AI suggestion needs evidence or improvement.
