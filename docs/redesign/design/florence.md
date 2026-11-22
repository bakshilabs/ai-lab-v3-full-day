# Florence in the Eco Town levels: how she behaves

This document defines how Florence, the AI helper, stands, moves and speaks in the six Eco Town levels of the redesign. It is written for the animated film in `docs/redesign/animation/` first, and for the game later. It does not change anything Florence says. Wherever a line of hers is meant, this document names the field in `docs/redesign/wireframes-data.js` that holds it (for example `scene`, `ui.offers`, `after`).

All sizes are for the film's stage of 1280 by 720 pixels. All frame numbers refer to `docs/redesign/animation/florence-sprite.webp`, which has six columns and five rows, and each cell was rendered at 340 by 440 pixels.

## 1. Who Florence is

Florence is a small wooden robot who loves this town and is good at her job. She is quick, cheerful and steady. She is curious about what the child will decide, and she is more interested in the town and the child than in herself. She offers her plans the way a good colleague puts three drawings on a table: all three are offered with the same care, and then she steps aside so that the child can test them and choose.

That personality has six consequences for her behaviour.

1. **She is always pleased to be here.** Her smile never leaves her face. No frame in the sprite sheet has a frown, a worried brow or a downturned mouth, and none should ever be added.
2. **She moves a little and means it.** She is calm by default. Each gesture she makes answers something that the child did or something that happened in the town. She does not fidget, and she does not wave to fill time.
3. **She looks where the child should look.** When the child is reading, she faces the child. When something happens in the town, she turns to the town. Her head direction is the strongest tool she has for guiding attention.
4. **She treats all three plans the same.** She never looks longer at one plan, never stands nearer to one plan, and never reacts before the results appear. The child must not be able to read the answer from her.
5. **Her feelings are about the town, never about herself.** When a test goes badly for a plan, she is interested in what the town showed. She is not embarrassed, sorry or surprised, because nothing went wrong for her: a test that shows what happens is the game working as intended.
6. **She gives the stage away.** The child's sentence, the test, the results and the town being built are the important things on screen. She is large when she speaks and small when she watches.

## 2. What the sprite sheet contains

I looked at every frame. These notes describe what is really in them, because several decisions below depend on it.

| Frames | What they show |
| --- | --- |
| 0 to 3 | She faces the viewer and breathes. The magnifying glass hangs in the hand on the left of the picture, and the card with three dots is held at her waist on the right of the picture. Her eyes are open. |
| 4 | The arm that holds the card starts to move outwards. |
| 5 | The card is held out to the side at shoulder height, with her eyes open. This looks like "here is my card". |
| 6 | The card is lifted beside her head, with her eyes open. |
| 7 to 17 | The arm waves beside her head, and her eyes are closed in happy curves. |
| 18 | The card is held out at shoulder height again, with her eyes open. |
| 19 | The arm comes down towards the idle pose. |
| 20 | Her body starts to turn, and the magnifying glass is held out flat towards the left of the picture. Her head still faces the viewer. |
| 21 to 28 | Her head and body are turned three quarters towards the left of the picture, and the magnifying glass is held out level. This is the strongest pointing pose. |
| 29 | Her head and body are still turned, and the magnifying glass has been lowered a little. This reads as "watching" more than "pointing". |

Three facts about the sheet matter a great deal.

- **Her mouth never opens.** There is no talking frame.
- **Her eyes are either open or closed in a happy curve.** There is no blink, and the happy eyes only exist with the arm raised.
- **She points towards the left of the picture.** In the film she stands at the bottom left corner, so when she points she points off the edge of the screen, away from the plans.

## 3. Where she stands and how large she is

Florence keeps one home position for the whole film: the bottom left corner. She does not walk about the screen. A child should always know where to find her.

I recommend that she is **mirrored for the whole film** (the sprite is flipped left to right all the time). Mirrored, her pointing pose points to the right, into the screen and towards the plans and the town. She is almost symmetrical, so the flip is not noticeable, and keeping it on all the time means that the magnifying glass and the card never jump from one hand to the other. Apply the flip to the inner element that carries the sprite, and apply every other movement (size, hop, tilt) to the outer element, with the turning point at the middle of her feet. From here on, "points into the screen" and "looks at the town" always mean the mirrored frames.

She has four sizes. The film has only two today (full size, and 52 per cent during the test).

