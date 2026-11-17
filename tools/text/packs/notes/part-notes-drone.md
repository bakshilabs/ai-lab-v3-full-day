
# Area notes: Module: Drone delivery / Drones at work mission list and briefs

## What this area is

This source defines the **Drones at work** module: a one-hour sequence of **six drone missions**, each based on a real drone job and a real skill. The module is not just delivery: delivery is mission 3 inside the wider “Drones at work” hour.

The six missions are:

1. **Ground school** 📋 — use: **Every flight**
2. **Hand flying** 🎮 — use: **Training**
3. **Delivery** 📦 — use: **Parcels and medicines**
4. **Farm survey** 🗺️ — use: **Mapping**
5. **Inspection** 🔧 — use: **Turbines and bridges**
6. **Search and rescue** 🔦 — use: **Finding people**

The module title and blurb are:

- Title, both age groups: **Drones at work**
- Junior blurb: **Six real drone jobs, from safety checks to search and rescue.**
- Senior blurb: **Six real drone jobs: checks, flying, delivery, mapping, inspection, rescue.**

## Who plays and how it is run

The material implies children play through the hour inside EcoTown, with progress saved between visits. There are two age versions:

- **Junior**: likely 8–12, based on the prompt wording.
- **Senior**: likely 13–17.

The module opens on a **mission map**. Missions open in order. A finished mission can be replayed. The system reports progress as:

- **Drones at work: the mission map (X of 6 done)**
- **Drones at work: all six missions done**

The run loop is:

1. Show the mission map.
2. Child chooses an open mission.
3. Show that mission’s opening brief.
4. Run the mission.
5. Save progress when the mission is finished.
6. Show the closing text / summary lines.
7. Child may go to the next mission, return to the map, or finish if allowed.

The material does **not** describe a teacher dashboard, teacher script, group management, classroom timings beyond “one hour”, or facilitator prompts. It only shows the in-game flow and saved progress.

## Mission order and progress rules

The missions unlock strictly in order:

1. Ground school
2. Hand flying
3. Delivery
4. Farm survey
5. Inspection
6. Search and rescue

A mission is open if all earlier missions are done. The first unfinished mission is the “next mission”. Completed missions can be played again; if replayed, the newest summary replaces the previous one.

Progress state stores:

- `done`: completed mission IDs
- `sum`: summary data for each completed mission
- `m3`: delivery mission’s own saved progress
- `town`: the delivery route kept in the town

If the old delivery-only state exists, it is restored as the delivery mission’s own progress.

## What it teaches

The module teaches practical drone work through six contexts:

### 1. Ground school
Children learn that real drone pilots check the drone, weather and map before flying. They practise pre-flight checking and deciding whether a flight is allowed and safe under the **Drone Code**.

### 2. Hand flying
Children practise flying manually so they can stay in control if wind rises or GPS is lost. Skills include take-off, hover, correcting for wind, flying through hoops at height, and landing gently.

### 3. Delivery
Children learn that some drones already carry parcels and medicines on planned routes. They turn a route into step-by-step instructions a drone can follow by itself, with battery limits in the senior version.

### 4. Farm survey
Children learn how farmers and surveyors fly drones in lines to take many overlapping photos, which a computer joins into one map. They plan survey lines and read crop/farm maps, including plant health in the senior version.

### 5. Inspection
Children learn drones can inspect turbines and bridges so fewer people have to climb high to look for damage. They practise holding safe distance, photographing inspection points, and spotting cracks/damage in images. The senior brief explicitly notes that real inspection pilots need extra Civil Aviation Authority permission.

### 6. Search and rescue
Children learn that search and rescue teams use drones with heat cameras to find lost people, even at night. They choose a camera/sensor, choose a search pattern, identify heat-camera findings, and guide a ground team.

## Florence / AI helper

The supplied files do **not** mention Florence or any AI helper lines. There is no defined helper character, personality, dialogue style, or behaviour in this material. Any Florence wording for this area would need to be created from other design documents or future files, not inferred from this source.

