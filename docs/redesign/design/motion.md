# Motion design for the Eco Town levels

This report says how things should move in the six Eco Town levels. It is written for the film of the six levels first, and for the game afterwards. It covers movement only. The layout of the screen belongs to the designer of `docs/redesign/ui/`, and no sentence that a child reads has been written or changed here.

The ready-made curves are in `motion-curves.js` in this folder. Every function in that file takes a time and returns a value, and it keeps nothing between frames, so the film can still draw any frame from a time in seconds.

## How this was studied

I read `film.js`, `town.js`, `eco.js`, `fx.js` and `vox.js`, and I took about 250 pictures of the film at chosen moments: the opening, the whole of level 1, twelve moments of each of the six tests, the building of each level, and the results and the choice in level 5. I also made a copy of the film in a temporary folder and changed only the camera in the copy, to try the framing that is recommended below. Nothing in `docs/redesign/animation/` was changed.

## The ten most important recommendations

1. Make every test end on a picture that is different for each plan and that stays until the child has chosen. At the moment the walkers, the carts, the lorry and the school children disappear or stop, and the three plates look the same as before the test.
2. Give each test three parts: a cause that the child sees start (about one second), the event (about five seconds), and one clear moment for each plan in turn (about one second each), followed by a still second. All six tests can keep their length of 10.5 seconds.
3. Bring the camera much closer when the town is being built, tilt it more steeply and look from the other side. The distance should be about 21 to 26 squares instead of 34 to 50, the tilt 0.82 radians instead of 0.66, and the turn minus 0.30 radians instead of plus 0.34. This removes the neighbouring towns from the picture and makes a new home about three times as large.
4. Let a building drop into place with weight: a fall of 300 milliseconds, a squash, a rebound, dust and a shadow that grows. At the moment it swells up from nothing, like a balloon.
5. Remove the two full-screen curtains inside each level. Carry the chosen plan from the table into the town in one movement, so that the child sees that their choice is what gets built.
6. Make the small actors large enough to read. People, cars, carts, bees and the school bell should be between 1.6 and 2 times their present size during a test, and lit windows need a pool of light on the ground.
7. Show each cause before its effect: a rain cloud slides in before the rain, the shop opens before people leave home, the sun goes down before the lights come on, and the bell swings and sends out rings before the children set off.
8. Reveal the results one plan at a time, 1.2 seconds apart, with the mark stamped after the sentence. At the moment nine sentences arrive in about two seconds in level 5.
9. Keep to a small set of curves and lengths, given below. Nothing that matters should last less than 400 milliseconds, and nothing should stand still for more than 1.2 seconds unless the child is reading.
10. Use effects sparingly: no confetti over the whole screen until the end of the hour, no shake stronger than 3 pixels, and no light that flashes more than three times in a second.

## Ground rules

**The curves.** Six curves are enough for the whole game.

- Things that arrive on the screen slow down as they arrive (`outCubic`).
- Things that leave speed up as they go (`inCubic`), and they pull back slightly first if they are important (`inBack`).
- The camera and the pointer are slow at both ends (`inOutCubic`). The camera never bounces.
- Things that fall speed up all the way down (`inQuad`), because that is how weight looks.
- Things that pop into being use a spring. The ordinary spring (`SPRING.pop`) passes its final size by about one tenth after 210 milliseconds and is still after 400 milliseconds. The lively spring (`SPRING.bouncy`) passes it by one quarter and is still after 620 milliseconds, and it is kept for the test button, the chosen plan and Florence's hop.
- The sky and the light change smoothly (`inOutSine`).

**The lengths.** A press takes 70 milliseconds to go down. A small thing that pops takes 400 milliseconds. A panel that slides in takes 320 milliseconds. A word that flies takes 420 milliseconds. A building takes 820 milliseconds to arrive. A camera move takes between 800 and 1,800 milliseconds.

**Order.** One important thing moves at a time. When several things arrive together they arrive in a row, 80 milliseconds apart, and a long row never takes more than 600 milliseconds altogether.

**Neutral things stay neutral.** A tick bounces a little, a cross gives a small shudder, and a dash simply appears. A plan that did badly is never mocked by the movement.

## The beats of one level

