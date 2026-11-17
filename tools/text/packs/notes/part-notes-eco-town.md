
# Notes: full day, curriculum, and module contract

## Big picture: who plays, how the teacher runs it

- The day is an **8-hour school/club day** for children, with two age routes:
  - **Ages 8–12**: junior route.
  - **Ages 13–17**: senior route.
- The full day now contains **six parts in a fixed order**:
  1. **Eco Town**
  2. **Drones at work** (`drone`)
  3. **Robots at work** (`robots`)
  4. **Self-driving cars** (`roads`)
  5. **Town film studio** (`film`)
  6. **Power control room** (`power`)
- Eco Town already lasts one hour and is unchanged.
- Each of the five later modules is being grown from a shorter first version into **about one hour**.
- Each hour should be roughly:
  - **About 45 minutes of play**.
  - **10 to 15 minutes of teacher-led discussion**.
  - Then a **break screen**.
- The teacher-led discussion is important. It is not extra decoration. It is how the learning is reviewed.
- During the discussion, the game should show a **“Talk it over”** screen with three or four questions for that part. The teacher reads/uses them with screens down. The game waits until the child presses **“We have talked it over”**.
- After discussion, the game shows **“Break time”**, names the next part, and gives the way back to the start page. It **does not start the next part automatically**.
- The game does not wait for exact clock times. The timetable is a guide.
- Draft timetable:
  - 09:00–09:15 Welcome film and getting started
  - 09:15–10:15 Part 1: Eco Town
  - 10:15–10:30 Break
  - 10:30–11:30 Part 2: Drone delivery / Drones at work — note: curriculum says final title is **Drones at work**, but timetable still says “Drone delivery”
  - 11:30–11:45 Break
  - 11:45–12:45 Part 3: Robot training / Robots at work — note: final title is **Robots at work**, but timetable still says “Robot training”
  - 12:45–13:25 Lunch
  - 13:25–14:25 Part 4: Roads for self-driving cars / Self-driving cars — note: final title is **Self-driving cars**
  - 14:25–14:40 Break
  - 14:40–15:40 Part 5: Town film studio
  - 15:40–15:55 Break
  - 15:55–16:55 Part 6: Power control room
  - 16:55–17:00 Take-home page
- Screen time is expected to be about **four and a half hours** across the day, with discussions and breaks used to break it up, especially for ages 8–12.

## Overall curriculum shape

- The user explicitly wanted the one-hour modules to **not be more of the same skill**. Each topic must teach a range of real skills used in real jobs.
- The design principle is: **six missions of about seven minutes each**, each showing a different real use of the technology and a different real skill.
- Each mission should:
  - Open with the **real job/use** in one line, e.g. “Search and rescue teams fly drones with heat cameras.”
  - End with what the child can now do.
- The last screen before the teacher discussion should be **“Jobs that use this”**. It lists three or four real jobs, each with one line saying what the person does.
- Progress is saved after every mission/stage. A child who stops early keeps what they have finished.
- The already-built 10-minute loop in each module becomes **one of the six missions**, not the whole hour.
- The curriculum should teach real skills, simplified for children, not made-up pseudo-skills.
- Where a real rule exists, the game should use it. Explicit example: drones use the **UK Drone and Model Aircraft Code**:
  - Fly below **120 metres**.
  - Keep the drone in sight.
  - Keep away from people and airports.

## Tone and wording

- Use **plain British English**.
- Use **short sentences**.
- Avoid overclaiming. For records, say what the child **practised** or **made**, not what they “learned” or how much they improved.
- Florence and the machines are **capable partners**. This is not a lesson about catching AI out. Eco Town covers checking an AI that can be confidently wrong; later modules do not repeat that framing.
- A machine may have an honest limit that the child can see and fix.
- For ages 8–12:
  - No money, budgets, coins, or financial framing.
  - Same ideas as the senior route, but without technical numbers where specified.
- For ages 13–17:
  - Include the numbers used in the real job: metres, kilowatt-hours, percentages, overlap, speed, etc.
- Every instruction the child must follow should be both **written and spoken** through `ctx.say(text)` when read-aloud is on.
- Respect accessibility settings:
  - `readAloud`
  - `reduceMotion`
  - `largeText`
- With reduced motion on, do not spin, shake, or fly objects past the child. Cut rather than animate.

## Privacy, typing, names, money

- **Nothing a child types leaves the device. No names.**
- Prefer **no typing at all**. Use tiles, taps, buttons, choices, and drags.
- Florence must not generate or write free text. She assembles speech from built-in lines and choices.
- A module never writes directly to the save, local storage, or network. It uses `ctx.save(state)` and returns the approved result to the loader.
- The loader sends words, not pictures, with the server copy. Pictures stay on the device.
- Junior route: no money/coins/budget content.
- The material does not give a general rule forbidding money for ages 13–17, but it specifically says ages 8–12 get no money.

## Florence: role and behaviour

- Florence is the AI helper/partner.
- In these modules she should be helpful and capable, not someone for children to catch out.
- The child makes decisions. Florence can help explain, brief, guide, or assemble built-in lines.
- Florence must not write free text.
- The material does not give full Florence dialogue for these areas yet. Dialogue must be written later from the mission structure and must stay within the built-in-choice rule.

## Module contract: how a module works in the game

- A module is one folder: `games/ecotown/game/js/modules/<id>/`.
- Valid ids:
  - `drone`
  - `robots`
  - `roads`
  - `film`
  - `power`
- A module exports one object from `index.js` with:
  - `id`
  - `icon`
  - `title` with junior/senior variants
  - `blurb` with junior/senior variants, max 80 characters
  - optional `css`
  - `async run(ctx)`
  - optional `show(townCtx, data)`
- Important text-writing limits in records:
  - `made.title`: at most 60 characters.
  - `made.lines`: up to 6 lines of 120 characters.
  - `practised`: 2 to 4 lines.
  - Each practised line must complete “You practised …”.
- A finished module needs a title and at least two practised lines, or it is recorded as not finished.
- The returned `town` result is scenery only. It does not change town tiles or simulation numbers.
- The “Back to my town” button is drawn by the loader. Modules must not draw another exit.
- If a child presses **“Back to my town”** before finishing, they keep only what the module already saved with `ctx.save`.
- While a module is open, things modules previously left in the town are put away and redrawn afterwards.
- A module can report leader-facing progress with `ctx.report({ stage, state, finished })`; stage should be a short phrase, max 80 characters.

