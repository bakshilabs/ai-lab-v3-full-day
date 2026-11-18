
# Area notes: Module “Roads / Self-driving cars” mission list and briefs

## What this area is

This module is an hour-long “Self-driving cars” activity inside Eco Town of the future. It has **six missions**, each framed as a real job connected with autonomous vehicles:

1. **📷 How a self-driving car sees**
2. **🏷 Teaching the car to recognise things**
3. **🚦 Rules of the road**
4. **🧪 Testing in simulation**
5. **🚕 A shared fleet**
6. **🚏 Redesigning the street**

The module opens on a **mission map**. Missions open **in order**. A child can replay any mission that is already finished. The module only counts as finished when all six are done.

Progress is saved after every mission. The saved state keeps:

- which of the six missions are done,
- small result records for missions 1–5,
- mission 6’s street-design state,
- the final street layout for the town.

At the end, the module produces a **take-home record** with:

- a title,
- one line per mission,
- a picture of the street the child designed, if mission 6 has been completed,
- a short list of things the child practised.

The final designed street is also what is left in the town afterwards.

## Who plays and how a teacher / club leader runs it

The source here does not give teacher-facing instructions, group-management notes, timings, classroom setup, discussion prompts, or assessment guidance. What it does show is that the game is designed for children to work through a sequence of six interactive missions, with a helper voice using `say(...)`, opening and closing cards, and a saved record.

The module supports two wording levels:

- `j` / junior: intended for the younger version, described in the prompt as **8–12**.
- senior: intended for the older version, described in the prompt as **13–17**.

The teacher or club leader can rely on the game flow:

1. Mission map opens.
2. The next unlocked mission is offered with a primary button.
3. The child completes the mission.
4. A closing card summarises what they did.
5. The game returns to the mission map.
6. When all six are complete, the child presses **Finish ➜** to see the record.

The material does not say whether children play alone, in pairs, or in teams, and it does not give instructions for whole-class facilitation.

## What it teaches

The module teaches self-driving-car engineering as a chain of practical jobs:

### Mission 1: How a self-driving car sees

Core teaching:

- Self-driving cars use **cameras, radar and lidar**.
- Each sensor has strengths and blind spots.
- Engineers need to know what each sensor can miss, especially people.
- Cars use more than one sensor because no single sensor sees everything.

Junior “now” outcome:

> Say what a camera, radar and lidar can each see, and why cars use more than one.

Senior “now” outcome:

> Explain each sensor’s strengths and limits, and why cars fuse several.

### Mission 2: Teaching the car to recognise things

Core teaching:

- People label many street pictures to train a recognition model.
- Objects include people, cyclists and dogs.
- Difficult “edge cases” matter because the model may get them wrong.

Junior outcome:

> Label pictures for a machine to learn from, and look for the hard ones it will get wrong.

Senior outcome:

> Label training data and hunt for the edge cases a model fails on.

### Mission 3: Rules of the road

Core teaching:

- Engineers translate road rules / the Highway Code into machine behaviour.
- The car needs clear choices about speed, gaps and priority.
- Rules must be testable.

Junior outcome:

> Choose safe speeds and gaps, and say who goes first.

Senior outcome:

> Turn road rules into clear, testable behaviour.

### Mission 4: Testing in simulation

Core teaching:

- Test engineers use computer simulation before real-road testing.
- Simulations let engineers find failures safely.
- Good testing changes one setting / variable at a time.

Junior outcome:

> Test something, find where it fails, and change one thing at a time.

Senior outcome:

> Test a system in simulation and isolate causes by changing one variable at a time.

### Mission 5: A shared fleet

Core teaching:

- Shared self-driving cars need fleet planning.
- Planners choose how many cars there are, where they wait, and where they charge.
- There is a trade-off between passenger waiting time and idle cars / empty driving.

Junior outcome:

> Plan a fleet of shared cars and read waiting times.

Senior outcome:

> Size a fleet and read the trade-off between waiting time and the number of cars.

### Mission 6: Redesigning the street

Core teaching:

- A street changes when shared self-driving cars replace parked private cars.
- Street designers need to mark places where vehicles stop.
- The design must work for passengers, walkers and cyclists.
- The design is tested with numbers.

Junior outcome:

> Design a street for everyone who uses it, and test it with real numbers.

Senior outcome:

> Design a street for every user and test it against measured outcomes.

## Florence / AI helper behaviour

