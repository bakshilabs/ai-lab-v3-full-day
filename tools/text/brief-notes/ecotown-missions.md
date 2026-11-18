<!-- Written by OpenAI from: Eco Town (part 1): its levels, missions and story films. -->

# Eco Town (part 1) notes

## Big picture

Eco Town is a green-town building game with an AI literacy layer. Children build a sustainable island town while also learning to test an AI helper’s plans before trusting them.

There are two connected spaces:

1. **The building/sandbox town** — the player marks town land and builds homes, routes, food, power, water/waste, and a town heart. They use credits, unlock categories, and work toward town goals.
2. **The AI Lab** — Florence makes plans on a **practice copy of the island**. Children brief her, check her plan with lenses/tests, identify what went wrong, rewrite the instruction, and then choose whether to apply parts of the corrected plan to their own town.

There are six AI Lab missions, in order:

1. **Read the land** (`land`)
2. **Getting around** (`move`)
3. **Homes** (`homes`)
4. **Food** (`food`)
5. **Water, power and waste** (`power`)
6. **A school for everyone** (`heart`)

Each mission has an opening story film and a closing story film. The stories show Florence making a confident but flawed plan, children checking it, and a clearer brief fixing it.

## Audience and versions

The game has two text versions:

- **Junior: Ages 8–12**
  - Short, plain, readable aloud.
  - Uses friendlier labels: “Flood lens”, “Street view”, “Winter test”, “Walking-time lens”.
  - Uses “families”, “baskets of food”, “tonnes”, “lights on”, “rubbish”.
  - Florence’s mistakes are described in child-friendly language, e.g. “Took one word too far”.

- **Senior: Ages 13–17**
  - More technical, with real units and named concepts.
  - Uses “households”, “food units”, “t carbon”, “embodied carbon”, “worst-case”, “brief”, “limits”.
  - Florence’s mistakes are framed as AI failure modes, e.g. “Proxy optimisation”, “Average-case assumption”, “Missing or biased data”, “Specification ambiguity”.
  - Includes senior-only **dilemmas** after some levels with trade-offs, e.g. more concrete flats means more households but more carbon.

The same mission structure and checks apply to both versions, but the wording changes substantially.

## Teacher / club leader use

The material includes facilitation notes for each mission. These are not shown as child UI text but tell a leader what to ask.

General teacher/leader pattern:

- Ask children to predict what a lens will show before using it.
- Pause on vague words such as “best”, “easy”, “strong”, “as much as possible”, “middle”.
- Ask who is included or excluded: children, wheelchair users, older residents, wildlife, non-drivers.
- Ask what evidence changed their minds.
- Use “screens down” discussion pauses. Junior prompts include: “Florence was very sure. Why did her plan still go wrong?” Senior: “Florence was confident. Why did the plan still fail?”

The UI has a **Class mode** prompt:

- Junior: “Do the missions in order” and “Ready!”
- Senior: “Class mode: complete the missions in order” and “Available”

The AI Lab classroom can be introduced with:

- Junior: “Welcome to my classroom! Ask me anything about building a green town, and I’ll show you on the big screen. Or pick a mission to test my plans.”
- Senior: “Welcome to the AI Lab. Ask me about any build or problem and I’ll put it on the screen, or choose a mission to test my plans.”

After all six missions, players complete a reflection sentence:

- Junior stem: **“Before I trust an AI plan, I…”**
- Senior stem: **“Before I trust an AI plan, I…”**

They can choose ideas such as checking with a lens, asking what the AI guessed, testing the worst day, asking everyone, or comparing to targets and units.

## What the area teaches

### Eco / town-planning learning

The six missions build up a sustainable-town curriculum:

1. **Land** — flat land beside a river can be a floodplain; build on dry ground and keep the meadow/wood/wetland safe.
2. **Movement** — safe walking and cycling routes matter; cars at school gates can make crossings unsafe; routes must work for everyone, including step-free access.
3. **Homes** — materials have embodied carbon; homes need to be warm as well as strong; timber and straw are lower-carbon and warmer than concrete flats.
4. **Food** — “most food” can destroy habitats; hedges support bees, birds, deer and other wildlife; enough food is better than maximum food at any cost.
5. **Power, water and waste** — power systems must work on the hardest night, not just an average day; batteries/storage, rain gardens/reed beds, compost/repair matter.
6. **Town heart / school** — the school should be within a 15-minute walk of every home; “the middle” must mean fair access, not just map centre; biased surveys give unfair answers.