The times are in seconds from the start of a level that has one gap in its sentence. Each further gap adds 2.4 seconds. The level becomes about three seconds longer than in the present film, and all of that is time for reading.

### 1. Arriving at the level (0 to 2.4 seconds)

The camera glides from the place of the last level to the place of this one. It does not cut behind a curtain, because every building site in Eco Town is within ten squares of the last one, and a glide tells the child that this is one town. The move lasts 1,600 milliseconds with `cameraMove`, which also lifts the camera by up to 8 per cent in the middle of a long move.

The level card pops in at 0.2 seconds with the ordinary spring, from 80 per cent of its size. It stays for 1,400 milliseconds. Then it shrinks and flies to the top left corner in 400 milliseconds and becomes the small level label, which lands with a slight overshoot. At the moment the card stands in the middle of the picture for three seconds and hides the town, and the label then fades in as a separate thing.

### 2. The invitation (2.6 to 8.3 seconds)

Florence prepares for 80 milliseconds by crouching to 94 per cent of her height, hops 14 pixels in 300 milliseconds, and lands with a small squash. The speech bubble grows out of her from its lower left corner with the soft spring in 450 milliseconds. The words appear at about 45 letters a second, which is the present speed. The bubble stays for the time the words take to appear and then for 600 milliseconds and 400 milliseconds a word (`readMs`). It leaves in 250 milliseconds by shrinking back towards Florence.

One small thing in the town may move to show the situation, for example a grey cloud that slides towards the river in level 1. It should be one thing only, and it should take two seconds or longer.

### 3. The sentence (8.4 seconds, then 2.4 seconds for each gap)

The sentence panel slides up 48 pixels in 320 milliseconds. The empty gap then swells gently, 1.2 times a second, to show where the word goes.

- The word buttons pop in one after another, 80 milliseconds apart, with the ordinary spring.
- The sample child waits 1.3 seconds. A shorter wait looks as if the child did not think.
- The pointer travels to the word in 450 to 800 milliseconds, depending on the distance (`pointerMs`), and rests there for 150 milliseconds before it presses.
- The button goes down 4 pixels in 70 milliseconds, stays down for 90 milliseconds and springs back (`press`).
- The words that were not chosen fade to 45 per cent and sink 6 pixels in 200 milliseconds. They stay on the screen, because the child may want to compare them.
- The chosen word flies to the gap in 420 milliseconds along an arc 34 pixels high, and it is 8 per cent larger in the middle of the flight (`flyWord`).
- The gap takes the word with a pop from 115 per cent of its size, and six small yellow squares burst from it and are gone in 250 milliseconds.

When the last gap is full, a highlight sweeps along the whole sentence from left to right in 500 milliseconds, so that the child reads it once as a whole. The button for asking Florence then pops in with the lively spring and swells gently until it is pressed.

### 4. Florence thinks (about 1.6 seconds)

When the button is pressed, the sentence panel shrinks towards Florence's chest in 350 milliseconds, as if she takes the sentence in. She leans back about 4 degrees for 150 milliseconds. Three dots then bounce in turn for 1,200 milliseconds: each dot rises 8 pixels and falls in 300 milliseconds, and the dots are 150 milliseconds apart. At the end she hops 18 pixels with the lively spring. The thinking should not last longer than 1.6 seconds, because nothing else is happening.

### 5. The three plans arrive (about 5.6 seconds)

A plain panel in the colour of the sky slides up over the town in 350 milliseconds and becomes the table. This replaces the three-coloured curtain, which at present covers the whole picture with plain cream for about half a second.

The three plates of land drop from above, 350 milliseconds apart, from left to right. Each one falls 9 squares in 380 milliseconds, squashes to 86 per cent of its height for 90 milliseconds, rebounds and settles (`drop`). Eight pieces of dust fly out from under it. The picture shakes by 2 pixels for 180 milliseconds on each landing in the film. At the moment the plates rise from below and overshoot upwards, which makes them look light.

The plan itself, which means the homes, the paths or the school, pops onto its plate 600 milliseconds after the plate lands. The three plans therefore appear 500 milliseconds apart, and the child's eye can go from A to B to C. The name of each plan snaps up from under its plate at the same moment, with the ordinary spring. Florence turns to her pointing pose while this happens.