The files do not name the AI helper as **Florence**. They show a helper channel through `say(...)`, but not the character name, appearance, or personality.

What the helper does here:

- On the mission map, she gives status and next-step guidance.
- She uses different wording for junior and senior players.
- She tells the child whether all missions are complete, how many missions are done, and what to do next.

Mission map helper lines include:

- Junior, no missions done: “Six missions with self-driving cars. Each is a real job. Start with mission 1.”
- Senior, no missions done: “Six missions, each a real job with self-driving cars. Start with mission 1.”
- Junior, some done: “`N` of 6 missions done. Carry on with mission `next`.”
- Senior, some done: “`N` of 6 complete. Next: mission `next`.”
- Junior, all done: “All six missions done! Press Finish to see what you made. Or play any mission again.”
- Senior, all done: “All six missions complete. Finish to see the record, or replay any mission.”

No other Florence-specific rules are given in this material.

## Mission map: exact structure and text

The hub heading is the same for both versions:

> Self-driving cars: six missions

Each mission appears as a button in an ordered list. Each button shows:

- mission number,
- icon,
- mission title,
- status.

Statuses:

- **✓ Done**
- **▶ Next**
- **🔒** for locked missions

Accessible labels include:

- “Mission `n`: `title`. Done. Play again.”
- “Mission `n`: `title`. Next.”
- “Mission `n`: `title`. Opens after the mission before it.”

Bottom hint text:

- If no missions are done:
  - Junior: “The missions open one by one.”
  - Senior: “Missions open in order.”
- If at least one mission is done:
  - Junior: “Tap a finished mission to play it again.”
  - Senior: “Select a finished mission to replay it.”

Primary button:

- If not all done:
  - First time: **Start: mission 1 ➜**
  - Later: **Carry on: mission `next` ➜**
- If all done:
  - **Finish ➜**

The code also reports progress to the host context as either:

- “Mission map: next is mission `next`”
- “All six missions done”

## Mission opening briefs

Each mission has three pieces of opening text:

- `job`: why this job matters,
- `how`: what the player will do,
- `now`: what the player should be able to do afterwards.

### Mission 1: “How a self-driving car sees”

Junior job:

> Self-driving cars see with cameras, radar and lidar. Engineers must know what each one misses, or the car could miss a person.

Senior job:

> Autonomous cars sense the street with cameras, radar and lidar. Engineers must know each sensor’s blind spots, because the car is only as safe as what it senses.

Junior how:

> Switch between the three views of the same street, in sun, rain, fog and dark. Tick every sensor that can answer.

Senior how:

> Compare the three sensor views in four conditions, tick every sensor that can answer, then choose the car’s sensor set.

### Mission 2: “Teaching the car to recognise things”

Junior job:

> People label thousands of street pictures so the car learns what a person, a cyclist or a dog looks like.

Senior job:

> Data labellers mark up street images so the car’s recognition model can learn; the hard cases matter most.

Junior how:

> Tap each thing in a picture to box it, then choose its label. Then test the car.

Senior how:

> Box and label each object, train, test on unseen pictures, then find and label the edge cases.

### Mission 3: “Rules of the road”

Junior job:

> Engineers turn the Highway Code into rules the car follows: how fast, how much room, who goes first.

Senior job:

> Engineers translate the Highway Code into behaviour: speeds, gaps and priorities the car follows every time.

Junior how:

> Choose what the car does in six places, then test it.

Senior how:

> Set the behaviour for six situations and test each one.

### Mission 4: “Testing in simulation”

Junior job:

> Test engineers drive the car millions of times in a computer before it goes on a real road.

Senior job:

> Test engineers run the car through millions of simulated miles to find failures safely.

Junior how:

> Run the tests, watch the replay of a failure, change one setting, run again.

Senior how:

> Run the scenarios, review failures, change one setting per run.

### Mission 5: “A shared fleet”

Junior job:

> Transport planners decide how many shared cars a town needs, and where they wait and charge.

Senior job:

> Fleet planners size a shared fleet and choose where it waits and charges, trading waiting time against idle cars.

Junior how:

> Choose the number of cars, where they wait and where they charge. Run the morning and read the numbers.

Senior how:

> Set fleet size, waiting places and charging hub; run the morning; read waits and empty driving.

### Mission 6: “Redesigning the street”

Junior job:

> This is Maple Street. Parked cars fill it all day. Soon shared self-driving cars will run here, and they stop only where the street is marked. Street designers plan those markings, so the street works for everyone.