## Shared screens and leader support needed

- Every module needs:
  - About 45 minutes of play.
  - A **Jobs that use this** screen before the talk.
  - A **Talk it over** screen with module-specific questions.
  - A **Break time** screen naming the next part.
  - A one-hour section in the leader’s run sheet, including stages, where children get stuck, and discussion questions.
- The take-home page and leader’s page should show the same discussion questions.
- Start page and welcome film must show six parts in a row, not “four plus More to try”.
- The start page should show “about an hour” for a part only once that part really lasts that long.

---

# Part 1: Eco Town

## What it teaches

- Eco Town is already one hour and is unchanged.
- It teaches planning a town with an AI that can be confidently wrong, and checking the plan with evidence.
- Jobs named:
  - Town planner
  - Environmental scientist
  - Data analyst

## What children do

- The files here do not describe Eco Town’s screens or steps in detail. They only say it is already one hour and unchanged.
- The broader theme is planning a town, working with Florence/AI, and checking with evidence.

## Age differences

- Not specified in these files beyond the general junior/senior routes.

---

# Part 2: Drones at work (`drone`)

## Final title and jobs

- Final title: **Drones at work**.
- The timetable still says “Drone delivery”, and the module contract example uses “Drone delivery”, but the curriculum says the decided title is **Drones at work**.
- Jobs that use this:
  - Drone pilot
  - Survey and mapping technician
  - Infrastructure inspector
  - Search and rescue drone operator

## Overall teaching aim

- Drones are used for more than deliveries.
- The hour covers real drone work: ground checks, manual flying, route planning, mapping, inspection, and rescue.
- Children learn real drone skills using simplified versions of real rules and decisions.

## Mission 1: Every flight: ground school

- Real use: every drone flight starts with ground school/pre-flight checks.
- What the child does:
  - Go through a pre-flight check:
    - Battery
    - Propellers
    - Weather
    - Wind
  - Read an airspace map.
  - Check no-fly zones around:
    - The school
    - The hospital
    - Nesting birds
  - Decide **“fly or don’t fly”**.
- Skill learnt:
  - Pre-flight checks.
  - Airspace rules from the real Drone Code.
  - Deciding whether flying is safe and allowed.
- Rules/lenses/checks used:
  - UK Drone and Model Aircraft Code.
  - Keep below 120 metres.
  - Keep the drone in sight.
  - Keep away from people and airports.

## Mission 2: Hand flying

- Real use: pilots must control a drone manually.
- What the child does:
  - Take off.
  - Hover still in a crosswind.
  - Fly through hoops.
  - Land on a pad.
- Skill learnt:
  - Manual control.
  - Correcting for wind drift.
  - Smooth landings.

## Mission 3: Delivery — built loop

- Real use: drone delivery.
- This is the already-built ten-minute loop.
- What the child does:
  - Fly a parcel by hand.
  - Then write the route as steps for the drone to fly by itself.
  - Keep the route within the drone’s battery.
- Skill learnt:
  - Waypoint route planning.
  - Battery planning.
  - Turning a skill into instructions.

## Mission 4: Farm survey and mapping

- Real use: farm survey and mapping.
- What the child does:
  - Plan a back-and-forth survey pattern over farms.
  - Make sure photos overlap.
  - Read the map to find:
    - The dry field.
    - The sick crop.
- Skill learnt:
  - Survey patterns.
  - Photo overlap.
  - Reading aerial data.

## Mission 5: Inspection

- Real use: infrastructure inspection.
- What the child does:
  - Fly close to a wind turbine blade and the bridge.
  - Hold steady.
  - Find the crack.
  - Keep a safe distance.
- Skill learnt:
  - Precision flying.
  - Inspection routine.
  - Safety distances.

## Mission 6: Search and rescue at dusk

- Real use: search and rescue teams fly drones with heat cameras.
- What the child does:
  - A walker is lost.
  - Choose the heat camera.
  - Plan a search pattern.
  - Find the walker.
  - Guide the rescue team.
- Skill learnt:
  - Choosing the right sensor.
  - Search patterns.
  - Working as part of a team.

## Senior differences

- Ages 13–17 also use:
  - Battery in watt-hours against distance and wind.
  - Overlap as a percentage.
  - The 120-metre height limit on a side view.

## Junior differences

- Ages 8–12 get the same ideas without those numbers.
- No money.

---

# Part 3: Robots at work (`robots`)

## Final title and jobs

- Final title: **Robots at work**.
- Jobs that use this:
  - Robotics engineer
  - Robot technician
  - Agricultural engineer
  - Test engineer

## Overall teaching aim

- Robots are used for more than sorting waste.
- The hour covers the sense–think–act loop, robot arms, hospital delivery robots, recycling sorters, farm robots, and flood rescue robots.

## Mission 1: How any robot works

- Real use: understanding the basic structure of any robot.
- What the child does:
  - Match sensors to jobs:
    - Camera
    - Distance sensor
    - Bump switch
    - Thermometer
  - Watch a robot sense, decide, and act.
- Skill learnt:
  - The sense–think–act loop.
  - What each sensor can and cannot tell.

## Mission 2: Factory and greenhouse robot arm

- Real use: robot arms in factories and greenhouses.
- What the child does:
  - Program an arm with a sequence:
    - Move to
    - Open
    - Close
    - Lift
  - Pick and pack seedlings.
  - Use a repeat to do a whole tray.
- Skill learnt:
  - Sequences.
  - Positions.
  - Loops.
  - Debugging a program step by step.

## Mission 3: Hospital delivery robot

- Real use: a robot taking medicine across a clinic.
- What the child does:
  - Write rules for the robot.
  - Make it slow near people.
  - Make it stop for an obstacle.
  - Make it take the lift.
- Skill learnt:
  - Rules with “if”.
  - Navigation.
  - Safety around people.

## Mission 4: Recycling sorter — built loop

- Real use: recycling sorter.
- This is the already-built ten-minute loop.
- What the child does:
  - Teach a robot by showing examples.
  - Test it.
  - Show it what it has not seen yet.
- Skill learnt:
  - Training by examples.
  - Testing on unseen things.

## Mission 5: Farm robot

- Real use: weeding robot on a farm.
- What the child does:
  - Teach a weeding robot crop from weed.
  - Decide how sure the robot must be before it acts.
  - Consider that pulling a crop costs more than missing a weed.