### 6. The test button and the press (about 2 seconds)

Florence shrinks and steps to the corner, as she does now, but she first leans towards the corner for 120 milliseconds. The test button pops in with the lively spring and then swells gently, 1.2 times a second by 3.5 per cent (`breathe`).

The sample child waits 1.6 seconds and presses. The button goes down 6 pixels in 70 milliseconds. When it is released, two rings spread from it across the table in 600 milliseconds. The present three rings are too heavy: they are up to 16 pixels thick, they last a full second and they hide the plates just as the test begins. The rings should be no thicker than 10 pixels and no stronger than 60 per cent. Each plate hops 0.4 squares as the ring reaches it, which joins the press to the plates.

The button should not fade away while a separate bar fades in at the top. The button itself should travel to the top of the screen in 450 milliseconds, shrinking as it goes, and become the bar that shows how far the test has run.

### 7. The test (10.5 seconds)

The six tests are described second by second in their own section below.

### 8. What happened (about 7 seconds)

The results appear one plan at a time: plan A at once, plan B after 1.2 seconds and plan C after 2.4 seconds. Within a plan the sentences are 200 milliseconds apart. While the results of a plan appear, its plate rises 0.5 squares and repeats the last movement of its test once, for example the water lapping at the homes. This ties each sentence to what the child saw.

Each sentence slides up 12 pixels and fades in over 220 milliseconds. Its mark is stamped 120 milliseconds later. A tick shrinks from 160 per cent to its size in 260 milliseconds with a slight overshoot. A cross is stamped in the same way and then shudders 3 pixels to each side for 160 milliseconds. A dash fades in over 200 milliseconds and does not bounce.

In the film the results should then stay for at least four seconds. In the game the child sets the pace.

### 9. The choice (about 3.5 seconds)

The pointer should go to the plate or to the name of the plan. In the present film it presses in the middle of the result sentences and the sparks cover the words.

- When the pointer arrives, the plate rises 0.3 squares in 200 milliseconds.
- When it is pressed, the plate dips 0.25 squares in 80 milliseconds and then rises 0.8 squares with the lively spring. Its name turns yellow with a pop, and sixteen sparks fly from the name.
- The two other plates slide outwards and down in 500 milliseconds, 80 milliseconds apart, and their results fade in 250 milliseconds.
- The chosen plate moves to the middle of the screen in 600 milliseconds and grows by one quarter. It stays there for 500 milliseconds. This quiet moment is missing at present, and it is the moment at which the child owns the choice.

### 10. The plan goes into the town (0.7 seconds)

The chosen plate shrinks and flies towards the place in the town where it will be built, in 700 milliseconds, speeding up as it goes. The table panel slides down at the same time and shows the town, with the camera already close to the building site. When the plate reaches the site it disappears in a burst of twelve pieces of dust, and the first building drops at that moment.

This needs the table and the town to be drawn in the same picture for 700 milliseconds, which means drawing the town first and the table on top of it without a background. If that is too much work for the film, the second-best answer is the present curtain made shorter: 300 milliseconds to cover, 100 milliseconds covered and 300 milliseconds to uncover.

### 11. Building (about 5.2 seconds) and life afterwards (1.5 seconds)

The section on buildings below gives the detail. When the last piece has landed there is a pause of 500 milliseconds, and then all the new pieces hop one after another, 60 milliseconds apart and 0.2 squares high.

The town should then show the result of the choice at once, for 1.5 seconds: people come out of the new homes, walkers use the new paths, the sawmill turns, the cart sets off, the windows glow at dusk, or the children walk to the school. Most of this exists already. Florence's sentence about the town should stay for the full reading time. In level 1 that sentence has 25 words and needs about 10 seconds after it has appeared, and at present it has about 4.

### 12. The recap (about 7.5 seconds)

The camera pulls back to its working distance in 900 milliseconds and then stands still. The child must never be asked to tap while the camera is moving, because the thing to tap would move under the finger.

The dashed ring that appears on the right place before the tap should go, because it gives the answer away. Instead the pointer travels to the place, presses, and the thing that was tapped answers: it hops 0.4 squares with a squash, and a ring spreads from it. Florence waves, and about 40 pieces of confetti burst from the place that was tapped and are gone in 1.6 seconds. The level's dot at the top fills with its tick, as it does now.