| Size | Height on the stage | When |
| --- | --- | --- |
| Speaking | 277 pixels (as today) | She is saying a line that the child must read: the welcome, the invitation (`scene`), the line that presents the plans (`ui.offers`), and the last line of the film. |
| Beside the child | About 195 pixels (70 per cent) | The child is building the sentence, the child is choosing, and Florence is asking the recap question. She is present and attentive, and the panel or the town is the main thing. |
| Watching | About 145 pixels (52 per cent, as today) | The test is running, the results are appearing, and the chosen plan is being built into the town. The town is the hero. |
| Away | Not shown | The level title card and the coloured wipe between screens. |

Changes of size take 0.4 seconds with a soft ease, as they do today. She should change size before or after a line, and never while her speech bubble is typing.

The steps of a level, in order:

| Step | Size | Which way she faces | Bubble |
| --- | --- | --- | --- |
| Welcome to the town | Speaking | The viewer | `intro`, then `helper` |
| Invitation | Speaking | The viewer | `scene` |
| The child builds the sentence | Beside the child | The viewer, with small leans towards the sentence | None |
| Florence works | Beside the child | The viewer, with her card held up | None |
| Florence presents three plans | Speaking, then shrinks to watching when the line has been read | Into the screen, towards the plans | `ui.offers` |
| The test button is waiting | Watching | The viewer | None |
| The test runs | Watching | The town | None |
| The results appear | Watching | The town | None |
| The child chooses | Beside the child | The viewer | None |
| The plan is built into the town | Watching for the first two seconds, then beside the child while she speaks | The town, then the viewer | `after`, starting two seconds into the build |
| Recap question | Beside the child | Into the screen while she asks, then the viewer | `point[0]` or `askF[0]` |
| Recap answered | Speaking | The viewer | `ui.recapYes` |
| End of the hour | Speaking | The viewer | `ui.breakLine` or `ui.lastLine` |

Two details follow from this table. First, the speech bubble must be attached to her and move with her when she changes size. Today it sits at a fixed place, which only works at full size. Second, at full size the mirrored magnifying glass reaches the right edge of her cell at about the height of the top of the bubble, so the bubble should start about 20 pixels further to the right than it does now, or sit a little lower, so that the glass does not touch it.

## 4. Which frames to use for each moment

The sprite was rendered to play at 9 or 10 frames each second. Do not play it faster than 12, because the wave becomes a blur, and do not hold a single wave frame from 7 to 17 for more than a quarter of a second, because a frozen wave with closed eyes looks odd.

Named sequences, so that the film and the game use the same ones:

- **Breathe:** frames 0, 1, 2, 3, 2, 1 at 3 frames each second. This is what she does when nothing else is asked of her.
- **Hello:** frames 4 to 19 once at 9 frames each second (1.8 seconds). This is a greeting and a goodbye, and nothing else.
- **Card up:** frames 4, 5 at 10 frames each second, then hold frame 5.
- **Card down:** frames 5, 4, 0 at 10 frames each second.
- **Turn to the town:** frames 20, 21, 22, 23 at 10 frames each second.
- **Point:** turn to the town, then hold frame 25. A slow drift through frames 24, 25, 26, 25 at 2 frames each second keeps her alive during a long hold.
- **Watch:** turn to the town, continue through 24 to 29 at 10 frames each second, then hold frame 29.
- **Turn back:** frames 23, 22, 21, 20, 0 at 12 frames each second.
- **Happy:** frames 6, 7, 8, 9, 10, 11, 12, 18, 19 at 10 frames each second (0.9 seconds), with a hop. This is her celebration.

