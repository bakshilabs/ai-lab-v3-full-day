
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
  - Town planner: decides where homes, streets and parks should go.
  - Architect: designs homes and schools.
  - Engineer: designs roads, bridges and power lines.

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
  - Drone pilot: flies drones safely.
  - Map maker: uses photographs from the air to draw maps.
  - Bridge inspector: checks bridges and towers for damage.
  - Rescue worker: searches for people who are lost.

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
  - Robot engineer: designs and builds robots.
  - Robot mechanic: keeps robots working and mends them.
  - Farmer: grows food, sometimes with the help of machines.
  - Tester: checks that a machine does its job properly.

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
  - Car engineer: designs cars and the parts that help them see.
  - Transport planner: decides how streets, buses and crossings should work.
  - Test driver: tries out new cars to check that they are safe.
  - Road safety officer: looks for ways to make streets safer.

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
  - Director: decides how a film tells its story.
  - Film editor: chooses which shots to keep and puts them in order.
  - Camera operator: films the shots.
  - Caption writer: adds words to a film for people who cannot hear it.

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
  - Power engineer: keeps electricity flowing to homes.
  - Wind turbine technician: looks after wind turbines.
  - Solar panel fitter: puts solar panels on roofs.
  - Emergency planner: decides what to do when something breaks.

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