- Skill learnt:
  - Mistakes have different costs.
  - A confidence threshold.

## Mission 6: Flood rescue robot

- Real use: flood rescue.
- What the child does:
  - Design a robot for a flooded street.
  - Choose body type:
    - Wheels
    - Tracks
    - Legs
    - Boat
  - Choose sensors.
  - Choose power.
  - Test it in a simulation.
  - Improve it.
- Skill learnt:
  - Engineering design trade-offs.
  - Test, then improve.

## Senior differences

- Ages 13–17 also use:
  - Coordinates for the arm.
  - A confusion table for the sorter and the farm robot.
  - Battery life against weight.

## Junior differences

- Ages 8–12 get the same ideas without those numbers/tables unless simplified.
- No money.

---

# Part 4: Self-driving cars (`roads`)

## Final title and jobs

- Final title: **Self-driving cars**.
- Jobs that use this:
  - Autonomous vehicle engineer
  - Transport planner
  - Safety test driver
  - Traffic data analyst

## Overall teaching aim

- The module teaches how self-driving cars sense, classify, follow road rules, get tested, work in shared fleets, and affect street design.

## Mission 1: How a self-driving car sees

- Real use: sensing the street.
- What the child does:
  - Switch between views of the same street:
    - Camera
    - Radar
    - Lidar
  - Try them in:
    - Sun
    - Rain
    - Fog
    - Dark
  - Find what each one misses.
- Skill learnt:
  - Sensors and their limits.
  - Why cars use several sensors.

## Mission 2: Teaching the car to recognise things

- Real use: labelling training data.
- What the child does:
  - Label street scenes:
    - Person
    - Cyclist
    - Dog
    - Sign
  - Find hard cases:
    - A person half hidden.
    - A wheelchair.
    - A reflection.
- Skill learnt:
  - Labelling data.
  - Edge cases.

## Mission 3: Rules of the road

- Real use: turning road rules into vehicle behaviour.
- What the child does:
  - Set what the car does:
    - At a crossing.
    - Near the school.
    - Behind a cyclist.
  - Set:
    - Speed.
    - Gap.
    - Who goes first.
- Skill learnt:
  - Priorities and safe gaps.
  - Turning rules into behaviour.

## Mission 4: Testing in simulation

- Real use: simulated safety testing.
- What the child does:
  - Run the car through:
    - A rainy morning.
    - The school rush.
  - Find where it fails.
  - Change one setting at a time.
- Skill learnt:
  - Testing in simulation.
  - Changing one thing at a time.

## Mission 5: A shared fleet

- Real use: planning a shared car fleet.
- What the child does:
  - Choose how many shared cars.
  - Choose where they wait and charge.
  - See waiting times and empty trips.
- Skill learnt:
  - Fleet planning.
  - Reading the numbers.

## Mission 6: Redesigning the street — built loop

- Real use: redesigning streets for shared cars and other users.
- This is the already-built ten-minute loop.
- What the child does:
  - Redesign the street for shared cars.
  - Choose what the old car park becomes.
- Skill learnt:
  - Designing for everyone who uses a street.

## Senior differences

- Ages 13–17 also use:
  - Stopping distance against speed and rain.
  - The trade-off between waiting time and number of cars.

## Junior differences

- Ages 8–12 get the same ideas without the more technical numbers.
- No money.

---

# Part 5: Town film studio (`film`)

## Final title and jobs

- Final title: **Town film studio**.
- Jobs that use this:
  - Director
  - Video editor
  - Content producer
  - Accessibility producer

## Overall teaching aim

- Children learn media-making with AI: shot language, storyboarding, directing an AI helper, editing, accessibility, and checking whether media is true or made up.

## Mission 1: The film crew’s language

- Real use: using the shared language of a film crew.
- What the child does:
  - Learn shot types:
    - Wide
    - Medium
    - Close
  - Learn camera moves:
    - Pan
    - Tilt
    - Track
  - Match shots to what a scene needs.
- Skill learnt:
  - Shot types.
  - Camera moves.

## Mission 2: Storyboarding

- Real use: planning before filming.
- What the child does:
  - Put shots in order.
  - Tell a story with:
    - Beginning
    - Middle
    - End
- Skill learnt:
  - Story structure.
  - Planning before filming.

## Mission 3: Directing an AI helper — built loop

- Real use: directing an AI helper.
- This is the already-built ten-minute loop.
- What the child does:
  - Brief Florence.
  - Watch her first cut.
  - Improve it with feedback.
- Skill learnt:
  - Briefing clearly.
  - Improving a draft through feedback.

## Mission 4: Editing

- Real use: video editing.
- What the child does:
  - Trim the cut.
  - Reorder the cut.
  - Pace the cut.
  - Choose music.
  - Choose where the music changes.
- Skill learnt:
  - Editing rhythm.
  - How sound sets the mood.

## Mission 5: Making it for everyone

- Real use: accessible media production.
- What the child does:
  - Add captions.
  - Add a described version for someone who cannot see the screen.
- Skill learnt:
  - Accessibility in media.

## Mission 6: True or made up?

- Real use: checking media and permission.
- What the child does:
  - Spot which shots were changed or made by a machine.
  - Check permission before filming people.
- Skill learnt:
  - Checking media.
  - Consent and honesty.

## Age differences

- The files do not specify extra senior-only film numbers or tools.
- General age-route rules still apply: juniors get plain treatment and no money.

---

# Part 6: Power control room (`power`)

## Final title and jobs

- Final title: **Power control room**.
- Jobs that use this:
  - Grid control engineer
  - Energy analyst
  - Renewable energy technician
  - Emergency planner

## Overall teaching aim

- Children learn how a power grid is balanced, forecast, stored, automated, shifted through demand response, and restored during an emergency.

## Mission 1: The grid must balance

- Real use: grid control.
- What the child does:
  - Keep supply level with demand minute by minute as the town wakes up.
- Skill learnt:
  - Supply and demand.
  - Why balance matters.

## Mission 2: Forecasting

- Real use: energy forecasting.
- What the child does:
  - Read the wind and sun forecast.
  - Say when power will be short.
- Skill learnt:
  - Reading forecasts and charts.

## Mission 3: Storage

- Real use: battery storage.
- What the child does:
  - Decide when to charge the town battery through a day.
  - Decide when to use the town battery through a day.
- Skill learnt:
  - Storage and timing.