## Lenses, checks, tests and decision tools children use

The material names several checks/tools children use:

- **Drone pre-flight check**: checking each part of the drone.
- **Weather check**: mentioned in the Ground school opening.
- **Map / airspace map**: children read where drones may fly.
- **Drone Code**: senior Ground school asks children to judge five flight plans against it; summary lines also mention judging flight plans against the Drone Code.
- **Fly / do not fly decision**: junior Ground school explicitly asks children to decide this.
- **Wind / crosswind / gusts**: Hand flying tests control in wind.
- **Hoops and landing pad**: Hand flying uses a hoop course and a landing pad.
- **Battery**: Delivery senior and Farm survey senior mention staying within battery.
- **Photo overlap**: Farm survey uses line spacing so photos overlap.
- **Plant health view**: senior Farm survey includes this.
- **Blue frames / inspection points**: Inspection uses blue frames as places to photograph.
- **Safe distance**: Inspection requires keeping away from turbines/bridges; senior says “company’s safe distance”.
- **Damage/crack spotting in photos**: Inspection ends with finding/reporting damage.
- **Camera/sensor choice**: Search and rescue asks children to choose a camera/sensor.
- **Heat camera**: used to identify warm spots and find the walker.
- **Search pattern**: Search and rescue uses patterns; summary names **lines** and **growing squares**.
- **Ground team guidance**: Search and rescue ends by guiding rescuers to the walker.

The files do **not** give detailed scoring rules, pass/fail thresholds, exact checklists, map contents, or the wording of any individual test screens beyond the mission briefs and summary lines.

## What children do, mission by mission

### Mission map / hub

The map/cards are handled by `kit.hub`, `kit.opening`, and `kit.closing`, but the exact button labels and hub text are not in the supplied files. The code does show the possible actions conceptually:

- Pick an open mission.
- Finish the module if finishing is available.
- After a mission, choose **next**, **finish**, or return/stop from the mission chain.

While the mission map and cards are showing, the camera looks over the island. If reduced motion is off, it slowly turns; if reduced motion is on, it stays still.

### 1. Ground school

**Opening / real job:**

> Real drone pilots check the drone, the weather and the map before every flight. Many problems are easier to find on the ground than in the air.

**Junior how-to:**

> Tap each part of the drone to check it. Then decide: fly, or do not fly. After that, read the map of where drones may fly.

**Senior how-to:**

> Check each drone, then decide whether to fly. Then read the airspace map and judge five flight plans against the Drone Code.

**After statement:**

> You can now check a drone before it flies and say whether a flight is allowed and safe.

Likely step flow from this file:

1. Check drone parts.
2. Decide whether the drone should fly or stay grounded.
3. Read an airspace map.
4. Judge flight plans against allowed/safe rules.

The take-home record can mention:

- checked the drone on a number of days
- fixed problems
- kept it grounded once / several times
- judged flight plans

### 2. Hand flying

**Opening / real job:**

> Pilots practise flying by hand, so they stay in control if the wind gets up or the drone loses its GPS signal.

**Junior how-to:**

> Take off, keep the drone still while the wind pushes it, fly through the hoops and land on the pad.

**Senior how-to:**

> Take off, hold a hover against a crosswind, fly a hoop course at different heights, and land gently on the pad.

**After statement:**

> You can now take off, hold a drone steady in the wind and land it gently.

Step flow:

1. Take off.
2. Hold a hover while wind/crosswind pushes the drone.
3. Fly through hoops; senior specifies different heights.
4. Land gently on the pad.

The take-home record can mention:

- number of hoops flown out of total
- whether the landing was gentle/soft
- for senior: wind speed in km/h gusts and landing speed in m/s

### 3. Delivery

**Opening / real job:**

> In some places drones already carry parcels and medicines, on routes that are planned before they fly.

**Junior how-to:**

> Fly a parcel by hand first. Then write the route as steps, so the drone can fly it by itself.

**Senior how-to:**

> Fly one delivery by hand. Then write the route as steps the drone follows by itself, within its battery.