## The camera

### What is wrong now

The camera hardly moves. Each level has one framing and a slow push of 6 to 8 per cent, and the change between levels happens behind a curtain. Level 1 is filmed from 50 squares away, so each of its four new homes is about 40 pixels wide on a picture of 1,280 pixels. In the other levels the camera is 34 to 36 squares away.

The camera also hangs over Studio Bay, the town to the south-east. Its pink and green roofs fill the lower right of every town picture, the towers of Drone City stand along the top, and the striped building of the neighbouring town sits on the right. Eco Town takes up less than half of the picture in which it is being built.

### The framing that was tried

I tried the following settings in a copy of the film, and they worked. Each new home of level 1 became about 120 pixels wide. The roofs of Studio Bay and the towers of Drone City were gone from all six building shots. The edge of the town to the east could still be seen at the right-hand edge in levels 1 to 3, and the haze described below is meant for that.

- The tilt is 0.82 radians (47 degrees) instead of 0.66. A steeper view cuts off the land behind the town, where Drone City stands.
- The turn is minus 0.30 radians instead of plus 0.34. The camera then stands over the water to the south-west of the hill instead of over Studio Bay.
- The point the camera looks at is moved towards the camera by 3 per cent of the distance instead of 15 per cent. With the steeper tilt this puts the subject at about 300 pixels from the top, which is clear of Florence and her speech bubble.
- The working distances are 24.5 squares for level 1, 27.5 for level 2, 26 for level 3, 24.5 for level 4, 31 for level 5 and 23 for level 6. The points looked at are in `CAMERA.levels` in `motion-curves.js`.

These numbers come from one round of pictures and each level will need a little adjusting. In level 5 the turbines stand at the far edge and were cut by the top of the picture at 29 squares, which is why 31 is given. In level 3 the sawmill stands nine squares from the homes, so the recap needs its own framing that holds both.

### The moves in a level

1. At the start of the level the camera glides from the last site to a wide view of the new one, at 1.3 times the working distance, and then eases in to the working distance. The whole move takes 1,600 milliseconds.
2. While the child fills the sentence the camera is still. A slow sideways drift of 0.02 radians is the most that is allowed. The present drift of 0.05 radians continues during the recap, which moves the place the child must tap.
3. When the plan arrives in the town the camera is already at the close distance, which is 0.85 times the working distance, and centred on the site.
4. During the building the camera eases back by 5 per cent, so that the growing group stays inside the picture.
5. For the recap the camera returns to the working distance in 900 milliseconds, and it has been still for at least 600 milliseconds before the child is asked to tap.

Every camera move uses `cameraMove`, lasts at least 800 milliseconds, and has ended before the next one starts. `cameraMs` gives a suitable length for any pair of framings.

### Keeping the neighbours out

The close and steep framing does most of the work, because the ground that the camera sees then lies inside Eco Town. Four more steps help.

- Add a haze in the colour of the sky that begins 6 squares behind the subject and is complete 34 squares behind it, so that anything far away is pale.
- Hide the map's delivery drones during a level. In the pictures a yellow drone flew over the new school at the moment it was built, and another crossed the first homes.
- Hide the map's pylons and wires inside Eco Town during a level. Their dark lines cross the building site in levels 1, 4 and 5.
- In the wide view at the start of a level, keep the neighbouring towns but stop their cars, so that the only things moving are in Eco Town.

## How a building arrives

At the moment each piece grows from nothing to its full size in about 780 milliseconds with an overshoot, and three small white squares drift near it. The eye reads this as a balloon. The dust is too small to see.

One building should arrive in 820 milliseconds, as follows (`drop`).

1. For 120 milliseconds before it falls, a pale outline of its base flashes on the ground and a small shadow appears, at 30 per cent of its final size.
2. It falls 6 squares in 300 milliseconds, speeding up all the way. While it falls it is 8 per cent taller and 4 per cent thinner, and the shadow grows to its full size.
3. It lands and squashes to 80 per cent of its height and 112 per cent of its width in 90 milliseconds. The base stays on the ground.
4. It rebounds to 106 per cent of its height in 170 milliseconds.
5. It settles in 260 milliseconds with one small swing.

