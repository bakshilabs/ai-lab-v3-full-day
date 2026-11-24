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
- `play.mjs` plays the level through and saves the pictures. It is run as `node play.mjs <folder> [width] [height] [side 0 or 1] [middle floor L or B] [plan 0 to 2]`. It tells the browser to wait up to five minutes for the page and for the level to appear, because the kit's helper allows only half a minute and the shared machine sometimes needs longer. It now adds `&gate` to the address. With `&gate`, the level stops at a few named moments in the middle of an animation until the script has taken its picture. This was needed because the recording machine was shared by six recordings and drew less than one picture each second, so pictures taken by the clock missed the test altogether. Without `&gate` in the address the level never waits.
- The kit in `../level-kit/` was not changed.

## What was run, and what was not

The designer who began this round was stopped before any of its changes had been confirmed by a finished recording. A second designer finished the round on the same day. It played the level through from start to finish four times, and every run reached the last closing picture with no error from the page.

- The good plan at 1440 by 810: the sunny side, the living room chosen for the middle floor, the timber home with a lot of insulation, then "Try another plan" with the brick home and back to the first plan, and the recap answered with the wrong side, to show that it does not block. The pictures are in `pictures/sunny-timber-lot-1440/`.
- Another plan at 1024 by 640: the shady side, the bedrooms chosen for the middle floor, the brick home with some insulation, then "Try another plan" with the timber home with no insulation and back to the first plan, and the recap answered with the right side. The pictures are in `pictures/shady-brick-1024/`.
- The folder `pictures/sunny-timber-none-1440/` held pictures of the first build, which no longer match the level, and it was removed. The older folders whose names begin with `before-and-after` are kept as a record of earlier owner decisions.
- Two earlier runs of the same two paths found the faults listed below, which were then repaired before the two recordings above were made.
- The level was also opened inside a frame with `?next=Go on`, as the whole game opens it, and taken straight to its closing picture with `window.trial.end()`. The chip showed 3, the last picture did not say that the trial level had ended, the buttons were "Play again" and "Go on", and the page told the frame that the level had ended.

Every picture of both recordings was looked at in full. These faults were found in the earlier runs and repaired:

- The tags of the three plans overlapped at 1024 by 768, so that "Timber home" on the first tag was hidden. They now stand further apart. The sign "Brick kiln" was cut off by the right edge of the picture on the shady side, and now stands a little further in.
- On the results, the edges of the signs under the open homes and of the sign "Brick kiln" showed between the cards. They are now hidden while the cards are up, because the cards say the same.
- The signs "Living room" and "Bedrooms" stayed over the home after the front wall had closed it, where the rooms cannot be seen. They now go when the front wall goes on, and they stand a little lower, inside their rooms.
- In the closing picture of a warm home, the sign "Warm" was hidden under the band when the camera came close to the beds. It now stands above the beds.

These were not run: the third plan on either side (the timber home with no insulation was seen only as the second try, and never through its own play break, which is shorter because it has no insulation); "Ask again"; closing and opening the front wall a second time; the whole game played by hand from Land to School; and any real Windows computer. The recording machine was shared by six recordings and drew at most one picture each second, so the times that the script prints are far too long and say nothing about how long a child takes. No fair estimate of the length was made in this round.

## What still stands in the way

- The places where the materials are made, the sawmill and the kiln, are plain boxes with no people working there. The meter carries the test, and the place itself does little.
- The warm air that rises through the home is drawn as a column of orange cubes. It tells the story while the home is built, but in the closing picture of the family asleep it looks like clutter in the attic.
- A snowflake that falls close to the camera in the night street is drawn as a large white block.
- On a screen as narrow as 1024 by 640, the sign "No insulation" under the first open home touches the left edge of the picture during the test.
- On a screen as narrow as 1024 by 640 the result cards cover most of the town, as they do in every level, because the cards come from the shared kit.
- "Play again" is on the band from the first moment of the closing picture, so a child can leave before the camera reaches the family's home. The button comes from the shared kit.
- The two real decisions in the play break, which floor goes in the middle and whose wall gets its insulation first, are good ones, but the rest of the building is still one tap for each part. A child who only follows the yellow places can finish without thinking.
- The owner has not given the words for brick on the meter, so the brick card only says how far the meter rose.

## Answers to the owner's four questions (24 November 2026, at the end of this round)

Is the level long enough? I think so. A child builds a home of three floors and an attic, sees it furnished, builds the street and spends a winter night in it, and that is a full level. No fair measurement of its length could be made on the shared machine, so this is a judgement and not a number.

Does it need more activities or scenes? It does not need more scenes. The one thing I would add is a little more life in the sawmill and the kiln, so that the test is as rich to look at as the play break.

Am I proud of my work? Mostly, yes. The dollhouse, the family by their cold walls, and the choice of which floor is warmest make a real lesson that a child can see. I am less proud of the materials scene and of the column of warm air in the closing picture.

Am I impressed by the experience a child gets? Yes, by the moment the front wall opens on the home the child built and the family is in the rooms the child chose. The level is weaker between those moments, where much of the building is following the yellow places.
