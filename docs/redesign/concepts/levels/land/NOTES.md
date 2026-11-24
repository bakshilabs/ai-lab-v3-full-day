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

## What was run, and what was not

The recording machine was shared by about twelve recordings at once during this round and drew less than one picture each second. Opening the page often took longer than the thirty seconds that the kit's helper allows. `record.mjs` in this folder is a copy of the kit's helper that allows ten minutes; the kit was not changed. The recording script now waits for Florence's sentences and for the state of the storm, and not for the clock.

RESULTS_PLACEHOLDER

## What still stands in the way

STANDS_PLACEHOLDER

## The owner's four questions

ANSWERS_PLACEHOLDER