**After statement:**

> You can now turn a route into steps a drone can follow by itself.

Step flow:

1. Fly a parcel delivery manually.
2. Write the delivery route as steps.
3. Watch or run the drone flying the route by itself.
4. Senior version must keep the route within battery.

The code says the delivery route can be kept in the town afterwards: a large drone flies back and forth along the steps the child wrote, if the route still exists in the town.

The take-home line is pulled from the delivery mission’s own summary if present, otherwise:

> Delivery: planned a route as steps and watched the drone fly it.

### 4. Farm survey

**Opening / real job:**

> Farmers and surveyors fly drones up and down in lines, taking hundreds of photos that a computer joins into one map.

**Junior how-to:**

> Choose how far apart the lines are, so the photos overlap. Then look at the map and find what the farmer needs to know.

**Senior how-to:**

> Plan a survey pattern with enough overlap and within the battery. Then read the map, including the plant health view.

**After statement:**

> You can now plan a survey so the photos overlap, and read a map made from the air.

Step flow:

1. Choose spacing between survey lines.
2. Make sure the photos overlap.
3. Senior: make sure the plan is within battery.
4. Read the resulting map.
5. Junior summary says they find the dry field and the sick crop.
6. Senior summary specifically says they find the sick crop and may use overlap percentages.

The take-home record can mention:

- number of survey lines
- percentage side overlap
- percentage along/front overlap if available
- within battery
- finding the sick crop / dry field

### 5. Inspection

**Opening / real job:**

> Inspectors fly drones close to wind turbines and bridges, so fewer people have to climb up high to look for damage.

**Junior how-to:**

> Fly to each blue frame and hold the drone still to take a photo. Do not go too close. Then find the crack in the photos.

**Senior how-to:**

> Photograph each inspection point while keeping the company's safe distance, then find the damage and decide what to report. (Real inspection pilots hold extra permission from the Civil Aviation Authority.)

**After statement:**

> You can now fly a careful inspection, keep a safe distance and spot damage in photos.

Step flow:

1. Fly to each blue frame / inspection point.
2. Hold the drone still to take photos.
3. Keep safe distance / do not go too close.
4. Inspect a wind turbine and a bridge.
5. Find the crack/damage in photos.
6. Senior: decide what to report.

Take-home can mention:

- number of photos
- turbine and bridge
- safe distance, unless the summary indicates they went too close
- cracks/damage found

### 6. Search and rescue

**Opening / real job:**

> Search and rescue teams fly drones with heat cameras to find people who are lost, even at night.

**Junior how-to:**

> Choose a camera, choose a way to search, check each warm spot, then guide the rescue team to the walker.

**Senior how-to:**

> Choose the sensor, choose a search pattern, identify what the heat camera finds, then guide the ground team.

**After statement:**

> You can now choose the right camera for a search, search in a pattern and help a team on the ground.

Step flow:

1. Choose a camera/sensor.
2. Choose a search pattern.
3. Use a heat camera to check warm spots.
4. Identify what the heat camera has found.
5. Find the walker.
6. Guide the rescue/ground team to the walker.

Named search patterns in the summary are:

- **lines**
- **growing squares**

Senior take-home may mention the number of searches and the ground-team path distance in metres.

## Differences between 8–12 and 13–17 versions

The junior and senior versions share the same mission titles, real-world openings, and “after” learning statements. Differences are mainly in the “how” instructions and the take-home wording.

### General pattern

Junior wording is simpler and more concrete:

- “Tap each part”
- “fly, or do not fly”
- “keep the drone still while the wind pushes it”
- “choose how far apart the lines are”
- “check each warm spot”

Senior wording uses more technical language and adds constraints:

- “airspace map”
- “judge five flight plans against the Drone Code”
- “crosswind”
- “different heights”
- “within its battery”
- “plant health view”
- “company’s safe distance”
- “Civil Aviation Authority”
- “sensor”
- “search pattern”

### Mission-by-mission age differences

