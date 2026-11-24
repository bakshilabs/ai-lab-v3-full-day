# Homes: notes on the level

Homes is level 3 of 6 in Eco Town. It began as the trial level, and it still lives in this folder, `docs/redesign/concepts/trial/`. Every word in it is a placeholder.

## The one round of rework (24 November 2026)

The owner allowed exactly one round of rework for each level. This is what changed in Homes in that round.

### The level is shorter

- The test makes both materials at the same time. The two meters under "Impact from making it" rise side by side while the trees are cut and the clay is dug, while the wood is sawn and the bricks are baked, and while both are carried to the street. This takes about eight seconds. Before, the sawmill and then the kiln took about fifteen seconds.
- The step in which the child had to tap each of the three sample homes in turn has gone. When the night has come, the three front walls open by themselves and the camera walks slowly past the three homes, so that the child sees who sleeps and who shivers by the heater before any card appears. Each home has a sign that carries its small picture of the insulation, the amount of insulation in words, and "Warm", "A little cold" or "Cold" with a sun, a cloud or a snowflake.
- The play break needs 15 taps for a home with insulation and 11 for the home without. Before, it needed about 25.
- One tap on the yellow plot builds the rest of the street. Before, the child tapped eight plots, or pressed a button.
- The first winter night in the street and the visit to the family's home are now one closing picture. The camera walks along the street at night, and then comes down to the home, whose front wall opens.

### The play break has real decisions

The play break is still about the structure and the enclosure of the home, and the furniture is still only revealed when the front wall opens.

- **Which floor goes in the middle.** After the ground floor, Florence says that two floors come next, one for the living room and one for the bedrooms, and that warm air rises, so the top floor is the warmest. The band shows two parts, "Living room floor" and "Bedroom floor", and no yellow place appears until the child has chosen one. A sign names each room as its floor goes in. When the front wall opens, the rooms are where the child put them, the family sleeps on the floor the child chose, and Florence says what the choice did. In the home with no insulation she says instead that the warm air goes out through the roof, so the top floor does not stay warm. Both answers are good ones, and they give different homes.
- **Whose wall first.** Each of the family stands by one wall of the ground floor and shivers until that wall has its insulation. Florence now asks whose wall the child will do first. This was already in the first build, but nothing told the child that it was a choice.
- **The colour of the roof**, as well as the colour of the door. Both are kept if the child tries another plan.

The child no longer places windows. The first build let the child put two large windows into five yellow places, which went against the owner's decision that the child never decides where windows go. The windows now come with the front wall, always in the same places.

The band under the picture shows only what matters at each moment: the one part that goes in next, or the two floors to choose from, the colours when there is a colour to choose, and a row of boxes called "Parts in place" that fills as the home grows. Before, it showed nine small buttons at once, of which only one could be used.

### Other repairs

- The test button now says "Make the materials", as in the approved wireframes.
- The meter no longer says "Worse for the atmosphere" for brick. The owner has not given the words for brick, and that sentence had been made up by the first build. The brick meter now ends with no statement, and the brick card says only "Making the bricks took the meter to 8 of 10." Timber still ends at the owner's words, "Better for the atmosphere".
- The chip in the corner shows 3, because Homes is level 3.
- When the level is held in the frame of the whole game, the last picture no longer says that it is the end of the trial level. Opened by itself, it still says so.
- If the level is taken straight to its closing picture, which the check of the whole game does, the family's home and the street are put there at once, so the closing picture no longer fails.
- The attic of the home with no insulation is pale inside, like its rooms.
- The signs "Your family" and "Your plot" are hidden during the test, where they used to be cut off by the edge of the picture.
- About fifty placeholder sentences that nothing used any more were removed from `trial.js`.

### The files

- `trial.js` holds the words, the street, the test, the plans and results, and the play break.
- `home.js` is the dollhouse. It gained `setRooms`, which swaps the living room and the bedrooms, and `setRoof`, which changes the colour of the roof.
- `play.mjs` plays the level through and saves the pictures. It is run as `node play.mjs <folder> [width] [height] [side 0 or 1] [middle floor L or B] [plan 0 to 2]`. It now adds `&gate` to the address. With `&gate`, the level stops at a few named moments in the middle of an animation until the script has taken its picture. This was needed because the recording machine was shared by six recordings and drew less than one picture each second, so pictures taken by the clock missed the test altogether. Without `&gate` in the address the level never waits.
- The kit in `../level-kit/` was not changed.

## What was run, and what was not

RUN_SECTION

## What still stands in the way

WEAK_SECTION