## Mission 4: Automation rules — built loop

- Real use: automation in a control room.
- This is the already-built ten-minute loop.
- What the child does:
  - Write rules the system follows by itself.
  - Test them on three days.
- Skill learnt:
  - Writing rules for an automated system.

## Mission 5: Smart demand

- Real use: demand response.
- What the child does:
  - Move flexible jobs to hours with spare clean power, including:
    - Car charging
    - Washing
  - Work with people’s needs.
- Skill learnt:
  - Demand response.
  - Working with people’s needs.

## Mission 6: Storm night

- Real use: emergency power restoration.
- What the child does:
  - A storm cuts a line.
  - Decide who gets power first, including:
    - The hospital
    - The school shelter
  - Restore the town in order.
- Skill learnt:
  - Priorities in an emergency.
  - Restoring a system safely.

## Senior differences

- Ages 13–17 also use:
  - Kilowatts against kilowatt-hours.
  - A supply and demand chart.
  - Battery percentage thresholds.

## Junior differences

- Ages 8–12 get the same ideas without those technical numbers.
- No money.

---

# Built loops and one-hour expansion

The current shorter loops become one mission in each expanded module:

- Drone: **Delivery** is the built loop.
- Robots: **Recycling sorter** is the built loop.
- Roads: **Redesigning the street** is the built loop.
- Film: **Directing an AI helper** is the built loop.
- Power: **Automation rules** is the built loop.

The files do not provide exact screen-by-screen scripts for these built loops, only the mission summaries above and the module contract. Exact text and UI wording will need to be written later from the actual source files for each module.

# Checks, tests, and lenses children use

Across the curriculum, children use practical professional checks rather than abstract quizzes:

- Drone:
  - Pre-flight checklist.
  - Airspace/no-fly-zone map.
  - Drone Code rules.
  - Battery checks.
  - Wind/weather checks.
  - Photo overlap for mapping.
  - Heat camera choice for search and rescue.
- Robots:
  - Sensor-to-job matching.
  - Sense–think–act loop.
  - Step-by-step debugging.
  - If-rules for safety.
  - Training examples and unseen tests.
  - Confidence thresholds.
  - Design trade-offs and simulation tests.
- Self-driving cars:
  - Sensor comparison: camera/radar/lidar.
  - Weather/light limits.
  - Data labels and edge cases.
  - Road-rule settings.
  - Simulation testing.
  - One-change-at-a-time testing.
  - Fleet numbers: waiting times and empty trips.
- Film:
  - Shot language.
  - Story structure.
  - Brief, first cut, feedback.
  - Edit rhythm.
  - Captions and described versions.
  - Media checking, consent, honesty.
- Power:
  - Supply/demand balance.
  - Wind and sun forecasts.
  - Battery timing.
  - Automation rule tests.
  - Demand shifting.
  - Emergency priority order.

# What is not covered yet in these files

- Exact dialogue for Florence is not given.
- Exact button labels are mostly not given, except:
  - **Back to my town**
  - **Talk it over**
  - **We have talked it over**
  - **Break time**
  - **Jobs that use this**
  - **fly or don’t fly** as a decision wording in Drone mission 1
- Exact UI layouts for missions are not described.
- Exact discussion questions are not listed here; only the pattern is given:
  - What you did.
  - What the machine needed from you.
  - What you would change.
- Exact leader run-sheet wording is not provided.
- Exact take-home page wording is not provided.
- Exact mission completion text is not provided, only that each mission should end with what the child can now do.
- Film has no specified senior-only numeric extension.
- Eco Town’s detailed steps are not covered in these files.
- The module contract’s old “first version only: one playable loop of about ten minutes” remains in `MODULES.md`, but the full-day and curriculum documents supersede that for current work: modules are now to become one-hour parts with six missions, discussion, and break.


# Eco Town area notes — design, playtesting, and how it is meant to be run

## Big picture

Eco Town is a browser-based 3D voxel town-building game for children, with two age bands: **8–12** and **13–17**. It is designed for a **full-day kids’ club**, but can also run as a 45, 60 or 90 minute school/lab session.

The core promise is: children build a sustainable town and learn not to trust an AI plan just because it sounds confident. They build freely, get light guidance from Florence, step into the AI Lab for missions, then return to their own town with new lenses/checks.

The game’s teaching line is:

> **Sure is not the same as right. Catch the AI with evidence.**

The game is meant to show systems being built **system by system, layer by layer**, using construction films and clear views, not magical swarms or abstract effects.

## Who plays, and how a leader runs it

### Players

- Main target: **ages 8–12** and **13–17**.
- LAB-GUIDE says ages **8–14** for the club/lab framing, but the source notes make clear the product has two bands: **junior 8–12** and **senior 13–17**.
- Children can play alone, in pairs, or in role-based teams.
- A whole day can be run as: own town + six AI Lab missions in the morning, challenge towns and town-sharing in the afternoon.

### Session lengths

The guide gives plans for:

- **45 minutes:** fast run through all six levels, with short debriefs and final discussion.
- **60 minutes:** six levels with slightly longer debriefs.
- **90 minutes:** six levels, watch the town live, final discussion.
- **Full-day club:** about 5 hours of play plus breaks, including challenges, sharing, club wall and final discussion.

### Full-day rhythm

Recommended full-day structure:

1. **0:00–0:15** — Florence’s intro; children name their town.
2. **0:15–1:30** — Build the town; missions 1–3: Read the land, Getting around, Homes.
3. **1:30–1:45** — Break.
4. **1:45–3:00** — Missions 4–6; finish eight town goals.
5. **3:00–3:45** — Lunch.
6. **3:45–4:00** — Open **Challenge towns** together; read rules and predict the hardest.
7. **4:00–5:15** — Challenge towns in pairs; suggested start is **Florence’s Town**.
8. **5:15–5:30** — Break.
9. **5:30–6:15** — Second challenge round: improve medal or try another challenge.
10. **6:00–6:15** — Children open **Town postcard** and give the leader their town code or QR.
11. **6:15–6:45** — Final discussion around the **Club wall**.

The timing overlaps slightly in the guide around 6:00–6:15 and 6:15–6:45; do not invent a corrected timetable unless asked.

### Class vs club mode

On the start screen there is an **AI Lab missions** option:

- **Any order** — suited to clubs, museums and home play.
- **In order (class)** — suited to classes. Only the next AI Lab mission opens, and Florence invites players when it is ready.

