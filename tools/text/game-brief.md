<!-- Written by OpenAI (gpt-5.5) from the real material, by tools/text/brief.mjs. Do not edit by hand: re-run the script. -->

# Game brief for writing Eco Town and the six-part day

## Core purpose

This is an educational browser game for a school or club day. Children build and test a sustainable town, then visit five one-hour future-work modules. The writing must help children act, notice evidence, discuss choices, and keep moving without feeling tested or shamed.

The whole day has six parts in this fixed order:

1. **Eco Town**
2. **Drones at work** (`drone`)
3. **Robots at work** (`robots`)
4. **Self-driving cars** (`roads`)
5. **Town film studio** (`film`)
6. **Power control room** (`power`)

Eco Town is already a one-hour part and is unchanged. Each later module is being expanded to about one hour: roughly 45 minutes of play, 10–15 minutes of teacher-led discussion, then a break screen. The game does not enforce exact times.

There are two age routes:

- **Ages 8–12 / junior**: plain, concrete language, read-aloud on by default, cards and choices, no money or budget framing.
- **Ages 13–17 / senior**: more technical vocabulary and real numbers where specified, such as metres, percentages, kWh, coordinates, speed, overlap, thresholds and stopping distances.

## How the teacher runs the day

The game is designed for a full day of about 8 hours, with breaks and discussion. The draft timetable is:

- 09:00–09:15 Welcome film and getting started
- 09:15–10:15 Part 1: Eco Town
- 10:15–10:30 Break
- 10:30–11:30 Part 2: Drones at work
- 11:30–11:45 Break
- 11:45–12:45 Part 3: Robots at work
- 12:45–13:25 Lunch
- 13:25–14:25 Part 4: Self-driving cars
- 14:25–14:40 Break
- 14:40–15:40 Part 5: Town film studio
- 15:40–15:55 Break
- 15:55–16:55 Part 6: Power control room
- 16:55–17:00 Take-home page

The start page and welcome film must show the six parts in order. Do not describe the later modules as “More to try”. A part should only say “about an hour” when it really lasts about an hour.

At the end of each of the five later modules, the game must show:

1. **Jobs that use this** — three or four real jobs, each with one line about what the person does.
2. **Talk it over** — three or four discussion questions. The teacher uses these with screens down. The game waits until the child presses **We have talked it over**.
3. **Break time** — names the next part and gives the way back to the start page. It does not start the next part automatically.

The teacher-led discussion is part of the learning, not an extra. The take-home page and leader page should show the same discussion questions.

## Florence: Eco Town versus the modules

Florence is the AI helper. She is a wooden robot planning helper in Eco Town. She is friendly, useful, keen and sometimes confidently wrong. She is not malicious. She follows words too narrowly, optimises the wrong thing, misses context, or guesses what people meant.

In **Eco Town**, the central lesson is:

> Sure is not the same as right. Catch the AI with evidence.

Florence may say she is 82%, 85% or 90% sure and still be wrong. Children do not “catch her out” to humiliate her. They test her plans with lenses, evidence and clearer instructions. She can say “Oops” and improve. She should not claim feelings as if alive. Leaders should be clear that Florence is pretend and scripted; there is no live AI tool with children.

In the five later **modules**, Florence should be a capable partner. These modules should not repeat Eco Town’s “confidently wrong AI” lesson as their main frame. The child still makes decisions. Florence may brief, guide, explain and assemble built-in lines, but she must not generate free text. If a machine has a limit, the child can see it and fix it.

## Privacy, typing, names and money

These rules matter in every line of copy:

- **Nothing a child types leaves the device.**
- **No child names.** Certificates can have a blank line for a child to write a name after printing.
- Town names may exist in Eco Town. Typed town names stay local and do not travel in sharing codes unless they match safe offered names.
- Prefer no typing. Use tiles, taps, buttons, choices and drags.
- Florence must not generate or write free text. Her lines are fixed or assembled from built-in choices.
- Modules use `ctx.save(state)` and return approved results to the loader. They do not write directly to storage or network.
- The loader sends words, not pictures, with the server copy. Pictures stay on the device.
- For ages **8–12**, do not add money, coins, budgets or financial framing. The broader Eco Town source contains some existing credit wording, but the governing copy rule for junior writing is no new money framing.
- For ages **13–17**, senior Eco Town can use credits where the existing design does; the later module briefs supplied here do not use money.