Senior job:

> Maple Street today: parked cars and a 40-space car park. Shared self-driving cars will stop only where the street is marked. Street designers lay out stops, bays and crossings for passengers, walkers and cyclists.

Junior how:

> Tap the 3D street to put in drop-off points, waiting bays and crossings. Run the morning, then choose what the old car park becomes.

Senior how:

> Place stops, bays and crossings on the 3D street, run the morning, read the numbers, and decide what the car park becomes.

## What children do, step by step

Only the mission briefs and wrapper flow are included here. The detailed screen-by-screen interaction inside each individual mission is in other files that are not part of this material. From this material, the flow is:

### Overall flow

1. Child sees the mission map.
2. Child starts the next unlocked mission with **Start: mission n ➜** or **Carry on: mission n ➜**.
3. Opening card explains:
   - the job,
   - how to do it,
   - what they will know or practise.
4. Child plays that mission.
5. Game records the mission result.
6. Closing card shows one or two summary lines from that mission.
7. Child returns to the mission map.
8. When all six are done, child presses **Finish ➜**.
9. The module returns the final record and, if available, the redesigned street for the town.

### Mission 1 actions from the brief

The child:

1. Switches between **camera**, **radar** and **lidar** views.
2. Looks at the same street in **sun**, **rain**, **fog** and **dark**.
3. Ticks every sensor that can answer.
4. Chooses the car’s sensor set.

Closing summary for mission 1 includes:

- the `m1Line(...)` result line,
- plus either:
  - Junior: “Sensors fitted: camera, radar, lidar.” or whatever sensors are in the chosen kit,
  - Senior: “Coverage gaps left: `number`.”

### Mission 2 actions from the brief

The child:

1. Taps objects in a picture to box them.
2. Chooses labels for them.
3. Trains/tests the car.
4. In the senior version, explicitly tests on unseen pictures and finds/labels edge cases.

The exact object list and detailed UI are not in this material.

### Mission 3 actions from the brief

The child:

1. Chooses what the car does in six places / situations.
2. Sets behaviours about speed, gaps and priority.
3. Tests each one.

The six places are not named in this material.

### Mission 4 actions from the brief

The child:

1. Runs tests / scenarios.
2. Watches or reviews a failure replay.
3. Changes one setting.
4. Runs again.

The design principle is “one change at a time” / “one variable at a time.”

### Mission 5 actions from the brief

The child:

1. Chooses the number of cars.
2. Chooses where cars wait.
3. Chooses where cars charge.
4. Runs the morning.
5. Reads the numbers:
   - waiting times,
   - and in the senior wording, empty driving.

### Mission 6 actions from the brief and wrapper

Before mission 6 opens, the wrapper sets the 3D scene to show Maple Street as it is today unless the child has already designed a street:

- fresh mission 6: old street with parked cars along both kerbs,
- plots set to “full”,
- layout starts as ten empty street sections,
- if replaying after a design exists, it shows the saved layout.

The child:

1. Works on **Maple Street**.
2. Taps / places things on the 3D street:
   - drop-off points,
   - waiting bays,
   - crossings.
3. Runs the morning.
4. Reads the numbers.
5. Chooses what the old car park becomes.
6. The game simulates the result and keeps layout, plots, runs and changes.

The street result is recalculated from saved state using:

- the layout,
- plots / land use,
- number of families in the town,
- extra families from the land choice if applicable,
- a fixed seed of 7,
- junior/senior mode,
- the fleet setting.

The take-home line for mission 6 differs by age level:

- Junior: “Redesigned the street: `x` drop-off point(s), `y` crossing(s), longest wait `time`”
- Senior: a generated street-design line, followed by “crossings marked where people cross” and, if not all crossing places are safe, “(`safe` of `lines` places)”.

## Lenses, checks and tests children use

The files mention these forms of checking/testing:

- **Sensor views** in mission 1:
  - camera,
  - radar,
  - lidar,
  - across sun, rain, fog and dark.
- **Ticking sensors that can answer** in mission 1.
- **Choosing a sensor set** in mission 1 and checking coverage gaps.
- **Boxing and labelling training data** in mission 2.
- **Testing on unseen pictures** and finding **edge cases** in mission 2.
- **Testing behaviours** for six road-rule situations in mission 3.
- **Simulation testing** in mission 4:
  - run scenarios,
  - watch/review failures,
  - change one setting per run.