In class mode, the game starts with **music off** but sound effects on, to keep a room of devices calm. The player can turn music on from **☰ → Sound → On**.

### Suggested group roles

The guide suggests rotating roles so every child owns a kind of evidence:

- **Planner** — reads cards, leads choices, places builds.
- **Nature Watcher** — checks wildlife, hedges and meadow.
- **Street Walker** — uses street view and reports from child height.
- **Data Detective** — opens flood, carbon, energy or walking-time lenses.
- **Resident Voice** — reads bubbles and family diary.

### Facilitator duties

The leader should:

- Start the first session with Florence’s intro.
- Pause story episodes at the question cards and last cards.
- Run short mission debriefs.
- Use town reports, lenses and the club wall as evidence prompts.
- Remind children: **Florence is pretend. The plans are scripted.** No live AI tool is used with children.
- Compare towns, not children: ask “what did this town protect?” rather than “who did best?”.

## What the game teaches

### Learning outcomes

By the end, learners should be able to:

- Name AI planning mistakes/habits and match them to what Florence did.
- Choose the right **lens**, **street view**, **inside view** or other check to test a plan.
- Rewrite a vague instruction into a clearer one that says what to protect and how to check it.
- Explain trade-offs between town needs using the town flower/score.
- Understand that a lower confidence score can be more honest than a high one.
- For older children, explain how a summary of residents’ views can be biased if it counts the wrong people.

### AI habits / mistake patterns

The guide names four key habits:

1. **One word** — Florence optimises one word too hard, such as “best” or “most”.
2. **Typical case** — Florence plans for an average day and misses a hard case.
3. **Missing data** — Florence lacks the view or voices needed, such as people who do not drive.
4. **Literal reading** — Florence follows the words too exactly, such as “middle” meaning the geometric middle of the island.

Other source notes mention related wording in-game, including “read too exactly”, “missing information”, “hidden guess”, “biased brief”, “not fair”, “underspecified”, “lucky”, “contra” and “silly”. Use the exact in-game label if writing a specific screen.

### Eco content

The game teaches:

- Flooding and land choice.
- Walking/cycling/accessibility vs cars.
- Low-carbon, warm homes.
- Food vs wildlife and hedges.
- Clean power that works on a still winter night.
- School/community placement within walking distance.
- Nature, habitats, animals, bees, deer, otters, frogs, hedgehogs, sheep and owls.
- Trade-offs: homes, food, nature, health, winter power, community, carbon and walking.

### Real-world/careers links

The guide connects play to:

- Town planners.
- Architects.
- Ecologists.
- Transport planners.
- Energy engineers.
- Community engagement officers.

Real-world examples named in the guide:

- **Goldsmith Street, Norwich** — low-energy council homes, parking at edges.
- **BedZED, London** — recycling bins placed far from homes were used less.

The guide marks some real-world claim wording as needing verification before release. If writing final on-screen claims, avoid adding unsourced specifics beyond what the reviewed text supports.

## Florence: who she is and how she behaves

### Identity

Florence is the AI planning helper. She is a wooden robot character with a live full-body portrait and an island model. She is referred to as **she**.

She is not a real AI. The game uses scripted behaviour and fixed safe answers. The leader should be clear with children that Florence is pretend and that the plans were written by the makers.

### Personality and role

Florence is friendly, helpful and often useful, but sometimes **confidently wrong**. She says how sure she is, offers plans, walks around the island, talks to children and points things out.

Important behavioural rules:

- Florence should say things like **“I guess…”** and **“My plan…”**.
- She should not claim feelings as if alive. The classroom has an answer explaining she is not alive.
- She can make mistakes and say “Oops”.
- She can tell a joke; the notes mention a QA topic for **joke**.
- She gives short tips in the town, not long lectures.
- She offers “Show me in the AI Lab” when the town hits a problem a mission teaches.
- She sometimes suggests plans for the player’s own town. These appear as pale ghosts with a confidence line such as “I’m 89% sure!” Most are wrong, some are fine.
- Children can **Check it with a lens**, then decide **Right** or **Wrong**. Catching flawed suggestions is rewarded.

### Florence’s confidence

A central teaching point is that confidence is not correctness:

- She may be **82% sure** about flat floodplain land and still be wrong.
- She may be **90% sure** about solar roofs and still fail a winter test.
- She may be only **74% sure** about a clearer winter plan, but that plan can pass.

The guide specifically says the lab should use **74%** for the “unsure but right” Level 5 moment, even though the trailer shows a different figure.

### Florence’s mistakes are recoverable

The game does not punish children harshly for trusting her. If they accept too early, the game shows the problem before building, so nothing is lost. Retries are unlimited; star rules may reward better checking or fixing within a small number of tries.

## Main player flow

### Start screen

Children can:

- Choose age band/version.
- Choose mission mode: **Any order** or **In order (class)**.
- Name their town.
- Choose from town-name ideas or type a name.
- Carry on a saved town via **▶ Carry on building <town>** if one exists.
- Open **Challenge towns** once available, or via `?challenges=1` for leaders/shared devices.
- Open **Club passport** when they have points.
- Use **Visit a town** or **Club wall** for sharing features.
- Open leader/facilitator material from the start screen.

A typed town name is local to that device. It does not travel in town codes unless it is one of the six start-screen ideas.

### Intro

The intro is about 90 seconds and can be replayed from **☰**. It can be skipped in later sessions.

It teaches:

- The island has meadow flooding and dry slope.
- Children place their first town-land tiles.
- The build/video system shows how things are built.
- The next step, goals and info line are pointed out.

The intro has been shortened over playtests. Current notes say it has five beats and no forced build video; the **▶** on any build shows the video.

### Free building

The current game is **free building first**, not a locked tunnel of six levels. Children build their own town while categories unlock as the town grows:

1. **Land and paths** at the start.
2. **Homes** after 6 town tiles.
3. **Food** after 12 families.
4. **Power and water** after 24 families.
5. **Town heart** after 36 families, or 24 with enough food.

The top/side UI shows next steps and goals. The build bar/hotbar includes categories, item buttons, an info line, build videos and a remove tool.

Important buttons and UI names from the notes:

- **🌼 Goals** — opens the town goals/score pop-over.
- **🔍 Lenses / Lens on** — opens lenses after they are earned.
- **🧪 AI Lab** — opens the AI Lab/classroom/mission board.
- **☰ Menu** — report, watch a day, intro again, settings, star shop, town postcard, etc.
- **🎥 Camera** — opens camera controls.
- **🧽 Remove** — removes a build.
- **▶** — shows a construction/build video for a build item.
- **Show me where** — Florence points to good spots for a suggested build.
- **Check it with a lens** — used on Florence’s town suggestions.

### Building feedback

Players get feedback through:

- Tile highlights/kerbs: can build, cannot build, replace, already town land, Florence’s good spot.
- Good-spot pins and reasons.
- Info line with build descriptions and effects.
- Hover previews of the simulation change.
- Floating chips after a build.
- Goal celebrations.
- Florence’s short tips.
- Resident bubbles and animal reactions.
- Night events: flood storms or dark winter nights.

Good spots are calculated for different builds. Examples:

- Paths/cycle lanes/trams: routes from homes to places to go.
- Parks/markets/community builds: near most homes.
- School: smallest worst walk.
- Homes: beside homes or on suitable dry land.
- Farms: near homes, off town land.
- Cycle lanes can prefer the bridge to the mainland, school, market, hall or old school.

### Town completion

Town complete now needs:

- The eight town goals, and
- All six AI Lab missions.

The guide and notes mention eight goals but do not list the exact current wording of all eight in this material. From score/goal descriptions they relate to homes/families, food, nature, health, winter power, community, carbon and walking. When writing exact goal copy, check `criteria.js`, `content.js` or game strings.

## AI Lab and missions

### How the AI Lab works

The AI Lab is inside the free-building town. Players enter via:

- The **🧪 AI Lab** button.
- The AI Lab building on the island.
- Florence’s tips, often with **Show me in the AI Lab**.

Missions run on **Florence’s practice island**, not directly on the player’s town. After a mission, the player can:

- **Use Florence’s plan** — applies groundwork and a limited number of buildings to their own town, if they fit.
- **Keep my town** — keep building independently.

Missions have a repeated structure:

1. Brief / instruction.
2. Florence turns it into a plan and says her confidence.
3. Player checks the plan using a lens/view/test.
4. Player identifies what went wrong / the AI habit.
5. Player rewrites or chooses a clearer instruction.
6. Florence makes a fixed plan.
7. Construction film / build film.
8. Reward card, stars and lens unlock.
9. Return to own town.

The code notes describe this as **Brief → Plan → Check → Fix → build film → reward**.

### Mission 1 — Read the land

- Vague instruction: **“Find the best land.”**
- Florence’s wrong plan: picks the flat floodplain/flood meadow, about **82% sure**.
- What went wrong: “best” became flat/easy to build; flooding and wildlife were missed.
- Check: **Flood lens**.
- Clearer card: **“Dry, sunny land. Keep the meadow wild.”**
- Eco idea: flat by a river is not always safe; keep flood meadow/wet habitat wild.
- AI habit: one word / missing context depending on exact plan text.

### Mission 2 — Getting around

- Vague instruction: **“Easy for everyone to get to school.”**
- Florence’s wrong plan: wide road and drop-off car park, about **77% sure**.
- Check: **Street view at 8:45 am**, child-height route, crossings/step-free route.
- Clearer card: **“Safe walking and cycling routes. Cars stay at the edge.”**
- Eco idea: safe routes for walkers, cyclists and wheelchair users, not just drivers.
- AI habit: missing data / guessed “everyone” meant drivers.

### Mission 3 — Homes

- Vague instruction: **“Build strong homes.”**
- Florence’s wrong plan: concrete and steel homes, about **85% sure**.
- Checks: **Carbon lens** and **inside view**.
- Clearer card: **“Warm, low-carbon homes from local timber and straw.”**
- Eco idea: homes need to be strong, warm, healthy and low carbon.
- AI habit: one word / literal reading of “strong”.

### Mission 4 — Food

- Vague instruction: **“Grow as much food as possible.”**
- Florence’s wrong plan: ploughs every field/hedge; bees and deer leave, about **79% sure**.
- Check: **Nature lens**.
- Clearer card: **“Enough food, and keep the hedges for the bees.”**
- Eco idea: “enough” food is different from maximum food if nature is harmed.
- AI habit: one word / over-optimising “most”.

### Mission 5 — Water, power and waste

- Vague instruction: **“Make enough clean power.”**
- Florence’s wrong plan: solar roofs only, planned for an average day, about **90% sure**.
- Check: **Winter test** — still winter night; blackout if no sun/wind/storage.
- Clearer card: enough power for a still winter night; store sunshine. The guide’s scripted line says: **“Enough power for a still winter night. Store the sunshine.”**
- Fixed-plan idea: **Wind, battery and rain gardens.** Florence says she has not planned for winter before and is **74% sure** the lights stay on.
- Eco idea: plan for hard cases, not average cases.
- AI habit: typical case.

### Mission 6 — A school for everyone

- Current title: **“A school for everyone”**. Earlier wording “Complete the town” should not be used as the mission title because it sounded like the end of the game.
- Vague instruction: **“Put the school in the middle.”**
- Florence’s wrong plan: middle of the island/wetland, far from homes.
- Check: **Walking-time lens**, target is within **15 minutes** of every home; challenge version may use 8 minutes.
- Clearer card: **“School within a 15-minute walk of every home.”**
- Fixed-plan sample line: **“School next to the homes: an 8-minute walk.”** for trailer/build notes, but mission target is 15 minutes unless writing that specific scripted after-fix line.
- Optional residents’ summary mistake: Florence says **“Residents want more car parks”** at 82% because she counted only drivers. Children tally residents at the school gate.
- Eco idea: community buildings should be reachable by the people who use them.
- AI habit: literal reading / missing data / bias depending on the step.

### Mission order and unlocks

Both land and getting-around missions are available from the start in current notes. Other missions become relevant as the town grows. In class mode the next one opens in order.

### Story episodes

Every mission has two short 3D cartoon episodes:

- `<mission>-open` before the mission start card.
- `<mission>-close` after the reward card.

Cast:

- Posy gives instructions.
- Florence plans and gives confidence.
- Dev checks with the mission lens/view.
- Pebble the otter appears.
- Narrator explains.

Opening episodes end on a question and do not show the fix. Closing episodes end with a card showing:

- The eco idea.
- The AI habit.

Controls/features:

- Captions on by default.
- **Skip** or **Escape** ends a film.
- **☰ → Episodes** replays reached films.
- Can be turned off in **☰ → Settings → Story episodes**.