| Moment | Frames, rate and holds | Simple movement added |
| --- | --- | --- |
| Greeting (welcome, and the last line of the film) | Hello once, starting 0.3 seconds before the bubble starts to type. Then breathe. | A hop of 10 pixels on frame 6 as the arm goes up. |
| Invitation at the start of a level | Breathe. From level 2 onwards there is no wave, because she has already said hello. | A tilt of 3 degrees towards the child as the line begins, held for 0.4 seconds. |
| Listening while the child builds the sentence | Breathe. | Each time a word lands in a gap, she tilts 3 degrees towards the sentence for 0.3 seconds and blinks once. The reaction is the same for every word, whichever word it is. |
| The child presses the button that asks her | Card up, starting 0.1 seconds after the press. | A squash of 6 per cent for 0.1 seconds on the press, as if she has been given the job. |
| Working (see section 7) | Hold frame 5 for 1.2 to 1.6 seconds. | The three dots on her card light up one after another. Her antenna glows. |
| Presenting the three plans | Card down (0.3 seconds), then point: frames 20 to 23, hold 25 until the line has been read, then turn back. | A hop of 8 pixels as each of the three plan cards lands, the same size for each. She does not turn or lean towards any one plan. |
| Waiting for the test button | Breathe, facing the viewer. | None. The button has its own pulse, and two things should not ask for attention at once. |
| The child presses the test button | Watch, starting on the press. | A hop of 10 pixels on the press. |
| Watching the test with the child | Hold frame 29 for the whole test. | Slow breathing by size (1 per cent, once every 2 seconds), and a blink every 3 to 5 seconds. She does not gesture during the test. |
| Each result appears | Stay on frame 29. | One nod for every result: a tilt of 2 degrees for 0.25 seconds. The nod is the same for a tick, a dash and a cross. See section 8 for why. |
| The child is choosing | Turn back, then breathe, facing the viewer. | None. She waits. She does not point, lean or look at any plan. |
| The child chooses a plan | Happy, without the hop, starting 0.2 seconds after the tap. | A tilt of 3 degrees. This reaction is identical whichever plan is chosen, because it is for the act of deciding. |
| The plan is built into the town | Watch, and hold frame 29 for the first two seconds. Then turn back and breathe while the bubble shows `after`. | A hop of 8 pixels when the last block lands. |
| "What changed?" (the second try) | Point (hold frame 25) towards the small picture of the first result for 1.5 seconds, then turn back and breathe while the child looks. | A tilt of 3 degrees towards the child when she turns back. The small picture should therefore sit to the right of her, low on the screen. |
| Recap question | Point (hold frame 25) for the first 1.5 seconds of the line, then turn back and breathe, facing the viewer, while the child answers. | None. She must not keep pointing while the child answers a question that says "point to", because her magnifying glass would look like the answer. |
| Recap answered | Happy, with a hop of 14 pixels on frame 6. Then breathe while the bubble shows `ui.recapYes`. | The landing squash described in section 5. |
| End of the hour | Breathe while the jobs appear, then hello once with the last line. | A hop of 10 pixels on frame 6. |

In the game, when the child taps another answer in the recap and Florence gives a hint, she uses the invitation behaviour: breathe, a tilt towards the child, the same smile. There is no shake of the head and no change of face.

## 5. What can be done with the existing frames and simple transforms

Everything in section 4 can be built today. These are the tools and their limits.

- **Mirroring** gives her a direction. Keep it constant, as section 3 says. Do not flip her in the middle of a scene.
- **Hop.** She rises 8 to 14 pixels and comes down in 0.32 seconds. On landing she is 6 per cent wider and 6 per cent shorter for 0.1 seconds, and then returns to normal. A hop is her main way of showing pleasure, because the happy eyes only exist in the wave frames.
- **Tilt.** She leans 2 or 3 degrees about her feet. More than 4 degrees looks like falling over, because she is a stiff wooden figure.
- **Shadow.** Replace the present shadow, which is a hard copy of her whole outline shifted down by 6 pixels, with a flat oval on the ground under her feet (about 120 by 18 pixels at full size, in the ink colour at 25 per cent). During a hop the oval shrinks to 80 per cent and fades slightly. This one change makes her stand in the world and makes the hop readable.
- **Blink overlay.** Two small rounded patches in the colour of her face cover her eyes for 0.1 seconds. The patches need three positions: one for the frames that face the viewer (0 to 6, 18 and 19), one for frame 20, and one for the turned frames (21 to 29). She blinks every 3 to 5 seconds, never during the wave (her eyes are already closed), and always once when she turns her head.
- **Talking.** She has no mouth frames, so do not try to move her mouth. While the bubble is typing, the ball on her antenna glows gently, and she makes one small nod (2 degrees) at the start of each sentence. Remove the present talking movement, which shakes her up and down by 3 pixels about two and a half times each second and reads as trembling. The glow needs the same three positions as the blink. This matches the existing game, where her bulb glows when she talks.
- **Card dots.** A small overlay lights the three dots on her card in turn. It is only used on frame 5, so it needs one position.
- **Reduced motion.** When the device asks for less movement, she holds frame 0 when she faces the viewer and frame 25 or 29 when she faces the town, with no hop, tilt or typing. This matches the `calm` option in `games/ecotown/game/js/home/florence.js`.