Several things follow the landing.

- Eight squares of dust, each 0.28 squares across, shoot outwards along the ground for 1.6 squares in 420 milliseconds and shrink to nothing (`dust`). They have hard edges and one pale colour, which suits the plain blocks.
- The steps of the roof land 40 milliseconds after one another, from the lowest to the highest, each with a small bounce. This uses the stepped roofs to give a clatter.
- Buildings and trees within 2 squares hop 0.08 squares, 60 milliseconds later.
- The window lights 200 milliseconds after the building is still.
- The picture shakes by 2 pixels for the first two landings of a level only. Eight shakes in a row would be unpleasant.

The gaps between buildings shorten like a drum roll: 420 milliseconds before the second, then 380, 350, 310 and so on down to 200 (`dropStart`). Eight homes take about 3 seconds in all.

Flat things are laid and not dropped. Road, path and field squares fall half a square in 220 milliseconds with a slight bounce (`layTile`), in a wave that runs along the road, 30 to 45 milliseconds apart. Level 2 has about 50 squares and level 4 about 70 pieces, so the gap must be chosen to keep the whole building within 5.2 seconds.

When something is replaced, as the first four homes are in level 3, the old building should lift 0.6 squares, fold flat in 250 milliseconds and leave a puff of dust. The new one then drops onto the same spot. At present the old homes shrink away while nobody is looking.

## The six tests, second by second

### What all six need

The times below are in seconds after the press. Four changes apply to all six tests.

- **A lasting difference.** Whatever moves must leave something behind, and it must still be there when the child chooses.
- **One moment for each plan.** The event runs on all three plates together, because one press started it. The decisive moment of each plate is then given its own beat, and at that beat the plate rises 0.5 squares for 500 milliseconds.
- **Larger actors.** A person is about 12 pixels wide at present. People, cars and carts are signs and not models, so they can be 1.6 to 2 times as large during a test.
- **Larger plates.** The three plates fill the width of the picture but only the top 40 per cent of its height, and the lower half is empty. A tilt of 0.85 radians instead of 0.68 makes each plate about a quarter taller. Moving the plates 60 pixels down leaves room above them for clouds and turbines, which at present run into the bar and the level dots.

### Level 1: the button that makes it rain

- **0 to 1.0.** A flat grey cloud slides over each plate from the river side in 600 milliseconds and overshoots slightly. The light dims by about a third. This is the cause, and it is missing at present.
- **0.6 to 1.4.** The rain begins and grows to its full strength in 800 milliseconds. The drops should be blue and half as wide again, because the present thin white drops cannot be seen against the pale sky. Each drop leaves a small pale square on the ground for 120 milliseconds.
- **1.4 to 5.0.** The river rises and spreads across the low land from the river outwards, at about 1.6 squares a second. Each column of water rises in 300 milliseconds. At present one sheet of water appears over the whole low land in a single frame. With a front that travels, the child sees the water reach the homes by the river at about 2.2 seconds, reach the homes on the meadow at about 3.6 seconds, and stop at the foot of the hill at about 5 seconds.
- **5.4, plan A.** The bank under the homes drops in two steps of 200 milliseconds with a few crumbs of sand. The plate shakes slightly. The front homes tip over in 500 milliseconds, speeding up, and rock once.
- **6.6, plan B.** The homes stand in water. Two square ripples spread from each home, 600 milliseconds each, and the lower part of each wall darkens to show how high the water came.
- **7.8, plan C.** The cloud parts above the hill and a pale beam of sun falls on the dry homes. Their windows light.
- **8.4 to 9.2.** The rain eases and the cloud slides away. The water stays at its highest level.
- **9.2 to 10.5.** Nothing moves except the water, which bobs slightly.

At the end the three plates show tipped homes, homes standing in water, and dry homes in the sun.

### Level 2: the button that opens the shops