- **Fleet simulation** in mission 5:
  - run the morning,
  - read waiting times,
  - read empty driving in the senior version.
- **Street simulation** in mission 6:
  - run the morning,
  - read longest wait and other numbers,
  - count drop-off points and crossings,
  - check safe crossings / marked crossing places.

The material does not mention any special “lens” UI by that name beyond the sensor views.

## Junior vs senior wording

The two versions mainly differ in vocabulary, sentence length, and abstraction.

### Junior style

Junior text is more direct and concrete. It uses:

- “Self-driving cars” rather than “Autonomous cars”.
- “People label…” rather than “Data labellers mark up…”.
- “the car learns…” rather than “the recognition model can learn”.
- “hard ones it will get wrong” rather than “edge cases a model fails on”.
- “Choose what the car does…” rather than “Set the behaviour…”.
- “real numbers” rather than “measured outcomes”.
- “Tap” rather than “Select” in the replay hint.

Examples:

- Junior: “Test something, find where it fails, and change one thing at a time.”
- Senior: “Test a system in simulation and isolate causes by changing one variable at a time.”

### Senior style

Senior text uses more technical and professional language:

- autonomous cars,
- sensors’ blind spots,
- fuse several sensors,
- data labellers,
- recognition model,
- edge cases,
- Highway Code into behaviour,
- simulated miles,
- scenarios,
- one variable at a time,
- fleet planners,
- idle cars,
- empty driving,
- measured outcomes.

The senior version also makes trade-offs and system thinking more explicit, especially in missions 5 and 6.

### Same across both

The mission titles are the same. The hub heading is the same. The basic game structure is the same. Both versions treat each mission as a real job.

## Closing cards and records

After a mission is played, the module calls a closing card with mission-specific result lines:

- Mission 1: sensor result line plus sensors fitted / coverage gaps.
- Mission 2: label result line.
- Mission 3: rules result line.
- Mission 4: simulation result line.
- Mission 5: fleet result line.
- Mission 6: street redesign result line.

At the end of the hour, the record title is:

- Junior: **My hour with self-driving cars**
- Senior: **Self-driving cars: six missions**

Practised lines for junior include:

- “telling what a camera, radar and lidar can each see, and labelling pictures for a machine to learn from”
- “turning the Highway Code into rules, and testing a car in `n` computer runs, one change at a time”
- “planning a fleet of `n` cars and reading the waiting times”
- if street mission completed: “designing a street for everyone who uses it, and testing it with numbers”

Practised lines for senior include:

- “comparing sensors and labelling training data, including the edge cases”
- “turning road rules into behaviour and testing it over `n` simulation runs, one change at a time”
- “sizing a shared fleet and reading the trade-off between waiting time and the number of cars”
- if street mission completed: “designing a street for every user and testing it against measured outcomes”, with “over `n` runs” added if relevant.

Each mission record line is clipped to 120 characters.

## Money, names, typing and privacy

This material does **not** mention money or budgets.

This material does **not** mention children typing free text.

This material does **not** mention collecting children’s names.

The saved progress shown here contains game state only:

- booleans for completed missions,
- small result records,
- street layout and plot choices,
- run/change counts.

No personal data is shown in these files. However, there is no explicit privacy policy or privacy-facing wording in this material.

## Tone and wording the designers want

The intended tone is:

- practical,
- calm,
- safety-conscious,
- concrete,
- job-based,
- focused on testing and evidence,
- not magical or overhyped.

The module repeatedly frames tasks as real engineering or planning jobs:

- engineers,
- data labellers,
- test engineers,
- transport planners / fleet planners,
- street designers.

The wording should make clear that self-driving cars are only safe if the system senses, recognises, follows rules, tests failures, and plans streets carefully.

Important wording patterns:

- Use “self-driving cars” for junior; “autonomous cars” can appear in senior.
- Use “camera, radar and lidar” as the sensor trio.
- Emphasise that sensors have limits / blind spots.
- Emphasise edge cases and hard cases in recognition.
- Emphasise clear, testable behaviour for road rules.
- Emphasise simulation as a safe way to find failures.
- Emphasise “one change at a time”.
- Emphasise trade-offs in fleet planning.
- Emphasise streets working for everyone: passengers, walkers and cyclists.
- Prefer measurable outcomes: waits, gaps, crossings, empty driving, safe places.

The game avoids promising that self-driving cars are perfect. It presents them as systems that need careful design, testing and planning.