- **Ground school**: Junior taps drone parts and decides “fly, or do not fly”; senior checks drones, reads the airspace map, and judges five flight plans against the Drone Code.
- **Hand flying**: Junior keeps the drone still while wind pushes it; senior holds a hover against a crosswind and flies at different heights.
- **Delivery**: Junior writes route steps after flying by hand; senior also has to keep the route within battery.
- **Farm survey**: Junior chooses line spacing for overlap and finds what the farmer needs; senior plans enough overlap within battery and reads the plant health view.
- **Inspection**: Junior uses blue frames and finds a crack; senior photographs inspection points, keeps the company’s safe distance, decides what to report, and is told about CAA permission.
- **Search and rescue**: Junior chooses a camera and checks warm spots; senior chooses a sensor, chooses a search pattern, identifies heat-camera results, and guides the ground team.

## Take-home record

When the module finishes, it returns a record called:

**My hour of drones at work**

It contains up to six “made” lines, one per completed mission, and up to four “You practised…” lines. Long lines are truncated at 120 characters.

The picture for the take-home page is an SVG titled:

**Drones at work: six missions**

It shows six small mission badges, one per mission, with a tick on completed missions.

### Possible “You practised…” lines

Depending on completed missions, the record says the child practised things like:

- checking a drone before flight, judging flights against the Drone Code and flying by hand in the wind
- checking a drone before flight and judging flights against the Drone Code
- flying a drone by hand in the wind and landing it gently
- turning a delivery route into steps a drone can follow by itself
- planning an overlapping survey, reading a crop map and inspecting a turbine and a bridge from a safe distance
- planning an overlapping survey and reading a crop map
- inspecting a turbine and a bridge from a safe distance and finding the damage
- searching with a heat camera in a pattern and guiding a rescue team on the ground

## Delivery route in the town

The delivery mission can create a town object:

- kind: **drone-route**
- data: the route information

If the route still exists in the town, a large drone is shown flying there and back along the steps the child wrote. If the place is gone, nothing is drawn.

## Money, names, typing and privacy

The supplied files do **not** mention money, points, budgets, personal names, account details, typing free text, uploads, sharing, or privacy rules.

The delivery mission says children “write the route as steps”, but this material does not show whether that means typing, selecting commands, dragging blocks, tapping arrows, or another interface. Do not assume free typing from these files alone.

## Tone and wording guidance visible in this material

The tone is practical, realistic and encouraging. It links every task to a real drone job and explains why the skill matters.

Important wording patterns:

- Use plain, direct verbs: **check**, **tap**, **choose**, **fly**, **hold**, **land**, **plan**, **read**, **find**, **guide**.
- Use real-world context without overclaiming: “In some places drones already carry parcels and medicines…”
- Keep safety central: checks before flight, weather and map checks, safe/allowed flights, safe distance, grounding the drone when needed.
- Explain purpose, not just mechanics: “Many problems are easier to find on the ground than in the air.”
- Avoid fantasy framing. These are real jobs: delivery, mapping, inspection, rescue.
- Use child-friendly technical language, scaled by age.
- Senior copy can include official/regulatory terms when relevant, e.g. **Drone Code**, **Civil Aviation Authority**, **airspace map**.
- The “after” lines say “You can now…” and describe the new practical capability.
- The take-home record says what the child did or practised, not abstract claims about intelligence or talent.

## Text that is present vs missing

Present in this material:

- Module title and blurb.
- Mission IDs, icons, titles and uses.
- Opening briefs for all six missions.
- Junior and senior “how to play” briefs for all six missions.
- “After” learning statements for all six missions.
- Progress/unlock rules.
- Take-home record wording and picture labels.
- Some stage/report strings.

Not present in this material:

- Exact mission map screen copy.
- Exact button labels on mission cards, closing cards, or finish/next controls.
- Florence/AI helper copy or behaviour.
- Detailed UI wording inside each mission.
- Scoring, failure, feedback, hints, or error messages.
- Teacher-facing guidance.
- Money/budget mechanics.
- Names/privacy/typing rules.