### AI literacy learning

The game repeatedly teaches that an AI can sound certain and still be wrong. Children should test AI plans against evidence.

Florence’s habits/failure modes are:

- **Junior: Took one word too far** / **Senior: Proxy optimisation**
  - She chases one measurable interpretation of a vague word such as “best”, “strong”, “as much as possible”.
- **Junior: Only thought of a normal day** / **Senior: Average-case assumption**
  - She plans for typical users or typical days, not worst cases or everyone.
- **Junior: Was missing information** / **Senior: Missing or biased data**
  - She lacks a fact or has data from only some people.
- **Junior: Followed your words, not what you meant** / **Senior: Specification ambiguity**
  - She follows the literal wording rather than the intended meaning.

The recurring lesson wording is close to:

- “Confidence is not evidence.”
- “Test the plan.”
- “Say what you mean.”
- “Ask everyone.”
- “Check what Florence guessed.”

## Florence: who she is and how she behaves

Florence is the AI planning helper. The source says she is:

- A wooden robot planner.
- Keen, proud, and a bit literal.
- Never mean.
- Able to learn when corrected.
- Often confident, but not always right.

She speaks in first person and gives plans with confidence labels such as:

- “82% sure!”
- “77% sure!”
- “85% sure!”
- “79% sure!”
- “90% sure!”
- “Only 74% sure”

A key point is that high confidence is not the same as correctness. In the power mission, Florence is 90% sure and wrong, then only 74% sure and right after the plan is tested.

Florence’s role differs across contexts:

- In the **building town**, she gives optional tips and proposals. Some are good; some are “confidently wrong”. Players should check them with a lens before accepting.
- In the **AI Lab**, she makes a plan from the child’s instruction/brief. The player must test it and rewrite it if needed.
- In the **story films**, she dramatizes the mistake, says “Oops”, and accepts a clearer instruction.

Florence is not framed as evil or deceitful. The game’s tone is that she guesses, optimises the wrong thing, or misses context unless humans give clear goals and check evidence.

## Lenses, checks and tests

The checks build up mission by mission. The full list is:

- **Flood lens** / **Flood-risk lens** (`flood`)
  - Checks which land floods in winter / winter flood extent against town land.
- **Street view** / **Street view (ground truth)** (`street`)
  - Checks what the street is like at the busiest time, especially 8:45 am school time.
- **Step-free check** / **Step-free access audit** (`access`)
  - Checks if a wheelchair user, buggy, slow walker etc. can get to school and the ferry.
- **Carbon lens** (`carbon`)
  - Checks carbon from buildings and car surfaces; in homes, embodied carbon of materials.
- **Inside view** / **Inside view (thermal)** (`inside`)
  - Checks how warm homes are with the heating off.
- **Nature lens** / **Habitat & species lens** (`nature`)
  - Checks habitats, bees/pollinators, deer, and where animals live.
- **Winter test** / **Worst-case power test** (`winter`)
  - Checks power on a still, dark winter night.
- **Walking-time lens** (`walk`)
  - Checks how long the walk to school is from every home.

Junior mode shows fewer checks at once and prioritises the new lens. The code also ensures the evidence that reveals the flaw is never hidden.

Important UI wording:

- Junior asks: **“How will you check Florence’s plan?”**
- Senior asks: **“Which evidence would test Florence’s plan?”**
- Junior button: **“Check Florence’s plan”**
- Senior button: **“Test the plan”**
- If a check finds nothing: it warns that one lens only checks one part of the plan and suggests trying another lens or accepting the plan.
- If the player tries to accept before finding an available problem, the UI can say: **“Wait! One check you haven’t tried shows a problem.”**

## Core AI Lab mission flow

The mission flow implied by the files is:

1. **Mission opens** with title, goal, brief and new lens/test.
2. Player tells Florence what to do.
   - They may use **word tiles**, **cards**, or **free text**.
   - Buttons include “Tell Florence what to do”, “Send to Florence”, “Use word tiles”, “Type it instead”, “Use a card”.
3. Florence creates a plan on a **practice copy of the island**.
4. Player chooses how to check the plan with lenses/tests.
5. If the right evidence is found, UI says:
   - Junior: **“You found the problem!”**
   - Senior: **“Evidence found”**