### New poses worth making later

The sprite sheet was rendered from the game's own 3D Florence (`games/ecotown/game/js/engine/florence.js`), which already has the gestures `cheer`, `nod`, `peer` and `talk`. New poses are therefore new renders, not new drawings. In order of value:

1. **Watching, turned towards the town, with her arms down and her head lifted a little, in four breathing frames and one blink frame.** She spends more time watching than doing anything else, and today the nearest pose is the end of a point.
2. **A cheer with both arms up and open, happy eyes** (about eight frames). This would separate "well done" from "hello" completely.
3. **Card held up with the dots lit one, two and three** (three frames), to replace the overlay.
4. **Peering through the magnifying glass at something** (about six frames). This is the natural pose for "What changed?" and for the recap, and it uses the prop she already carries.
5. **Two mouth shapes for talking,** facing the viewer and turned (four frames).
6. **A point towards her other side,** so that mirroring is no longer needed.

Poses that should not be made are listed in section 8.

## 6. How her speech bubble behaves

The bubble is the only way a child receives her words in the film, so it is paced for a child of eight who is reading, not for an adult who is skimming.

- **Typing pace.** About 30 letters each second. The film types 48 each second today, which is too fast to follow as it appears.
- **Pauses.** The typing stops for 0.35 seconds after a full stop or a question mark, and for 0.15 seconds after a comma. She nods once as each new sentence starts.
- **How much at once.** The bubble shows at most two sentences, and no more than three lines of text. A longer line is shown in parts: the first part is typed and held, then it clears, and the next part is typed. `intro` has three sentences and needs two parts. The bubble keeps the hidden copy of the text that it has today, so that it is the right size from the first letter and does not grow while it types.
- **Reading time.** After the last letter, the bubble stays for at least 2 seconds, or for 0.4 seconds for every word in it, whichever is longer. In the film today `intro` is about 150 letters in a window of 4.8 seconds, which leaves a child about one second to read thirty words. `after` has the same problem to a smaller degree. The level timings in `film.js` should be worked out from the length of each line and not fixed.
- **When it clears.** In the film it clears when its reading time is over, with the 0.3 second fade it has now. In the game it stays until the child acts, and clears 0.3 seconds after the child's first tap on a word button, a test button or the town. A bubble never disappears while it is still typing, and a new bubble never starts until the old one has gone.
- **No bubble while the town is the hero.** There is no bubble while the test runs or while results appear. The results are sentences on the plan cards, and a bubble would compete with them.
- **Shape and place.** The bubble is attached to her, beside her head, with a small tail that points to her. It moves and scales with her. It never covers the test button, the plan cards or the place the child must tap in the recap.
- **Sound.** If a voice is added later, the typing follows the voice and not the other way round, and the pauses above become the pauses in the recording.

## 7. How she shows that she is working

Between the child's sentence and the three plans there is a short moment when Florence is making the plans. Today the film shows a speech bubble with three dots in it while she stands still. Three dots in a speech bubble mean "I am not sure what to say" in every messaging app a child has seen, so this is the one place where the film suggests hesitation.

She should look busy and capable.

1. She lifts her card (frames 4 and 5, then hold frame 5). The card is her notepad, and it already has three dots on it.
2. The three dots on the card light up one after another, from left to right, once. When the third dot is lit, the work is finished. This is progress with an end, not waiting without one.
3. Her antenna glows steadily while the dots fill.
4. Her eyes stay open and on the child, and her smile stays.
5. The moment always lasts the same time, between 1.2 and 1.6 seconds. A fixed, short time says "this is how long the job takes". A long or uneven time would suggest difficulty.
6. As the third dot lights, she hops once, lowers the card, and turns to point as the first plan appears. The plans arrive as the result of her work.

There is no speech bubble during this moment. In the game, if the plans are ever late, the dots simply fill a second time at the same pace.

## 8. What Florence must never do

These rules come from the owner's decision that the game must not say or suggest that Florence could be wrong, or show how sure she is, and from the rule that Florence suggests and the child decides.