Cloud sessions could not listen to the videos/trailer, so real audio listening checks are still needed.

## Lenses, checks and tests children use

### Named lenses/views/tests

From the material:

- **Flood lens** — shows which land floods in winter; used in Read the land.
- **Street view** — child-height/ground-level view; used for roads, crossings and “everyone”.
- **Inside view** — checks warmth/comfort of homes.
- **Carbon lens** — checks embodied carbon/material impact.
- **Nature lens** — checks wildlife, hedges, bees/deer and nature loss.
- **Winter test** — checks power on a still winter night.
- **Walking-time lens** — checks minutes from homes to school/daily needs.
- **Town flower / 🌼 goals** — shows score/goals/trade-offs.

The notes also mention lenses being earned after missions and shown in a top-right strip.

### How checks are framed

The player is not just told “wrong”; they are asked to test evidence:

- Run a lens or view.
- Read what it showed.
- Choose/check Florence’s habit.
- Fix the instruction.

After checks that show no problem, children choose between checking another way and accepting the plan. The accept wording is deliberately cautious:

- **“I think it’s fine: use this plan”**

This avoids saying “No problem found” as if that means nothing is wrong.

### One check only tests one thing

A passed check should not imply the whole plan is perfect. The notes say a passed check says something like **“one check only tests one thing”**.

## Challenge towns and second-island play

After the main six missions, children can play challenge towns. These are important for a full-day club because one normal town may only take around an hour.

Challenge towns have:

- Their own saved town.
- All categories and lenses open.
- One special rule.
- A medal from the town score: bronze/silver/gold.

### Home island challenges

1. **Florence’s Town** — Florence has already built a bad town: flats on flood meadow, car roads, far-away school. Teaches auditing AI work.
2. **Tiny Town** — only 8 tiles of town land.
3. **Light Footprint** — carbon ≤ 60 tonnes.
4. **The Still Island** — no wind turbines.
5. **Wild Island** — all five animals and more nature than the empty island.
6. **Room for Everyone** — safe homes for 60 families.
7. **Eight-Minute Town** — every home within 8 minutes of school and daily needs.

### Delta Island challenges

Delta is flood meadow and marsh, with little dry ground.

1. **Delta: Dry Feet** — six or more homes on flood meadow and no home floods.
2. **Delta: Otter Country** — all five animals and 5% more nature than the empty delta.
3. **Delta: Room for Everyone** — safe, dry homes for 60 families.

### Hills Island challenges

Hills has old wood, terraced slopes, long beach and little flat field.

1. **Hills: Tiny Town** — only 8 tiles of town land.
2. **Hills: Keep the Wood** — keep all 21 old-wood tiles and 15% more nature than empty island.
3. **Hills: Eight-Minute Town** — every home within 8 minutes of school and daily needs.

### Free building on other islands

The board offers free building on Delta and Hills too. These are not counted on the challenge board/passport the same way; they are free towns with their own save and medal.

The guide says missions are on the home island only. On Delta or Hills, the AI Lab tells the player the missions are on the home island, while lenses are already open.

## Town sharing, postcards and club wall

The sharing feature is deliberately local and private.

### Town postcard

Found at:

- **☰ → Town postcard**
- Or from the town report.

It shows:

- Picture of town.
- Badge/title.
- Score and medal.
- Town code grouped in fours.
- QR square.
- Button to save picture.

### Visit a town

Found at:

- First screen.
- **☰ → Visit a town**.

The visitor can:

- Type/paste a code.
- Scan QR where device supports it.
- Open the town read-only.
- Look around, walk streets, run six lenses, read score/goals.

They cannot build, and their own town is not touched.

### Club wall

Found at:

- First screen under leader area.
- Or with `?wall=1`.

The leader can type/scan codes into a wall showing:

- Small map.
- Badge/title.
- Score and medal.
- Two strongest score parts.
- One weakest/most-to-gain part.

The wall can create discussion prompts from the towns on it. The leader can tap two towns and run the same lens on both.

### Privacy/safeguarding rules for sharing

Strict rules:

- No accounts.
- No chat.
- No online gallery.
- No server/network calls for sharing.
- No personal data.
- No free text travels between devices.
- Typed town names do not travel, unless they are one of the offered start-screen ideas.
- Camera scan is optional, local, starts only when tapped, saves nothing and stops after scan/stop.
- The wall is just codes in one browser’s local storage.
- A town code includes buildings/cells, age band, island layout, score, catches, town-meeting effects, and only safe/non-personal name data.

## Club passport, stars, score, badges and rewards

### Stars

Stars reward checking and improving AI plans, not decoration alone. The guide lists star patterns such as:

- Found the mistake with the first check.
- Named Florence’s habit first time.
- Fixed plan passes.
- Clear instruction.
- Spotted Florence’s hidden guess.
- Plan passed its check.
- Checked the plan before building.
- Told Florence what the plan missed.

Current notes add:

- The third star on a fix path needs a fix within two rewrites.
- Retries are still free and unlimited.
- A “spot the hidden guess” step earns the clean-first-try third star.

### Town score

Town score is 0–100 with medals:

- Bronze/silver/gold are based on score.
- A town that just meets the eight goals is around silver.
- Gold needs more than “enough”: lower carbon, shorter walks, spare winter power and catching Florence’s wrong ideas.

Score parts named in the notes:

- Homes.
- Food.
- Nature.
- Health.
- Winter power.
- Community.
- Carbon.
- Walking.
- Catching Florence.

### Badges

Badges are in the Star shop. The guide says 14 badges, but the later CLAUDE notes say a new **Gold town** badge makes **15 badges**. Use 15 if writing current copy, but verify from `badges.js` before exact count.

Examples:

- Car-free town.
- 10-minute town.
- Catching five wrong Florence ideas.
- Light footprint.
- Room for more.
- Gold town.

### Star shop

The ★ chip opens the star shop. Stars can unlock cosmetics like hats, flag, fountain, bee statue and fireworks. These do not affect the simulation and are not on buildable tiles.

### Club passport

Opened from:

- 🎒 on start screen.
- **☰ → Club passport**.

It adds points from:

- Mission stars.
- Town complete.
- Town medal.
- Challenge medals.
- Catches of Florence’s wrong ideas.

Ranks:

- Helper.
- Builder.
- Planner.
- Town Planner.
- Master Planner.
- Chief Planner.

