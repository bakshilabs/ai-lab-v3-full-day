<!-- Written by OpenAI from: Module: Robot training: its mission list and briefs. -->

# Area notes: Module: Robot training — mission list and briefs

## What this area is

This material defines the **“Robots at work”** module in EcoTown. It is a one-hour module made of **six missions**, each based on a real robot job and one robotics/AI skill.

The module title is the same for both age routes:

- **Title:** “Robots at work”
- **Junior blurb:** “Six robot jobs: sensors, arms, rules, sorting, weeding and rescue.”
- **Senior blurb:** “Sense, think, act: six real robot jobs and the skills behind them.”

The six missions are:

1. **📡 Sense, think, act** — “How any robot works”
2. **🦾 Robot arm** — “Factory and greenhouse arm”
3. **🏥 Hospital rules** — “Hospital delivery robot”
4. **♻️ Recycling sorter** — “Recycling sorter”
5. **🌱 Weeding robot** — “Farm weeding robot”
6. **🌊 Flood rescue** — “Flood rescue robot”

The mission list is deliberately structured so that each mission:

1. Opens with the **real job**.
2. Explains **how to play**.
3. Ends with what the child **can now do**.

This is stated in the comments: “Each mission opens with the real job, then how to play, and ends with what the child can now do.”

## Who plays, and how a teacher or leader runs it

The module has two age routes:

- **Junior:** ages **8–12**, stored as `j`.
- **Senior:** ages **13–17**, stored as `s`.

The code uses different wording and learning outcomes for the two routes, but the six mission topics stay the same.

The material refers to a **leader’s list** through the `stageOf()` function. This generates short progress labels such as:

- “Choosing a mission”
- “Mission 1 of 6, Sense, think, act: reading the job”
- “Mission 3 of 6, Hospital rules: done”
- “All six missions done”

The leader/teacher-facing progress is therefore about which mission the child is in, and whether they are choosing, reading the job, or done.

The module flow:

1. The child starts on a mission map/list via `showMap()`.
2. They choose an open mission.
3. If they are not resuming a half-finished mission, they read the mission brief via `showBrief()`.
4. They play the mission.
5. The module saves progress during and after missions.
6. They see a completion card via `showDone()`.
7. From the completion card they may go to the **next mission** directly.
8. When all six missions are done, the module returns a finished record.

Missions open in order. The first mission is always open. Later missions open when the previous mission is done, and completed missions can be replayed.

The code does not include full teacher instructions, lesson timings, printable guidance, classroom grouping, facilitation prompts, or assessment rubrics beyond the leader-facing stage labels and saved completion record.

## What it teaches

The module teaches robotics and introductory AI concepts through concrete robot jobs.

### Overall curriculum ideas named in the source

The comment in `index.js` says the module covers:

- Sensors and the **sense–think–act loop**.
- A **robot arm program**.
- **Hospital safety rules**.
- A **recycling sorter trained by example**.
- A weeding robot’s **confidence threshold**.
- A flood rescue robot that is **designed, tested and improved**.

### Mission-by-mission skills

#### Mission 1: Sense, think, act

- **Junior skill:** “Sensors, and sense, think, act”
- **Senior skill:** “Sensors and the control loop”

Children learn that robots work by repeating a loop: they sense, think and act. The senior route frames this as a control loop.

#### Mission 2: Robot arm

- **Junior skill:** “Steps, bugs and repeats”
- **Senior skill:** “Sequences, debugging and loops”

Children learn to write a sequence for a robot arm, run it, step through it, spot/fix a bug, and use repeats/loops.

#### Mission 3: Hospital rules

- **Junior skill:** “If … then rules, safety first”
- **Senior skill:** “Conditional rules and priority”

Children learn conditional rules and the importance of rule order/priority, especially where safety matters.

#### Mission 4: Recycling sorter

- **Junior skill:** “Teaching by example, fair tests”
- **Senior skill:** “Training data and unseen tests”

Children learn to train a robot/classifier with labelled examples, then test it fairly on unseen items.

#### Mission 5: Weeding robot

- **Junior skill:** “How sure before it acts”
- **Senior skill:** “Confidence thresholds and costs”

Children learn that a robot may have a confidence score and must only act when it is sure enough. They also learn that some mistakes are worse than others.

#### Mission 6: Flood rescue

- **Junior skill:** “Design, test, improve”
- **Senior skill:** “Design trade-offs and simulation”

Children learn to design a robot for a job, test it in simulation, read failures, and improve the design. Seniors explicitly deal with trade-offs and weight.

## Florence, the AI helper

This area only mentions Florence in one comment:

> “Nothing is typed; Florence's lines are built from fixed words.”

So, in this module:

- Florence appears to be the AI helper or guide.
- Her lines are not free-generated from child input.
- Her lines are assembled from fixed, pre-written words/phrases.
- The child does not type to Florence.

The provided files do **not** show Florence’s actual lines, personality details, visual presentation, or when exactly she speaks. I should not invent those from this material alone. The main constraint for writing her here is: keep her wording fixed, controlled, and not dependent on typed free text.

## Lenses, checks and tests children use

The material does not mention a named “lens” mechanic in these files. It does, however, describe mission-specific checks/tests:

- **Mission 1:** Children match jobs to sensors, then predict a robot’s next action from a sensor reading/rule.
- **Mission 2:** Children use **Run** and **Step** to test the robot arm program and find bugs.
- **Mission 3:** Children press **Test run** and watch/read what happens at each event.
- **Mission 4:** Children test the sorter on things it has **not seen**. Seniors read the misses, add examples, and test again.
- **Mission 5:** Children press **Weed the row** and read a result table, using confidence thresholds.
- **Mission 6:** Children press **Test** in a flooded-street simulation, read where the design failed, then change and test again.

The source names these checks/tests as buttons or actions:

- **Run**
- **Step**
- **Test run**
- **Weed the row**
- **Test**
- **Next mission**

The source also names broad actions like “press,” “tap,” “choose,” “match,” “set,” “read,” and “watch.”

## What children do in each mission

These notes are based on the mission brief strings. The detailed internal mission screens are not in these two files, but the briefs give the intended sequence.

### Mission 1 of 6: 📡 Sense, think, act

- **Use/job label:** “How any robot works”
- **Short name:** “Sense, think, act”

#### Junior real-job brief

“Every robot does three things, over and over: it senses, it thinks, and it acts. Robot engineers choose its sensors first.”

#### Senior real-job brief

“Every robot runs the same loop: sense, think, act. Choosing the right sensors is one of the first jobs of a robotics engineer.”

#### What juniors do

1. “Match each job to the sensor that can do it.”
2. “Then watch a robot sense, think and act, and say what it will do next.”

#### What seniors do

1. “Match each job to the sensor that can do it.”
2. “Then predict the robot’s next move from its sensor reading and its rule, and set the rule yourself.”

#### Completion outcome

- **Junior:** “You can now choose a sensor for a job, and follow a robot’s sense, think, act loop.”
- **Senior:** “You can now choose a sensor by what it can and cannot measure, and trace a robot’s control loop.”

#### Difference between age routes

The junior route is more concrete: choose a sensor and say what the robot will do next. The senior route adds sensor limitations, sensor readings, rules, setting the rule, and the term “control loop.”

### Mission 2 of 6: 🦾 Robot arm

- **Use/job label:** “Factory and greenhouse arm”
- **Short name:** “Robot arm”

#### Junior real-job brief

“In factories and greenhouses, robot arms pick and pack all day. A person writes the steps they follow.”

#### Senior real-job brief

“Robot arms in factories and greenhouses follow programs of positions and grips. Technicians write them, test them and fix them.”

#### What juniors do

1. “Tap the step tiles to write the arm’s program.”
2. “Press Run to watch it. Press Step to go one step at a time.”

#### What seniors do

1. “Tap the step tiles to write the arm’s program. Positions are in centimetres.”
2. “Run it, or step through it to find a bug.”

#### Completion outcome

- **Junior:** “You can now write steps in order, find a wrong step, and use a repeat.”
- **Senior:** “You can now write a sequence with positions, debug it step by step, and use a loop.”

#### Difference between age routes

The junior route uses “steps,” “wrong step,” and “repeat.” The senior route uses more formal programming vocabulary: “sequence,” “positions,” “centimetres,” “debug,” and “loop.”

### Mission 3 of 6: 🏥 Hospital rules

- **Use/job label:** “Hospital delivery robot”
- **Short name:** “Hospital rules”

#### Junior real-job brief

“Some hospitals have robots that carry medicine along the corridors. They follow rules that keep people safe.”

#### Senior real-job brief

“Hospital delivery robots carry medicine and samples along corridors and ride the lifts. Their rules keep people safe.”

#### What juniors do

1. “Choose what the robot does in each case: ‘If this happens, then do that.’”
2. “Press Test run and watch the trip.”

#### What seniors do

1. “Set each ‘if … then’ rule.”
2. “Then put the rules in order: the robot uses the first one that fits.”
3. “Test run the trip and read what happened at each event.”

#### Completion outcome

- **Junior:** “You can now write ‘if … then’ rules for a robot, and put safety first.”
- **Senior:** “You can now write condition and action rules, and order them so the safest one wins.”

