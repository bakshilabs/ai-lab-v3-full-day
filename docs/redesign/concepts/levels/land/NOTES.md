# Land (level 1 of 6): notes on the level

These notes were started on 24 November 2026, in the one round of rework that the owner allowed for each level. The first build had no notes file. Every word a child reads in this level is a placeholder.

## What the level is now

The family stands on a wooden lookout beside a river, in a valley where nothing has been built. The child finishes one sentence with a word button and asks Florence once. Florence shows three places for the town, each with three test huts: a raised bank beside the river, a low meadow far from it and a hill far from it. One press of "Make it rain" brings a storm. The river climbs a striped post, spreads over the meadow and puts the lanterns out there, and wears the bank away until one hut tips. The huts on the hill stay lit.

The child then looks closely at each place, chooses one, and marks out the first homes of the town. The rain then comes once more over the child's own town. "Try another plan" moves the same homes to another place and lets it rain on them there. The recap is a tap on the place that stayed dry, and the last picture is the town in the evening.

## What changed in this round

The first build's designer judged the play break thin, and I agreed. In the first build the child put ten identical homes on sixteen identical yellow squares. No square was better or worse than another, so nothing was decided. Most of this round went into that.

**The play break is now a real decision.** Each kind of land has fourteen places for six homes and one town green, and the places are not the same. Some are below the line of mud that the river left, some are at the broken edge of the bank, some are beside a tree, some are beside the path down to the river, and some are high on the hill. Each difference can be seen in the valley before the child chooses.

**The first home is the family's own.** It has a red roof and a yellow door, and a sign says "Your family". The family stands at its door, and it stays there for the rest of the level.

**The people answer.** When a home is placed, the people who live there come to the door and say one short sentence about their place. Glad people wave and bounce. Worried people stand with their arms down, and their sentence has a dashed edge and a small mark, so that it is not told apart by colour.

**A home can be taken back.** Tapping a home that has been placed takes it back, so the child can put it somewhere better. The sample child in the recordings does this once.

**The child's layout is then tested by the river.** When the town is shown, the rain comes once more. Everyone goes indoors first. The lights go out in every home that the water reaches, and a home at the broken edge of the bank tips. Florence's sentence about the town follows what the child did. On the hill she says that the homes at the foot of the hill got wet if the child left any there. On the bank she says that the homes stand back from the edge if the child kept them back.

**The child can look closely before choosing.** After the test, three buttons over the picture take the camera close to each place in turn, with that place's result card under it. "Show all three" brings all three cards back. The far hill was hard to see from the lookout, and this answers that.

**Smaller changes.** The camera of the play break is lower and closer, so the people's faces can be seen. The town is shown from close by, and not from across the river. A path now runs from the hill down to the river. The test huts on the hill are larger. There are three small animals to find by tapping: a frog on the bank, a duck by the water and a rabbit on the hill. The level has sounds of its own for the rain, the river, far thunder, the bank falling and a lantern going out (`sound.js`). The rain grows heavier in three steps as the river rises. The flag colours stay in the band after everything is placed; in the first build Florence said the colour could be changed when the buttons had already gone. "Ask again" now puts the valley back as it was before the rain; in the first build the second test ran on a valley that was already flooded.

**Two repairs for the whole game.** The corner chip already showed 1, which is right for Land, so it stays. When the level is held in a frame with `?next=`, the label in the corner now says "These words are placeholders." and no longer calls it a trial level. Land's last picture never said that it was the end of the trial level.

## Decisions I made, and one I left alone

- The test is still one press. An earlier half-done rework (kept as a record in commit `728640e`) asked the child to tap the cloud twice for more rain. I did not take that over, because the owner's standard for the test is one press.
- The rain that comes over the child's own town has no button. It is part of showing the plan in the town, and it is the same thing that "Try another plan" already showed in the first build. If the owner reads "test once" more strictly than this, it can be taken out of `s.town` in one line, and the play break still stands.
- Nobody stands in or near flood water. The family watches the test from the lookout under an umbrella, and during the second rain every person is indoors.
- **The word button still does not change the result.** The child's word is drawn in the valley as a yellow outline, and Florence repeats it, but she shows the same three places whichever word is chosen. The kit's README says that the child's words must change the result. Whether Land should do so is a question the owner has not answered, so I kept the present behaviour.

## Finishing the round (a second designer, later on 24 November 2026)

The designer who began this round was stopped while it waited for its recordings, so the round was finished by a second designer. I kept everything the first designer changed, because it all worked when I ran it, and I fixed what the new pictures showed.