6. Player identifies Florence’s habit / failure mode.
   - Junior: **“Why did this plan go wrong?”**
   - Senior: **“Which failure mode caused this?”**
7. Player gives Florence a clearer instruction.
   - Junior: **“Give Florence a clearer instruction”**
   - Senior: **“Rewrite the instruction: goal + limit + check”**
8. Florence makes a corrected plan.
9. Player builds/uses/accepts the corrected plan or keeps their own town.
   - Junior: **“Use Florence’s plan”** / **“Keep my town as it is”**
   - Senior: **“Adopt the plan”** / **“Keep my town”**
10. Level-complete card shows a stat and stars.
11. A closing story film reinforces the eco lesson and AI lesson.

There are also “clean” paths where the player gives a good instruction first time. In that case, the game asks them to spot Florence’s hidden guess/assumption.

## Stars and rewards

The AI Lab gives stars. Star text differs by outcome.

For a flawed plan:

- Junior stars:
  - “Found the problem with your first check”
  - “Named Florence’s habit first time”
  - “Fixed the plan in one or two tries”
- Senior stars:
  - “Found the evidence with your first test”
  - “Identified the failure mode first time”
  - “Fixed within two rewrites”

For a clean first plan:

- Junior:
  - “Clear instruction first time”
  - “Spotted Florence’s hidden guess”
  - “The plan passed its check”
- Senior:
  - “Well specified first time”
  - “Found the unstated assumption”
  - “The plan passed its test”

Stars can be spent in the **Star shop** on cosmetic extras only. They do not change town scores. Items include Florence hats, a town flag, beach fountain, bee/pollinator statue, and dusk fireworks.

## Mission-by-mission notes

### 1. Read the land

**Mission title:** “Read the land”  
**Goal:**

- Junior: “Choose dry land where your town can grow”
- Senior: “Site selection: where should the town grow?”

**Brief:** Florence will find/select land for 40 families/households. Senior says 18 tiles.

**New lens:** Flood lens.

**Typical flawed instruction:** “Find the best land, with lots of space.”

**Florence’s flawed plan:** She reads “best” as flat, wide, near the river. She chooses meadow/floodplain land. She may also clear old wood.

**Checks and revealed flaws:**

- Flood lens: meadow floods every winter; senior says `{n} of 18 town tiles are on the floodplain`.
- Nature lens can reveal old woodland would be cut down.

**Pass requirements:**

- Town land must be within target range: junior labels it as marking town land; senior says “Town land: X of target tiles (16–18)”.
- No town land on the floodplain.
- Woodland cleared: at most 1 tile.
- No town land on wetland if that happens.

**Clearer instruction/card:** “Dry, sunny land. Keep the meadow wild.”

**Eco lesson:** Flat land by a river can flood; floodplains are flat because rivers built them by flooding.

**AI lesson:** Florence took one word, “best”, too far.

**Hidden guess if plan is clean:** Florence guessed how much land the town needs / site area: 18 tiles for 40 households.

**Story films:**

- Opening: Posy asks for the best land. Florence chooses flat riverside meadow and is 82% sure. Dev notices squelchy grass; Pebble the otter hints at the wild/wet side.
- Closing: Winter rain floods the pegged meadow. Dev uses the flood lens. Posy gives the clearer instruction. Florence moves the plan to dry slope land and keeps the meadow wild.

### 2. Getting around

**Mission title:** “Getting around”  
**Goal:**

- Junior: “Plan safe ways for children to get to school”
- Senior: “Movement network: how do people reach school and the ferry?”

**Brief:** Children need to get to school; connect homes to the island school and ferry. Senior explicitly asks who “everyone” includes.

**New test/lens:** Street view at 8:45 am / rush-hour ground truth. Access check is also important for step-free routes.

**Typical flawed instruction:** “Make it easy for everyone to get to school.”

**Florence’s flawed plan:** She assumes “easy” means easy for cars. She builds a wide road and school-gate car park.

**Checks and revealed flaws:**

- Street view: at 8:45 am, children cannot cross / car tiles on children’s route.
- Access audit: not step-free, or busy roads/rough ground on route.

**Pass requirements:**