## Accessibility and delivery

Every instruction the child must follow should be written and also spoken through `ctx.say(text)` when read-aloud is on. Respect:

- `readAloud`
- `reduceMotion`
- `largeText`

With reduced motion on, do not spin, shake or fly objects past the child. Cut rather than animate. Keep cards short. Use plain British English. Use colour-blind-safe patterns, not colour alone. Keep tap targets large. Do not rely on audio without captions or text.

## Tone

Use plain British English. Keep sentences short. Be warm, practical and evidence-led. Use real job language, but explain it simply. Avoid hype. Avoid fantasy framing for real technologies. Avoid overclaiming: records should say what the child **practised**, **made**, **planned**, **checked** or **tested**, not that they mastered a skill or became an expert.

Good wording habits:

- “Check it with a lens.”
- “What did the evidence show?”
- “One check only tests one thing.”
- “Try one change at a time.”
- “You practised…”
- “You can now…”

Avoid:

- “The AI is stupid.”
- “No problem found” as if one check proves the whole plan.
- Saying Florence is alive or has real feelings.
- Making technologies seem magic or perfect.
- Asking children about their own homes, family hardship, personal travel, money or names.

## Shared module structure

Each of the five later modules has six missions. Each mission should:

1. Open with the real job or real use.
2. Say what the child will do.
3. Let the child play a different practical skill.
4. End with what the child can now do.
5. Save progress after completion.

The already-built ten-minute loops become one mission inside the expanded hour:

- Drone: **Delivery**
- Robots: **Recycling sorter**
- Roads: **Redesigning the street**
- Film: **Directing an AI helper**
- Power: **Automation rules**

Missions open in order. Finished missions can be replayed. If a child leaves early, they keep what has already been saved. The loader draws **Back to my town**; modules must not draw another exit.

Records must fit the module contract:

- `made.title`: no more than 60 characters.
- `made.lines`: up to 6 lines, each no more than 120 characters.
- `practised`: 2 to 4 lines.
- Each practised line must complete “You practised …”.
- A finished module needs a title and at least two practised lines, or it is not recorded as finished.

## What children do on the main screens

### Start and welcome

Children choose the age route, start or continue, and see the six parts in order. Eco Town also has mission mode choices: **Any order** for clubs/home/museums, and **In order (class)** for classes. In class mode, the game starts with music off and sound effects on.

### Eco Town free-building town

Children build a sustainable island town. They mark town land, build routes, homes, food, power, water/waste and a town heart. They use the build bar, goals, lenses, camera, remove tool and AI Lab. Categories unlock as the town grows.

They see feedback through tile highlights, good-spot pins, info lines, build previews, floating chips, goal celebrations, Florence tips, resident bubbles, animal reactions and night events. They can watch construction films with **▶**.

### Eco Town AI Lab mission screens

Each mission happens on Florence’s practice island, not directly in the child’s own town. The pattern is:

1. Mission card gives a goal and a vague instruction.
2. Child tells Florence what to do using word tiles, cards or, in senior Eco Town, local typed text.
3. Florence makes a plan and gives a confidence line.
4. Child chooses a lens, view or test.
5. Evidence reveals what Florence missed.
6. Child identifies the AI habit or failure mode.
7. Child gives a clearer instruction.
8. Florence makes a corrected plan.
9. Child chooses whether to use/adopt parts of Florence’s plan or keep their own town.
10. Reward card shows stars, a stat and the unlocked lens/check.
11. Closing story film reinforces the eco idea and AI idea.

### Later module mission map