- **The people's sentences can now be read.** In the first designer's version, what the people at a door say disappeared after eight seconds. It now stays until the child places or takes back the next home, so a slow reader has time for it. Placing the town green clears the last sentence, so that the flag is seen.
- **The far row of the hill and of the bank is no longer under the title.** The camera of the play break on the hill and on the bank now sits a little lower and further back. In the first pictures the family's home on the top of the hill stood right under the title "Mark out the town", and the sign "Your family" was hidden behind it.
- **The town on the meadow and on the bank is seen from closer.** On the meadow the reeds at the water's edge filled the bottom of the picture, so the camera now stands behind them. On the bank, half of the picture was empty river, so the camera now stands nearer to the homes.
- **The small sign that keeps the first result in view** (the kit's sign, during "Try another plan") now sits at the bottom left of the picture, over the river, and not at the top left, where it hid two homes of the bank. This is done in this level's own `index.html`; the kit was not changed.
- **The tag of the far hill** now stands to the right of its test huts. On a screen 1024 wide it overlapped the title of the step.
- **The close look at the meadow** is taken from behind the reeds, which had filled the front of the picture, and from high enough that the three buttons of the look step do not cover the roofs.
- **On the meadow, the camera of the play break is a little lower**, so that what the people of the back row say does not slide under the title, and the sign "The river came up to here" stands further left, clear of the homes. The line of mud along the foot of the hill now runs that far left too.
- **The meter of the river rises with Florence's sentence.** It used to say "over the meadow" while Florence already said that the river was pulling at the bank.
- **While someone speaks, the signs "Your family" and "The river came up to here" step aside**, because they overlapped what the people said. They come back when the child does the next thing.
- **The evening picture has its own view for each kind of land.** On the meadow it had come so close that faces were cut in half.
- **A home at the broken edge of the bank can now be seen to fail.** When the rain comes over the child's own town on the bank, a home at the broken edge used to tilt so slightly, straight towards the camera, that it looked unharmed. It now leans to one side, sinks, and its lights go out, and it stays empty and dark after the rain.
- **Two trees on the meadow were moved**, because they stood in front of the camera in the town on the hill and in the evening picture.
- **The recordings.** The recording script can now hold the storm over the child's town at its highest point until the picture is taken (`s.hold`, used only by `play.mjs`). The machine drew less than one picture each second, and without this the picture "town-rain" showed the town after the rain had already gone. The small counter of pictures each second is now hidden in the pictures.

## What was run, and what was not

The recording machine was shared by about twelve recordings at once during this round and drew less than one picture each second. Opening the page often took longer than the thirty seconds that the kit's helper allows. `record.mjs` in this folder is a copy of the kit's helper that allows ten minutes; the kit was not changed. The recording script now waits for Florence's sentences and for the state of the storm, and not for the clock.

The level was run in the pre-installed Playwright Chromium with the lighting effects on, on two full paths, and every picture was looked at.

- `pictures/hill-1440/` (1440 by 810): the child asks for land that is high up and far away, tests, looks at each place, chooses the far hill, marks out the family's home and five neighbours (taking one home back and putting it somewhere better), places the town green, changes the flag colour, sees the rain over the town, answers the recap and reaches the evening picture. It has 29 pictures, all looked at.
- `pictures/meadow-then-bank-1024/` (1024 by 640): the child asks for land that is far away from the river, chooses the far meadow, marks out the town there, sees the water reach every home, presses "Try another plan", picks the bank beside the river and sees the homes at the broken edge lean and go dark, then goes back to the first plan and finishes. It has 34 pictures, all looked at.
- `framed.mjs` opened the level inside a frame with `?next=Go on`. The label said "These words are placeholders.", the chip said 1, and the last picture had "Play again" and "Go on". Its pictures were looked at and are not kept.

The recording machine was shared with other designers' recordings. For most of the session it drew less than one picture each second; for the final recordings it drew one or two each second, so the names of a few test pictures (for example "test-clouds") show a slightly later moment than the name says. The final runs estimated about 12 minutes for a typical child who tries another plan and 9 to 11 minutes for a fast reader, and these times are only rough because the animations still ran slowly.

Not run: "Ask again" after the test (it was run by the first designer of this round, not by me), the hill and the bank as first choices at 1024, the meadow and the bank as first choices at 1440, tapping the three small animals, the sound, and any real touch or mouse use by a person. The level was never played by a child.

## What still stands in the way

- **The word button does not change the result.** The child's word is drawn in the valley and Florence repeats it, but the three places and their results are the same whichever word is chosen. The kit's README and Astra's accepted feedback say that the child's request must change the result. This needs the owner's answer; one simple way would be for Florence to show her three places nearest to the kind of land the child asked for, so that "high up and far away" gives a higher hill than "far away from the river".
- **The far hill is still seen from the lookout only from a distance.** The close look at the hill shows the dry huts but not the river below them, so "These homes stayed dry" rests on the huts' lights more than on seeing the water stop short.
- **The meadow gives the child no good place.** Every place on the meadow is below the line of mud, so the play break there has differences of comfort (a tree, the path, a puddle) but no safe choice. This is true to the plan, but a child who chose the meadow has less to decide.
- **The second rain over the child's own town has no button.** It is part of showing the plan in the town. If the owner reads "test once" strictly, it can be taken out of `s.town` in one line.
- **What the people say can cover a yellow place behind it** until the child does the next thing. The child can still tap the place, or tap any other place first.
- **The level has not been played with a mouse by a person,** and no child has played it.

## The owner's four questions

These are my answers after finishing the round. They are my own judgement, and I am the second designer of this round.

**Is the level long enough?** Yes. On the recording machine, once it was running at a normal pace, the script estimated about twelve and a half minutes for a typical child who also tries another plan, and about nine to eleven minutes for a fast reader who does not. That is the right length for one of six levels in an hour. The play break is now the longest part, which is right, because it is where the child decides most.

**Does it need more activities or scenes?** It does not need more scenes. It needs one change of substance: the word the child chooses should change what Florence shows, and that waits for the owner. After that, the best addition would be small: letting the child see the river stop below the hill in the close look, so that "stayed dry" is seen and not only told.

**Am I proud of the work?** Mostly, yes. The storm is clear at a glance, the play break is now a real decision with people who answer back, and the child's own town meets the rain, so a careless layout shows. I am not fully proud while the child's word does nothing to the result, and while a child who chooses the meadow has no good place left to choose in the play break.

**Am I impressed by the experience a child gets?** I am impressed by the moment when the river rises, the lanterns on the meadow go out and the bank falls away, and by the moment the homes at the broken edge lean over in the child's own town. I am less impressed by the long look from the lookout at a far hill, and I have only seen the level through recordings, never through a child's hands.