#### Difference between age routes

The junior route focuses on simple “If this happens, then do that” choices and safety first. The senior route adds rule priority/order, the idea that the first fitting rule is used, and “condition and action” vocabulary.

### Mission 4 of 6: ♻️ Recycling sorter

- **Use/job label:** “Recycling sorter”
- **Short name:** “Recycling sorter”

#### Junior real-job brief

“Recycling centres use robots with cameras to sort rubbish. People teach them by showing them examples.”

#### Senior real-job brief

“Recycling plants use camera-guided robots to pick and sort waste. They are trained on examples that people have labelled.”

#### What juniors do

1. “Tap a thing, then tap its bin, to show the robot an example.”
2. “Test it on things it has not seen.”
3. “Then show it more.”

#### What seniors do

1. “Tap a thing, then its bin: each one is a labelled example.”
2. “Test on a set it has not seen.”
3. “Read the misses.”
4. “Add examples and test again.”

#### Completion outcome

- **Junior:** “You can now teach a robot with examples, and test it on things it has not seen.”
- **Senior:** “You can now train a classifier by example and test it fairly on unseen things.”

#### Difference between age routes

The junior route says “things,” “bins,” and “teach a robot.” The senior route introduces “labelled example,” “classifier,” “unseen things,” and fair testing.

#### Town result

This mission can leave a **trained recycling robot** in the town as scenery. The exported town object has:

- `kind: 'recycling-robot'`
- `data` from the mission

The robot only appears if the town has a suitable spot. If there is nowhere for it to stand, nothing is drawn.

### Mission 5 of 6: 🌱 Weeding robot

- **Use/job label:** “Farm weeding robot”
- **Short name:** “Weeding robot”

#### Junior real-job brief

“Some farm robots find weeds and pull them out, so farmers need less weedkiller. They must not pull up the crops.”

#### Senior real-job brief

“Weeding robots tell crops from weeds with a camera and act only when they are sure enough. Less weedkiller, fewer lost crops.”

#### What juniors do

1. “Look at how sure the robot is about each plant.”
2. “Then set how sure it must be before it pulls a plant.”
3. “Press Weed the row.”

#### What seniors do

1. “Read the robot’s confidence for each plant.”
2. “Set the threshold it needs before it pulls.”
3. “Weed the row and read the table.”

#### Completion outcome

- **Junior:** “You can now set how sure a robot must be before it acts, when some mistakes are worse than others.”
- **Senior:** “You can now choose a confidence threshold when mistakes have different costs.”

#### Difference between age routes

The junior route uses plain-language “how sure” and emphasizes not making worse mistakes. The senior route uses “confidence,” “threshold,” and “costs.”

### Mission 6 of 6: 🌊 Flood rescue

- **Use/job label:** “Flood rescue robot”
- **Short name:** “Flood rescue”

#### Junior real-job brief

“After a flood, rescue teams send robots where it is not safe for people. Engineers design them, test them and make them better.”

#### Senior real-job brief

“Rescue robots go where it is too dangerous for people, such as a flooded street. Engineers design them, test them in simulation and improve them.”

#### What juniors do

1. “Choose the robot’s body, sensors and battery.”
2. “Press Test to try it in the flooded street.”
3. “Then make it better.”

#### What seniors do

1. “Choose body, sensors, floats and battery.”
2. “Each adds weight.”
3. “Test in the simulation.”
4. “Read where it failed.”
5. “Change it and test again.”

#### Completion outcome

- **Junior:** “You can now design a robot for a job, test it, and make it better.”
- **Senior:** “You can now make design trade-offs, test a design in simulation and improve it.”

#### Difference between age routes

The junior route focuses on designing, testing, and improving. The senior route adds floats, weight, simulation, failure analysis, and trade-offs.

## Mission order, unlocking, replay and saving

The first mission is always open. A later mission opens if:

- the previous mission is done, or
- that mission itself is already done, which allows replay.

A tick after a gap is not trusted. If saved progress says a later mission is done but an earlier mission is not, the later tick is removed.

Progress is saved:

- between visits,
- after every mission,
- inside missions,
- and with half-done mission state.

Each mission can keep its own part-done progress in `parts`. There is also a current mission `cur` with:

- mission number `n`,
- current part `part`,
- data `d`.

Mission 4 has additional saved sorter state:

- `m4`
- `r4`

The recycling sorter state is reset at the start of Mission 4 unless the child is resuming. The comment says: “the next sorter visit starts a new robot with a different tray; the six ticks stay.”

At the end of all six missions:

- the module reports “All six missions done,”
- marks the state as finished,
- increments the play count,
- returns a finished record with a title, lines, picture, and practised skills,
- may return the recycling robot as a town object if Mission 4 produced town data.

The source does not include the wording of the final record title/lines; those are in `record.js`, not provided here.

## 8–12 and 13–17 version differences

The same mission structure is used for both age routes. Differences are mainly in vocabulary, complexity and emphasis.

General pattern:

- **Junior wording** uses concrete, everyday language: “how sure,” “wrong step,” “thing,” “bin,” “show it more,” “make it better.”
- **Senior wording** uses more technical language: “control loop,” “positions in centimetres,” “debugging,” “conditional rules,” “priority,” “labelled example,” “classifier,” “confidence threshold,” “costs,” “trade-offs,” and “simulation.”

Specific added senior concepts:

- Mission 1: sensor limitations, sensor reading, rule setting, control loop.
- Mission 2: positions in centimetres, debugging, loops.
- Mission 3: rule ordering and first matching rule.
- Mission 4: labelled examples, unseen test set, misses, classifier, fair testing.
- Mission 5: confidence threshold and mistake costs.
- Mission 6: floats, weight, design trade-offs, simulation failure analysis.

## Money, names, typing and privacy

The provided material says nothing about money or budgets. No mission brief here mentions coins, costs, buying, rewards, scores, or spending.

The provided material says nothing about children entering names.

The material explicitly says:

- “Nothing is typed.”
- “Florence’s lines are built from fixed words.”

So text input is not part of this module, at least as described here.

Privacy is not directly discussed in the provided files. The code does show saved progress, play counts, done flags, mission summaries, current mission state, sorter state, and town data, but it does not mention personal data, names, free text, accounts, or sharing. I should not claim any wider privacy policy from this material alone.

## Tone and wording style to follow

The mission brief wording is plain, concrete and active. It should feel practical and job-based.

Important tone features:

- Start from a **real-world robot job**.
- Use short sentences.
- Tell the child exactly what to do: “Tap…”, “Press…”, “Choose…”, “Set…”, “Read…”, “Test…”.
- Avoid long explanations before action.
- Use everyday language for juniors.
- Use accurate technical vocabulary for seniors, but still keep it clear.
- Emphasize safety and real consequences where relevant, especially in hospital, weeding and flood rescue missions.
- Frame mistakes as part of testing and improving: find a bug, read misses, read where it failed, change it and test again.
- Avoid typing prompts, open-ended generated chat, or asking children for personal information.

The wording often uses “you can now…” for completion outcomes. That gives children a clear skill statement at the end of a mission.

## Exact mission list data to preserve

When writing mission cards, briefs or lists, these labels are important:

1. **Mission 1 of 6, Sense, think, act**
   - Icon: 📡
   - Use: “How any robot works”
   - Skill junior: “Sensors, and sense, think, act”
   - Skill senior: “Sensors and the control loop”

2. **Mission 2 of 6, Robot arm**
   - Icon: 🦾
   - Use: “Factory and greenhouse arm”
   - Skill junior: “Steps, bugs and repeats”
   - Skill senior: “Sequences, debugging and loops”

3. **Mission 3 of 6, Hospital rules**
   - Icon: 🏥
   - Use: “Hospital delivery robot”
   - Skill junior: “If … then rules, safety first”
   - Skill senior: “Conditional rules and priority”

4. **Mission 4 of 6, Recycling sorter**
   - Icon: ♻️
   - Use: “Recycling sorter”
   - Skill junior: “Teaching by example, fair tests”
   - Skill senior: “Training data and unseen tests”

5. **Mission 5 of 6, Weeding robot**
   - Icon: 🌱
   - Use: “Farm weeding robot”
   - Skill junior: “How sure before it acts”
   - Skill senior: “Confidence thresholds and costs”

6. **Mission 6 of 6, Flood rescue**
   - Icon: 🌊
   - Use: “Flood rescue robot”
   - Skill junior: “Design, test, improve”
   - Skill senior: “Design trade-offs and simulation”

## Material not covered in these files

These files do not provide:

- The actual map screen text from `showMap()`.
- The full mission brief layout from `showBrief()`.
- The done-card layout from `showDone()`.
- Florence’s actual dialogue.
- Mission internals from `m1-ui.js` through `m6-ui.js`.
- The exact final record text from `record.js`.
- Full teacher guide wording.
- Accessibility copy.
- Any named lens system.
- Any scoring, money or reward system.
- Any privacy policy wording.
- Any child-name or typing flow.

So future writing should use these notes as the mission-list and brief foundation, but not assume details that live in the missing files.