Children see six mission cards. The next mission is open, finished missions can be replayed, and later missions are locked. The map should say how many of six are done and what to do next.

### Later module opening brief

The brief must say:

- the real job/use;
- how to play;
- what the child can do after the mission.

### Later module play screens

Use direct action text: tap, choose, drag, match, test, read, run, guide, check, improve. The screen should show a practical professional check, not an abstract quiz.

### Later module mission closing card

The closing card gives factual results from that mission and a “You can now…” style statement. It should not overpraise or compare children.

### Jobs, talk and break

After all six missions, show **Jobs that use this**, then **Talk it over**, then **Break time**. The break screen names the next part and returns children to the start page. It does not launch the next part.

## Lenses, checks and tests

The game’s learning is built around evidence checks.

### Eco Town checks

- **Flood lens** — shows land that floods in winter.
- **Street view** — child-height view, especially for 8:45 am routes.
- **Step-free check / access audit** — checks access for wheelchair users, buggies and slow walkers.
- **Carbon lens** — shows embodied carbon/material impact.
- **Inside view** — checks warmth/comfort of homes.
- **Nature lens** — checks habitats, hedges, bees, deer and other wildlife.
- **Winter test** — tests power on a still winter night.
- **Walking-time lens** — checks minutes from homes to school/daily needs.
- **Town flower / goals** — shows trade-offs and score parts.

### Module checks

- Drone: pre-flight checklist, weather, wind, airspace map, Drone Code, fly/do not fly decision, battery, photo overlap, safe distance, heat camera, search pattern.
- Robots: sensor matching, sense–think–act loop, Run, Step, Test run, unseen tests, confidence threshold, Weed the row, simulation test.
- Roads: camera/radar/lidar views, weather/light conditions, labels and edge cases, road-rule tests, simulation runs, one-change-at-a-time testing, fleet waiting times, street crossing checks.
- Film: shot language, storyboard order, AI brief and feedback, edit rhythm, music change, captions, described version, picture checking, permission before filming people.
- Power: supply/demand balance, forecasts, battery charge/hold/use, automation rules, demand shifting within people’s needs, emergency priority restoration.

## Part 1: Eco Town

Eco Town teaches sustainable town planning and AI literacy. Children build a town while learning that a confident AI plan must be checked with evidence.

### Eco Town missions

1. **Read the land** — Florence treats “best land” as flat riverside meadow. Children use the Flood lens. Clearer instruction: “Dry, sunny land. Keep the meadow wild.”
2. **Getting around** — Florence treats “easy for everyone” as a wide road and car park. Children use Street view and access checks. Clearer instruction: “Safe walking and cycling. Cars stay at the edge.”
3. **Homes** — Florence treats “strong homes” as concrete and steel. Children use Carbon lens and Inside view. Clearer instruction: “Warm, low-carbon homes from timber and straw.”
4. **Food** — Florence grows as much food as possible and removes hedges. Children use Nature lens. Clearer instruction: “Enough food, and keep the hedges for the bees.”
5. **Water, power and waste** — Florence uses solar only and plans for an average day. Children use the Winter test. Clearer idea: power for a still winter night, with storage.
6. **A school for everyone** — Florence puts the school in the map middle. Children use Walking-time lens. Clearer instruction: “School within a 15-minute walk of every home.”

Eco Town jobs named in the broader design include town planner, environmental scientist and data analyst, and the guide also links to architects, ecologists, transport planners, energy engineers and community engagement officers.

## Part 2: Drones at work (`drone`)

Final title: **Drones at work**. It teaches that drones are used for many real jobs, not just delivery. Jobs that use this: drone pilot, survey and mapping technician, infrastructure inspector, search and rescue drone operator.

Missions:

1. **Ground school** — real pilots check the drone, weather and map before flight. Children check battery, propellers, weather and wind; read no-fly zones; use the Drone Code; decide fly or do not fly.
2. **Hand flying** — pilots practise manual control. Children take off, hover in wind, fly through hoops and land gently.
3. **Delivery** — built loop. Children fly a parcel by hand, then write route steps for the drone to fly by itself. Senior also plans battery use.
4. **Farm survey** — children plan back-and-forth survey lines, check photo overlap and read the map for dry/sick crops. Senior uses overlap percentages and plant health view.
5. **Inspection** — children fly near a turbine and bridge, hold steady, photograph points, keep safe distance and find cracks.
6. **Search and rescue** — children choose the heat camera, choose a search pattern, check warm spots, find the walker and guide the ground team.

Senior route includes battery in watt-hours against distance and wind, overlap as a percentage, and the 120-metre height limit on a side view. Junior route keeps the same ideas without technical numbers.

## Part 3: Robots at work (`robots`)

Final title: **Robots at work**. It teaches how robots sense, think, act, follow programs and rules, learn from examples, use confidence thresholds and are designed for hard places. Jobs that use this: robotics engineer, robot technician, agricultural engineer, test engineer.

Missions:

1. **Sense, think, act** — children match sensors to jobs and follow a robot’s loop. Senior names this as a control loop and considers sensor limits.
2. **Robot arm** — children program a factory/greenhouse arm with steps, positions, grips and repeats; they run, step and debug it. Senior uses centimetres, sequences and loops.
3. **Hospital rules** — children write if–then rules for a delivery robot, make it slow near people, stop for obstacles and take the lift. Senior orders rules by priority.
4. **Recycling sorter** — built loop. Children train a sorter with examples, test unseen items and add more examples.
5. **Weeding robot** — children set how sure the robot must be before pulling a plant. Senior uses confidence thresholds and mistake costs.
6. **Flood rescue** — children choose body, sensors and power, test in a flooded-street simulation, read failures and improve the design. Senior adds floats, weight and trade-offs.

There is no typing in this module. Florence’s lines are built from fixed words.

## Part 4: Self-driving cars (`roads`)

Final title: **Self-driving cars**. It teaches how autonomous systems sense, classify, follow road rules, get tested, work in shared fleets and affect street design. Jobs that use this: autonomous vehicle engineer, transport planner, safety test driver, traffic data analyst.

Missions:

1. **How a self-driving car sees** — children compare camera, radar and lidar in sun, rain, fog and dark, and find what each misses.
2. **Teaching the car to recognise things** — children box and label people, cyclists, dogs and signs; then test and find edge cases such as hidden people, wheelchairs and reflections.
3. **Rules of the road** — children set behaviour at crossings, near school and behind cyclists: speed, gap and who goes first.
4. **Testing in simulation** — children run scenarios, watch failures, change one setting and test again.
5. **A shared fleet** — children choose fleet size, waiting places and charging, then read waiting times and empty trips.
6. **Redesigning the street** — built loop. Children redesign Maple Street with stops, bays and crossings, run the morning, read the numbers and choose what the old car park becomes.

Senior route uses stopping distance against speed/rain and the trade-off between waiting time and number of cars. Junior route keeps the same ideas without more technical numbers.

## Part 5: Town film studio (`film`)

Final title: **Town film studio**. It teaches media-making with AI: shot language, storyboarding, directing an AI helper, editing, accessibility and checking truth/permission. Jobs that use this: director, video editor, content producer, accessibility producer.

The module needs something in the town to film. If there is nothing, it says there is nothing here to film yet and asks the child to go back to the town.

Missions:

1. **The film crew’s language** — children identify wide, medium and close-up shots, plus pan, tilt and track moves.
2. **Storyboarding** — children order shot cards into beginning, middle and end. Senior also leaves out unneeded cards.
3. **Directing an AI helper** — built loop. Children brief Florence with place, who is in it and mood, watch her first cut and give feedback.
4. **Editing** — children pick takes, trim, pace the cut, choose music and choose where music changes.
5. **Making it for everyone** — children choose captions and described-version wording. Senior checks captions are clear and quick to read and descriptions fit gaps.
6. **True or made up?** — children check pictures for changes, machine-made clues and sources, and decide when to ask permission before filming people.