1. **She never shows doubt.** She does not scratch her head, shrug, look up and away, raise one eyebrow, show a question mark, or put three dots in her speech bubble. The existing 3D Florence has a `think` gesture (head tilted, eyes glancing away, brow raised), an `oops` gesture, a `shrug`, and an antenna that droops when she is embarrassed. None of these may be used in the redesign.
2. **She never shows how sure she is.** There is no meter, no stars, no size or colour difference between her plans, and no difference in how eagerly she presents them.
3. **She never gives away the answer.** She does not look at, lean towards, stand beside or point at one plan more than another. She reacts to every result with the same nod, whether it is a tick, a dash or a cross. She does not celebrate before the child has chosen.
4. **She never looks sorry, ashamed or surprised about a result.** A cross beside a plan is something the town showed, and she is interested in it. She does not flinch, droop or cover her eyes.
5. **She never judges the child's choice.** Her reaction to the choice is the same for every plan. She does not shake her head, and she never looks disappointed.
6. **She never chooses, presses or taps for the child.** She does not touch the word buttons, the test button or the plans.
7. **She never competes with the town.** She does not move, wave or speak while the test is running or while results are appearing, apart from breathing, blinking and the small nods.
8. **She never covers what the child needs.** She and her bubble stay out of the plan cards, the test button, the place to tap in the recap, and the part of the town that is changing.
9. **She never waves for no reason.** The wave means hello or goodbye. She does not wave at random to fill time, as she does on the start page.
10. **She never talks over herself.** One bubble at a time, and never a bubble that vanishes before a child could read it.
11. **She never stops smiling, and she never stands completely still for more than five seconds** while she is on screen. Breathing and blinking are always running.

## 9. What is weakest about her in the present film, and the fix for each

This list is in order, with the most damaging problem first.

1. **She points away from the plans.** She stands at the bottom left and the pointing frames point to the left, off the edge of the screen, while the three plans appear to her right. *Fix:* mirror her for the whole film, as section 3 describes.
2. **Her lines cannot be read in the time given.** The bubble types 48 letters each second, and the windows are fixed (4.8 seconds for the three sentences of `intro`). *Fix:* the pace, pauses, parts and reading time in section 6, with the level timings worked out from the length of each line.
3. **She does not watch the test.** While the test runs she faces the viewer and breathes, as if nothing were happening behind her. The child gets no cue to look at the town, and she does not seem to care about it. *Fix:* turn to the town when the child presses the test button and hold frame 29 until the child has to choose.
4. **She does not respond to anything the child does.** The word taps, the press that asks her, the test button, the choice and the tap on the town all pass without any reaction from her except at the very end. She feels like a sticker in the corner. *Fix:* the small tilts, hops and blinks listed in section 4, which all use existing frames.
5. **The working moment looks like hesitation.** It is a speech bubble containing three dots while she stands still. *Fix:* the card and its dots, as section 7 describes, and no bubble.
6. **Her face is frozen.** She has no blink and no sign of speaking apart from a fast shake of 3 pixels, which reads as trembling. *Fix:* the blink overlay, the antenna glow, one nod for each sentence, and remove the shake.
7. **The point settles on its weakest frame.** The code runs frames 20 to 29 and then holds the last one, and frame 29 is the frame where the magnifying glass has already been lowered. For most of the line that presents the plans she is not really pointing. *Fix:* hold frame 25 for pointing, and keep frame 29 for watching.
8. **One gesture carries three meanings.** The wave is used for the welcome, for the right answer in the recap and for the end of the hour. *Fix:* keep the wave for hello and goodbye, and use the shorter happy sequence with a hop for the recap and for the choice.
9. **She has only two sizes, and the bubble is not attached to her.** She is at full size beside the child's sentence panel and during the build, where she should give way, and the bubble has a fixed position. *Fix:* the four sizes and the step table in section 3, with the bubble following her.
10. **Her shadow is a shifted copy of her outline.** It makes her look like a paper cut-out lying on the screen, and not like a figure standing in the world. *Fix:* the flat oval on the ground in section 5.
11. **The breathing does not restart cleanly.** The breathing frames follow the film's clock, and the wave follows the start of the line, so there can be a small jump when one hands over to the other. *Fix:* always start and end a gesture on frame 0 or frame 20, as the named sequences in section 4 do.

## 10. A note on the words

I have not changed or suggested any words. One behaviour point depends on a line, so I record it here for the lead. The town's `helper` line is shown in the welcome, straight after `intro`. Florence should deliver it in exactly the same bright way as the line before it: facing the viewer, breathing, smiling, with no drop in energy and no change of pose. If she looked smaller or more careful during that line, the picture would say something that the owner has ruled out.