- **0 to 0.6.** The shop opens on each plate: its awning flips out in 300 milliseconds with an overshoot, and six small squares sparkle at the door.
- **0.6 to 1.4.** One person hops out of each home, 120 milliseconds apart. On plan B the people of the four far homes turn towards the long road, wait 300 milliseconds, and then a car pops up beside the home and the person hops into it. This small hesitation is what explains the car.
- **1.4 to 6.5.** Everyone travels at a steady speed, with the present bobbing step. Each walker leaves a dotted trail in their own colour on the path, one dot every half square. Each car leaves an unbroken grey line.
- **About 5.0, plan A, and about 5.5, plan C.** The walkers arrive. Each one hops once and then stays standing in a row in front of the shop. At present they simply stop.
- **About 7.5, plan B.** The cars arrive last, because the road is the long way round, and park in a row beside the shop. Arriving last is itself part of the answer.
- **7.8 to 9.0.** The trees on each plate hop in a wave, 60 milliseconds apart. Plan A has two trees and the other plans have eight, and the hop lets the eye count them. This is the only sign of the second check in this level, and at present nothing shows it.
- **9.0 to 10.5.** Still.

At the end the child sees coloured dotted trails and a row of people, or grey lines and a row of parked cars.

### Level 3: the button that makes the materials

- **0 to 0.8.** The three works start. The saw spins up in 600 milliseconds, the mouth of the brick oven begins to glow, and the cement works trembles slightly.
- **0.8 to 5.6.** Each works makes one piece every 900 milliseconds, on the same beat: a plank slides out, a brick pops onto the pile, a slab pops out. Equal output on all three plates matters, because it shows that the only difference is the pollution. The sawmill gives off nothing. The brick oven gives off one puff on each beat. The cement works gives off three larger and darker puffs on each beat.
- **The clouds.** Each puff rises quickly at first and slows, and joins a cloud that hangs about 4 squares above the chimney. The cloud must spread sideways and not upwards: at present the cement cloud rises out of the picture and covers the level dots and the bar. The cloud should throw a shadow that darkens its plate as it grows.
- **5.6 to 6.4.** The works slow down and stop.
- **6.4, plan A.** The stack of planks hops and three white squares twinkle in the clear sky above the sawmill.
- **7.4, plan B.** The small cloud settles with a soft squash.
- **8.4, plan C.** The large cloud settles, and its shadow lies across the whole plate.
- **9.0 to 10.5.** The clouds drift slightly and stay until the choice.

At present the clouds have finished growing after about 6.5 seconds and nothing changes for the last 4, and nothing at all happens at the sawmill. The second check of this level is good for all three plans, and it is best left to the result sentences.

### Level 4: the button that takes the food to market

- **0 to 0.6.** The market stall opens: its awning pops and three empty places appear on its counter.
- **0.6 to 1.6.** The food is loaded. On plans A and B three crops hop from the field into the cart, 200 milliseconds apart, and the cart dips at each one. On plan C four boxes hop into the lorry, its door shuts, and the side of the lorry flashes pale blue for 200 milliseconds to show that it is cold.
- **1.6 to 4.2.** The carts travel to the market with a dotted trail. The lorry sets off at the same moment on the long road with a grey line behind it.
- **4.2, plans A and B.** The carts stop with a slight overshoot. The crops hop onto the counter, 200 milliseconds apart, and the stall sparkles. The carts stay.
- **4.8 to 6.0, the wild places.** On plan A the bees circle the field, find nowhere to land, and fly up and out of the picture in a line. At present they leave before the test, while the plan is still appearing, and nobody sees it. On plans B and C the flowers hop in a wave, and two more bees and a bird arrive. Bees must be about twice their present size.
- **8.6, plan C.** The lorry arrives more than four seconds after the carts. It brakes, its door opens, and four brown boxes slide out onto the counter.
- **9.4 to 10.5.** Still.

At the end the child sees a short dotted trail and fresh crops on the counter, or a grey line round the whole plate and boxes on the counter, and a meadow with bees or without them.

### Level 5: the button that keeps the lights on