Mission 3 saved progress never stores anything typed.

## Part 6: Power control room (`power`)

Final title: **Power control room**. It teaches how a power grid is balanced, forecast, stored, automated, shifted through demand response and restored in an emergency. Jobs that use this: grid control engineer, energy analyst, renewable energy technician, emergency planner.

Missions:

1. **The grid must balance** — children set the town battery every ten minutes so supply and demand stay level. Senior uses frequency and 50 Hz.
2. **Forecasting** — children read wind/sun or supply/demand charts and mark hours when power will be short. Senior sizes shortfalls in kWh.
3. **Storage** — children choose Charge, Hold or Use through three days so stored energy is ready when needed.
4. **Automation rules** — built loop. Children build rules from tiles and test them on a windy day, still day and winter day. Senior debugs gaps.
5. **Smart demand** — children move flexible jobs such as washing and car charging to spare clean-power hours while meeting people’s needs.
6. **Storm night** — children prepare for a storm, isolate a broken line, restore priority places such as the health centre/shelter first, then bring everyone back safely.

There is no typing in this module. Senior route uses kW/kWh, charts and battery percentage thresholds; junior route uses visual, plain-language equivalents.

## Junior versus senior writing rules

### Junior, ages 8–12

- Use short, concrete sentences.
- Use “families”, “baskets”, “lights on”, “rubbish”, “spare wind and sun”.
- Use cards, tiles, taps and choices.
- Avoid money, budgets, coins and financial framing.
- Avoid unnecessary numbers unless they are central and already specified.
- Keep instructions easy to read aloud.
- Make success factual: “You checked…”, “You planned…”, “You practised…”.

### Senior, ages 13–17

- Use more professional terms, still in plain English.
- Use “households”, “units”, “brief”, “constraints”, “threshold”, “simulation”, “embodied carbon”, “supply and demand”.
- Include real numbers where specified: metres, kWh, percentages, coordinates, speed, overlap, stopping distance, 50 Hz, battery thresholds.
- Eco Town senior may type local briefs; nothing typed leaves the device.
- Name AI concepts in Eco Town where appropriate: proxy optimisation, average-case assumption, missing or biased data, specification ambiguity.

## Discussion and take-home framing

Discussion questions should help children explain:

- what they did;
- what the machine or system needed from them;
- what evidence changed their mind;
- what they would change next time;
- who benefits or might be missed.

Take-home and record text must be factual. Say “planned a route”, “tested rules”, “labelled pictures”, “moved jobs”, “checked pictures”, “kept safe distance”. Do not claim that the child is now an expert or that a system is perfect.

The day should compare towns and choices, not children. Ask what a town protected, what it tested, and what it could improve.

## Area summaries

### Game screens

Game screens are the live interface children and leaders see while playing: start page, mission maps, brief cards, choices, feedback, closing cards, Jobs that use this, Talk it over and Break time. Children read them, and many lines are also spoken through read-aloud. Writers must make every action clear in short British English: tap, choose, drag, test, read, run, guide. The screen must never rely on sound alone, colour alone or hidden teacher knowledge. It must respect junior/senior differences, accessibility settings and the fixed day structure. Screens should show evidence, checks and next steps, not long explanations.

### Game words (content.js)

Game words are the reusable labels, buttons, tooltips, mission titles, lens names, build descriptions and short Florence lines used throughout Eco Town. Children read them constantly while building and checking plans. Writers must preserve exact names such as AI Lab, Flood lens, Street view, Winter test, Walking-time lens, Use Florence’s plan and Back to my town where those names are established. These strings need to be short enough for small screens and read-aloud. They must support the core Eco Town lesson: Florence may be confident, but children check with evidence and clearer instructions.

### Story cartoons (voiced)

Story cartoons are the short voiced Eco Town episodes before and after each AI Lab mission. Children hear them with captions, and leaders may pause them for questions. They show Florence making a confident but flawed plan, children noticing a problem, a lens or test revealing evidence, and a clearer brief fixing the plan. Writers must keep Florence friendly, scripted and not malicious. The films need memorable question cards, short spoken lines and clear lesson cards. They must not give away the fix too early in opening films. Captions, skip controls and reduced-motion needs matter.