- Routes from homes to school and ferry, at least 3 movement tiles.
- No unsafe crossings at 8:45 am.
- Step-free route to school and ferry if access context applies.

**Clearer instruction/card:** “Safe walking and cycling. Cars stay at the edge.”

**Eco lesson:** Safe walking and cycling, with cars kept at the edge, works better for everyone.

**AI lesson:** Florence filled a gap: she guessed everyone drives. Children should say who they mean by “everyone”.

**Hidden guess:** Florence assumed children take the shortest path to school. Real route choices/desire lines can differ.

**Story films:**

- Opening: Posy asks for “easy for everyone”. Florence builds a big road and car park, 77% sure. Dev says they walk to school.
- Closing: Street view at quarter to nine shows too many cars to cross. Florence admits she guessed everyone drives. The corrected plan lays paths and cycle lanes with cars at the edge.

### 3. Homes

**Mission title:** “Homes”  
**Goal:**

- Junior: “Build homes for the first 40 families”
- Senior: “Housing: 40 households, under the embodied-carbon limit”

**Brief:** Florence builds homes. Senior states embodied-carbon limit: 70 t for homes’ materials and 40 households.

**New lens:** Carbon lens. Inside view is also used.

**Typical flawed instruction:** “Build strong homes that will last for years.”

**Florence’s flawed plan:** She reads “strong” as concrete and steel. Concrete flats look strong from above, but have high embodied carbon and are cold.

**Checks and revealed flaws:**

- Carbon lens: carbon cloud; senior says embodied carbon is over the 70 t limit.
- Inside view: homes are below 18 °C with heating off.

**Pass requirements:**

- Safely house 40 families/households. Flooded homes do not count.
- Embodied carbon at or below target homes-carbon limit.
- Average indoor temperature at least 18 °C.

**Clearer instruction/card:** “Warm, low-carbon homes from timber and straw.”

**Eco lesson:** Carbon can hide in materials. Timber and straw store carbon and make warm, low-carbon homes; cement/concrete releases lots of CO₂.

**AI lesson:** A plan that looks right from the sky is not proof. Use evidence.

**Hidden guess:** Florence assumed how many people/families/households live in each home.

**Story films:**

- Opening: Posy asks for strong homes. Florence builds concrete and steel flats, 85% sure. Dev asks if strong is all a home should be.
- Closing: Carbon lens shows the concrete carbon cloud. Posy gives the clearer instruction. Florence builds timber and straw homes, warm and under the limit.

### 4. Food

**Mission title:** “Food”  
**Goal:**

- Junior: “Grow enough food for the town, and keep the wildlife”
- Senior: “Food system: enough food without losing biodiversity”

**Brief:** Everyone needs food; habitats are part of the test.

**New lens:** Nature lens.

**Typical flawed instruction:** “Grow as much food as we possibly can.”

**Florence’s flawed plan:** She ploughs everything: every field and every hedge. This maximises food but removes habitat.

**Checks and revealed flaws:**

- Nature lens: bees/pollinators and deer have left; hedgerow tiles removed.

**Pass requirements:**

- Food supply meets food need. Junior: 1 basket feeds 3 families. Senior: 1 unit feeds 3 households.
- Bees/pollinators present.
- Deer present.

**Clearer instruction/card:** “Enough food, and keep the hedges for the bees.”

**Eco lesson:** Hedges are homes and corridors for wildlife; they support bees, birds, hedgehogs/deer etc. Enough food is better than maximum food at all costs.

**AI lesson:** Florence did exactly what the words said: “as much as possible”. Tell the AI what must be kept as well as what you want.

**Hidden guess:** Florence assumed food demand per family/household, e.g. one basket/unit feeds 3.

**Story films:**

- Opening: Posy asks for as much food as possible. Florence ploughs fields and hedges, 79% sure. Dev notices the hedges and bees are gone.
- Closing: Nature lens shows no hedges and lost bees/deer. Posy asks for enough food and hedges for bees. Florence creates orchard, beehives, hedges, enough food.

### 5. Water, power and waste

**Mission title:** “Water, power and waste”  
**Goal:**

- Junior: “Keep the lights on, deal with rainwater and manage rubbish”
- Senior: “Utilities: worst-case power, rainwater and waste”

**Brief:** Make sure homes have electricity at night, somewhere for rainwater to go, and a way to deal with rubbish. Senior says size power for a still winter night and notes batteries only help if charged.