- **0.5 to 3.0.** A yellow sun slides down behind the back edge of each plate in 2.2 seconds, speeding up. The sky goes from day through a warm peach colour to dark blue. At present it passes through a flat grey at about 2.7 seconds, which looks dull. The solar roofs glint until the sun has gone and then turn dull.
- **2.2 to 3.4.** The families come home. The windows light one home after another, 110 milliseconds apart. Each window pops, and a square pool of warm light appears on the ground in front of the home. The pools matter more than the windows: a window is about 4 pixels wide, so the pool is what the child will see.
- **3.4 to 5.0.** All three plates are lit. Small yellow pulses travel from each source to the homes, one journey every 600 milliseconds: from the turbines on plan B, and from the turbines and the battery on plan C. Plan A has no pulses, because its roofs have no sun.
- **5.0 to 6.6, plan A.** The lights fail. They flicker three times, slowly (`failingLight`), and then go dark one home after another from the far end, 90 milliseconds apart. The pools of light vanish. The present flicker is nearly five flashes a second for two seconds, which is too fast for comfort and for safety.
- **6.6 to 7.6, plan B.** A gust crosses the plate as five white streaks, the turbines speed up for 800 milliseconds, and the pools of light brighten and return. Three birds cross the plate and bend their path round the turbines.
- **7.6 to 8.8, plan C.** Pulses leave the battery and its bars step down from three to two. The lights do not waver. The birds fly straight past, away from the two turbines.
- **8.8 to 10.5.** It stays night. Daylight should return only after the child has chosen, over 800 milliseconds.

At the end one plate is dark and two are lit, and the child has seen where the power of each came from. The rings and sparks of a tap must be white with a dark edge on this level, because the present dark ring cannot be seen against the night.

### Level 6: the button that rings the school bell

- **0 to 1.2.** The bell swings and rings down to rest (`ring`). It is shown at twice its size while it rings, because it is about 10 pixels wide at present and cannot be seen. Three square rings spread from each school, 250 milliseconds apart and 700 milliseconds each. The flag waves.
- **1.0 to 1.8.** One child hops out of each home, 100 milliseconds apart. Where the school is too far, a car pops up beside the home and the child hops in: three cars on plan A, two on plan B and none on plan C.
- **1.8 to 7.0.** The children walk and the cars drive, with trails as in level 2. Each walker who arrives hops once and stays in a row in front of the school. Each car stops at the gate with a small puff and stays there.
- **7.4, plan A.** The three parked cars pulse once.
- **8.2, plan B.** The two parked cars pulse once.
- **9.0, plan C.** All seven children hop one after another, 60 milliseconds apart. This is the largest movement of the test, and it belongs to the plan in which every child walked.
- **9.6 to 10.5.** Still.

At the end the child counts children standing at the school and cars parked at the gate. At present the children and the cars vanish when they arrive, and the three plates end exactly as they began.

## Particles and screen effects

### Worth adding

- Dust at every landing, as described above.
- Dotted trails behind walkers and unbroken lines behind cars, which stay until the choice.
- Blue rain with a mark where each drop lands.
- Square ripples on water.
- Pools of light at night, and pulses that travel from a source of power to the homes.
- Hard-edged puffs of pollution that gather into a cloud with a shadow.
- A burst of six squares when a word lands in its gap or a shop opens.
- Small confetti from the place that was tapped at the end of a level.

### The limits

- Every particle is a square or a block with a hard edge, in a colour that is already in the game. There is no blur and no soft glow, because they would not match the plain blocks and the hard shadows.
- No more than about 150 flat particles and 40 pieces of dust are on the screen at one time.
- A shake is never stronger than 3 pixels or longer than 200 milliseconds, and there are no more than two in a row. The game should have a setting that turns shakes off.
- Nothing flashes more than three times in a second, and the whole picture never flashes.
- Confetti over the whole screen is kept for the end of the hour. At present it falls after every level, which makes the end feel ordinary.
- No effect plays over words while the child is reading them.

## How the child's taps are shown

The film shows a round pointer, and the game will show the same answers under the child's finger without the pointer.

- The pointer travels along a slight curve (`pointerPath`), slow at both ends, in 450 to 800 milliseconds. At present it waits below the picture and can take 1.1 seconds to arrive. It should rest near the place where it will be needed next.
- It arrives at least 150 milliseconds before it presses.
- The press shrinks the pointer to 78 per cent in 70 milliseconds, holds it for 90 milliseconds and lets it spring back.
- Two rings spread from the tap. The first grows from 14 to 58 pixels in 450 milliseconds, and the second follows 120 milliseconds later and is thinner (`tapRing`). The rings are white with a dark edge so that they show on grass, on paper and at night.
- The thing that was tapped answers within 60 milliseconds by going down, and what the tap causes begins within 100 milliseconds of the release. Nothing that a child taps should ever stay still.
- A thing that is waiting to be tapped swells gently. Only one thing on the screen does this at a time.