### Pages

Pages are the web or surrounding game pages: start, welcome, take-home, visit/share surfaces, passport or printable records where applicable. Children, parents and leaders may read them. Writers must be clear about what is local, what is saved and what is not shared. Do not ask for child names. Do not imply accounts, chat, online galleries or live AI where the material does not support them. The take-home wording should say what the child practised or made, not overclaim learning. The start page must show the six parts in order and only say “about an hour” for parts that truly are.

### Leader page

The leader page is for teachers and club leaders running the day. It should explain the timetable, the six-part order, when to pause, where children may get stuck, and how to run screens-down discussion. Leaders need the same Talk it over questions that children see, plus practical prompts about evidence, trade-offs and comparing towns rather than children. Copy must remind leaders that Florence is pretend and scripted, not a live AI. It should also flag privacy, no child names, local sharing rules, accessibility options and the junior no-money rule. Keep it usable during a busy session.

### Module: Drone delivery

This area is now the **Drones at work** module, not only delivery. Children work through six real drone jobs: ground school, hand flying, delivery, farm survey, inspection and search and rescue. Writers must keep safety central: pre-flight checks, weather, wind, airspace, Drone Code, fly/do not fly decisions, battery, overlap, safe distance and heat-camera search patterns. Junior wording stays concrete; senior wording can include watt-hours, overlap percentages, side-view height limit and official terms such as Civil Aviation Authority where supplied. Delivery is the built loop inside the wider hour. Avoid fantasy drone uses and do not add money.

### Module: Robot training

This area is the **Robots at work** module. Children meet six robot jobs: sense–think–act, robot arm, hospital rules, recycling sorter, weeding robot and flood rescue. Writers must frame robots as systems that sense, decide and act, and children as people who choose sensors, write steps, test rules, label examples, set thresholds and improve designs. Junior wording uses “how sure”, “wrong step” and “make it better”; senior wording can use control loop, centimetres, debugging, classifier, confidence threshold, costs, trade-offs and simulation. There is no typing. Florence’s lines are fixed words, not generated text.

### Module: Roads for self-driving cars

This area is the **Self-driving cars** module. Children play six missions about sensing, labelling, road-rule behaviour, simulation testing, shared fleets and street redesign. Writers must avoid making self-driving cars seem perfect. The emphasis is safety, blind spots, edge cases, testable rules, one change at a time, fleet trade-offs and streets that work for passengers, walkers and cyclists. Junior text says self-driving cars and uses plain actions. Senior text can say autonomous cars, fused sensors, recognition model, simulated miles, empty driving and measured outcomes. Mission 6, redesigning the street, is the built loop and leaves the street design in town.

### Module: Town film studio

This area is the **Town film studio** module. Children complete six film and media jobs: crew language, storyboarding, directing Florence, editing, access and checking truth/permission. Writers must keep the work practical, not just playful effects. Use real film words such as wide, medium, close-up, pan, tilt, track, storyboard, first cut, feedback, captions and described version, but explain them simply. Florence is a capable AI helper in mission 3; the child briefs her and improves the first cut. Mission 6 must stress checking pictures and asking before filming people. Do not store typed material; mission 3 progress never stores anything typed.

### Module: Power control room

This area is the **Power control room** module. Children run six power-system missions: balancing the grid, forecasting, storage, automation rules, smart demand and storm restoration. Writers must keep the tone calm, practical and safety-led. Junior text should use visual ideas such as a level scale, dark squares, spare wind and sun, safe places and bringing everyone back. Senior text can use supply, demand, 50 Hz, kWh, charge/discharge, surplus renewables, constraints, priority load and re-energise. The built loop is automation rules. There is no typing. Records should report measured actions, such as steps balanced, forecasts read, rules tested and priority sites restored.