**New test:** Winter-night test / worst-case power test.

**Typical flawed instruction:** “Make enough clean, green power for every home.”

**Florence’s flawed plan:** She puts solar panels on every roof. On a normal day it is plenty, so she is 90% sure, but it fails on a dark, still winter night.

**Checks and revealed flaws:**

- Winter test: still winter night blackout; senior shows supply/demand.

**Pass requirements:**

- Still winter-night supply covers demand.
- At least one rain garden or reed bed.
- At least one compost hub or repair café.

**Clearer instruction/card:** “Keep the lights on through a still winter night with batteries. Add rain gardens and compost.”

**Eco lesson:** Plan power for the hardest night, not the average day. Store energy for later. Rain gardens/reed beds handle rain; compost/repair reduce waste.

**AI lesson:** Sure is not the same as right. Confidence must be tested.

**Hidden guess:** Florence assumed how much power each home uses on a winter night.

**Story films:**

- Opening: Florence fits solar roofs and says 90% sure. Dev asks about a day that is not normal.
- Closing: Still winter night: sun gone, windless, lights go out. Posy asks for power through a still winter night and stored sunshine. Florence builds turbine and batteries, says only 74% sure, then testing shows the lights stay on.

### 6. A school for everyone

**Mission title:** “A school for everyone”  
**Goal:**

- Junior: “Choose a spot for the new school, close to every home”
- Senior: “Town centre: school, market and nature links”

**Brief:** The little island school is full; where should the new school go? Senior also mentions market, park and nature links.

**New lens:** Walking-time lens. Access audit may also reveal problems.

**Typical flawed instruction:** “Put the new school right in the middle.”

**Florence’s flawed plan:** She takes “middle” literally as the exact middle of the island, not the middle of the homes. Some homes are too far away.

**Checks and revealed flaws:**

- Walking-time lens: furthest home has too long a walk; story uses 18 minutes.
- Access audit: rough ground or non-step-free route can be a problem.

**Pass requirements:**

- New school placed.
- Longest walk to school is 15 minutes or less from every home. No homes means no walk to measure, not a pass.

**Clearer instruction/card:** “School within a 15-minute walk of every home.”

**Eco lesson:** Walkable towns put school, shops and parks within short walks/cycles. The game uses a 15-minute walking rule.

**AI lesson:** Florence followed the literal wording. Also, the closing film adds a biased-data lesson: asking only people at the car park means only asking drivers.

**Hidden guess:** Florence assumed walking speed: junior says every child walks at the same speed; senior says 3 minutes per tile for everyone.

**Story films:**

- Opening: Posy says put the school in the middle. Florence measures the island and builds at the exact middle, 81% sure. Dev says it is a long way from his house.
- Closing: Walking lens shows 18 minutes from Dev’s house. Florence admits she read “the middle” too exactly. The school is moved so every home is close enough. Then Florence says people want more car parks because she asked ten people at the car park; Posy points out she only asked drivers and should ask at the school gate too.

## Building/sandbox goals and unlocks

The sandbox build categories are:

- **Land**
- **Travel / Getting around**
- **Homes**
- **Food**
- **Power / Power & water**
- **Town heart**

Players use a build bar with labels such as:

- “What to build” / “Build categories”
- “Tools”
- “Remove” / “Demolish”
- “credits” / “cr”
- “Watch it being built”
- “From above” / “Eye level”

There are 8 town goals/targets in the sandbox:

- Homes for 40 families/households.
- Enough food.
- Room for nature.
- Health.
- Winter-night energy.
- Community places.
- Carbon at or below 160 tonnes/t.
- Every home close to school / longest walk ≤ 15 minutes.

Build unlock tips explain what to do before building:

- Homes unlock when enough town land exists.
- Food unlocks after homes/households.
- Power and water unlock later.
- Town heart unlocks later.

Examples of builds explicitly named in the text:

- Town land
- Timber terrace
- Straw homes (implied by straw homes / timber and straw)
- Concrete flats
- Footpaths
- Cycle lanes
- Car roads
- Mixed farm
- Orchard
- Allotments
- Keep wild
- Hedge
- Park
- Wind turbine
- Battery store
- Solar roofs
- Rain garden
- Reed bed
- Compost hub
- Repair café
- Market square
- Community hall
- Festival field
- Town school