## Pacing

### Too short at present

- The water of level 1 appears in a single frame.
- The failing lights of level 5 flicker nearly five times a second.
- The bees of level 4 leave in about 700 milliseconds, before the test has started.
- The boxes of level 4 are loaded in under a second and are a few pixels wide.
- The nine result sentences of level 5 arrive within about two seconds.
- Florence's sentence about the finished town stays for about 4 seconds after its 25 words have appeared, and it needs about 10.

### Too long at present

- The level card hides the town for 3 seconds.
- Each of the three curtains in a level takes 1.1 seconds, and the picture is plain cream for about half a second of each.
- The last 2 to 4 seconds of the tests in levels 2, 3, 4 and 6 show nothing new.
- The end of the hour lasts 15 seconds with one camera move.

### The rule

Something that the child must notice lasts at least 400 milliseconds. Something that the child must understand, such as the moment that decides a plan, lasts at least 1,000 milliseconds and is followed by 400 milliseconds in which nothing else starts. No picture stays the same for more than 1.2 seconds unless there are words to read. Words stay for the time they take to appear and then for 600 milliseconds and 400 milliseconds a word.

## The weakest moments of the present film, in order

1. **The tests of levels 2, 4 and 6 end with nothing to see.** The people, the carts and the children vanish or stop, and the plates look as they did before the press. The fix is the trails, the rows of people and parked cars, and the beat for each plan.
2. **The town is too small and too crowded while it is being built.** Level 1 is the worst, at 50 squares away. The fix is the closer, steeper camera that looks from the south-west.
3. **The flood of level 1 is hard to read.** One sheet of water appears at once, the rain cannot be seen, and all three plates end with the same flooded meadow. The fix is the cloud, the blue rain, the water that travels, and the three different endings.
4. **Buildings swell up from nothing.** The fix is the drop with squash, dust and shadow.
5. **The curtains cut the choice off from the town.** The child chooses a plan, the screen goes cream, and a town appears. The fix is to fly the chosen plate into the town.
6. **The results arrive too fast and all together.** The fix is one plan at a time, with the plate rising as its results appear.
7. **The pollution of level 3 leaves the picture.** It covers the bar and the level dots, and the sawmill shows nothing. The fix is a cloud that spreads sideways, a shadow, and equal output from all three works.
8. **The night of level 5 turns on small windows.** The failure of plan A is a fast shimmer of windows 4 pixels wide. The fix is the pools of light, the slow failure and the travelling pulses.
9. **Nothing shows the cause of a test.** The press sends out heavy rings, and then everything happens at once. The fix is the cloud, the shop opening, the sunset and the swinging bell.
10. **The camera does nothing to help.** It is the same picture from the invitation to the recap. The fix is the five moves listed above.
11. **The level card and the level label are two things.** The fix is one card that shrinks into the label.
12. **The recap gives the answer away and the town does not answer the tap.** The fix is to remove the ring that appears beforehand and to make the tapped thing hop.
13. **The pointer comes from off the screen, and it presses on the result sentences.** The fix is a pointer that rests nearby and presses the plate or its name.
14. **Things that belong to the map cross the subject.** A drone flew over the school as it was built, and wires cross three of the building sites. The fix is to hide them during a level.
15. **Florence only bobs.** She has no preparation before she speaks, shrinks or presents. The fix is the small hop, the lean and the bouncing dots. Her character belongs to `florence.md`, and only her movement is covered here.

Two things that I noticed belong to the designer of the screen and not to this report. In level 6 the level label is long enough to run under the bar of the test. In every level the result sentences are set at about 16 pixels, which is small for the most important words on the table.

## Using this in the film

The film already draws each frame from a time, so each beat above can be added as a start time and one of the functions in `motion-curves.js`. A sensible order of work is the camera numbers first, because they change three constants and one table. The drop of the buildings comes next, because it replaces one line in `town.js`. The six tests come after that, one at a time, starting with levels 2 and 6, which gain the most. The flight of the chosen plan into the town comes last, because it is the only change that needs two scenes in one picture.