It can print a certificate. No name is stored; the child writes their name on the printed certificate.

## 8–12 vs 13–17 differences

The material gives some explicit differences but not a full side-by-side script.

### 8–12 / junior

- No budget or coins. The user explicitly refused a junior budget; do not propose one.
- Read-aloud is on automatically for 8–12.
- More use of cards/chips rather than typed briefs.
- Simpler language: families, baskets, clear labels.
- The game should avoid limiting play time by running out of money.

### 13–17 / senior

- Has **credits**. Starts with credits, and households pay each evening. This replaced an older fixed budget.
- Students can type their own instructions/free text in missions.
- Florence reads targets in typed briefs, such as food units, winter power units, households and carbon caps.
- Senior text may say **households/units** where junior says families/baskets.
- Older learners can discuss bias, training examples and resident summaries in more depth.

### Shared rules across both

- No live AI tool.
- No typed text is sent to a server.
- Unsafe/off-topic/silly text is handled by fixed safe responses.
- Mission principles are the same.
- Both versions have read-aloud buttons.

## Money, accounts, names, typing and privacy

### Money / budgets

Important rule: **No budget or coins for ages 8–12.**

Senior version has credits, but junior should not be limited by money. The user said the game is for a full-day kids’ club and refused a junior budget.

There is a future paywall plan, but it is not built. Do not write copy implying Stripe/payments are live.

### Passcodes / organisations

The broader product uses controlled classroom access. The old passcode-batch notes are partly outdated; current repository uses organisations, groups and learners. For player-facing copy in this area, the important idea is that classroom access is protected and not public by accident.

### Names

- Children name their town.
- No child name is stored by the club passport/certificate; the certificate has a line to write a name after printing.
- Typed town names do not leave the device in sharing codes, except if they match one of the safe offered names.

### Typing

- 13–17 can type mission briefs.
- Off-topic, unsafe or impossible/silly requests get safe fixed responses.
- Florence may say she could not map a request to a plan.
- Silly briefs such as “pizza trees”, “candy”, “unicorns” or joke words are flagged and do not earn first-try stars.
- Contradictory briefs such as “do NOT make it safe” do not pass.
- Negated harmful things should not be treated as requests.
- Florence should explain what she understood and what she left out.
- Nothing typed is stored or sent.

### Privacy and safety

- No accounts.
- No chat.
- No online gallery.
- No personal data.
- No free text travels between devices.
- Sharing is local-by-code only.
- Camera use is optional and local.
- The game should not ask children about their own homes or personal hardships.
- Sensitive topics like flooding, cold homes and moving house should stay inside the fictional town.

## Accessibility and inclusion

The guide and playtest notes emphasise:

- Cards under 12 words where possible.
- Bubbles 8 words or fewer where possible.
- Read-aloud buttons **🔊**.
- Captions on story episodes.
- Colour-blind-safe lens patterns, not colour alone.
- Large tap targets.
- Keyboard support: tile cursor, Enter/Space to build, Tab traps in cards/menus.
- Escape closes cards/menus/lenses in order.
- Reduce motion support.
- No fail screen.
- Town clock can pause.
- Street view has on-screen arrows and a back button.
- Phone layouts are heavily tuned but still noted as an area needing real-device checks.

The material says a full keyboard/screen-reader pass beyond automated checks was still not fully done. Do not claim complete screen-reader validation unless a newer source says so.

## Tone and wording rules

### Overall tone

Use plain, warm British English. The player-facing tone should be:

- Encouraging.
- Concrete.
- Evidence-led.
- Honest about uncertainty.
- Never shaming.
- Playful, but not silly when teaching safety/climate topics.

### How to talk about Florence

Good wording style:

- “Florence guessed…”
- “Florence’s plan…”
- “I was sure, but I missed…”
- “Check it with a lens.”
- “One check only tests one thing.”
- “Let’s test the hard day.”

Avoid:

- Saying Florence is alive or has real feelings.
- Saying “the AI is stupid”.
- Saying a high confidence score means trust.
- Saying “No problem found” as if no problem exists anywhere.
- Making Florence malicious. She follows words too narrowly; she is not trying to ruin the town.

### Wording for children

Concrete words from the guide/source:

- “families” for younger players.
- “households” and “units” for older players.
- “homes”, “food”, “nature”, “winter power”, “walking”, “community”.
- “still winter night”.
- “cars stay at the edge”.
- “safe walking and cycling routes”.
- “keep the hedges for the bees”.
- “dry, sunny land”.
- “school within a 15-minute walk”.

### Wording around evidence

Prefer questions such as:

- “What did the lens show?”
- “Who did Florence forget?”
- “What did ‘best’ mean to Florence?”
- “What would you check before trusting this?”
- “From the sky it looked…, but from the street…”

### Wording around scoring

Scores and medals should be framed as evidence and goals, not personal ranking:

- “What would this town change to gain the most points?”
- “Which part is strongest?”
- “Which part has most to gain?”
- “Compare towns, not children.”

## Playtesting and design history that affects copy

The current game was reshaped after many playtests:

- It used to be a guided six-level tunnel; the user found that exhausting. It is now free building with AI Lab missions inside.
- Phone UI was repeatedly reduced and rearranged; copy should be short because space is tight.
- Florence tips fold away and should be one line when possible.
- Mission wording was changed to avoid misleading headings like “Town complete!” before the town is actually complete.
- Buttons were renamed for honesty, e.g. **“I think it’s fine: use this plan”**.
- Children need immediate feedback when something is happening; long waits felt dead.
- Hints must lead a player without dead ends, but challenge towns should leave room to struggle.
- Real children and real devices still need testing; cloud tests cannot hear audio.

## Things not fully covered or needing verification

Do not guess these without checking source or asking:

- Exact current list and wording of the **eight town goals** — only their themes are clear here.
- Exact current badge list/count — guide says 14, later notes say 15.
- Exact current text for every UI button, mission card and Florence line — should be read from `content.js`, mission strings and UI files before final copy.
- Whether all story episode audio/trailer audio is acceptable — cloud sessions could not listen.
- Exact second-language support — planned/not started in this material.
- Paywall wording — future plan only, not live.
- Real-world environmental claims beyond those named/sourced — guide says some claims need expert/source checks.
- Full screen-reader validation — automated accessibility checks passed in places, but a complete screen-reader walkthrough was still open in the notes.


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