The code says a town has one school: building it again moves it.

## Applying Florence’s AI Lab plan to the player’s town

The AI Lab plan is made on a practice island. The player’s own town changes only if they choose to use/adopt the plan.

Junior use-question wording says:

- Florence can add parts of her corrected plan to the town.
- She builds the first few parts on empty tiles.
- Everything already built stays where it is.
- The player can build the rest themselves.

Senior says:

- The AI Lab funds the groundwork and the first four buildings.
- The player builds the rest.
- Nothing already built is replaced.
- Applying the plan costs no credits.

If the plan does not fit, the UI can say there are no empty tiles or placements were skipped because occupied/not allowed.

The game can also tell the player they are “ahead” if their own town already has the thing the mission is about. Florence then plans on the practice island and only adds what is still missing.

## Money / credits

The sandbox uses credits:

- Junior label: “credits”
- Senior label: “cr”
- Junior income: “+N 💰 earned today from the families”
- Senior income: “+N cr household income”
- If the player cannot afford something: “Not enough credits yet” / “Insufficient credits”
- Removing/demolishing refunds cost. The remove description says it removes tile layers one at a time: add-on, then building, then land designation.

AI Lab plan adoption is funded separately, at least in the senior wording: “funded by the AI Lab (no credits spent).” Junior also implies Florence adds first parts rather than the player paying.

The material provided does not give the exact economy rules, prices, or income formula.

## Names

The very end of `content.js` says: “Town names offered on the start screen, and a tiny filter for typed names.” The actual town-name list and filter rules are not included in the provided material. So I can only note that town names exist and typed names are filtered somehow; I should not invent name options or filter behaviour.

## Typing, word tiles and cards

Players can tell Florence what to do in several ways:

- **Word tiles**
- **Free text** (“Type it instead” / “Free text”)
- **Cards** (“Use a card”)

Buttons and prompts include:

- “Tell Florence what to do” / “Write an instruction for Florence”
- “Send to Florence” / “Send”
- “Use word tiles”
- “Use a card”
- “Type it instead” / “Free text”
- “Type an instruction first” / “Write an instruction first”

Each mission has a set of word tiles. For example:

- Land tiles include “Find”, “the best”, “flat”, “sunny”, “dry”, “land”, “that never floods”, “keep the meadow wild”, “keep the wood”, “keep the wetland”.
- Move tiles include “easy”, “safe”, “for everyone”, “walking”, “cycling”, “footpaths”, “cars stay at the edge”, “no cars”, “fast”.
- Homes tiles include “strong”, “cheap”, “warm”, “low-carbon”, “from wood”, “and straw”, “reused bricks”, “green roofs”, “tall”.
- Food tiles include “as much food as possible”, “enough food”, “keep the hedges”, “for the bees”, “an orchard”, “allotments”.
- Power tiles include “clean power”, “for a still winter night”, “store the sunshine”, “batteries”, “wind turbines”, “solar roofs”, “rain gardens”, “a repair café”, “compost”.
- Heart tiles include “the school”, “in the middle”, “within a 15-minute walk”, “of every home”, “a market”, “a safe route”, “green bridges”.

The game detects some problematic text patterns even if the plan happens to pass:

- Negation missed: Florence may miss “not” and do the opposite.
- Repetition: instruction mostly says the same word repeatedly.
- Emoji/pictures: not accepted as a proper instruction/specification.
- Too short: one or two words leaves Florence guessing.
- “Won’t do” / refused part of brief: no clear-first-time star.
- Silly/non-buildable requests: Florence leaves out nonsense parts.

The tone is corrective but not punitive: the player is told why the first-instruction star was not earned and encouraged to state the goal and constraints clearly.

## Privacy

The provided files do not mention privacy, data collection, storage of typed instructions, account details, or personal information. They do mention that the final AI rule is “saved in your town report”, but no privacy policy or storage mechanics are included here. I should not infer anything beyond that.

## Story films / episodes

There are twelve story episodes: an opening and closing cartoon for each mission.

Cast:

- **Narrator** — introduces and summarises.
- **Florence** — AI robot planner.
- **Posy** — asks for things in plain words; often provides the clearer instruction.
- **Dev** — checks things and says to look through the lens.
- **Pebble the otter** — non-speaking; shows the wild side of the island.

The episodes have title cards, spoken lines, camera shots, labels and visual actions. Captions identify speakers. There is a function to convert “90%” to “90 percent” for text-to-speech, but the caption keeps the written form.

Each opening film sets up the mistake. Each closing film shows the evidence, the “Oops” moment, the clearer instruction, and the corrected plan.

Common episode rhythm:

1. Narrator sets the town context.
2. Posy gives a vague/plain-language request.
3. Florence makes a confident plan and displays a confidence label.
4. Dev or the environment hints at the problem.
5. A question card asks what to check or what Florence missed.
6. In the closing film, a lens/test reveals the flaw.
7. Florence says “Oops…” and names what she assumed or over-focused on.
8. Posy gives a clearer instruction.
9. Florence builds the corrected plan and it is checked.
10. Narrator states the eco lesson and AI lesson.

The story cards are short and memorable, e.g.:

- Land opening: “Is the flattest land the best land?”
- Move opening: “Who is ‘everyone’?”
- Homes opening: “What can’t you see from the sky?”
- Food opening: “What should Florence keep?”
- Power opening: “Is very sure the same as right?”
- Heart opening: “The middle of what?”

Closing lesson cards include:

- “Flat land by a river can flood. Keep it wild.”
- “An AI can take one word too far. Say what you mean.”
- “Safe paths to walk and cycle. Cars stay at the edge.”
- “An AI fills gaps with guesses. Say who you mean.”
- “Carbon hides in what we build with. Timber and straw keep it low.”
- “Looking right is not proof. Check with evidence.”
- “Hedges are homes and paths for wildlife. Grow enough, not most.”
- “An AI does what you say. Tell it what to keep.”
- “Plan power for the hardest night. Store some for later.”
- “Sure is not the same as right. Test the plan.”
- “School a short walk from every home.”
- “If an AI only asks some people, its answer is unfair. Ask everyone.”

## Junior vs senior wording differences to preserve

When writing text, keep these style differences clear:

### Junior

- Use concrete, spoken-language sentences.
- Prefer “families” not “households”.
- Prefer “baskets of food” not “food units”.
- Say “lights on”, “rubbish”, “rain”, “busy roads”, “old wood”.
- Explain tests plainly: “what happens when it’s cold, dark and there is no wind?”
- Use encouraging exclamations: “Nice!”, “Brilliant!”, “Well done!”
- Use emoji in checklist labels and goal text.

### Senior

- Use planning/specification vocabulary.
- Prefer “households”, “brief”, “limits”, “targets”, “embodied carbon”, “winter-night supply / demand”, “access audit”.
- Name AI concepts: proxy optimisation, average-case assumption, missing/biased data, specification ambiguity.
- Explain trade-offs and units.
- Avoid over-cute phrasing; still accessible, but more precise.

## Tone and wording principles

The intended tone is:

- Warm, encouraging and practical.
- Child-safe and non-shaming.
- Clear that mistakes are learnable.
- Concrete: “8:45 am”, “still winter night”, “15-minute walk”, “70 t”, “160 t”, “40 families”.
- Evidence-led: lenses, audits and tests are more important than Florence’s confidence.
- Specific about who is affected: children, wheelchair users, slow walkers, older residents, families, wildlife, bees, deer, non-drivers.

Avoid making Florence sound malicious. She is confident and sometimes wrong because she guesses, optimises the wrong thing, or interprets words literally.

Avoid saying a lens proves the whole plan. The UI explicitly says each lens checks only one part of the plan.

Use the exact in-game names where possible:

- “Florence”
- “AI Lab”
- “Flood lens”
- “Street view”
- “Step-free check”
- “Carbon lens”
- “Inside view”
- “Nature lens”
- “Winter test”
- “Walking-time lens”
- “Use Florence’s plan” / “Accept Florence’s plan” / “Adopt the plan” depending version/context
- “Town report”
- “Star shop”

## Things not covered in this material

The provided files do **not** fully cover:

- Exact town-name options or typed-name filter rules.
- Privacy policy or data handling.
- Exact credit prices/income mechanics.
- Complete catalog stats for every build item; only build names and effects implied by text are visible here.
- Any web pages around the game beyond in-game UI text.
- Detailed implementation of the planner that maps typed instructions to plans; the comments say actual assumptions come from the planner, but that source is not included here.
